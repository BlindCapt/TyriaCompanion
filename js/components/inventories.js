import { GW2Api } from '../api.js';

export const Inventories = {
    activeTab: 'global', // 'global', 'visual', 'bank'
    selectedChar: '', // Active character for visual view
    allDetails: {},
    wallet: null, // Global wallet data

    async render(container) {
        container.innerHTML = `
            <div class="loader-container">
                <div class="spinner"></div>
                <p>Récupération des inventaires, de votre banque et de vos stockages...</p>
            </div>
        `;

        try {
            let characters = [];
            let bank = [];
            let accountInfo = null;
            let materials = [];
            let categories = [];
            let guildsStashes = [];

            try {
                const results = await Promise.allSettled([
                    GW2Api.getCharacters(),
                    GW2Api.getWallet(),
                    GW2Api.getBank(),
                    GW2Api.getAccountInfo(),
                    GW2Api.getAccountMaterials(),
                    GW2Api.getMaterialsCategories()
                ]);
                characters = results[0].status === 'fulfilled' ? results[0].value || [] : [];
                this.wallet = results[1].status === 'fulfilled' ? results[1].value : null;
                bank = results[2].status === 'fulfilled' ? results[2].value || [] : [];
                accountInfo = results[3].status === 'fulfilled' ? results[3].value : null;
                materials = results[4].status === 'fulfilled' ? results[4].value || [] : [];
                categories = results[5].status === 'fulfilled' ? results[5].value || [] : [];
            } catch (e) {
                console.error("Error fetching inventories dependencies", e);
            }

            if ((!characters || characters.length === 0) && (!bank || bank.length === 0)) {
                container.innerHTML = `
                    <div class="card" style="text-align: center; padding: 40px;">
                        <i class="fa-solid fa-users-slash" style="font-size: 40px; color: var(--text-muted); margin-bottom: 20px;"></i>
                        <h3>Aucune donnée trouvée</h3>
                        <p style="color: var(--text-secondary); margin-top: 10px;">
                            Impossible de charger les personnages et la banque de votre compte.
                        </p>
                    </div>
                `;
                return;
            }

            // Fetch guild details and stashes in parallel if accountInfo exists
            if (accountInfo && accountInfo.guilds && accountInfo.guilds.length > 0) {
                try {
                    const guildPromises = accountInfo.guilds.map(async (guildId) => {
                        try {
                            const [infoResult, stashResult] = await Promise.allSettled([
                                GW2Api.getGuildInfo(guildId),
                                GW2Api.getGuildStash(guildId)
                            ]);
                            
                            if (infoResult.status === 'fulfilled' && stashResult.status === 'fulfilled') {
                                return {
                                    guildId,
                                    name: infoResult.value.name,
                                    tag: infoResult.value.tag,
                                    stash: stashResult.value
                                };
                            } else if (infoResult.status === 'fulfilled') {
                                return {
                                    guildId,
                                    name: infoResult.value.name,
                                    tag: infoResult.value.tag,
                                    stash: null
                                };
                            }
                        } catch (err) {
                            console.warn(`Could not fetch details/stash for guild ${guildId}`, err);
                        }
                        return null;
                    });
                    
                    const resolvedGuilds = await Promise.all(guildPromises);
                    guildsStashes = resolvedGuilds.filter(g => g && g.stash);
                } catch (ge) {
                    console.error("Error fetching guild stashes", ge);
                }
            }

            this.materials = materials;
            this.materialsCategories = categories;
            this.guildsStashes = guildsStashes;
            if (guildsStashes.length > 0 && !this.selectedGuildId) {
                this.selectedGuildId = guildsStashes[0].guildId;
            }

            // Set default selected character if empty
            if (!this.selectedChar && characters.length > 0) {
                this.selectedChar = characters[0].name;
            }

            // 1. Gather all item IDs (including bags themselves, bank slots, owned materials and guild stashes)
            const allItems = [];
            const bagIds = [];
            const bankIds = [];
            const materialIds = [];
            const guildIds = [];

            characters.forEach(char => {
                if (!char.bags) return;
                char.bags.forEach((bag, bagIndex) => {
                    if (!bag) return;
                    if (bag.id) bagIds.push(bag.id);
                    if (bag.inventory) {
                        bag.inventory.forEach((slot, slotIndex) => {
                            if (!slot) return;
                            allItems.push({
                                id: slot.id,
                                count: slot.count,
                                binding: slot.binding || 'Non lié',
                                boundTo: slot.bound_to || '',
                                charName: char.name,
                                charProfession: char.profession,
                                bagIndex: bagIndex + 1,
                                slotIndex: slotIndex + 1
                            });
                        });
                    }
                });
            });

            if (Array.isArray(bank)) {
                bank.forEach((slot, slotIndex) => {
                    if (!slot) return;
                    bankIds.push(slot.id);
                    allItems.push({
                        id: slot.id,
                        count: slot.count,
                        binding: slot.binding || 'Non lié',
                        boundTo: slot.bound_to || '',
                        charName: 'Banque',
                        charProfession: 'bank',
                        bagIndex: Math.floor(slotIndex / 30) + 1,
                        slotIndex: (slotIndex % 30) + 1
                    });
                });
            }

            if (Array.isArray(materials)) {
                materials.forEach(mat => {
                    if (mat && mat.count > 0) {
                        materialIds.push(mat.id);
                    }
                });
            }

            guildsStashes.forEach(g => {
                if (g.stash && Array.isArray(g.stash)) {
                    g.stash.forEach(tab => {
                        if (tab.inventory && Array.isArray(tab.inventory)) {
                            tab.inventory.forEach(slot => {
                                if (slot && slot.id) {
                                    guildIds.push(slot.id);
                                }
                            });
                        }
                    });
                }
            });

            const uniqueIds = [...new Set([
                ...allItems.map(i => i.id),
                ...bagIds,
                ...bankIds,
                ...materialIds,
                ...guildIds
            ])];

            // 2. Fetch item details
            this.allDetails = await GW2Api.getItemDetails(uniqueIds);

            // 3. Render base tabs structure
            this.renderLayout(container, characters, allItems, bank);

        } catch (error) {
            container.innerHTML = `
                <div class="card" style="border-color: var(--color-danger); padding: 30px; text-align: center;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 40px; color: var(--color-danger); margin-bottom: 15px;"></i>
                    <h3>Erreur Inventaires & Banque</h3>
                    <p style="margin-top: 10px; color: var(--text-secondary);">${error.message}</p>
                    <button class="btn btn-secondary" style="margin-top: 20px;" onclick="location.reload()">Réessayer</button>
                </div>
            `;
        }
    },

    renderLayout(container, characters, allItems, bank) {
        container.innerHTML = `
            <div class="legendary-tabs">
                <button class="tab-btn ${this.activeTab === 'global' ? 'active' : ''}" id="btn-inv-global">
                    <i class="fa-solid fa-magnifying-glass"></i> Recherche Globale
                </button>
                <button class="tab-btn ${this.activeTab === 'visual' ? 'active' : ''}" id="btn-inv-visual">
                    <i class="fa-solid fa-boxes-stacked"></i> Sacs par Personnage
                </button>
                <button class="tab-btn ${this.activeTab === 'bank' ? 'active' : ''}" id="btn-inv-bank">
                    <i class="fa-solid fa-vault"></i> Banque & Stockages
                </button>
            </div>
            <div id="inventories-content-pane">
                <!-- Sub-view content -->
            </div>
        `;

        // Wire sub tab events
        document.getElementById('btn-inv-global').addEventListener('click', () => {
            this.activeTab = 'global';
            this.renderContent(characters, allItems, bank);
        });
        document.getElementById('btn-inv-visual').addEventListener('click', () => {
            this.activeTab = 'visual';
            this.renderContent(characters, allItems, bank);
        });
        document.getElementById('btn-inv-bank').addEventListener('click', () => {
            this.activeTab = 'bank';
            this.renderContent(characters, allItems, bank);
        });

        this.renderContent(characters, allItems, bank);
    },

    renderContent(characters, allItems, bank) {
        const pane = document.getElementById('inventories-content-pane');
        if (!pane) return;

        // Toggle active tabs
        document.getElementById('btn-inv-global').className = `tab-btn ${this.activeTab === 'global' ? 'active' : ''}`;
        document.getElementById('btn-inv-visual').className = `tab-btn ${this.activeTab === 'visual' ? 'active' : ''}`;
        document.getElementById('btn-inv-bank').className = `tab-btn ${this.activeTab === 'bank' ? 'active' : ''}`;

        if (this.activeTab === 'global') {
            this.renderGlobalSearch(pane, characters, allItems);
        } else if (this.activeTab === 'visual') {
            this.renderVisualGrid(pane, characters);
        } else if (this.activeTab === 'bank') {
            this.renderBankAndStorages(pane, bank);
        }
    },

    renderBankAndStorages(pane, bank) {
        pane.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 35px; align-items: center; width: 100%;">
                <div id="bank-section-container" style="width: 100%; display: flex; justify-content: center;"></div>
                <div id="materials-section-container" style="width: 100%; display: flex; justify-content: center;"></div>
                <div id="guild-section-container" style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 15px; width: 100%;"></div>
            </div>
        `;

        const bankContainer = document.getElementById('bank-section-container');
        this.renderBankVisualGrid(bankContainer, bank);

        const materialsContainer = document.getElementById('materials-section-container');
        this.renderMaterialsStorage(materialsContainer);

        const guildContainer = document.getElementById('guild-section-container');
        this.renderGuildVaults(guildContainer);
    },

    renderGlobalSearch(pane, characters, allItems) {
        pane.innerHTML = `
            <div class="card">
                <div class="card-title">
                    <span>Recherche d'objets dans tous les inventaires</span>
                    <i class="fa-solid fa-magnifying-glass"></i>
                </div>
                
                <!-- Filter bar -->
                <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; align-items: flex-end;">
                    <div style="flex: 2; min-width: 250px; display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Rechercher un objet (nom ou ID)</label>
                        <div style="position: relative; display: flex; gap: 10px;">
                            <input type="text" id="inv-search-input" placeholder="Ex: Sac, Épée, Anneau, Ecto..." style="width: 100%; padding: 10px 15px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 13px;">
                            <button id="btn-inv-search-clear" class="btn btn-secondary btn-sm" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); padding: 4px 8px; font-size: 10px; display: none;">&times;</button>
                        </div>
                    </div>
                    <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Emplacement</label>
                        <select id="inv-filter-char" class="form-select" style="width: 100%;">
                            <option value="all">Tous les emplacements</option>
                            <option value="Banque">Banque de Compte</option>
                            ${characters.map(char => `<option value="${char.name}">${char.name}</option>`).join('')}
                        </select>
                    </div>
                    <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Rareté</label>
                        <select id="inv-filter-rarity" class="form-select" style="width: 100%;">
                            <option value="all">Toutes les raretés</option>
                            <option value="Junk">Médiocre (Junk)</option>
                            <option value="Basic">Basique (Basic)</option>
                            <option value="Fine">Raffiné (Fine)</option>
                            <option value="Rare">Rare</option>
                            <option value="Exotic">Exotique (Exotic)</option>
                            <option value="Ascended">Élevé (Ascended)</option>
                            <option value="Legendary">Légendaire (Legendary)</option>
                        </select>
                    </div>
                </div>

                <!-- Results table -->
                <div style="overflow-x: auto; max-height: 550px; overflow-y: auto;">
                    <table class="tp-market-table" style="margin-top: 0;">
                        <thead>
                            <tr>
                                <th>Objet</th>
                                <th>Rareté</th>
                                <th>Personnage</th>
                                <th>Emplacement</th>
                                <th>Quantité</th>
                                <th>Liaison</th>
                            </tr>
                        </thead>
                        <tbody id="inv-table-body">
                            <!-- Rows will be injected here -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const searchInput = document.getElementById('inv-search-input');
        const clearBtn = document.getElementById('btn-inv-search-clear');
        const charFilter = document.getElementById('inv-filter-char');
        const rarityFilter = document.getElementById('inv-filter-rarity');

        const filterAction = () => {
            clearBtn.style.display = searchInput.value ? 'block' : 'none';
            this.filterGlobalList(allItems);
        };

        searchInput.addEventListener('input', filterAction);
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            filterAction();
        });
        charFilter.addEventListener('change', filterAction);
        rarityFilter.addEventListener('change', filterAction);

        // Initial filter
        this.filterGlobalList(allItems);
    },

    filterGlobalList(allItems) {
        const query = document.getElementById('inv-search-input').value.toLowerCase().trim();
        const charName = document.getElementById('inv-filter-char').value;
        const rarity = document.getElementById('inv-filter-rarity').value;
        const tbody = document.getElementById('inv-table-body');
        if (!tbody) return;

        let filtered = [...allItems];

        // Filter by character
        if (charName !== 'all') {
            filtered = filtered.filter(i => i.charName === charName);
        }

        // Filter by rarity
        if (rarity !== 'all') {
            filtered = filtered.filter(i => {
                const detail = this.allDetails[i.id];
                return detail?.rarity === rarity;
            });
        }

        // Filter by text search
        if (query) {
            filtered = filtered.filter(i => {
                const detail = this.allDetails[i.id];
                const name = (detail?.name || '').toLowerCase();
                const idStr = i.id.toString();
                return name.includes(query) || idStr.includes(query);
            });
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;">
                        Aucun objet trouvé dans les sacs correspondants.
                    </td>
                </tr>
            `;
            return;
        }

        // Sort alphabetically by name
        filtered.sort((a, b) => {
            const nameA = (this.allDetails[a.id]?.name || '').toLowerCase();
            const nameB = (this.allDetails[b.id]?.name || '').toLowerCase();
            return nameA.localeCompare(nameB, 'fr');
        });

        const rarityColors = {
            Junk: '#606075',
            Basic: '#f8f9fc',
            Fine: '#4cc9f0',
            Rare: '#ffb703',
            Exotic: '#ff9f1c',
            Ascended: '#ff4d6d',
            Legendary: '#7209b7'
        };

        const profColors = {
            guardian: '#72c1c6',
            warrior: '#ffd166',
            revenant: '#9e2a2b',
            engineer: '#d08c3f',
            ranger: '#8cb369',
            thief: '#c08a8a',
            elementalist: '#f28482',
            mesmer: '#b5179e',
            necromancer: '#2ec4b6',
            bank: '#ffb703'
        };

        const iconMap = {
            warrior: 'fa-shield-halved',
            guardian: 'fa-shield',
            revenant: 'fa-eye-slash',
            thief: 'fa-mask',
            ranger: 'fa-crosshairs',
            engineer: 'fa-gear',
            elementalist: 'fa-fire',
            necromancer: 'fa-skull',
            mesmer: 'fa-wand-magic-sparkles',
            bank: 'fa-vault'
        };

        tbody.innerHTML = filtered.map(item => {
            const detail = this.allDetails[item.id];
            const name = detail?.name || `Objet #${item.id}`;
            const icon = detail?.icon || 'https://wiki.guildwars2.com/images/a/a1/Raptor_art.png';
            const itemRarity = detail?.rarity || 'Basic';
            const rarityColor = rarityColors[itemRarity] || 'var(--border-color)';
            
            // Build dynamic tooltip for search table
            let titleAttr = `${name}\n[${itemRarity}]`;
            if (item.binding) {
                const bindLabel = item.binding === 'Soulbind' ? "Lié à l'âme" : item.binding === 'Account' ? "Lié au compte" : item.binding;
                titleAttr += `\n${bindLabel}`;
            }
            if (detail?.level) {
                titleAttr += `\nNiveau requis: ${detail.level}`;
            }
            if (detail?.description) {
                const cleanDesc = detail.description.replace(/<[^>]*>/g, '').trim();
                titleAttr += `\n\n"${cleanDesc}"`;
            }
            const cleanTitle = titleAttr.replace(/"/g, '&quot;');

            const prof = item.charProfession.toLowerCase();
            const profColor = profColors[prof] || 'var(--text-secondary)';
            const profIcon = iconMap[prof] || 'fa-user';

            let bindingText = item.binding;
            if (bindingText === 'Soulbind') {
                bindingText = `<span style="color: var(--color-danger);">Lié à l'âme</span>`;
            } else if (bindingText === 'Account') {
                bindingText = `<span style="color: var(--color-accent);">Lié au compte</span>`;
            }

            return `
                <tr>
                    <td>
                        <div class="tp-item-cell" data-item-id="${item.id}" title="${cleanTitle}">
                            <img src="${icon}" style="width: 24px; height: 24px; border-radius: var(--radius-sm); border: 1.5px solid ${rarityColor};" alt="${name}">
                            <strong style="font-size: 12px; color: ${itemRarity === 'Legendary' ? 'var(--color-legendary)' : 'var(--text-primary)'};">${name}</strong>
                        </div>
                    </td>
                    <td>
                        <span style="font-size: 10px; font-weight: 700; color: ${rarityColor}; text-transform: uppercase;">
                            ${itemRarity}
                        </span>
                    </td>
                    <td>
                        <div style="display: inline-flex; align-items: center; gap: 8px;">
                            <span style="width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; color: ${profColor}; background: ${profColor}1a; border: 1px solid ${profColor}33;">
                                <i class="fa-solid ${profIcon}"></i>
                            </span>
                            <span style="font-weight: 600; font-size: 12px;">${item.charName}</span>
                        </div>
                    </td>
                    <td style="font-size: 11px; color: var(--text-muted);">
                        ${item.charProfession === 'bank' ? `Onglet ${item.bagIndex}` : `Sac ${item.bagIndex}`}, Empl. ${item.slotIndex}
                    </td>
                    <td style="font-weight: 700; font-size: 12px;">${item.count}</td>
                    <td style="font-size: 11px;">${bindingText}</td>
                </tr>
            `;
        }).join('');
    },

    renderVisualGrid(pane, characters) {
        const iconMap = {
            warrior: 'fa-shield-halved',
            guardian: 'fa-shield',
            revenant: 'fa-eye-slash',
            engineer: 'fa-gear',
            ranger: 'fa-crosshairs',
            thief: 'fa-mask',
            elementalist: 'fa-fire',
            necromancer: 'fa-skull',
            mesmer: 'fa-wand-magic-sparkles'
        };

        const profColors = {
            guardian: '#72c1c6',
            warrior: '#ffd166',
            revenant: '#9e2a2b',
            engineer: '#d08c3f',
            ranger: '#8cb369',
            thief: '#c08a8a',
            elementalist: '#f28482',
            mesmer: '#b5179e',
            necromancer: '#2ec4b6'
        };

        const charButtonsHtml = characters.map(char => {
            const prof = char.profession.toLowerCase();
            const color = profColors[prof] || 'var(--text-secondary)';
            const icon = iconMap[prof] || 'fa-user';
            const isActive = char.name === this.selectedChar;
            
            return `
                <button class="inv-char-btn ${isActive ? 'active' : ''}" data-char="${char.name}" style="--char-color: ${color};">
                    <i class="fa-solid ${icon}"></i>
                    <span>${char.name}</span>
                    <span class="char-lvl">Niv. ${char.level}</span>
                </button>
            `;
        }).join('');

        pane.innerHTML = `
            <div class="inv-char-selector">
                ${charButtonsHtml}
            </div>
            
            <div id="visual-bags-container">
                <!-- GW2 Inventory window will render here -->
            </div>
        `;

        // Wire character selectors
        const charButtons = pane.querySelectorAll('.inv-char-btn');
        charButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-char');
                this.selectedChar = name;
                charButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-char') === name));
                this.renderBagsGrid(characters);
            });
        });

        this.renderBagsGrid(characters);
    },

    renderBagsGrid(characters) {
        const container = document.getElementById('visual-bags-container');
        if (!container) return;

        const char = characters.find(c => c.name === this.selectedChar);
        if (!char) {
            container.innerHTML = `<p class="text-muted" style="text-align: center; padding: 20px;">Aucun personnage sélectionné.</p>`;
            return;
        }

        const rarityColors = {
            Junk: '#606075',
            Basic: '#3c352d',
            Fine: '#4cc9f0',
            Masterwork: '#4ad66d',
            Rare: '#ffb703',
            Exotic: '#ff9f1c',
            Ascended: '#ff4d6d',
            Legendary: '#7209b7'
        };

        if (!char.bags || char.bags.length === 0 || char.bags.every(b => b === null)) {
            container.innerHTML = `
                <div class="gw2-inventory-window">
                    <div class="gw2-inventory-header">
                        <div class="gw2-inventory-title">
                            <i class="fa-solid fa-boxes-stacked"></i>
                            <span>Inventaire - ${char.name}</span>
                            <span style="font-size: 11px; color: var(--text-muted); margin-left: 6px;">(${char.profession})</span>
                        </div>
                    </div>
                    <div class="gw2-inventory-body" style="justify-content: center; align-items: center; padding: 40px; color: var(--text-secondary);">
                        Aucun sac équipé sur ce personnage.
                    </div>
                </div>
            `;
            return;
        }

        // 1. Build Left Bags bar HTML and Right Grid HTML
        let bagsBarHtml = '';
        let slotsHtml = '';
        let totalSlots = 0;
        let occupiedSlots = 0;

        char.bags.forEach((bag, bagIndex) => {
            if (!bag) {
                bagsBarHtml += `
                    <div class="gw2-bag-slot-empty" title="Emplacement de sac vide">
                        <i class="fa-solid fa-lock"></i>
                    </div>
                `;
                return;
            }

            totalSlots += bag.size;

            const detail = this.allDetails[bag.id];
            const bagName = detail?.name || `Sac #${bagIndex + 1}`;
            const bagIcon = detail?.icon || 'https://render.guildwars2.com/file/54C811FFDF7D3BAAF48F4E6838BDCD70FC90DE6C/63148.png';
            const bagRarity = detail?.rarity || 'Basic';
            const rarityColor = rarityColors[bagRarity] || '#3c352d';

            bagsBarHtml += `
                <div class="gw2-bag-slot" data-bag-index="${bagIndex}" style="border-color: ${rarityColor};" title="${bagName} (${bag.size} emplacements)">
                    <img src="${bagIcon}" alt="Sac">
                </div>
            `;

            // Loop slots for this bag
            for (let i = 0; i < bag.size; i++) {
                const slot = bag.inventory && bag.inventory[i];
                if (slot) {
                    occupiedSlots++;
                    const itemDetail = this.allDetails[slot.id];
                    const name = itemDetail?.name || `Objet #${slot.id}`;
                    const icon = itemDetail?.icon || 'https://wiki.guildwars2.com/images/a/a1/Raptor_art.png';
                    const rarity = itemDetail?.rarity || 'Basic';
                    const rarityColor = rarityColors[rarity] || '#3c352d';

                    // Build dynamic native tooltip
                    let titleAttr = `${name}\n[${rarity}]`;
                    if (slot.binding) {
                        const bindLabel = slot.binding === 'Soulbind' ? "Lié à l'âme" : slot.binding === 'Account' ? "Lié au compte" : slot.binding;
                        titleAttr += `\n${bindLabel}`;
                    }
                    if (itemDetail?.level) {
                        titleAttr += `\nNiveau requis: ${itemDetail.level}`;
                    }
                    if (itemDetail?.description) {
                        const cleanDesc = itemDetail.description.replace(/<[^>]*>/g, '');
                        titleAttr += `\n\n"${cleanDesc}"`;
                    }

                    slotsHtml += `
                        <div class="inv-visual-slot" data-bag-index="${bagIndex}" data-item-name="${name.toLowerCase()}" data-item-id="${slot.id}" style="border-color: ${rarityColor};" title="${titleAttr}">
                            <img src="${icon}" alt="${name}">
                            ${slot.count > 1 ? `<span style="position: absolute; bottom: 1px; right: 3px; font-size: 9px; font-weight: 800; color: #fff; text-shadow: 1px 1px 2px #000, -1px -1px 2px #000;">${slot.count}</span>` : ''}
                        </div>
                    `;
                } else {
                    slotsHtml += `
                        <div class="inv-visual-slot-empty" data-bag-index="${bagIndex}"></div>
                    `;
                }
            }
        });

        // 2. Format gold for wallet
        const goldObj = this.wallet ? this.wallet.find(c => c.id === 1) : null;
        const pocketGoldHtml = this.formatPocketGold(goldObj ? goldObj.value : 0);

        // 3. Render full inventory frame
        container.innerHTML = `
            <div class="gw2-inventory-window">
                <!-- Header with Title and Search -->
                <div class="gw2-inventory-header">
                    <div class="gw2-inventory-title">
                        <i class="fa-solid fa-boxes-stacked"></i>
                        <span>Inventaire</span>
                        <span style="font-size: 11px; color: #7d7265; font-weight: 600; text-transform: none;">(${char.name})</span>
                    </div>
                    <div class="gw2-inventory-search-container">
                        <input type="text" id="gw2-inv-search" placeholder="Rechercher..." autocomplete="off">
                        <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    </div>
                </div>

                <!-- Main area: left bags vertical bar, right grid -->
                <div class="gw2-inventory-body">
                    <div class="gw2-inventory-bags-bar">
                        ${bagsBarHtml}
                    </div>
                    <div class="gw2-inventory-grid-container">
                        <div class="gw2-inventory-grid">
                            ${slotsHtml}
                        </div>
                    </div>
                </div>

                <!-- Footer: Wallet and slot counts -->
                <div class="gw2-inventory-footer">
                    <div class="gw2-inventory-wallet">
                        ${pocketGoldHtml}
                    </div>
                    <div class="gw2-inventory-slots-count">
                        ${occupiedSlots} / ${totalSlots} Emplacements
                    </div>
                </div>
            </div>
        `;

        // 4. Wire events: Search filtering
        const searchInput = document.getElementById('gw2-inv-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const slots = container.querySelectorAll('.inv-visual-slot, .inv-visual-slot-empty');
                
                slots.forEach(slot => {
                    if (!query) {
                        slot.classList.remove('dimmed');
                        return;
                    }
                    
                    const name = slot.getAttribute('data-item-name') || '';
                    const id = slot.getAttribute('data-item-id') || '';
                    
                    if (name.includes(query) || id.includes(query)) {
                        slot.classList.remove('dimmed');
                    } else {
                        slot.classList.add('dimmed');
                    }
                });
            });
        }

        // 5. Wire events: Bag slot hover highlights
        const bagSlots = container.querySelectorAll('.gw2-bag-slot');
        bagSlots.forEach(bagSlot => {
            const bagIndex = bagSlot.getAttribute('data-bag-index');
            
            bagSlot.addEventListener('mouseenter', () => {
                bagSlot.classList.add('highlighted');
                container.querySelectorAll(`[data-bag-index="${bagIndex}"]`).forEach(slot => {
                    if (slot.classList.contains('inv-visual-slot')) {
                        slot.classList.add('bag-hover-highlight');
                    }
                });
            });
            
            bagSlot.addEventListener('mouseleave', () => {
                bagSlot.classList.remove('highlighted');
                container.querySelectorAll(`[data-bag-index="${bagIndex}"]`).forEach(slot => {
                    slot.classList.remove('bag-hover-highlight');
                });
            });
        });
    },

    formatPocketGold(copperAmount) {
        if (!copperAmount) copperAmount = 0;
        const gold = Math.floor(copperAmount / 10000);
        const silver = Math.floor((copperAmount % 10000) / 100);
        const copper = copperAmount % 100;
        
        return `
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 11px;">
                ${gold > 0 ? `<span style="color: #ffd166; display: inline-flex; align-items: center; gap: 3px;">${gold.toLocaleString()} <span class="coin-symbol gold-dot" style="width: 10px; height: 10px; border-radius: 50%; display: inline-block; background-color: #ffd166; box-shadow: 0 0 5px rgba(255,209,102,0.6);" title="Or"></span></span>` : ''}
                ${gold > 0 || silver > 0 ? `<span style="color: #e0e0e0; display: inline-flex; align-items: center; gap: 3px;">${silver} <span class="coin-symbol silver-dot" style="width: 10px; height: 10px; border-radius: 50%; display: inline-block; background-color: #e0e0e0; box-shadow: 0 0 5px rgba(224,224,224,0.6);" title="Argent"></span></span>` : ''}
                <span style="color: #cd7f32; display: inline-flex; align-items: center; gap: 3px;">${copper} <span class="coin-symbol copper-dot" style="width: 10px; height: 10px; border-radius: 50%; display: inline-block; background-color: #cd7f32; box-shadow: 0 0 5px rgba(205,127,50,0.6);" title="Bronze"></span></span>
            </div>
        `;
    },

    renderBankVisualGrid(pane, bank) {
        const rarityColors = {
            Junk: '#606075',
            Basic: '#3c352d',
            Fine: '#4cc9f0',
            Masterwork: '#4ad66d',
            Rare: '#ffb703',
            Exotic: '#ff9f1c',
            Ascended: '#ff4d6d',
            Legendary: '#7209b7'
        };

        if (!bank || bank.length === 0) {
            pane.innerHTML = `
                <div class="gw2-inventory-window">
                    <div class="gw2-inventory-header">
                        <div class="gw2-inventory-title">
                            <i class="fa-solid fa-vault"></i>
                            <span>Banque de Compte</span>
                        </div>
                    </div>
                    <div class="gw2-inventory-body" style="justify-content: center; align-items: center; padding: 40px; color: var(--text-secondary);">
                        Votre banque de compte est vide ou inaccessible.
                    </div>
                </div>
            `;
            return;
        }

        const slotsPerTab = 30;
        const totalSlots = bank.length;
        const numTabs = Math.ceil(totalSlots / slotsPerTab);
        let occupiedSlots = 0;

        // Count occupied slots
        bank.forEach(slot => {
            if (slot) occupiedSlots++;
        });

        // Build stacked tabs HTML
        let bankTabsHtml = '';
        for (let t = 0; t < numTabs; t++) {
            let tabSlotsHtml = '';
            let occupiedInTab = 0;
            const startIdx = t * slotsPerTab;

            for (let s = 0; s < slotsPerTab; s++) {
                const globalIdx = startIdx + s;
                const slot = globalIdx < totalSlots ? bank[globalIdx] : null;

                if (slot) {
                    occupiedInTab++;
                    const itemDetail = this.allDetails[slot.id];
                    const name = itemDetail?.name || `Objet #${slot.id}`;
                    const icon = itemDetail?.icon || 'https://wiki.guildwars2.com/images/a/a1/Raptor_art.png';
                    const rarity = itemDetail?.rarity || 'Basic';
                    const rarityColor = rarityColors[rarity] || '#3c352d';

                    // Build dynamic native tooltip
                    let titleAttr = `${name}\n[${rarity}]`;
                    if (slot.binding) {
                        const bindLabel = slot.binding === 'Soulbind' ? "Lié à l'âme" : slot.binding === 'Account' ? "Lié au compte" : slot.binding;
                        titleAttr += `\n${bindLabel}`;
                    }
                    if (itemDetail?.level) {
                        titleAttr += `\nNiveau requis: ${itemDetail.level}`;
                    }
                    if (itemDetail?.description) {
                        const cleanDesc = itemDetail.description.replace(/<[^>]*>/g, '');
                        titleAttr += `\n\n"${cleanDesc}"`;
                    }

                    tabSlotsHtml += `
                        <div class="inv-visual-slot" data-item-name="${name.toLowerCase()}" data-item-id="${slot.id}" style="border-color: ${rarityColor};" title="${titleAttr}">
                            <img src="${icon}" alt="${name}">
                            ${slot.count > 1 ? `<span style="position: absolute; bottom: 1px; right: 3px; font-size: 9px; font-weight: 800; color: #fff; text-shadow: 1px 1px 2px #000, -1px -1px 2px #000;">${slot.count}</span>` : ''}
                        </div>
                    `;
                } else {
                    tabSlotsHtml += `
                        <div class="inv-visual-slot-empty"></div>
                    `;
                }
            }

            bankTabsHtml += `
                <div class="gw2-bank-tab-section" style="margin-bottom: 25px;">
                    <div class="gw2-bank-tab-header" style="font-weight: 700; color: #e0d0be; font-size: 11px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px; font-family: var(--font-heading); text-transform: uppercase; letter-spacing: 0.5px;">
                        <span><i class="fa-solid fa-folder-open" style="color: var(--color-accent); margin-right: 6px;"></i> Onglet de banque ${t + 1}</span>
                        <span style="font-size: 10px; color: var(--text-muted); text-transform: none; font-weight: 500;">${occupiedInTab} / 30 emplacements</span>
                    </div>
                    <div class="gw2-inventory-grid">
                        ${tabSlotsHtml}
                    </div>
                </div>
            `;
        }

        // Gold formatting
        const goldObj = this.wallet ? this.wallet.find(c => c.id === 1) : null;
        const pocketGoldHtml = this.formatPocketGold(goldObj ? goldObj.value : 0);

        pane.innerHTML = `
            <div class="gw2-inventory-window" style="max-width: 500px;">
                <!-- Header with Title and Search -->
                <div class="gw2-inventory-header">
                    <div class="gw2-inventory-title">
                        <i class="fa-solid fa-vault"></i>
                        <span>Banque de Compte</span>
                    </div>
                    <div class="gw2-inventory-search-container">
                        <input type="text" id="gw2-bank-search" placeholder="Rechercher..." autocomplete="off">
                        <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    </div>
                </div>

                <!-- Body (single visual scrollable container) -->
                <div class="gw2-inventory-body" style="padding: 15px;">
                    <div class="gw2-inventory-grid-container" style="max-height: 520px; width: 100%;">
                        <div style="display: flex; flex-direction: column; width: 100%;">
                            ${bankTabsHtml}
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="gw2-inventory-footer">
                    <div class="gw2-inventory-wallet">
                        ${pocketGoldHtml}
                    </div>
                    <div class="gw2-inventory-slots-count">
                        ${occupiedSlots} / ${totalSlots} Emplacements
                    </div>
                </div>
            </div>
        `;

        // Wire events: Search filtering
        const searchInput = document.getElementById('gw2-bank-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const slots = pane.querySelectorAll('.inv-visual-slot, .inv-visual-slot-empty');
                
                slots.forEach(slot => {
                    if (!query) {
                        slot.classList.remove('dimmed');
                        return;
                    }
                    
                    const name = slot.getAttribute('data-item-name') || '';
                    const id = slot.getAttribute('data-item-id') || '';
                    
                    if (name.includes(query) || id.includes(query)) {
                        slot.classList.remove('dimmed');
                    } else {
                        slot.classList.add('dimmed');
                    }
                });
            });
        }
    },

    renderMaterialsStorage(pane) {
        const rarityColors = {
            Junk: '#606075',
            Basic: '#3c352d',
            Fine: '#4cc9f0',
            Masterwork: '#4ad66d',
            Rare: '#ffb703',
            Exotic: '#ff9f1c',
            Ascended: '#ff4d6d',
            Legendary: '#7209b7'
        };

        const materials = this.materials || [];
        const categories = this.materialsCategories || [];

        // Build HTML for each category
        let categoriesHtml = '';
        let totalOwnedMaterials = 0;

        categories.forEach(cat => {
            let slotsHtml = '';
            let ownedInCat = 0;

            if (cat.items && Array.isArray(cat.items)) {
                cat.items.forEach(itemId => {
                    const userMat = materials.find(m => m.id === itemId);
                    if (userMat && userMat.count > 0) {
                        ownedInCat++;
                        totalOwnedMaterials++;
                        const itemDetail = this.allDetails[itemId];
                        const name = itemDetail?.name || `Objet #${itemId}`;
                        const icon = itemDetail?.icon || 'https://wiki.guildwars2.com/images/a/a1/Raptor_art.png';
                        const rarity = itemDetail?.rarity || 'Basic';
                        const rarityColor = rarityColors[rarity] || '#3c352d';

                        let titleAttr = `${name}\n[${rarity}]\nQuantité: ${userMat.count}`;
                        if (itemDetail?.description) {
                            const cleanDesc = itemDetail.description.replace(/<[^>]*>/g, '');
                            titleAttr += `\n\n"${cleanDesc}"`;
                        }

                        slotsHtml += `
                            <div class="inv-visual-slot" data-item-name="${name.toLowerCase()}" data-item-id="${itemId}" style="border-color: ${rarityColor};" title="${titleAttr}">
                                <img src="${icon}" alt="${name}">
                                <span style="position: absolute; bottom: 1px; right: 3px; font-size: 9px; font-weight: 800; color: #fff; text-shadow: 1px 1px 2px #000, -1px -1px 2px #000;">${userMat.count}</span>
                            </div>
                        `;
                    }
                });
            }

            if (ownedInCat > 0) {
                categoriesHtml += `
                    <div class="gw2-material-category" data-category-id="${cat.id}" style="margin-bottom: 20px;">
                        <div class="gw2-material-category-header" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); font-weight: 700; color: #e0d0be; font-size: 12px; font-family: var(--font-heading); text-transform: uppercase; border-radius: var(--radius-sm); margin-bottom: 10px; transition: background 0.2s;">
                            <span style="display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-chevron-down toggle-icon" style="transition: transform 0.2s; color: var(--color-accent);"></i>
                                <span>${cat.name}</span>
                            </span>
                            <span style="font-size: 11px; color: var(--text-muted); font-weight: 500; text-transform: none;">${ownedInCat} objets</span>
                        </div>
                        <div class="gw2-material-category-body gw2-inventory-grid" style="padding: 0 5px;">
                            ${slotsHtml}
                        </div>
                    </div>
                `;
            }
        });

        if (totalOwnedMaterials === 0) {
            categoriesHtml = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    Aucun matériau stocké sur ce compte.
                </div>
            `;
        }

        pane.innerHTML = `
            <style>
                .gw2-material-category-header:hover {
                    background: rgba(255, 255, 255, 0.07) !important;
                    color: var(--color-accent) !important;
                }
            </style>
            <div class="gw2-inventory-window" style="max-width: 500px;">
                <!-- Header with Title and Search -->
                <div class="gw2-inventory-header">
                    <div class="gw2-inventory-title">
                        <i class="fa-solid fa-mortar-pestle"></i>
                        <span>Stockage de Matériaux</span>
                    </div>
                    <div class="gw2-inventory-search-container">
                        <input type="text" id="gw2-materials-search" placeholder="Rechercher..." autocomplete="off">
                        <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    </div>
                </div>

                <!-- Body (single visual scrollable container) -->
                <div class="gw2-inventory-body" style="padding: 15px;">
                    <div class="gw2-inventory-grid-container" style="max-height: 520px; width: 100%;">
                        <div style="display: flex; flex-direction: column; width: 100%;">
                            ${categoriesHtml}
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="gw2-inventory-footer" style="justify-content: flex-end;">
                    <div class="gw2-inventory-slots-count">
                        ${totalOwnedMaterials} Matériaux possédés
                    </div>
                </div>
            </div>
        `;

        // Wire events: Category collapsibility
        const categoryHeaders = pane.querySelectorAll('.gw2-material-category-header');
        categoryHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const body = header.nextElementSibling;
                const icon = header.querySelector('.toggle-icon');
                if (body.style.display === 'none') {
                    body.style.display = 'grid';
                    icon.style.transform = 'rotate(0deg)';
                } else {
                    body.style.display = 'none';
                    icon.style.transform = 'rotate(-90deg)';
                }
            });
        });

        // Wire events: Search filtering
        const searchInput = document.getElementById('gw2-materials-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const slots = pane.querySelectorAll('.inv-visual-slot');
                
                slots.forEach(slot => {
                    if (!query) {
                        slot.classList.remove('dimmed');
                        return;
                    }
                    
                    const name = slot.getAttribute('data-item-name') || '';
                    const id = slot.getAttribute('data-item-id') || '';
                    
                    if (name.includes(query) || id.includes(query)) {
                        slot.classList.remove('dimmed');
                    } else {
                        slot.classList.add('dimmed');
                    }
                });

                // Adjust category headers visibility/collapse based on match
                const categories = pane.querySelectorAll('.gw2-material-category');
                categories.forEach(cat => {
                    const body = cat.querySelector('.gw2-material-category-body');
                    const header = cat.querySelector('.gw2-material-category-header');
                    const slots = cat.querySelectorAll('.inv-visual-slot');
                    const hasVisibleSlots = Array.from(slots).some(s => !s.classList.contains('dimmed'));

                    if (query) {
                        if (hasVisibleSlots) {
                            cat.style.display = 'block';
                            body.style.display = 'grid';
                            const icon = header.querySelector('.toggle-icon');
                            if (icon) icon.style.transform = 'rotate(0deg)';
                        } else {
                            cat.style.display = 'none';
                        }
                    } else {
                        cat.style.display = 'block';
                    }
                });
            });
        }
    },

    renderGuildVaults(pane) {
        const guildsStashes = this.guildsStashes || [];

        if (guildsStashes.length === 0) {
            pane.innerHTML = `
                <div class="gw2-inventory-window" style="max-width: 500px;">
                    <div class="gw2-inventory-header">
                        <div class="gw2-inventory-title">
                            <i class="fa-solid fa-shield-halved"></i>
                            <span>Coffres de Guilde</span>
                        </div>
                    </div>
                    <div class="gw2-inventory-body" style="justify-content: center; align-items: center; padding: 40px; color: var(--text-secondary); text-align: center;">
                        <i class="fa-solid fa-circle-info" style="font-size: 30px; margin-bottom: 15px; color: var(--text-muted);"></i>
                        <p>Aucun coffre de guilde accessible ou clé API sans droits de guilde.</p>
                    </div>
                </div>
            `;
            return;
        }

        const guildButtonsHtml = guildsStashes.map(g => {
            const isActive = g.guildId === this.selectedGuildId;
            return `
                <button class="inv-char-btn ${isActive ? 'active' : ''}" data-guild="${g.guildId}" style="--char-color: var(--color-accent);">
                    <i class="fa-solid fa-shield-halved"></i>
                    <span>${g.name}</span>
                    <span class="char-lvl">[${g.tag}]</span>
                </button>
            `;
        }).join('');

        pane.innerHTML = `
            <div class="inv-char-selector">
                ${guildButtonsHtml}
            </div>
            
            <div id="guild-stashes-container">
                <!-- Guild stash window will render here -->
            </div>
        `;

        // Wire guild selectors
        const guildButtons = pane.querySelectorAll('.inv-char-btn');
        guildButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const guildId = btn.getAttribute('data-guild');
                this.selectedGuildId = guildId;
                guildButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-guild') === guildId));
                this.renderGuildStashContent();
            });
        });

        this.renderGuildStashContent();
    },

    renderGuildStashContent() {
        const container = document.getElementById('guild-stashes-container');
        if (!container) return;

        const currentGuild = this.guildsStashes.find(g => g.guildId === this.selectedGuildId);
        if (!currentGuild || !currentGuild.stash || !Array.isArray(currentGuild.stash)) {
            container.innerHTML = `
                <div class="gw2-inventory-window" style="max-width: 500px;">
                    <div class="gw2-inventory-body" style="justify-content: center; align-items: center; padding: 40px; color: var(--text-secondary);">
                        Ce coffre de guilde est vide ou inaccessible.
                    </div>
                </div>
            `;
            return;
        }

        const rarityColors = {
            Junk: '#606075',
            Basic: '#3c352d',
            Fine: '#4cc9f0',
            Masterwork: '#4ad66d',
            Rare: '#ffb703',
            Exotic: '#ff9f1c',
            Ascended: '#ff4d6d',
            Legendary: '#7209b7'
        };

        let stashTabsHtml = '';
        let totalSlots = 0;
        let occupiedSlots = 0;

        currentGuild.stash.forEach((tab, tIdx) => {
            let tabSlotsHtml = '';
            const size = tab.size || 50;
            totalSlots += size;
            let occupiedInTab = 0;

            for (let s = 0; s < size; s++) {
                const slot = tab.inventory && tab.inventory[s];
                if (slot) {
                    occupiedInTab++;
                    occupiedSlots++;
                    const itemDetail = this.allDetails[slot.id];
                    const name = itemDetail?.name || `Objet #${slot.id}`;
                    const icon = itemDetail?.icon || 'https://wiki.guildwars2.com/images/a/a1/Raptor_art.png';
                    const rarity = itemDetail?.rarity || 'Basic';
                    const rarityColor = rarityColors[rarity] || '#3c352d';

                    let titleAttr = `${name}\n[${rarity}]`;
                    if (slot.binding) {
                        titleAttr += `\nLiaison: ${slot.binding}`;
                    }
                    if (itemDetail?.description) {
                        const cleanDesc = itemDetail.description.replace(/<[^>]*>/g, '');
                        titleAttr += `\n\n"${cleanDesc}"`;
                    }

                    tabSlotsHtml += `
                        <div class="inv-visual-slot" data-item-name="${name.toLowerCase()}" data-item-id="${slot.id}" style="border-color: ${rarityColor};" title="${titleAttr}">
                            <img src="${icon}" alt="${name}">
                            ${slot.count > 1 ? `<span style="position: absolute; bottom: 1px; right: 3px; font-size: 9px; font-weight: 800; color: #fff; text-shadow: 1px 1px 2px #000, -1px -1px 2px #000;">${slot.count}</span>` : ''}
                        </div>
                    `;
                } else {
                    tabSlotsHtml += `
                        <div class="inv-visual-slot-empty"></div>
                    `;
                }
            }

            const tabGoldHtml = this.formatPocketGold(tab.coins || 0);
            const tabName = tab.note || (size === 50 ? "Réserve de guilde" : size === 100 ? "Trésor de guilde" : "Cave de guilde");

            stashTabsHtml += `
                <div class="gw2-bank-tab-section" style="margin-bottom: 25px;">
                    <div class="gw2-bank-tab-header" style="font-weight: 700; color: #e0d0be; font-size: 11px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px; font-family: var(--font-heading); text-transform: uppercase; letter-spacing: 0.5px;">
                        <span><i class="fa-solid fa-folder-open" style="color: var(--color-accent); margin-right: 6px;"></i> ${tabName} (${size} emplacements)</span>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            ${tab.coins > 0 ? `<div style="display: flex; align-items: center; gap: 5px;"><span style="color: var(--text-muted); font-size: 10px; font-weight: 500;">Or déposé :</span> ${tabGoldHtml}</div>` : ''}
                            <span style="font-size: 10px; color: var(--text-muted); text-transform: none; font-weight: 500;">${occupiedInTab} / ${size} emplacements</span>
                        </div>
                    </div>
                    <div class="gw2-inventory-grid">
                        ${tabSlotsHtml}
                    </div>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="gw2-inventory-window" style="max-width: 500px;">
                <!-- Header with Title and Search -->
                <div class="gw2-inventory-header">
                    <div class="gw2-inventory-title">
                        <i class="fa-solid fa-shield-halved"></i>
                        <span>Coffre de Guilde : ${currentGuild.name}</span>
                    </div>
                    <div class="gw2-inventory-search-container">
                        <input type="text" id="gw2-guild-search" placeholder="Rechercher..." autocomplete="off">
                        <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    </div>
                </div>

                <!-- Body (single visual scrollable container) -->
                <div class="gw2-inventory-body" style="padding: 15px;">
                    <div class="gw2-inventory-grid-container" style="max-height: 520px; width: 100%;">
                        <div style="display: flex; flex-direction: column; width: 100%;">
                            ${stashTabsHtml}
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="gw2-inventory-footer" style="justify-content: flex-end;">
                    <div class="gw2-inventory-slots-count">
                        ${occupiedSlots} / ${totalSlots} Emplacements
                    </div>
                </div>
            </div>
        `;

        // Wire events: Search filtering
        const searchInput = document.getElementById('gw2-guild-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const slots = container.querySelectorAll('.inv-visual-slot, .inv-visual-slot-empty');
                
                slots.forEach(slot => {
                    if (!query) {
                        slot.classList.remove('dimmed');
                        return;
                    }
                    
                    const name = slot.getAttribute('data-item-name') || '';
                    const id = slot.getAttribute('data-item-id') || '';
                    
                    if (name.includes(query) || id.includes(query)) {
                        slot.classList.remove('dimmed');
                    } else {
                        slot.classList.add('dimmed');
                    }
                });
            });
        }
    }
};

