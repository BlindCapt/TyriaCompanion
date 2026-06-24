import { GW2Api } from '../api.js';

export const Dashboard = {
    async render(container) {
        container.innerHTML = `
            <div class="loader-container">
                <div class="spinner"></div>
                <p>Chargement des données du compte...</p>
            </div>
        `;

        try {
            // Fetch account info, wallet, characters, currencies
            const account = await GW2Api.getAccountInfo();
            const wallet = await GW2Api.getWallet();
            const characters = await GW2Api.getCharacters();
            const currencies = await GW2Api.getCurrencies();

            // Format Gold
            const goldObj = wallet.find(c => c.id === 1); // Currency ID 1 is Gold
            const goldHtmlLarge = this.formatGoldLarge(goldObj ? goldObj.value : 0);

            // Find key currencies
            const karma = wallet.find(c => c.id === 2)?.value || 0;
            const laurels = wallet.find(c => c.id === 3)?.value || 0;
            const aurillium = wallet.find(c => c.id === 45)?.value || 0;
            const astralAcclaim = wallet.find(c => c.id === 74)?.value || 0;
            const unusualCoins = wallet.find(c => c.id === 62)?.value || 0;

            // Generate characters HTML with profession colors & icons
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

            const charactersHtml = characters.length > 0 
                ? characters.map(char => {
                    const profClass = char.profession.toLowerCase();
                    const icon = iconMap[profClass] || 'fa-user';
                    const color = profColors[profClass] || 'var(--text-secondary)';
                    return `
                        <div class="character-card" style="border-left: 3px solid ${color};">
                            <div class="char-main">
                                <div class="char-prof-icon-circle" style="color: ${color}; background-color: ${color}12; border: 1px solid ${color}33;">
                                    <i class="fa-solid ${icon}"></i>
                                </div>
                                <div>
                                    <div class="char-name">${char.name}</div>
                                    <div class="char-meta">${char.race} • ${char.profession}</div>
                                </div>
                            </div>
                            <div class="char-level" style="background-color: ${color}1a; border: 1px solid ${color}4d; color: ${color};">Niv. ${char.level}</div>
                        </div>
                    `;
                }).join('')
                : '<p class="text-muted">Aucun personnage trouvé.</p>';

            // Date format
            const creationDate = new Date(account.created).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Account play time hours
            const playTimeHours = Math.floor((account.age || 0) / 3600);
            const guildsCount = account.guilds ? account.guilds.length : 0;
            const isCommander = account.commander;

            // Expansions checklist
            const expansions = [
                { id: 'HeartOfThorns', name: 'Heart of Thorns (HoT)', color: '#2ec4b6' },
                { id: 'PathOfFire', name: 'Path of Fire (PoF)', color: '#ffb703' },
                { id: 'EndOfDragons', name: 'End of Dragons (EoD)', color: '#4cc9f0' },
                { id: 'SecretsOfTheObscure', name: 'Secrets of the Obscure (SotO)', color: '#7209b7' },
                { id: 'JanthirWilds', name: 'Janthir Wilds (JW)', color: '#e63946' }
            ];

            const expansionsHtml = expansions.map(exp => {
                const unlocked = account.access && account.access.includes(exp.id);
                return `
                    <div class="expansion-badge-item ${unlocked ? 'unlocked' : 'locked'}">
                        <div style="display: flex; align-items: center;">
                            <span class="expansion-dot" style="background-color: ${unlocked ? exp.color : 'var(--text-muted)'};"></span>
                            <span class="expansion-name">${exp.name}</span>
                        </div>
                        <span class="expansion-status-label">${unlocked ? '<i class="fa-solid fa-circle-check"></i> Actif' : '<i class="fa-solid fa-circle-xmark"></i> Non possédé'}</span>
                    </div>
                `;
            }).join('');

            // Update main container
            container.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 25px;">
                    <!-- Hero Section: Profile and Fortune -->
                    <div class="dashboard-hero-container">
                        <!-- Profile Card -->
                        <div class="dashboard-hero-profile">
                            <div class="profile-header">
                                <div class="profile-avatar">
                                    <i class="fa-solid ${isCommander ? 'fa-shield-cat' : 'fa-user-gear'}"></i>
                                </div>
                                <div>
                                    <h2 class="profile-name">${account.name}</h2>
                                    <div class="profile-badges">
                                        ${isCommander ? '<span class="badge-commander"><i class="fa-solid fa-flag"></i> Commandant</span>' : ''}
                                        <span class="badge-creation"><i class="fa-solid fa-calendar"></i> Depuis le ${creationDate}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="profile-stats">
                                <div class="prof-stat-item">
                                    <span class="prof-stat-label">Temps de Jeu</span>
                                    <strong class="prof-stat-value">${playTimeHours.toLocaleString()} h</strong>
                                </div>
                                <div class="prof-stat-item">
                                    <span class="prof-stat-label">Guildes</span>
                                    <strong class="prof-stat-value">${guildsCount} / 5</strong>
                                </div>
                                <div class="prof-stat-item">
                                    <span class="prof-stat-label">Niveau Fractale</span>
                                    <strong class="prof-stat-value">${account.fractal_level || 1}</strong>
                                </div>
                                <div class="prof-stat-item">
                                    <span class="prof-stat-label">Rang WvW</span>
                                    <strong class="prof-stat-value">${account.wvw_rank || 1}</strong>
                                </div>
                            </div>
                        </div>

                        <!-- Fortune Gold display -->
                        <div class="dashboard-hero-gold">
                            <div class="gold-card-header">
                                <span>Fortune Globale</span>
                                <i class="fa-solid fa-coins gold-icon-glow"></i>
                            </div>
                            <div class="gold-display-large">
                                ${goldHtmlLarge}
                            </div>
                            <div class="gold-display-subtitle">
                                Solde disponible immédiatement sur votre compte
                            </div>
                        </div>
                    </div>

                    <!-- Row 2: Resources & Expansion Unlocks -->
                    <div class="grid-layout">
                        <!-- Resources Card -->
                        <div class="card">
                            <div class="card-title">
                                <span>Ressources et Monnaies</span>
                                <i class="fa-solid fa-wallet"></i>
                            </div>
                            <div class="wallet-grid-new">
                                <div class="wallet-item-new">
                                    <div class="item-icon-circle" style="color: #c9c9ff; background: rgba(201, 201, 255, 0.05);"><i class="fa-solid fa-yin-yang"></i></div>
                                    <div class="wallet-info">
                                        <span>Karma</span>
                                        <strong>${karma.toLocaleString()}</strong>
                                    </div>
                                </div>
                                <div class="wallet-item-new">
                                    <div class="item-icon-circle" style="color: #ffd166; background: rgba(255, 209, 102, 0.05);"><i class="fa-solid fa-leaf"></i></div>
                                    <div class="wallet-info">
                                        <span>Lauriers</span>
                                        <strong>${laurels}</strong>
                                    </div>
                                </div>
                                <div class="wallet-item-new">
                                    <div class="item-icon-circle" style="color: #ff9f1c; background: rgba(255, 159, 28, 0.05);"><i class="fa-solid fa-gem"></i></div>
                                    <div class="wallet-info">
                                        <span>Aurillium</span>
                                        <strong>${aurillium.toLocaleString()}</strong>
                                    </div>
                                </div>
                                <div class="wallet-item-new">
                                    <div class="item-icon-circle" style="color: var(--color-accent); background: rgba(76, 201, 240, 0.05);"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
                                    <div class="wallet-info">
                                        <span>Acclamations</span>
                                        <strong>${astralAcclaim.toLocaleString()}</strong>
                                    </div>
                                </div>
                                <div class="wallet-item-new" style="grid-column: span 2;">
                                    <div class="item-icon-circle" style="color: #4cc9f0; background: rgba(76, 201, 240, 0.05);"><i class="fa-solid fa-circle-nodes"></i></div>
                                    <div class="wallet-info">
                                        <span>Pièces Inhabituelles</span>
                                        <strong>${unusualCoins.toLocaleString()}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Expansions Unlocks Card -->
                        <div class="card">
                            <div class="card-title">
                                <span>Extensions Déverrouillées</span>
                                <i class="fa-solid fa-rectangle-list"></i>
                            </div>
                            <div class="expansions-list">
                                ${expansionsHtml}
                            </div>
                        </div>
                    </div>

                    <!-- Row 3: Characters Gallery Grid -->
                    <div class="card">
                        <div class="card-title">
                            <span>Vos Personnages (${characters.length})</span>
                            <i class="fa-solid fa-users"></i>
                        </div>
                        <div class="character-grid">
                            ${charactersHtml}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `
                <div class="card" style="border-color: var(--color-danger); padding: 30px; text-align: center;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 40px; color: var(--color-danger); margin-bottom: 15px;"></i>
                    <h3>Erreur lors de la récupération des données</h3>
                    <p style="margin-top: 10px; color: var(--text-secondary);">${error.message}</p>
                    <button class="btn btn-secondary" style="margin-top: 20px;" onclick="location.reload()">Réessayer</button>
                </div>
            `;
        }
    },

    formatGoldLarge(copperAmount) {
        if (!copperAmount) copperAmount = 0;
        const gold = Math.floor(copperAmount / 10000);
        const silver = Math.floor((copperAmount % 10000) / 100);
        const copper = copperAmount % 100;

        return `
            <div class="gold-digits">
                <div class="digit-group gold">
                    <span class="digit-val">${gold.toLocaleString()}</span>
                    <span class="coin-symbol gold-dot" title="Or"></span>
                </div>
                <div class="digit-group silver">
                    <span class="digit-val">${silver}</span>
                    <span class="coin-symbol silver-dot" title="Argent"></span>
                </div>
                <div class="digit-group copper">
                    <span class="digit-val">${copper}</span>
                    <span class="coin-symbol copper-dot" title="Bronze"></span>
                </div>
            </div>
        `;
    }
};
