import { GW2Api } from '../api.js';

export const TradingPost = {
    favorites: JSON.parse(localStorage.getItem('gw2_tp_favorites')) || [19721, 19976], // Default: Ecto, Mystic Coin
    popularItems: [
        { id: 19721, name: "Boule d'ectoplasme" },
        { id: 19976, name: "Pièce mystique" },
        { id: 24358, name: "Fiole de sang puissant" },
        { id: 24341, name: "Os ancien" },
        { id: 24350, name: "Griffe sauvage" },
        { id: 24277, name: "Tas de poussière cristalline" },
        { id: 24356, name: "Croc sauvage" },
        { id: 24289, name: "Écaille blindée" },
        { id: 24300, name: "Totem élaboré" },
        { id: 24294, name: "Sac de venin puissant" },
        { id: 19684, name: "Pierre runique gelée" },
        { id: 46738, name: "Trèfle mystique" },
        { id: 19722, name: "Lingot de mithril" },
        { id: 19685, name: "Lingot d'orichalque" }
    ],
    inventory: [], // Will hold parsed owned items
    allDetails: {},
    allPrices: {},

    async render(container) {
        container.innerHTML = `
            <div class="loader-container">
                <div class="spinner"></div>
                <p>Récupération de votre banque, stockage de matériaux, inventaires et cours du marché...</p>
            </div>
        `;

        try {
            // 1. Fetch data
            const [bank, materials, characters] = await Promise.all([
                GW2Api.getBank(),
                GW2Api.fetchWithCache('/account/materials', 'account_materials', 3 * 60 * 1000, true),
                GW2Api.getCharacters().catch(e => {
                    console.error("Error fetching characters for trading post", e);
                    return [];
                })
            ]);
            
            // 2. Parse owned items
            const bankItems = (bank || []).filter(item => item !== null && item.count > 0).map(item => ({
                id: item.id,
                count: item.count,
                location: 'Banque',
                binding: item.binding || 'Non lié'
            }));

            const materialItems = (materials || []).filter(item => item !== null && item.count > 0).map(item => ({
                id: item.id,
                count: item.count,
                location: 'Matériaux',
                binding: item.binding || 'Non lié',
                rawCategory: item.category
            }));

            const characterItems = [];
            (characters || []).forEach(char => {
                if (!char.bags) return;
                char.bags.forEach(bag => {
                    if (bag && bag.inventory) {
                        bag.inventory.forEach(slot => {
                            if (slot && slot.count > 0) {
                                characterItems.push({
                                    id: slot.id,
                                    count: slot.count,
                                    location: `Perso: ${char.name}`,
                                    binding: slot.binding || 'Non lié'
                                });
                            }
                        });
                    }
                });
            });

            // Combine inventory items
            this.inventory = [...bankItems, ...materialItems, ...characterItems];

            // 3. Compile unique IDs we need details/prices for
            const uniqueIds = [...new Set([
                ...this.inventory.map(item => item.id),
                ...this.favorites,
                ...this.popularItems.map(item => item.id)
            ])];

            // 4. Fetch details & prices in parallel
            this.allDetails = await GW2Api.getItemDetails(uniqueIds);
            this.allPrices = await GW2Api.getMarketPrices(uniqueIds);

            // 5. Render interface
            this.renderInterface(container);

        } catch (error) {
            container.innerHTML = `
                <div class="card" style="border-color: var(--color-danger); padding: 30px; text-align: center;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 40px; color: var(--color-danger); margin-bottom: 15px;"></i>
                    <h3>Erreur Comptoir</h3>
                    <p style="margin-top: 10px; color: var(--text-secondary);">${error.message}</p>
                    <button class="btn btn-secondary" style="margin-top: 20px;" onclick="location.reload()">Réessayer</button>
                </div>
            `;
        }
    },

    renderInterface(container) {
        // Calculate total values
        let bankGross = 0;
        let materialsGross = 0;
        let charactersGross = 0;

        this.inventory.forEach(item => {
            const price = this.allPrices[item.id];
            if (price?.sells?.unit_price) {
                const lineVal = item.count * price.sells.unit_price;
                if (item.location === 'Banque') {
                    bankGross += lineVal;
                } else if (item.location === 'Matériaux') {
                    materialsGross += lineVal;
                } else if (item.location.startsWith('Perso: ')) {
                    charactersGross += lineVal;
                }
            }
        });

        const totalGross = bankGross + materialsGross + charactersGross;
        const totalNet = Math.round(totalGross * 0.85);
        const totalTax = totalGross - totalNet;

        // Render HTML structure
        container.innerHTML = `
            <!-- Appraisal Summary Card -->
            <div class="appraisal-summary" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; align-items: center;">
                <div class="appraisal-stat">
                    <span>Valeur Banque (Brute)</span>
                    <strong>${this.formatGold(bankGross)}</strong>
                </div>
                <div class="appraisal-stat" style="border-left: 1px solid var(--border-color); padding-left: 20px;">
                    <span>Valeur Matériaux (Brute)</span>
                    <strong>${this.formatGold(materialsGross)}</strong>
                </div>
                <div class="appraisal-stat" style="border-left: 1px solid var(--border-color); padding-left: 20px;">
                    <span>Valeur Personnages (Brute)</span>
                    <strong>${this.formatGold(charactersGross)}</strong>
                </div>
                <div class="appraisal-stat" style="border-left: 1px solid var(--border-color); padding-left: 20px;">
                    <span>Taxes Estimées (15%)</span>
                    <strong style="color: var(--color-danger);">${this.formatGold(totalTax)}</strong>
                </div>
                <div class="appraisal-stat" style="border-left: 1px solid var(--border-color); padding-left: 20px;">
                    <span>Valeur Nette Totale</span>
                    <strong style="color: var(--color-success);">${this.formatGold(totalNet)}</strong>
                </div>
            </div>

            <!-- Favorites Section -->
            <div class="card" style="margin-bottom: 25px;">
                <div class="card-title">
                    <span>Prix Favoris & Suivis</span>
                    <i class="fa-solid fa-star" style="color: var(--color-warning);"></i>
                </div>
                <div id="favorites-grid" class="grid-layout" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-bottom: 0;">
                    <!-- Favorites cards will be rendered here -->
                </div>
            </div>

            <!-- Main Catalog & Search -->
            <div class="card" style="margin-bottom: 25px;">
                <div class="card-title">
                    <span>Recherche & Analyse d'Inventaire</span>
                    <i class="fa-solid fa-magnifying-glass"></i>
                </div>

                <!-- Filters & Search Input -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px; align-items: flex-end;">
                    <div style="grid-column: span 2; min-width: 250px; display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Rechercher un objet (nom ou ID)</label>
                        <div style="position: relative; display: flex; gap: 10px;">
                            <input type="text" id="tp-search-input" placeholder="Ex: Ectoplasme, Sang, Pièce..." style="width: 100%; padding: 10px 15px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 13px;">
                            <button id="btn-tp-search-clear" class="btn btn-secondary btn-sm" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); padding: 4px 8px; font-size: 10px; display: none;">&times;</button>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Emplacement</label>
                        <select id="tp-filter-location" class="form-select" style="width: 100%;">
                            <option value="all">Tout l'inventaire</option>
                            <option value="bank">Banque uniquement</option>
                            <option value="materials">Matériaux uniquement</option>
                            <option value="characters">Personnages uniquement</option>
                            <option value="popular">Objets populaires / Autres</option>
                        </select>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Sous-Catégorie</label>
                        <select id="tp-filter-subcategory" class="form-select" style="width: 100%;">
                            <option value="all">Tous les types</option>
                            <option value="ore">Minerais & Métaux</option>
                            <option value="wood">Bois (Planches, Rondins)</option>
                            <option value="cloth_leather">Tissus & Cuirs</option>
                            <option value="trophy">Matériaux Fins (Sang...)</option>
                            <option value="rare">Matériaux Rares (Ectos...)</option>
                            <option value="gem">Gemmes & Joyaux</option>
                            <option value="cooking">Ingrédients de Cuisine</option>
                            <option value="other">Autres / Divers</option>
                        </select>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Tier</label>
                        <select id="tp-filter-tier" class="form-select" style="width: 100%;">
                            <option value="all">Tous les Tiers</option>
                            <option value="6">Tier 6 (T6)</option>
                            <option value="5">Tier 5 (T5)</option>
                            <option value="4">Tier 4 (T4)</option>
                            <option value="3">Tier 3 (T3)</option>
                            <option value="2">Tier 2 (T2)</option>
                            <option value="1">Tier 1 (T1)</option>
                            <option value="none">Sans Tier</option>
                        </select>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Trier par</label>
                        <select id="tp-filter-sort" class="form-select" style="width: 100%;">
                            <option value="default">Ordre du catalogue</option>
                            <option value="net_desc">Gain potentiel max (Revente)</option>
                            <option value="net_asc">Gain potentiel min (Revente)</option>
                            <option value="count_desc">Stock le plus grand</option>
                            <option value="count_asc">Stock le plus petit</option>
                            <option value="name_asc">Nom (A-Z)</option>
                        </select>
                    </div>
                </div>

                <!-- Catalog Table -->
                <div style="overflow-x: auto; max-height: 500px; overflow-y: auto;">
                    <table class="tp-market-table" style="margin-top: 0;">
                        <thead>
                            <tr>
                                <th>Objet</th>
                                <th>Lieu</th>
                                <th>Quantité</th>
                                <th>Achat Imm. (Demande)</th>
                                <th>Vente Imm. (Offre)</th>
                                <th>Valeur Brute</th>
                                <th>Valeur Nette (-15%)</th>
                                <th style="text-align: center;">Favori</th>
                            </tr>
                        </thead>
                        <tbody id="catalog-table-body">
                            <!-- Rows will be rendered dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Tax Simulator Card -->
            <div class="card">
                <div class="card-title">
                    <span>Simulateur de Taxes du Comptoir</span>
                    <i class="fa-solid fa-calculator"></i>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 13px;">
                    Saisissez le montant de vente souhaité au Comptoir pour voir vos gains réels et les frais retenus par la Compagnie Commerciale du Lion Noir.
                </p>
                <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                    <div class="form-group" style="flex: 1; min-width: 200px;">
                        <label for="calc-gold-input">Prix de vente souhaité (Or) :</label>
                        <input type="number" id="calc-gold-input" value="100" min="1" style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; width: 100%;">
                    </div>
                    <div style="flex: 2; min-width: 300px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px;">
                        <div class="wallet-item-new" style="flex-direction: column; align-items: flex-start; padding: 10px 12px;">
                            <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Mise en vente (5%)</span>
                            <strong id="calc-listing-fee" style="color: var(--color-warning); font-size: 13px;">5.00g</strong>
                        </div>
                        <div class="wallet-item-new" style="flex-direction: column; align-items: flex-start; padding: 10px 12px;">
                            <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Transaction (10%)</span>
                            <strong id="calc-transaction-fee" style="color: var(--color-danger); font-size: 13px;">10.00g</strong>
                        </div>
                        <div class="wallet-item-new" style="flex-direction: column; align-items: flex-start; border-color: var(--color-success); padding: 10px 12px;">
                            <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Profit net (85%)</span>
                            <strong id="calc-net-profit" style="color: var(--color-success); font-size: 13px;">85.00g</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Wire event listeners
        const searchInput = document.getElementById('tp-search-input');
        const clearSearchBtn = document.getElementById('btn-tp-search-clear');
        const locationFilter = document.getElementById('tp-filter-location');
        const subcatFilter = document.getElementById('tp-filter-subcategory');
        const tierFilter = document.getElementById('tp-filter-tier');
        const sortFilter = document.getElementById('tp-filter-sort');
        const taxInput = document.getElementById('calc-gold-input');

        searchInput.addEventListener('input', () => {
            clearSearchBtn.style.display = searchInput.value ? 'block' : 'none';
            this.filterCatalog();
        });

        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            this.filterCatalog();
        });

        locationFilter.addEventListener('change', () => {
            this.filterCatalog();
        });

        subcatFilter.addEventListener('change', () => {
            this.filterCatalog();
        });

        tierFilter.addEventListener('change', () => {
            this.filterCatalog();
        });

        sortFilter.addEventListener('change', () => {
            this.filterCatalog();
        });

        if (taxInput) {
            taxInput.addEventListener('input', () => {
                this.updateTaxCalculator(parseFloat(taxInput.value) || 0);
            });
        }

        // Render initial lists
        this.renderFavorites();
        this.filterCatalog();
    },

    renderFavorites() {
        const grid = document.getElementById('favorites-grid');
        if (!grid) return;

        if (this.favorites.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 25px; color: var(--text-muted); font-size: 13px;">
                    Aucun objet en favori. Étoilez un objet dans le catalogue ci-dessous pour l'épingler ici !
                </div>
            `;
            return;
        }

        grid.innerHTML = this.favorites.map(id => {
            const detail = this.allDetails[id];
            const price = this.allPrices[id];
            const name = detail?.name || `Objet #${id}`;
            const icon = detail?.icon || 'https://wiki.guildwars2.com/images/a/a1/Raptor_art.png';

            // Calculate stock
            const inBank = this.inventory.filter(item => item.id === id && item.location === 'Banque').reduce((sum, item) => sum + item.count, 0);
            const inMaterials = this.inventory.filter(item => item.id === id && item.location === 'Matériaux').reduce((sum, item) => sum + item.count, 0);
            const inCharacters = this.inventory.filter(item => item.id === id && item.location.startsWith('Perso: ')).reduce((sum, item) => sum + item.count, 0);
            const totalStock = inBank + inMaterials + inCharacters;

            const buyPrice = price?.buys?.unit_price || 0;
            const sellPrice = price?.sells?.unit_price || 0;
            const totalNetValue = Math.round(totalStock * sellPrice * 0.85);

            return `
                <div class="card" style="padding: 15px; border-color: rgba(76, 201, 240, 0.15); display: flex; flex-direction: column; justify-content: space-between; gap: 12px; margin-bottom: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div data-item-id="${id}" style="display: flex; align-items: center; gap: 10px; cursor: pointer;" title="${this.getItemTooltip(detail)}">
                            <img src="${icon}" style="width: 32px; height: 32px; border-radius: var(--radius-sm);" alt="${name}">
                            <div>
                                <h4 style="font-size: 13px; font-weight: 700; margin: 0; line-height: 1.3;">${name}</h4>
                                <span style="font-size: 10px; color: var(--text-muted);">Stock: <strong>${totalStock}</strong> (${inBank} Bq / ${inMaterials} Mat / ${inCharacters} Perso)</span>
                            </div>
                        </div>
                        <button class="btn-favorite-toggle" data-id="${id}" style="background: none; border: none; color: var(--color-warning); cursor: pointer; font-size: 14px;">
                            <i class="fa-solid fa-star"></i>
                        </button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 10px; font-size: 11px;">
                        <div>
                            <span style="color: var(--text-muted); display: block; font-size: 9px; text-transform: uppercase;">Achat Imm.</span>
                            <strong>${this.formatGold(buyPrice)}</strong>
                        </div>
                        <div>
                            <span style="color: var(--text-muted); display: block; font-size: 9px; text-transform: uppercase;">Vente Imm.</span>
                            <strong>${this.formatGold(sellPrice)}</strong>
                        </div>
                    </div>
                    <div style="background-color: rgba(46, 196, 182, 0.03); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid rgba(46, 196, 182, 0.1); display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                        <span style="color: var(--text-secondary); font-weight: 500;">Valeur Nette (-15%)</span>
                        <strong style="color: var(--color-success); font-weight: 700;">${this.formatGold(totalNetValue)}</strong>
                    </div>
                </div>
            `;
        }).join('');

        // Wire favorite toggle buttons
        grid.querySelectorAll('.btn-favorite-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.getAttribute('data-id'));
                this.toggleFavorite(id);
            });
        });
    },

    filterCatalog() {
        const query = document.getElementById('tp-search-input').value.toLowerCase().trim();
        const location = document.getElementById('tp-filter-location').value;
        const subcat = document.getElementById('tp-filter-subcategory').value;
        const tier = document.getElementById('tp-filter-tier').value;
        const sort = document.getElementById('tp-filter-sort').value;
        const tbody = document.getElementById('catalog-table-body');
        if (!tbody) return;

        let displayItems = [];

        if (location === 'popular') {
            // Show only popular items
            displayItems = this.popularItems.map(pop => {
                const owned = this.inventory.filter(item => item.id === pop.id);
                const count = owned.reduce((sum, i) => sum + i.count, 0);
                return {
                    id: pop.id,
                    count: count,
                    location: count > 0 ? owned.map(o => o.location).join(', ') : 'Aucun',
                    isPopularOnly: true
                };
            });
        } else {
            // Show owned items
            displayItems = [...this.inventory];
            if (location === 'bank') {
                displayItems = displayItems.filter(i => i.location === 'Banque');
            } else if (location === 'materials') {
                displayItems = displayItems.filter(i => i.location === 'Matériaux');
            } else if (location === 'characters') {
                displayItems = displayItems.filter(i => i.location.startsWith('Perso: '));
            }
        }

        // Apply subcategory filter
        if (subcat !== 'all') {
            displayItems = displayItems.filter(item => {
                return this.getItemSubcategory(item.id) === subcat;
            });
        }

        // Apply tier filter
        if (tier !== 'all') {
            displayItems = displayItems.filter(item => {
                const itemTier = this.getItemTier(item.id);
                if (tier === 'none') return itemTier === 0;
                return itemTier === parseInt(tier);
            });
        }

        // Apply text query filter
        if (query) {
            displayItems = displayItems.filter(item => {
                const detail = this.allDetails[item.id];
                const name = (detail?.name || '').toLowerCase();
                const idStr = item.id.toString();
                return name.includes(query) || idStr.includes(query);
            });
        }

        // Apply sorting
        if (sort === 'net_desc') {
            displayItems.sort((a, b) => {
                const priceA = this.allPrices[a.id]?.sells?.unit_price || 0;
                const priceB = this.allPrices[b.id]?.sells?.unit_price || 0;
                return (b.count * priceB) - (a.count * priceA);
            });
        } else if (sort === 'net_asc') {
            displayItems.sort((a, b) => {
                const priceA = this.allPrices[a.id]?.sells?.unit_price || 0;
                const priceB = this.allPrices[b.id]?.sells?.unit_price || 0;
                return (a.count * priceA) - (b.count * priceB);
            });
        } else if (sort === 'count_desc') {
            displayItems.sort((a, b) => b.count - a.count);
        } else if (sort === 'count_asc') {
            displayItems.sort((a, b) => a.count - b.count);
        } else if (sort === 'name_asc') {
            displayItems.sort((a, b) => {
                const nameA = (this.allDetails[a.id]?.name || '').toLowerCase();
                const nameB = (this.allDetails[b.id]?.name || '').toLowerCase();
                return nameA.localeCompare(nameB, 'fr');
            });
        }

        if (displayItems.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;">
                        Aucun objet ne correspond aux critères de recherche.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = displayItems.map(item => {
            const id = item.id;
            const count = item.count;
            const loc = item.location;
            const detail = this.allDetails[id];
            const price = this.allPrices[id];

            const name = detail?.name || `Objet #${id}`;
            const icon = detail?.icon || 'https://wiki.guildwars2.com/images/a/a1/Raptor_art.png';

            const buyPrice = price?.buys?.unit_price || 0;
            const sellPrice = price?.sells?.unit_price || 0;
            const grossVal = count * sellPrice;
            const netVal = Math.round(grossVal * 0.85);

            const isFav = this.favorites.includes(id);

            return `
                <tr>
                    <td>
                        <div class="tp-item-cell" data-item-id="${id}" title="${this.getItemTooltip(detail)}">
                            <img src="${icon}" style="width: 24px; height: 24px; border-radius: var(--radius-sm);" alt="${name}">
                            <strong style="font-size: 12px;">${name}</strong>
                        </div>
                    </td>
                    <td style="font-size: 11px; color: var(--text-secondary);">${loc}</td>
                    <td style="font-weight: 700; font-size: 12px;">${count}</td>
                    <td>${this.formatGold(buyPrice)}</td>
                    <td>${this.formatGold(sellPrice)}</td>
                    <td>${this.formatGold(grossVal)}</td>
                    <td style="color: var(--color-success); font-weight: 700;">${this.formatGold(netVal)}</td>
                    <td style="text-align: center;">
                        <button class="btn-row-favorite-toggle" data-id="${id}" style="background: none; border: none; color: ${isFav ? 'var(--color-warning)' : 'var(--text-muted)'}; cursor: pointer; font-size: 13px;">
                            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-star"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Wire row toggle buttons
        tbody.querySelectorAll('.btn-row-favorite-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.getAttribute('data-id'));
                this.toggleFavorite(id);
            });
        });
    },

    getItemSubcategory(id) {
        const detail = this.allDetails[id];
        if (!detail) return 'other';

        const name = (detail.name || '').toLowerCase();
        
        // Find if item is in our parsed inventory list to get its rawCategory from Materials endpoint
        const invItem = this.inventory.find(i => i.id === id);
        const rawMatCategory = invItem?.rawCategory || 0;

        // Classify based on category ID from materials storage API
        if (rawMatCategory === 5) return 'cooking';
        if (rawMatCategory === 37) return 'gem';
        if (rawMatCategory === 29) return 'trophy';
        if (rawMatCategory === 30) return 'rare';
        
        // If it's category 6 (Common crafting), let's split by name keywords
        if (rawMatCategory === 6) {
            if (name.includes('minerai') || name.includes('lingot') || name.includes('pépite') || 
                name.includes('cuivre') || name.includes('fer') || name.includes('mithril') || 
                name.includes('orichalque') || name.includes('platine') || name.includes('or') || 
                name.includes('argent') || name.includes('acier') || name.includes('bronze') || 
                name.includes('darksteel') || name.includes('métal')) {
                return 'ore';
            }
            if (name.includes('rondin') || name.includes('planche') || name.includes('bois') || 
                name.includes('sureau') || name.includes('sapin') || name.includes('chêne') || 
                name.includes('ancien') || name.includes('vert')) {
                return 'wood';
            }
            if (name.includes('chute') || name.includes('rouleau') || name.includes('tissu') || 
                name.includes('fil') || name.includes('laine') || name.includes('coton') || 
                name.includes('lin') || name.includes('soie') || name.includes('gaze') || 
                name.includes('cuir') || name.includes('section') || name.includes('lanière') || 
                name.includes('peaux') || name.includes('peau')) {
                return 'cloth_leather';
            }
        }

        // Fallbacks using item details name keywords (covers bank items and popular items)
        if (name.includes('sang') || name.includes('fiole') || name.includes('griffe') || 
            name.includes('os') || name.includes('venin') || name.includes('écaille') || 
            name.includes('croc') || name.includes('sac') || name.includes('totem') || 
            name.includes('poussière')) {
            return 'trophy';
        }
        if (name.includes('ectoplasme') || name.includes('magnétite') || name.includes('noyau') || 
            name.includes('obsidienne') || name.includes('trèfle') || name.includes('runique') || 
            name.includes('amalgame')) {
            return 'rare';
        }
        if (name.includes('minerai') || name.includes('lingot')) {
            return 'ore';
        }
        if (name.includes('bois') || name.includes('planche')) {
            return 'wood';
        }
        if (name.includes('tissu') || name.includes('cuir')) {
            return 'cloth_leather';
        }

        return 'other';
    },

    getItemTier(id) {
        const detail = this.allDetails[id];
        if (!detail) return 0;

        const name = (detail.name || '').toLowerCase();
        
        // Tier 6 keywords
        if (name.includes('puissant') || name.includes('sauvage') || name.includes('ancestral') || 
            name.includes('orichalque') || name.includes('rigide') || name.includes('gaze') || 
            (name.includes('os') && name.includes('ancien')) || name.includes('élaboré') || 
            name.includes('cristalline') || name.includes('cristallin')) {
            return 6;
        }
        
        // Tier 5 keywords
        if (name.includes('tiède') || name.includes('lourd') || name.includes('acérée') || 
            name.includes('acéré') || name.includes('fort') || name.includes('lisse') || 
            name.includes('gravé') || name.includes('incandescente') || name.includes('mithril') || 
            (name.includes('bois') && name.includes('ancien')) || name.includes('épaisse') || 
            name.includes('épais') || name.includes('soie')) {
            return 5;
        }
        
        // Tier 4 keywords
        if (name.includes('grande fiole') || (name.includes('os') && name.includes('fossile')) || 
            name.includes('grande griffe') || name.includes('grand croc') || name.includes('plein sac') || 
            name.includes('grande écaille') || name.includes('sculpté') || name.includes('lumineuse') || 
            name.includes('platine') || name.includes('sureau') || name.includes('robuste') || 
            name.includes('lin') || name.includes('acier')) {
            return 4;
        }
        
        // Tier 3 keywords
        if ((name.startsWith('fiole de sang') && !name.includes('minuscule') && !name.includes('petite') && !name.includes('grande') && !name.includes('tiède') && !name.includes('puissant')) || 
            (name.startsWith('os') && !name.includes('éclat') && !name.includes('fragment') && !name.includes('fossile') && !name.includes('lourd') && !name.includes('ancien')) || 
            (name.startsWith('griffe') && !name.includes('minuscule') && !name.includes('petite') && !name.includes('grande') && !name.includes('acérée') && !name.includes('sauvage')) || 
            (name.startsWith('croc') && !name.includes('minuscule') && !name.includes('petit') && !name.includes('grand') && !name.includes('acéré') && !name.includes('sauvage')) || 
            (name.startsWith('sac de venin') && !name.includes('minuscule') && !name.includes('petit') && !name.includes('plein') && !name.includes('fort') && !name.includes('puissant')) || 
            (name.startsWith('écaille') && !name.includes('minuscule') && !name.includes('petite') && !name.includes('grande') && !name.includes('lisse') && !name.includes('blindée')) || 
            (name.startsWith('totem') && !name.includes('minuscule') && !name.includes('petit') && !name.includes('sculpté') && !name.includes('gravé') && !name.includes('élaboré')) || 
            name.includes('radieuse') || name.includes('chêne') || name.includes('grossière') || 
            name.includes('grossier') || name.includes('coton') || name.includes('fer')) {
            return 3;
        }
        
        // Tier 2 keywords
        if (name.includes('petite') || name.includes('petit') || name.includes('fragment') || 
            name.includes('miroitante') || name.includes('sapin') || name.includes('fine') || 
            name.includes('fin') || name.includes('laine')) {
            return 2;
        }
        
        // Tier 1 keywords
        if (name.includes('minuscule') || name.includes('éclat') || name.includes('scintillante') || 
            name.includes('cuivre') || name.includes('vert') || name.includes('brute') || 
            name.includes('jute')) {
            return 1;
        }

        return 0; // Other / Not tiered
    },

    toggleFavorite(id) {
        if (this.favorites.includes(id)) {
            this.favorites = this.favorites.filter(favId => favId !== id);
        } else {
            this.favorites.push(id);
        }
        localStorage.setItem('gw2_tp_favorites', JSON.stringify(this.favorites));

        // Re-render UI segments
        this.renderFavorites();
        this.filterCatalog();
    },

    updateTaxCalculator(goldVal) {
        const listingFee = goldVal * 0.05;
        const transactionFee = goldVal * 0.10;
        const netProfit = goldVal * 0.85;

        document.getElementById('calc-listing-fee').textContent = `${listingFee.toFixed(2)}g`;
        document.getElementById('calc-transaction-fee').textContent = `${transactionFee.toFixed(2)}g`;
        document.getElementById('calc-net-profit').textContent = `${netProfit.toFixed(2)}g`;
    },

    getItemTooltip(item) {
        if (!item) return '';
        const name = item.name || '';
        const rarity = item.rarity || 'Basic';
        let text = `${name}\n[${rarity}]`;
        if (item.level) {
            text += `\nNiveau requis: ${item.level}`;
        }
        if (item.description) {
            const cleanDesc = item.description.replace(/<[^>]*>/g, '').trim();
            text += `\n\n"${cleanDesc}"`;
        }
        return text.replace(/"/g, '&quot;');
    },

    formatGold(copperAmount) {
        if (!copperAmount) return '0 <span class="coin-symbol copper-dot"></span>';
        const gold = Math.floor(copperAmount / 10000);
        const silver = Math.floor((copperAmount % 10000) / 100);
        const copper = copperAmount % 100;

        let formatted = '';
        if (gold > 0) formatted += `<span class="gold-coin" style="color: #ffd166; font-weight: 700;">${gold.toLocaleString()}g </span>`;
        if (silver > 0 || gold > 0) formatted += `<span class="silver-coin" style="color: #f8f9fc; font-weight: 600;">${silver}s </span>`;
        if (copper > 0 || (!gold && !silver)) formatted += `<span class="copper-coin" style="color: #cd7f32;">${copper}c</span>`;
        return formatted;
    }
};
