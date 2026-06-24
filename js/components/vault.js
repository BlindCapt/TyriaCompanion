import { GW2Api } from '../api.js';

export const Vault = {
    activeSubTab: 'daily', // 'daily', 'weekly', 'special', 'shop'
    activeShopFilter: 'Featured', // 'Featured', 'Normal', 'Legacy'

    async render(container) {
        container.innerHTML = `
            <div class="legendary-tabs">
                <button class="tab-btn ${this.activeSubTab === 'daily' ? 'active' : ''}" id="btn-vault-daily">
                    <i class="fa-solid fa-calendar-day"></i> Objectifs Quotidiens
                </button>
                <button class="tab-btn ${this.activeSubTab === 'weekly' ? 'active' : ''}" id="btn-vault-weekly">
                    <i class="fa-solid fa-calendar-week"></i> Objectifs Hebdomadaires
                </button>
                <button class="tab-btn ${this.activeSubTab === 'special' ? 'active' : ''}" id="btn-vault-special">
                    <i class="fa-solid fa-star"></i> Spéciaux (Saison)
                </button>
                <button class="tab-btn ${this.activeSubTab === 'shop' ? 'active' : ''}" id="btn-vault-shop">
                    <i class="fa-solid fa-store"></i> Boutique du Sorcier
                </button>
            </div>
            <div id="vault-content-pane">
                <div class="loader-container">
                    <div class="spinner"></div>
                    <p>Chargement de la Chambre du Sorcier...</p>
                </div>
            </div>
        `;

        // Wire sub tab events
        document.getElementById('btn-vault-daily').addEventListener('click', () => {
            this.activeSubTab = 'daily';
            this.renderContent();
        });
        document.getElementById('btn-vault-weekly').addEventListener('click', () => {
            this.activeSubTab = 'weekly';
            this.renderContent();
        });
        document.getElementById('btn-vault-special').addEventListener('click', () => {
            this.activeSubTab = 'special';
            this.renderContent();
        });
        document.getElementById('btn-vault-shop').addEventListener('click', () => {
            this.activeSubTab = 'shop';
            this.renderContent();
        });

        await this.renderContent();
    },

    async renderContent() {
        const pane = document.getElementById('vault-content-pane');
        if (!pane) return;

        // Update active tab styles
        document.getElementById('btn-vault-daily').className = `tab-btn ${this.activeSubTab === 'daily' ? 'active' : ''}`;
        document.getElementById('btn-vault-weekly').className = `tab-btn ${this.activeSubTab === 'weekly' ? 'active' : ''}`;
        document.getElementById('btn-vault-special').className = `tab-btn ${this.activeSubTab === 'special' ? 'active' : ''}`;
        document.getElementById('btn-vault-shop').className = `tab-btn ${this.activeSubTab === 'shop' ? 'active' : ''}`;

        pane.innerHTML = `
            <div class="loader-container">
                <div class="spinner"></div>
                <p>Synchronisation avec la Chambre du Sorcier...</p>
            </div>
        `;

        try {
            // Fetch Astral Acclaim balance from wallet
            let currentAcclaim = 0;
            try {
                const wallet = await GW2Api.getWallet();
                const acclaimObj = wallet.find(c => c.id === 74);
                currentAcclaim = acclaimObj ? acclaimObj.value : 0;
            } catch (e) {
                console.error("Failed to load wallet for Astral Acclaim", e);
            }

            const percent = Math.min(100, Math.round((currentAcclaim / 1300) * 100));

            pane.innerHTML = `
                <!-- Astral Acclaim Balance Banner -->
                <div class="vault-header-banner" style="background: linear-gradient(135deg, rgba(114, 9, 183, 0.12), rgba(76, 201, 240, 0.12)); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 15px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 45px; height: 45px; background: rgba(76, 201, 240, 0.1); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(76, 201, 240, 0.3);">
                            <img src="https://render.guildwars2.com/file/1856A01E331452E4C14E4C9CF4F818E3FAEF9B79/3124964.png" alt="Astral Acclaim" style="width: 28px; height: 28px;">
                        </div>
                        <div>
                            <h3 style="font-size: 15px; font-weight: 700; margin: 0; font-family: var(--font-heading);">Pièces Astrales Possédées</h3>
                            <p style="font-size: 11px; color: var(--text-secondary); margin: 2px 0 0 0;">Limite du compte : 1 300 maximum</p>
                        </div>
                    </div>
                    <div style="flex-grow: 1; max-width: 400px; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; min-width: 200px;">
                        <div style="display: flex; justify-content: space-between; width: 100%; font-size: 13px; font-weight: 700;">
                            <span style="color: var(--color-accent);">${currentAcclaim} <span style="font-weight: 500; font-size: 11px; color: var(--text-secondary);">possédées</span></span>
                            <span style="color: var(--text-muted);">1 300 <span style="font-weight: 500; font-size: 11px;">max</span></span>
                        </div>
                        <div class="mat-progressbar" style="height: 8px; width: 100%; margin-top: 0; background-color: rgba(255, 255, 255, 0.05); border-radius: 4px; overflow: hidden;">
                            <div class="mat-bar" style="width: ${percent}%; height: 100%; background: linear-gradient(to right, var(--color-primary), var(--color-accent)); border-radius: 4px;"></div>
                        </div>
                    </div>
                </div>
                <div id="vault-tab-detail-pane"></div>
            `;

            const detailPane = document.getElementById('vault-tab-detail-pane');

            if (this.activeSubTab === 'daily') {
                await this.renderObjectivesTab(detailPane, '/account/wizardsvault/daily?lang=fr', 'wizards_vault_daily', true);
            } else if (this.activeSubTab === 'weekly') {
                await this.renderObjectivesTab(detailPane, '/account/wizardsvault/weekly?lang=fr', 'wizards_vault_weekly', true);
            } else if (this.activeSubTab === 'special') {
                await this.renderObjectivesTab(detailPane, '/account/wizardsvault/special?lang=fr', 'wizards_vault_special', false);
            } else if (this.activeSubTab === 'shop') {
                await this.renderShopTab(detailPane, currentAcclaim);
            }
        } catch (error) {
            pane.innerHTML = `<p class="text-danger" style="text-align: center; padding: 20px;">Erreur : ${error.message}</p>`;
        }
    },

    async renderObjectivesTab(pane, endpoint, cacheKey, showMetaReward) {
        // Fetch vault data (caches for 1 minute to allow quick refreshes but save bandwidth)
        const data = await GW2Api.fetchWithCache(endpoint, cacheKey, 60 * 1000, true);
        
        if (!data || !data.objectives) {
            pane.innerHTML = `<p class="text-muted" style="text-align: center; padding: 20px;">Aucun objectif disponible pour le moment.</p>`;
            return;
        }

        let metaHtml = '';
        if (showMetaReward) {
            const metaClaimed = data.meta_reward_claimed;
            const metaCurrent = data.meta_progress_current || 0;
            const metaComplete = data.meta_progress_complete || 1;
            const metaPercent = Math.min(100, Math.round((metaCurrent / metaComplete) * 100));
            const metaAstral = data.meta_reward_astral || 0;

            metaHtml = `
                <div class="card" style="margin-bottom: 20px; border-color: ${metaClaimed ? 'var(--color-success)' : 'var(--border-color)'};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div>
                            <h4 style="font-size: 13px; font-weight: 700; margin: 0;">
                                Coffre de Récompense Globale (${metaCurrent} / ${metaComplete})
                            </h4>
                            <span style="font-size: 11px; font-weight: 600; color: ${metaClaimed ? 'var(--color-success)' : 'var(--color-warning)'}; margin-top: 4px; display: block;">
                                ${metaClaimed ? '<i class="fa-solid fa-circle-check"></i> Récompense Réclamée' : '<i class="fa-solid fa-hourglass-half"></i> En cours de complétion'}
                            </span>
                        </div>
                        <span style="font-size: 14px; font-weight: 800; color: var(--color-accent);">
                            +${metaAstral} <i class="fa-solid fa-star"></i>
                        </span>
                    </div>
                    <div class="mat-progressbar" style="height: 8px;">
                        <div class="mat-bar" style="width: ${metaPercent}%; background-color: ${metaClaimed ? 'var(--color-success)' : 'var(--color-accent)'};"></div>
                    </div>
                </div>
            `;
        }

        let listHtml = data.objectives.map(obj => {
            const completed = obj.progress_current >= obj.progress_complete;
            const itemClass = completed ? 'completed' : '';
            const iconClass = completed ? 'fa-square-check' : 'fa-square';
            const progressText = completed ? 'Terminé' : `${obj.progress_current} / ${obj.progress_complete}`;
            const trackBadgeClass = obj.track === 'PvE' ? 'badge-pve' : (obj.track === 'PvP' ? 'badge-pvp' : 'badge-wvw');
            const percent = Math.min(100, Math.round((obj.progress_current / obj.progress_complete) * 100));

            return `
                <div class="check-item ${itemClass}" style="cursor: default; margin-bottom: 8px; align-items: flex-start;">
                    <div class="check-label" style="align-items: flex-start; flex-grow: 1;">
                        <i class="fa-regular ${iconClass} check-box-icon" style="margin-top: 3px;"></i>
                        <div style="flex-grow: 1;">
                            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <span class="check-title" style="font-weight: 600; font-size: 13px;">${obj.title}</span>
                                <span class="track-badge ${trackBadgeClass}">${obj.track}</span>
                            </div>
                            <span style="font-size: 10px; color: var(--text-muted); display: block; margin-top: 4px;">
                                Progrès : ${progressText}
                            </span>
                            ${!completed ? `
                            <div class="mat-progressbar" style="height: 4px; margin-top: 6px; width: 100%; max-width: 300px; background-color: rgba(255, 255, 255, 0.05); border-radius: 2px; overflow: hidden;">
                                <div class="mat-bar" style="width: ${percent}%; height: 100%; background: linear-gradient(to right, var(--color-primary), var(--color-accent)); border-radius: 2px; transition: width 0.3s ease;"></div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <span class="check-reward" style="font-weight: 700; font-size: 12px; display: flex; align-items: center; gap: 4px; color: var(--text-primary); margin-left: 15px; flex-shrink: 0; margin-top: 2px;">
                        +${obj.acclaim} <i class="fa-solid fa-star" style="color: var(--color-accent); font-size: 12px;"></i>
                    </span>
                </div>
            `;
        }).join('');

        pane.innerHTML = `
            ${metaHtml}
            <div class="checklist-container">
                ${listHtml}
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-refresh-vault" style="margin-top: 20px; width: 100%;">
                <i class="fa-solid fa-arrows-rotate"></i> Rafraîchir les objectifs
            </button>
        `;

        document.getElementById('btn-refresh-vault').addEventListener('click', () => {
            // Force clear non-permanent cache for the current tab's key and reload
            localStorage.removeItem('gw2_cache_' + cacheKey);
            localStorage.removeItem('gw2_cache_wallet'); // Clear wallet cache to refresh points
            this.renderContent();
        });
    },

    async renderShopTab(pane, currentAcclaim) {
        pane.innerHTML = `
            <div class="loader-container">
                <div class="spinner"></div>
                <p>Récupération des offres de la boutique...</p>
            </div>
        `;

        try {
            // Fetch Wizards Vault listings (cache for 2 minutes to keep it snappy but accurate)
            const listings = await GW2Api.fetchWithCache('/account/wizardsvault/listings?lang=fr', 'wizards_vault_listings', 2 * 60 * 1000, true);
            
            if (!listings || listings.length === 0) {
                pane.innerHTML = `<p class="text-muted" style="text-align: center; padding: 20px;">La boutique est vide pour le moment.</p>`;
                return;
            }

            // Group listings by type
            const featuredListings = listings.filter(l => l.type === 'Featured');
            const normalListings = listings.filter(l => l.type === 'Normal');
            const legacyListings = listings.filter(l => l.type === 'Legacy');

            // Count listings per type
            const featuredCount = featuredListings.length;
            const normalCount = normalListings.length;
            const legacyCount = legacyListings.length;

            // Get filtered listings
            let filteredListings = [];
            if (this.activeShopFilter === 'Featured') {
                filteredListings = featuredListings;
            } else if (this.activeShopFilter === 'Normal') {
                filteredListings = normalListings;
            } else if (this.activeShopFilter === 'Legacy') {
                filteredListings = legacyListings;
            }

            // Fetch details for all filtered items
            const itemIds = filteredListings.map(l => l.item_id);
            const itemDetails = await GW2Api.getItemDetails(itemIds);

            // Tooltip helper
            const getTooltipAttr = (item) => {
                if (!item) return '';
                const name = item.name || '';
                let text = name;
                if (item.rarity) {
                    text += `\n[${item.rarity}]`;
                }
                if (item.level) {
                    text += `\nNiveau requis: ${item.level}`;
                }
                if (item.description) {
                    const cleanDesc = item.description.replace(/<[^>]*>/g, '').trim();
                    text += `\n\n"${cleanDesc}"`;
                }
                return text.replace(/"/g, '&quot;');
            };

            // Rarity color helper
            const getRarityColor = (rarity) => {
                switch (rarity) {
                    case 'Junk': return '#aaaaaa';
                    case 'Basic': return '#ffffff';
                    case 'Fine': return '#62a4da';
                    case 'Masterwork': return '#1a9306';
                    case 'Rare': return '#fcd00b';
                    case 'Exotic': return '#ffa405';
                    case 'Ascended': return '#fb3e8e';
                    case 'Legendary': return '#a020f0';
                    default: return 'var(--border-color)';
                }
            };

            // Build filter tabs HTML
            const filterTabsHtml = `
                <div class="shop-filter-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; flex-wrap: wrap;">
                    <button class="btn ${this.activeShopFilter === 'Featured' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-shop-featured" style="font-size: 11px; padding: 6px 12px; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-star"></i> En Vedette (${featuredCount})
                    </button>
                    <button class="btn ${this.activeShopFilter === 'Normal' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-shop-normal" style="font-size: 11px; padding: 6px 12px; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-box"></i> Objets Courants (${normalCount})
                    </button>
                    <button class="btn ${this.activeShopFilter === 'Legacy' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-shop-legacy" style="font-size: 11px; padding: 6px 12px; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-clock-rotate-left"></i> Héritage (${legacyCount})
                    </button>
                </div>
            `;

            // Build grid HTML
            const gridHtml = filteredListings.map(listing => {
                const item = itemDetails[listing.item_id] || {
                    name: `Objet #${listing.item_id}`,
                    icon: 'https://render.guildwars2.com/file/1856A01E331452E4C14E4C9CF4F818E3FAEF9B79/3124964.png',
                    description: 'Détails de l\'objet indisponibles.',
                    rarity: 'Basic'
                };

                const isSoldOut = listing.purchase_limit !== null && listing.purchased >= listing.purchase_limit;

                return `
                    <div class="shop-card ${isSoldOut ? 'sold-out' : ''}" data-item-id="${listing.item_id}" style="background-color: var(--bg-card); border: 1px solid ${isSoldOut ? 'var(--border-color)' : 'rgba(255,255,255,0.03)'}; border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; transition: all 0.2s ease; position: relative; overflow: hidden; cursor: pointer; box-shadow: var(--shadow-sm); ${isSoldOut ? 'opacity: 0.55;' : ''}">
                        
                        ${isSoldOut ? `
                        <div class="sold-out-overlay" style="position: absolute; top: 10px; right: 10px; background-color: var(--color-danger); color: white; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; z-index: 2; border: 1px solid rgba(255,255,255,0.2);">
                            Épuisé
                        </div>
                        ` : ''}

                        <div style="display: flex; gap: 12px; align-items: flex-start;">
                            <!-- Icon -->
                            <div class="shop-item-icon-wrapper" style="position: relative; width: 44px; height: 44px; flex-shrink: 0;">
                                <img src="${item.icon}" alt="${item.name}" title="${getTooltipAttr(item)}" style="width: 44px; height: 44px; border-radius: var(--radius-sm); border: 2px solid ${getRarityColor(item.rarity)}; background-color: rgba(0,0,0,0.2);" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/1856A01E331452E4C14E4C9CF4F818E3FAEF9B79/3124964.png';">
                                ${listing.item_count > 1 ? `
                                <span class="shop-item-count-badge" style="position: absolute; bottom: -2px; right: -2px; background: rgba(0, 0, 0, 0.85); color: #fff; font-size: 9px; font-weight: 800; padding: 1px 3px; border-radius: 3px; border: 1px solid rgba(255, 255, 255, 0.2); pointer-events: none;">
                                    x${listing.item_count}
                                </span>
                                ` : ''}
                            </div>

                            <!-- Name and Rarity -->
                            <div style="flex-grow: 1; min-width: 0;">
                                <h4 class="item-name" style="font-size: 13px; font-weight: 700; margin: 0; line-height: 1.3; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.name}">${item.name}</h4>
                                <span style="font-size: 10px; font-weight: 600; color: ${getRarityColor(item.rarity)}; text-transform: uppercase; margin-top: 2px; display: block;">${item.rarity || 'Objet'}</span>
                            </div>
                        </div>

                        <!-- Description -->
                        <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; min-height: 32px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" title="${item.description ? item.description.replace(/<[^>]*>/g, '') : ''}">
                            ${item.description ? item.description.replace(/<[^>]*>/g, '').trim() : 'Aucune description disponible.'}
                        </div>

                        <!-- Cost and Limits Footer -->
                        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: auto;">
                            <!-- Acclaim Cost -->
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span style="font-size: 14px; font-weight: 800; color: ${currentAcclaim >= listing.cost ? 'var(--text-primary)' : 'var(--color-danger)'};">
                                    ${listing.cost}
                                </span>
                                <img src="https://render.guildwars2.com/file/1856A01E331452E4C14E4C9CF4F818E3FAEF9B79/3124964.png" alt="Pièce Astrale" style="width: 14px; height: 14px;">
                            </div>

                            <!-- Purchase Count / limit -->
                            <div style="text-align: right; font-size: 11px; font-weight: 500; color: var(--text-secondary);">
                                ${listing.purchase_limit === null ? `
                                    <span style="color: var(--color-success); font-weight: 600;"><i class="fa-solid fa-infinity"></i> Illimité</span>
                                ` : `
                                    Achetés : <span style="font-weight: 700; color: ${isSoldOut ? 'var(--color-danger)' : 'var(--text-primary)'};">${listing.purchased}</span> / ${listing.purchase_limit}
                                `}
                            </div>
                        </div>

                    </div>
                `;
            }).join('');

            pane.innerHTML = `
                ${filterTabsHtml}
                <div class="shop-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
                    ${gridHtml}
                </div>
                <button class="btn btn-secondary btn-sm" id="btn-refresh-vault-shop" style="margin-top: 20px; width: 100%;">
                    <i class="fa-solid fa-arrows-rotate"></i> Rafraîchir la boutique
                </button>
            `;

            // Wire filter events
            document.getElementById('btn-shop-featured').addEventListener('click', () => {
                this.activeShopFilter = 'Featured';
                this.renderShopTab(pane, currentAcclaim);
            });
            document.getElementById('btn-shop-normal').addEventListener('click', () => {
                this.activeShopFilter = 'Normal';
                this.renderShopTab(pane, currentAcclaim);
            });
            document.getElementById('btn-shop-legacy').addEventListener('click', () => {
                this.activeShopFilter = 'Legacy';
                this.renderShopTab(pane, currentAcclaim);
            });

            // Wire refresh event
            document.getElementById('btn-refresh-vault-shop').addEventListener('click', () => {
                localStorage.removeItem('gw2_cache_wizards_vault_listings');
                localStorage.removeItem('gw2_cache_wallet'); // Also refresh wallet cache for points
                this.renderContent();
            });

        } catch (error) {
            pane.innerHTML = `<p class="text-danger" style="text-align: center; padding: 20px;">Erreur : ${error.message}</p>`;
        }
    }
};
