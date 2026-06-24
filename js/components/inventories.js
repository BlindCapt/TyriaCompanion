import { GW2Api } from '../api.js';

export const Inventories = {
    activeTab: 'global', // 'global', 'visual'
    selectedChar: '', // Active character for visual view
    allDetails: {},
    wallet: null, // Global wallet data

    async render(container) {
        container.innerHTML = `
            <div class="loader-container">
                <div class="spinner"></div>
                <p>Récupération des inventaires de vos personnages...</p>
            </div>
        `;

        try {
            let characters = [];
            try {
                const results = await Promise.allSettled([
                    GW2Api.getCharacters(),
                    GW2Api.getWallet()
                ]);
                characters = results[0].status === 'fulfilled' ? results[0].value : [];
                this.wallet = results[1].status === 'fulfilled' ? results[1].value : null;
            } catch (e) {
                console.error("Error fetching inventories dependencies", e);
            }

            if (!characters || characters.length === 0) {
                container.innerHTML = `
                    <div class="card" style="text-align: center; padding: 40px;">
                        <i class="fa-solid fa-users-slash" style="font-size: 40px; color: var(--text-muted); margin-bottom: 20px;"></i>
                        <h3>Aucun personnage trouvé</h3>
                        <p style="color: var(--text-secondary); margin-top: 10px;">
                            Impossible de charger les personnages de votre compte.
                        </p>
                    </div>
                `;
                return;
            }

            // Set default selected character if empty
            if (!this.selectedChar) {
                this.selectedChar = characters[0].name;
            }

            // 1. Gather all item IDs (including bags themselves)
            const allItems = [];
            const bagIds = [];

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

            const uniqueIds = [...new Set([...allItems.map(i => i.id), ...bagIds])];

            // 2. Fetch item details
            this.allDetails = await GW2Api.getItemDetails(uniqueIds);

            // 3. Render base tabs structure
            this.renderLayout(container, characters, allItems);

        } catch (error) {
            container.innerHTML = `
                <div class="card" style="border-color: var(--color-danger); padding: 30px; text-align: center;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 40px; color: var(--color-danger); margin-bottom: 15px;"></i>
                    <h3>Erreur Inventaires</h3>
                    <p style="margin-top: 10px; color: var(--text-secondary);">${error.message}</p>
                    <button class="btn btn-secondary" style="margin-top: 20px;" onclick="location.reload()">Réessayer</button>
                </div>
            `;
        }
    },

    renderLayout(container, characters, allItems) {
        container.innerHTML = `
            <div class="legendary-tabs">
                <button class="tab-btn ${this.activeTab === 'global' ? 'active' : ''}" id="btn-inv-global">
                    <i class="fa-solid fa-magnifying-glass"></i> Recherche Globale
                </button>
                <button class="tab-btn ${this.activeTab === 'visual' ? 'active' : ''}" id="btn-inv-visual">
                    <i class="fa-solid fa-boxes-stacked"></i> Sacs par Personnage
                </button>
            </div>
            <div id="inventories-content-pane">
                <!-- Sub-view content -->
            </div>
        `;

        // Wire sub tab events
        document.getElementById('btn-inv-global').addEventListener('click', () => {
            this.activeTab = 'global';
            this.renderContent(characters, allItems);
        });
        document.getElementById('btn-inv-visual').addEventListener('click', () => {
            this.activeTab = 'visual';
            this.renderContent(characters, allItems);
        });

        this.renderContent(characters, allItems);
    },

    renderContent(characters, allItems) {
        const pane = document.getElementById('inventories-content-pane');
        if (!pane) return;

        // Toggle active tabs
        document.getElementById('btn-inv-global').className = `tab-btn ${this.activeTab === 'global' ? 'active' : ''}`;
        document.getElementById('btn-inv-visual').className = `tab-btn ${this.activeTab === 'visual' ? 'active' : ''}`;

        if (this.activeTab === 'global') {
            this.renderGlobalSearch(pane, characters, allItems);
        } else {
            this.renderVisualGrid(pane, characters);
        }
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
                        <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Personnage</label>
                        <select id="inv-filter-char" class="form-select" style="width: 100%;">
                            <option value="all">Tous les personnages</option>
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
            necromancer: '#2ec4b6'
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
            mesmer: 'fa-wand-magic-sparkles'
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
                        Sac ${item.bagIndex}, Empl. ${item.slotIndex}
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
    }
};
