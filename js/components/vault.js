import { GW2Api } from '../api.js';

export const Vault = {
    activeSubTab: 'daily', // 'daily', 'weekly', 'special'

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
            </div>
            <div id="vault-content-pane">
                <div class="loader-container">
                    <div class="spinner"></div>
                    <p>Chargement des objectifs de la Chambre du Sorcier...</p>
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

        await this.renderContent();
    },

    async renderContent() {
        const pane = document.getElementById('vault-content-pane');
        if (!pane) return;

        // Update active tab styles
        document.getElementById('btn-vault-daily').className = `tab-btn ${this.activeSubTab === 'daily' ? 'active' : ''}`;
        document.getElementById('btn-vault-weekly').className = `tab-btn ${this.activeSubTab === 'weekly' ? 'active' : ''}`;
        document.getElementById('btn-vault-special').className = `tab-btn ${this.activeSubTab === 'special' ? 'active' : ''}`;

        pane.innerHTML = `
            <div class="loader-container">
                <div class="spinner"></div>
                <p>Synchronisation avec la Chambre du Sorcier...</p>
            </div>
        `;

        try {
            if (this.activeSubTab === 'daily') {
                await this.renderObjectivesTab(pane, '/account/wizardsvault/daily', 'wizards_vault_daily', true);
            } else if (this.activeSubTab === 'weekly') {
                await this.renderObjectivesTab(pane, '/account/wizardsvault/weekly', 'wizards_vault_weekly', true);
            } else {
                await this.renderObjectivesTab(pane, '/account/wizardsvault/special', 'wizards_vault_special', false);
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
            this.renderContent();
        });
    }
};
