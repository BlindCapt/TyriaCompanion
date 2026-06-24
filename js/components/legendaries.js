import { GW2Api } from '../api.js';

export const Legendaries = {
    activeSubTab: 'seasons', // 'seasons', 'obsidian', 'orrax'
    obsidianPiecesCount: 6,  // Default to full set (6) or 1 piece
    showCraftGuide: false,   // Craft guide visibility


    async render(container) {
        container.innerHTML = `
            <div class="legendary-tabs">
                <button class="tab-btn ${this.activeSubTab === 'seasons' ? 'active' : ''}" id="btn-tab-seasons">
                    <i class="fa-solid fa-dragon"></i> Saisons des Dragons
                </button>
                <button class="tab-btn ${this.activeSubTab === 'obsidian' ? 'active' : ''}" id="btn-tab-obsidian">
                    <i class="fa-solid fa-gem"></i> Armure d'Obsidienne (SotO)
                </button>
                <button class="tab-btn ${this.activeSubTab === 'orrax' ? 'active' : ''}" id="btn-tab-orrax">
                    <i class="fa-solid fa-suitcase"></i> Dos de Janthir (Orrax)
                </button>
            </div>
            <div id="legendary-content-pane">
                <div class="loader-container">
                    <div class="spinner"></div>
                    <p>Chargement de votre progression...</p>
                </div>
            </div>
        `;

        // Wire sub tab events
        document.getElementById('btn-tab-seasons').addEventListener('click', () => {
            this.activeSubTab = 'seasons';
            this.renderContent();
        });
        document.getElementById('btn-tab-obsidian').addEventListener('click', () => {
            this.activeSubTab = 'obsidian';
            this.renderContent();
        });
        document.getElementById('btn-tab-orrax').addEventListener('click', () => {
            this.activeSubTab = 'orrax';
            this.renderContent();
        });

        await this.renderContent();
    },

    async renderContent() {
        const pane = document.getElementById('legendary-content-pane');
        if (!pane) return;

        // Visual toggle active button classes
        const btnSeasons = document.getElementById('btn-tab-seasons');
        const btnObsidian = document.getElementById('btn-tab-obsidian');
        const btnOrrax = document.getElementById('btn-tab-orrax');
        if (btnSeasons) btnSeasons.className = `tab-btn ${this.activeSubTab === 'seasons' ? 'active' : ''}`;
        if (btnObsidian) btnObsidian.className = `tab-btn ${this.activeSubTab === 'obsidian' ? 'active' : ''}`;
        if (btnOrrax) btnOrrax.className = `tab-btn ${this.activeSubTab === 'orrax' ? 'active' : ''}`;

        if (this.activeSubTab === 'seasons') {
            await this.renderSeasons(pane);
        } else if (this.activeSubTab === 'obsidian') {
            await this.renderObsidian(pane);
        } else if (this.activeSubTab === 'orrax') {
            await this.renderOrrax(pane);
        }
    },

    async renderSeasons(pane) {
        try {
            const progress = await GW2Api.getSeasonsOfTheDragonsProgress();
            if (!progress) {
                pane.innerHTML = `<p class="text-muted">Impossible de récupérer la progression.</p>`;
                return;
            }

            const completedCount = progress.filter(ach => ach.done).length;
            const percent = Math.round((completedCount / 24) * 100);

            // Tier rewards indicators
            const tier1 = completedCount >= 4 ? 'done' : 'lock';
            const tier2 = completedCount >= 10 ? 'done' : 'lock';
            const tier3 = completedCount >= 16 ? 'done' : 'lock';
            const tier4 = completedCount >= 24 ? 'done' : 'lock';

            let listHtml = progress.map(ach => {
                const isStarted = !ach.done && ach.current > 0;
                const statusClass = ach.done ? 'completed' : (isStarted ? 'started' : 'missing');
                const badgeClass = ach.done ? 'done' : (isStarted ? 'started' : 'lock');
                const badgeText = ach.done ? 'Complété' : `${ach.current}/${ach.max}`;
                const checkIcon = ach.done ? 'fa-circle-check' : 'fa-circle';
                
                return `
                    <div class="meta-item ${statusClass}" data-meta-id="${ach.id}">
                        <div class="meta-header">
                            <div class="meta-info">
                                <span class="meta-name">${ach.name}</span>
                                <span class="meta-desc">${ach.requirement || ach.description || ''}</span>
                            </div>
                            <span class="meta-badge ${badgeClass}">
                                <i class="fa-regular ${checkIcon}"></i> ${badgeText}
                            </span>
                        </div>
                    </div>
                `;
            }).join('');

            pane.innerHTML = `
                <div class="card" style="margin-bottom: 25px;">
                    <div class="card-title">
                        <span>Progression Globale : Seasons of the Dragons</span>
                        <span style="color: var(--color-accent);">${completedCount} / 24 (${percent}%)</span>
                    </div>
                    
                    <div class="mat-progressbar" style="height: 12px; margin-bottom: 20px;">
                        <div class="mat-bar" style="width: ${percent}%;"></div>
                    </div>

                    <!-- Rewards Track -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center;">
                        <div class="wallet-item ${tier1 === 'done' ? 'active' : ''}" style="flex-direction: column; padding: 10px; border-color: ${tier1 === 'done' ? 'var(--color-success)' : 'var(--border-color)'}">
                            <i class="fa-solid fa-gift" style="font-size: 20px; color: ${tier1 === 'done' ? 'var(--color-success)' : 'var(--text-muted)'}"></i>
                            <span style="font-size: 11px; margin-top: 5px; font-weight: 600;">Palier 1 (4)</span>
                            <span style="font-size: 9px; color: var(--text-muted);">Arme Élevée</span>
                        </div>
                        <div class="wallet-item ${tier2 === 'done' ? 'active' : ''}" style="flex-direction: column; padding: 10px; border-color: ${tier2 === 'done' ? 'var(--color-legendary)' : 'var(--border-color)'}">
                            <i class="fa-solid fa-gem" style="font-size: 20px; color: ${tier2 === 'done' ? 'var(--color-legendary)' : 'var(--text-muted)'}"></i>
                            <span style="font-size: 11px; margin-top: 5px; font-weight: 600;">Palier 2 (10)</span>
                            <span style="font-size: 9px; color: var(--text-muted);">Précurseur G3</span>
                        </div>
                        <div class="wallet-item ${tier3 === 'done' ? 'active' : ''}" style="flex-direction: column; padding: 10px; border-color: ${tier3 === 'done' ? 'var(--color-success)' : 'var(--border-color)'}">
                            <i class="fa-solid fa-bag-shopping" style="font-size: 20px; color: ${tier3 === 'done' ? 'var(--color-success)' : 'var(--text-muted)'}"></i>
                            <span style="font-size: 11px; margin-top: 5px; font-weight: 600;">Palier 3 (16)</span>
                            <span style="font-size: 9px; color: var(--text-muted);">Sac 32 Places</span>
                        </div>
                        <div class="wallet-item ${tier4 === 'done' ? 'active' : ''}" style="flex-direction: column; padding: 10px; border-color: ${tier4 === 'done' ? 'var(--color-accent)' : 'var(--border-color)'}">
                            <i class="fa-solid fa-award" style="font-size: 20px; color: ${tier4 === 'done' ? 'var(--color-accent)' : 'var(--text-muted)'}"></i>
                            <span style="font-size: 11px; margin-top: 5px; font-weight: 600;">Palier 4 (24)</span>
                            <span style="font-size: 9px; color: var(--text-muted);">Amulette Légendaire</span>
                        </div>
                    </div>
                </div>

                <div class="meta-achievements-list">
                    ${listHtml}
                </div>
            `;

            // Add click listeners to expand achievements and show detailed sub-tasks
            const headers = pane.querySelectorAll('.meta-header');
            headers.forEach(header => {
                const item = header.closest('.meta-item');
                const metaId = parseInt(item.dataset.metaId, 10);
                if (metaId === 5823) return; // Skip final dialogue since it has no sub-tasks
                
                header.addEventListener('click', async () => {
                    let subList = item.querySelector('.sub-achievements-list');
                    if (subList) {
                        subList.style.display = subList.style.display === 'none' ? 'block' : 'none';
                        item.classList.toggle('expanded');
                        return;
                    }
                    
                    // Create subList container
                    subList = document.createElement('div');
                    subList.className = 'sub-achievements-list';
                    subList.innerHTML = `
                        <div class="sub-loader">
                            <i class="fa-solid fa-spinner fa-spin"></i> Chargement des détails...
                        </div>
                    `;
                    item.appendChild(subList);
                    item.classList.add('expanded');
                    
                    try {
                        const details = await GW2Api.getSeasonsAchievementDetails(metaId);
                        if (!details || details.length === 0) {
                            subList.innerHTML = `<p class="text-muted" style="padding: 10px; font-size: 12px; text-align: center;">Aucun détail disponible.</p>`;
                            return;
                        }
                        
                        subList.innerHTML = details.map(sub => {
                            const subStatus = sub.done ? 'sub-completed' : 'sub-missing';
                            const subIcon = sub.done ? 'fa-square-check' : 'fa-square';
                            const subColor = sub.done ? 'var(--color-success)' : 'var(--text-muted)';
                            return `
                                <div class="sub-ach-item ${subStatus}">
                                    <i class="fa-regular ${subIcon}" style="color: ${subColor}; font-size: 14px; margin-right: 8px; margin-top: 1px;"></i>
                                    <div style="flex-grow: 1;">
                                        <div style="font-weight: 500; font-size: 12px;">${sub.name}</div>
                                        <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">${sub.requirement || sub.description || ''}</div>
                                    </div>
                                </div>
                            `;
                        }).join('');
                    } catch (err) {
                        subList.innerHTML = `<p class="text-danger" style="padding: 10px; font-size: 12px; text-align: center;">Erreur : ${err.message}</p>`;
                    }
                });
            });
        } catch (error) {
            pane.innerHTML = `<p class="text-danger">Erreur : ${error.message}</p>`;
        }
    },

    async renderObsidian(pane) {
        try {
            // Loading screen inside pane
            pane.innerHTML = `
                <div class="loader-container">
                    <div class="spinner"></div>
                    <p>Scrutage de votre banque, de vos matériaux et de vos personnages...</p>
                </div>
            `;

            // Fetch materials, wallet, bank and characters in parallel
            let wallet = [];
            let bank = [];
            let materials = [];
            let characters = [];
            let currencies = [];

            try {
                const results = await Promise.allSettled([
                    GW2Api.getWallet(),
                    GW2Api.getBank(),
                    GW2Api.fetchWithCache('/account/materials', 'account_materials', 3 * 60 * 1000, true),
                    GW2Api.getCharacters(),
                    GW2Api.getCurrencies()
                ]);
                
                wallet = results[0].status === 'fulfilled' ? results[0].value || [] : [];
                bank = results[1].status === 'fulfilled' ? results[1].value || [] : [];
                materials = results[2].status === 'fulfilled' ? results[2].value || [] : [];
                characters = results[3].status === 'fulfilled' ? results[3].value || [] : [];
                currencies = results[4].status === 'fulfilled' ? results[4].value || [] : [];
            } catch (e) {
                console.error("Error loading obsidian inputs", e);
            }

            // Find essences in wallet by static API IDs (robust across translations)
            const fineEssenceObj = currencies.find(c => c.id === 78);
            const masterworkEssenceObj = currencies.find(c => c.id === 80);
            const rareEssenceObj = currencies.find(c => c.id === 79);

            const staticChargeObj = currencies.find(c => c.id === 72);
            const stardustObj = currencies.find(c => c.id === 73);
            const calcifiedObj = currencies.find(c => c.id === 75);

            // Balances in wallet
            const fineCount = wallet.find(c => c.id === 78)?.value || 0;
            const masterworkCount = wallet.find(c => c.id === 80)?.value || 0;
            const rareCount = wallet.find(c => c.id === 79)?.value || 0;

            const staticCount = wallet.find(c => c.id === 72)?.value || 0;
            const stardustCount = wallet.find(c => c.id === 73)?.value || 0;
            const calcifiedCount = wallet.find(c => c.id === 75)?.value || 0;

            // Fetch details for all item requirements to get their official fresh icons
            const itemIds = [
                100930, 19675, 19721, // Amalgamated, Clover, Ecto
                19925, 81840, 19678, // Obsidian Shard, Dark Energy Cube, Gift of Battle
                46746, 46745,         // Vision Crystal, Lesser Vision Crystal
                24295, 24283, 24300, 24277, // T6 materials (Blood, Venom, Totem, Dust)
                71655, 71787, 73236, 73196  // T6 gifts (Blood, Venom, Totem, Dust)
            ];
            const itemDetails = await GW2Api.getItemDetails(itemIds);

            // Item counts checked across Bank + Materials + Characters bags
            const amalgamatedRiftEssenceCount = this.countTotalItem(100930, bank, materials, characters);
            const cloverCount = this.countTotalItem(19675, bank, materials, characters);
            const ectoCount = this.countTotalItem(19721, bank, materials, characters);
            const obsidianCount = this.countTotalItem(19925, bank, materials, characters);
            const darkEnergyCount = this.countTotalItem(81840, bank, materials, characters);
            const giftBattleCount = this.countTotalItem(19678, bank, materials, characters);
            
            const visionCrystalCount = this.countTotalItem(46746, bank, materials, characters);
            const lesserVisionCrystalCount = this.countTotalItem(46745, bank, materials, characters);
            const visionCrystalTotal = visionCrystalCount + lesserVisionCrystalCount;

            const giftBloodCount = this.countTotalItem(71655, bank, materials, characters);
            const giftVenomCount = this.countTotalItem(71787, bank, materials, characters);
            const giftTotemCount = this.countTotalItem(73236, bank, materials, characters);
            const giftDustCount = this.countTotalItem(73196, bank, materials, characters);

            const bloodCount = this.countTotalItem(24295, bank, materials, characters) + (giftBloodCount * 100);
            const venomCount = this.countTotalItem(24283, bank, materials, characters) + (giftVenomCount * 100);
            const totemCount = this.countTotalItem(24300, bank, materials, characters) + (giftTotemCount * 100);
            const dustCount = this.countTotalItem(24277, bank, materials, characters) + (giftDustCount * 100);

            // Obsidian requirements (1 piece vs 6 pieces)
            const factor = this.obsidianPiecesCount;

            // Calculate overall progress & retrieve requirements config
            const progressObj = this.calculateProgress(characters, bank, materials, wallet, factor);
            const reqs = progressObj.reqs;

            // Calculate progress percents for specific items
            const pAmalgamated = Math.min(100, Math.round((amalgamatedRiftEssenceCount / reqs.amalgamated) * 100)) || 0;
            const pClover = Math.min(100, Math.round((cloverCount / reqs.clover) * 100)) || 0;
            const pEcto = Math.min(100, Math.round((ectoCount / reqs.ecto) * 100)) || 0;
            const pStatic = Math.min(100, Math.round((staticCount / reqs.static) * 100)) || 0;
            const pStardust = Math.min(100, Math.round((stardustCount / reqs.stardust) * 100)) || 0;
            const pCalcified = Math.min(100, Math.round((calcifiedCount / reqs.calcified) * 100)) || 0;
            const pFine = Math.min(100, Math.round((fineCount / reqs.fine) * 100)) || 0;
            const pMaster = Math.min(100, Math.round((masterworkCount / reqs.master) * 100)) || 0;
            const pRare = Math.min(100, Math.round((rareCount / reqs.rare) * 100)) || 0;
            const pObsidian = Math.min(100, Math.round((obsidianCount / reqs.obsidian) * 100)) || 0;
            const pDarkEnergy = Math.min(100, Math.round((darkEnergyCount / reqs.darkEnergy) * 100)) || 0;
            const pGiftBattle = Math.min(100, Math.round((giftBattleCount / reqs.giftBattle) * 100)) || 0;
            const pVisionCrystal = Math.min(100, Math.round((visionCrystalTotal / reqs.visionCrystal) * 100)) || 0;
            const pBlood = Math.min(100, Math.round((bloodCount / reqs.blood) * 100)) || 0;
            const pVenom = Math.min(100, Math.round((venomCount / reqs.venom) * 100)) || 0;
            const pTotem = Math.min(100, Math.round((totemCount / reqs.totem) * 100)) || 0;
            const pDust = Math.min(100, Math.round((dustCount / reqs.dust) * 100)) || 0;

            // Get dynamic icons
            const amalgamatedIcon = itemDetails[100930]?.icon || 'https://render.guildwars2.com/file/F4A4C84E9D0A86E0FECA94F7CEEE57E9EA369D3B/3110292.png';
            const cloverIcon = itemDetails[19675]?.icon || 'https://render.guildwars2.com/file/FE9DC3E10D4B2AE16DADEB07CF28A058570E2EF3/455855.png';
            const ectoIcon = itemDetails[19721]?.icon || 'https://render.guildwars2.com/file/A12C596F1D3528A614660FB2D66133F3987CE5EB/222340.png';
            const obsidianIcon = itemDetails[19925]?.icon || 'https://render.guildwars2.com/file/4C221CD6B96D69FDF8C053E778E2CD37C4F22C5A/63345.png';
            const darkEnergyIcon = itemDetails[81840]?.icon || 'https://render.guildwars2.com/file/E52F86B1DF85CAE0FE59C8614E2B16B4D5D726D6/1454593.png';
            const giftBattleIcon = itemDetails[19678]?.icon || 'https://render.guildwars2.com/file/FDF5ED7D3BAAF48F4E6838BDCD70FC90DE6C6314.png';
            const visionCrystalIcon = itemDetails[46746]?.icon || 'https://render.guildwars2.com/file/A94F7CEEE57E9EA369D3BFDF5ED7D3BAAF48F4E6/63363.png';

            const fineIcon = fineEssenceObj?.icon || 'https://render.guildwars2.com/file/41D633F8F0CCFAD7FDADEF7CE84BF7C312AA1B49/3630022.png';
            const masterworkIcon = masterworkEssenceObj?.icon || 'https://render.guildwars2.com/file/E0A96441F8405ABEF06114BE750154583CF3B1D2/3630023.png';
            const rareIcon = rareEssenceObj?.icon || 'https://render.guildwars2.com/file/A6012206459C56680D1BD4D23E0B706F0B0AE40D/3630024.png';

            const staticIcon = staticChargeObj?.icon || 'https://render.guildwars2.com/file/314EF613F04029E9A8354FB8D79A72EDC36DDF10/3123702.png';
            const stardustIcon = stardustObj?.icon || 'https://render.guildwars2.com/file/22DE50C72BCD2610345EA67F5E4032057EA2ABE5/3123701.png';
            const calcifiedIcon = calcifiedObj?.icon || 'https://render.guildwars2.com/file/0BF799CCA1DD262AE1F3B867900A002D080B56C3/3188140.png';

            // T6 Icons
            const bloodIcon = itemDetails[24295]?.icon || 'https://render.guildwars2.com/file/1A930A6A7B5B01EAB4CB36E79014C12B500BF6B3/66950.png';
            const venomIcon = itemDetails[24283]?.icon || 'https://render.guildwars2.com/file/543EC37900EA2A57E77FA891193A48D66AA224AB/66939.png';
            const totemIcon = itemDetails[24300]?.icon || 'https://render.guildwars2.com/file/C1ABF9082901FC3CEABC3138CBCCA1DAD5D41812/66955.png';
            const dustIcon = itemDetails[24277]?.icon || 'https://render.guildwars2.com/file/080D00670558CD9E580D5662030394B2206E92A6/434537.png';

            // Get persistent manual checklist
            const checklist = this.getManualChecklist();

            // Helper for dynamic item hovers
            const getTooltipAttr = (item, isCurrency = false) => {
                if (!item) return '';
                const name = item.name || '';
                let text = name;
                if (!isCurrency && item.rarity) {
                    text += `\n[${item.rarity}]`;
                }
                if (!isCurrency && item.level) {
                    text += `\nNiveau requis: ${item.level}`;
                }
                if (item.description) {
                    const cleanDesc = item.description.replace(/<[^>]*>/g, '').trim();
                    text += `\n\n"${cleanDesc}"`;
                }
                return text.replace(/"/g, '&quot;');
            };

            pane.innerHTML = `
                <div class="card" style="margin-bottom: 25px;">
                    <div class="card-title">
                        <span>Calculateur d'Armure d'Obsidienne</span>
                        <div class="toggle-container" style="display: flex; gap: 8px;">
                            <button id="btn-obsidian-1" class="btn btn-sm ${this.obsidianPiecesCount === 1 ? 'btn-primary' : 'btn-secondary'}">1 Pièce</button>
                            <button id="btn-obsidian-6" class="btn btn-sm ${this.obsidianPiecesCount === 6 ? 'btn-primary' : 'btn-secondary'}">Set Complet (6)</button>
                        </div>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 13px;">
                        Ce calculateur vérifie vos réserves en banque, votre stockage de matériaux et vos inventaires de personnages pour comptabiliser les composants restants pour fabriquer votre armure légendaire de SotO.
                    </p>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-weight: 700; font-size: 12px;">
                            <span style="color: var(--text-secondary);">Progression Globale de l'Armure</span>
                            <div>
                                <span id="obsidian-overall-progress-percent" style="color: var(--color-accent); font-weight: 800;">${progressObj.percent}%</span>
                                <span id="obsidian-overall-progress-steps" style="color: var(--text-muted); font-size: 10px; margin-left: 5px;">(${progressObj.completedSteps.toLocaleString()} / ${progressObj.totalSteps.toLocaleString()})</span>
                            </div>
                        </div>
                        <div class="mat-progressbar" style="height: 10px;">
                            <div id="obsidian-overall-progress-bar" class="mat-bar" style="width: ${progressObj.percent}%;"></div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                        <button id="btn-toggle-craft-guide" class="btn btn-secondary btn-sm">
                            <i class="fa-solid ${this.showCraftGuide ? 'fa-book-open-reader' : 'fa-book'}"></i>
                            <span>${this.showCraftGuide ? 'Masquer le Guide de Craft' : 'Afficher le Guide de Craft'}</span>
                        </button>
                    </div>
                </div>

                <!-- Craft Guide Panel -->
                <div id="obsidian-craft-guide-card" class="card" style="display: ${this.showCraftGuide ? 'block' : 'none'}; margin-bottom: 25px; border-color: var(--color-primary-glow);">
                    <div class="card-title" style="color: var(--color-legendary);">
                        <span>Guide de Craft Pas-à-Pas - Armure d'Obsidienne</span>
                        <i class="fa-solid fa-scroll"></i>
                    </div>
                    <div style="font-size: 13px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 20px;">
                        <!-- Step 1 -->
                        <div style="border-left: 2px solid var(--color-primary); padding-left: 15px; position: relative;">
                            <span style="position: absolute; left: -9px; top: 0; background: var(--bg-card); padding: 0 4px; color: var(--color-primary); font-weight: 700; font-size: 11px;">1</span>
                            <h4 style="color: var(--text-primary); font-size: 14px; font-weight: 700; margin-bottom: 6px;">Étape 1 : Prérequis de Collections</h4>
                            <p>Vous devez déverrouiller la collection correspondante au poids d'armure désiré (Léger, Moyen, Lourd) en achetant et débloquant les ensembles de skins suivants :</p>
                            <ul style="margin-left: 20px; margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
                                <li><strong style="color: var(--text-primary);">Armure de la Garde astrale</strong> (Astral Ward) : Achetée auprès de la Garde astrale contre des pièces d'or et des monnaies de cartes de SotO.</li>
                                <li><strong style="color: var(--text-primary);">Armure d'Oneiros</strong> (Oneiros-spun) : Débloquée via l'artisanat ou achetée au comptoir/PNJ de Nayos.</li>
                            </ul>
                        </div>
                        
                        <!-- Step 2 -->
                        <div style="border-left: 2px solid var(--color-primary); padding-left: 15px; position: relative;">
                            <span style="position: absolute; left: -9px; top: 0; background: var(--bg-card); padding: 0 4px; color: var(--color-primary); font-weight: 700; font-size: 11px;">2</span>
                            <h4 style="color: var(--text-primary); font-size: 14px; font-weight: 700; margin-bottom: 6px;">Étape 2 : L'Armure Précurseur (Garde Astrale Purifiée)</h4>
                            <p>Chaque pièce légendaire nécessite son précurseur purifié. Fusionnez les ingrédients suivants dans la Forge Mystique :</p>
                            <div style="background: rgba(0,0,0,0.15); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-top: 8px;">
                                <ul style="margin-left: 20px; display: flex; flex-direction: column; gap: 5px;">
                                    <li><i class="fa-solid fa-shirt" style="color: var(--color-accent);"></i> 1 Pièce d'armure de la <strong style="color: var(--text-primary);">Garde astrale</strong> correspondante</li>
                                    <li><i class="fa-solid fa-gem" style="color: var(--color-accent);"></i> 1 <strong style="color: var(--text-primary);">Cristal de vision mineur</strong> (ou Cristal de vision standard pour le torse)</li>
                                    <li><i class="fa-solid fa-gift" style="color: var(--color-accent);"></i> 1 <strong style="color: var(--text-primary);">Don de la Garde astrale</strong> (vendu par Lyhr pour : 250 Charges statiques + 250 Poussières + 250 Halètements + 1 Lingot blindé)</li>
                                    <li><i class="fa-solid fa-circle-nodes" style="color: var(--color-accent);"></i> 10 <strong style="color: var(--text-primary);">Essences de faille amalgamées</strong></li>
                                </ul>
                            </div>
                        </div>

                        <!-- Step 3 -->
                        <div style="border-left: 2px solid var(--color-primary); padding-left: 15px; position: relative;">
                            <span style="position: absolute; left: -9px; top: 0; background: var(--bg-card); padding: 0 4px; color: var(--color-primary); font-weight: 700; font-size: 11px;">3</span>
                            <h4 style="color: var(--text-primary); font-size: 14px; font-weight: 700; margin-bottom: 6px;">Étape 3 : Les Dons Légendaires Majeurs</h4>
                            <p>Rassemblez les cadeaux d'artisanat et d'exploration requis pour la forge finale :</p>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
                                <div style="background: rgba(0,0,0,0.15); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                                    <h5 style="color: var(--color-legendary); font-size: 12px; font-weight: 700; margin-bottom: 6px;">Don d'Obsidienne (Lyhr)</h5>
                                    <ul style="margin-left: 15px; font-size: 11px; display: flex; flex-direction: column; gap: 4px;">
                                        <li>1 Don de combat (WvW)</li>
                                        <li>250 Fragments d'obsidienne</li>
                                        <li>1 Don de Nayos intérieur</li>
                                        <li>1 Certificat de soutien (50 Jetons de fournisseur + 250 écus)</li>
                                    </ul>
                                </div>
                                <div style="background: rgba(0,0,0,0.15); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                                    <h5 style="color: var(--color-legendary); font-size: 12px; font-weight: 700; margin-bottom: 6px;">Don de Secrets of the Obscure</h5>
                                    <ul style="margin-left: 15px; font-size: 11px; display: flex; flex-direction: column; gap: 4px;">
                                        <li>1 Don de la cour astrale (Skywatch Archipelago)</li>
                                        <li>1 Don de l'avant-poste d'obsidienne (Amnytas)</li>
                                        <li>250 Fragments d'obsidienne</li>
                                        <li>5 Cubes d'énergie sombre stabilisée</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- Step 4 -->
                        <div style="border-left: 2px solid var(--color-primary); padding-left: 15px; position: relative;">
                            <span style="position: absolute; left: -9px; top: 0; background: var(--bg-card); padding: 0 4px; color: var(--color-primary); font-weight: 700; font-size: 11px;">4</span>
                            <h4 style="color: var(--text-primary); font-size: 14px; font-weight: 700; margin-bottom: 6px;">Étape 4 : L'Assemblage Final</h4>
                            <p>Une fois les composants réunis, assemblez la pièce légendaire finale dans la Forge Mystique :</p>
                            <div style="background: rgba(114, 9, 183, 0.05); padding: 10px; border-radius: var(--radius-sm); border: 1px dashed var(--color-primary); margin-top: 8px;">
                                <ul style="margin-left: 20px; display: flex; flex-direction: column; gap: 5px;">
                                    <li><i class="fa-solid fa-shield-halved" style="color: var(--color-legendary);"></i> 1 <strong style="color: var(--text-primary);">Pièce d'armure précurseur purifiée</strong></li>
                                    <li><i class="fa-solid fa-gift" style="color: var(--color-legendary);"></i> 1 <strong style="color: var(--text-primary);">Don d'Obsidienne</strong></li>
                                    <li><i class="fa-solid fa-gift" style="color: var(--color-legendary);"></i> 1 <strong style="color: var(--text-primary);">Don de magie condensée</strong> (Don de sang + venin + totems + poussière T6)</li>
                                    <li><i class="fa-solid fa-gift" style="color: var(--color-legendary);"></i> 1 <strong style="color: var(--text-primary);">Don de Secrets of the Obscure</strong></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid-layout">
                    <!-- Card 1: Composants Majeurs de Forge -->
                    <div class="card">
                        <div class="card-title">
                            <span>Composants de Forge (API)</span>
                            <i class="fa-solid fa-anvil"></i>
                        </div>
                        <div class="material-list">
                            <!-- Amalgamated Rift Essence -->
                            <div class="mat-item" data-item-id="100930">
                                <div class="mat-details">
                                    <img src="${amalgamatedIcon}" alt="Essence amalgamée" title="${getTooltipAttr(itemDetails[100930])}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/F4A4C84E9D0A86E0FECA94F7CEEE57E9EA369D3B/3110292.png';">
                                    <span class="mat-name">Essence de faille amalgamée</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${amalgamatedRiftEssenceCount} / ${reqs.amalgamated}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pAmalgamated}%;"></div></div>
                                </div>
                            </div>
                            <!-- Mystic Clovers -->
                            <div class="mat-item" data-item-id="19675">
                                <div class="mat-details">
                                    <img src="${cloverIcon}" alt="Trèfles mystiques" title="${getTooltipAttr(itemDetails[19675])}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/FE9DC3E10D4B2AE16DADEB07CF28A058570E2EF3/455855.png';">
                                    <span class="mat-name">Trèfles mystiques</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${cloverCount} / ${reqs.clover}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pClover}%;"></div></div>
                                </div>
                            </div>
                            <!-- Ectoplasm -->
                            <div class="mat-item" data-item-id="19721">
                                <div class="mat-details">
                                    <img src="${ectoIcon}" alt="Ectoplasmes" title="${getTooltipAttr(itemDetails[19721])}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/A12C596F1D3528A614660FB2D66133F3987CE5EB/222340.png';">
                                    <span class="mat-name">Boules d'ectoplasme</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${ectoCount} / ${reqs.ecto}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pEcto}%;"></div></div>
                                </div>
                            </div>
                            <!-- Vision Crystals -->
                            <div class="mat-item" data-item-id="46746">
                                <div class="mat-details">
                                    <img src="${visionCrystalIcon}" alt="Cristaux de vision" title="${getTooltipAttr(itemDetails[46746])}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/A94F7CEEE57E9EA369D3BFDF5ED7D3BAAF48F4E6/63363.png';">
                                    <span class="mat-name">Cristaux de vision (total)</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${visionCrystalTotal} / ${reqs.visionCrystal}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pVisionCrystal}%;"></div></div>
                                </div>
                            </div>
                            <!-- Cubes of Dark Energy -->
                            <div class="mat-item" data-item-id="81840">
                                <div class="mat-details">
                                    <img src="${darkEnergyIcon}" alt="Cubes d'énergie sombre" title="${getTooltipAttr(itemDetails[81840])}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/E52F86B1DF85CAE0FE59C8614E2B16B4D5D726D6/1454593.png';">
                                    <span class="mat-name">Cubes d'énergie sombre</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${darkEnergyCount} / ${reqs.darkEnergy}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pDarkEnergy}%;"></div></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Card 2: Obsidian & Combat WvW -->
                    <div class="card">
                        <div class="card-title">
                            <span>Obsidienne & Combat (API)</span>
                            <i class="fa-solid fa-shield-halved"></i>
                        </div>
                        <div class="material-list">
                            <!-- Obsidian Shards -->
                            <div class="mat-item" data-item-id="19925">
                                <div class="mat-details">
                                    <img src="${obsidianIcon}" alt="Fragments d'obsidienne" title="${getTooltipAttr(itemDetails[19925])}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/4C221CD6B96D69FDF8C053E778E2CD37C4F22C5A/63345.png';">
                                    <span class="mat-name">Fragments d'obsidienne</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${obsidianCount} / ${reqs.obsidian}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pObsidian}%;"></div></div>
                                </div>
                            </div>
                            <!-- Gift of Battle -->
                            <div class="mat-item" data-item-id="19678">
                                <div class="mat-details">
                                    <img src="${giftBattleIcon}" alt="Don de combat" title="${getTooltipAttr(itemDetails[19678])}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/FDF5ED7D3BAAF48F4E6838BDCD70FC90DE6C6314.png';">
                                    <span class="mat-name">Don de combat (WvW)</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${giftBattleCount} / ${reqs.giftBattle}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pGiftBattle}%;"></div></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Card 3: Essences & Monnaies de cartes SotO -->
                    <div class="card">
                        <div class="card-title">
                            <span>Monnaies de Faille & Cartes (API)</span>
                            <i class="fa-solid fa-circle-nodes"></i>
                        </div>
                        <div class="material-list">
                            <!-- Fine Essence (T1) -->
                            <div class="mat-item" data-item-id="78">
                                <div class="mat-details">
                                    <img src="${fineIcon}" alt="Essence T1" title="${getTooltipAttr(fineEssenceObj, true)}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/41D633F8F0CCFAD7FDADEF7CE84BF7C312AA1B49/3630022.png';">
                                    <span class="mat-name">Essence de faille (T1)</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${fineCount} / ${reqs.fine}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pFine}%;"></div></div>
                                </div>
                            </div>
                            <!-- Masterwork Essence (T2) -->
                            <div class="mat-item" data-item-id="80">
                                <div class="mat-details">
                                    <img src="${masterworkIcon}" alt="Essence T2" title="${getTooltipAttr(masterworkEssenceObj, true)}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/E0A96441F8405ABEF06114BE750154583CF3B1D2/3630023.png';">
                                    <span class="mat-name">Essence de faille (T2)</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${masterworkCount} / ${reqs.master}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pMaster}%;"></div></div>
                                </div>
                            </div>
                            <!-- Rare Essence (T3) -->
                            <div class="mat-item" data-item-id="79">
                                <div class="mat-details">
                                    <img src="${rareIcon}" alt="Essence T3" title="${getTooltipAttr(rareEssenceObj, true)}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/A6012206459C56680D1BD4D23E0B706F0B0AE40D/3630024.png';">
                                    <span class="mat-name">Essence de faille (T3)</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${rareCount} / ${reqs.rare}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pRare}%;"></div></div>
                                </div>
                            </div>
                            <!-- Static Charges -->
                            <div class="mat-item" data-item-id="72">
                                <div class="mat-details">
                                    <img src="${staticIcon}" alt="Charges statiques" title="${getTooltipAttr(staticChargeObj, true)}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/314EF613F04029E9A8354FB8D79A72EDC36DDF10/3123702.png';">
                                    <span class="mat-name">Charges statiques (Archipel)</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${staticCount} / ${reqs.static}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pStatic}%;"></div></div>
                                </div>
                            </div>
                            <!-- Pinch of Stardust -->
                            <div class="mat-item" data-item-id="73">
                                <div class="mat-details">
                                    <img src="${stardustIcon}" alt="Poussière d'étoiles" title="${getTooltipAttr(stardustObj, true)}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/22DE50C72BCD2610345EA67F5E4032057EA2ABE5/3123701.png';">
                                    <span class="mat-name">Pincées de poussière (Amnytas)</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${stardustCount} / ${reqs.stardust}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pStardust}%;"></div></div>
                                </div>
                            </div>
                            <!-- Calcified Gashes -->
                            <div class="mat-item" data-item-id="75">
                                <div class="mat-details">
                                    <img src="${calcifiedIcon}" alt="Entailles calcifiées" title="${getTooltipAttr(calcifiedObj, true)}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/0BF799CCA1DD262AE1F3B867900A002D080B56C3/3188140.png';">
                                    <span class="mat-name">Entailles calcifiées (Nayos)</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${calcifiedCount} / ${reqs.calcified}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pCalcified}%;"></div></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Card 4: Matériaux T6 (Craft Magic) -->
                    <div class="card">
                        <div class="card-title">
                            <span>Composants T6 Artisanat (API)</span>
                            <i class="fa-solid fa-mortar-pestle"></i>
                        </div>
                        <div class="material-list">
                            <!-- Powerful Blood -->
                            <div class="mat-item" data-item-id="24295">
                                <div class="mat-details">
                                    <img src="${bloodIcon}" alt="Sang puissant" title="${getTooltipAttr(itemDetails[24295])}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/1A930A6A7B5B01EAB4CB36E79014C12B500BF6B3/66950.png';">
                                    <span class="mat-name">Fioles de sang puissant</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${bloodCount} / ${reqs.blood}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pBlood}%;"></div></div>
                                </div>
                            </div>
                            <!-- Powerful Venom Sac -->
                            <div class="mat-item" data-item-id="24283">
                                <div class="mat-details">
                                    <img src="${venomIcon}" alt="Venin puissant" title="${getTooltipAttr(itemDetails[24283])}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/543EC37900EA2A57E77FA891193A48D66AA224AB/66939.png';">
                                    <span class="mat-name">Sacs de venin puissant</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${venomCount} / ${reqs.venom}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pVenom}%;"></div></div>
                                </div>
                            </div>
                            <!-- Elaborate Totem -->
                            <div class="mat-item" data-item-id="24300">
                                <div class="mat-details">
                                    <img src="${totemIcon}" alt="Totems élaborés" title="${getTooltipAttr(itemDetails[24300])}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/C1ABF9082901FC3CEABC3138CBCCA1DAD5D41812/66955.png';">
                                    <span class="mat-name">Totems élaborés</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${totemCount} / ${reqs.totem}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pTotem}%;"></div></div>
                                </div>
                            </div>
                            <!-- Crystalline Dust -->
                            <div class="mat-item" data-item-id="24277">
                                <div class="mat-details">
                                    <img src="${dustIcon}" alt="Poussière cristalline" title="${getTooltipAttr(itemDetails[24277])}" onerror="this.onerror=null;this.src='https://render.guildwars2.com/file/080D00670558CD9E580D5662030394B2206E92A6/434537.png';">
                                    <span class="mat-name">Tas de poussière cristalline</span>
                                </div>
                                <div class="mat-count-box">
                                    <span class="mat-numbers">${dustCount} / ${reqs.dust}</span>
                                    <div class="mat-progressbar" style="width: 120px;"><div class="mat-bar" style="width: ${pDust}%;"></div></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Card 5: Suivi Manuel (Checkboxes) -->
                    <div class="card">
                        <div class="card-title">
                            <span>Objectifs & Étapes Manuels</span>
                            <i class="fa-solid fa-square-check" style="color: var(--color-accent);"></i>
                        </div>
                        <div class="checklist-container" style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
                            <!-- Collections -->
                            <div style="font-weight: 700; font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px; border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">Skins de Collections</div>
                            <label class="check-item ${checklist.skins_astral ? 'completed' : ''}" style="cursor: pointer; padding: 10px 12px; margin: 0; display: flex; align-items: center;">
                                <span class="check-label">
                                    <input type="checkbox" id="chk-skins-astral" ${checklist.skins_astral ? 'checked' : ''} style="margin-right: 10px; cursor: pointer;">
                                    <span class="check-title">Skins Garde astrale débloqués</span>
                                </span>
                            </label>
                            <label class="check-item ${checklist.skins_oneiros ? 'completed' : ''}" style="cursor: pointer; padding: 10px 12px; margin: 0; display: flex; align-items: center;">
                                <span class="check-label">
                                    <input type="checkbox" id="chk-skins-oneiros" ${checklist.skins_oneiros ? 'checked' : ''} style="margin-right: 10px; cursor: pointer;">
                                    <span class="check-title">Skins Oneiros débloqués</span>
                                </span>
                            </label>

                            <!-- Precursors -->
                            <div style="font-weight: 700; font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-top: 10px; margin-bottom: 5px; border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">Précurseurs Purifiés</div>
                            ${factor === 6 ? `
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                    <label class="check-item ${checklist.precursor_helm ? 'completed' : ''}" style="cursor: pointer; padding: 8px 10px; margin: 0; font-size: 12px; display: flex; align-items: center;">
                                        <span class="check-label">
                                            <input type="checkbox" id="chk-precursor-helm" ${checklist.precursor_helm ? 'checked' : ''} style="margin-right: 8px; cursor: pointer;">
                                            <span>Casque</span>
                                        </span>
                                    </label>
                                    <label class="check-item ${checklist.precursor_shoulders ? 'completed' : ''}" style="cursor: pointer; padding: 8px 10px; margin: 0; font-size: 12px; display: flex; align-items: center;">
                                        <span class="check-label">
                                            <input type="checkbox" id="chk-precursor-shoulders" ${checklist.precursor_shoulders ? 'checked' : ''} style="margin-right: 8px; cursor: pointer;">
                                            <span>Épaules</span>
                                        </span>
                                    </label>
                                    <label class="check-item ${checklist.precursor_chest ? 'completed' : ''}" style="cursor: pointer; padding: 8px 10px; margin: 0; font-size: 12px; display: flex; align-items: center;">
                                        <span class="check-label">
                                            <input type="checkbox" id="chk-precursor-chest" ${checklist.precursor_chest ? 'checked' : ''} style="margin-right: 8px; cursor: pointer;">
                                            <span>Torse</span>
                                        </span>
                                    </label>
                                    <label class="check-item ${checklist.precursor_gloves ? 'completed' : ''}" style="cursor: pointer; padding: 8px 10px; margin: 0; font-size: 12px; display: flex; align-items: center;">
                                        <span class="check-label">
                                            <input type="checkbox" id="chk-precursor-gloves" ${checklist.precursor_gloves ? 'checked' : ''} style="margin-right: 8px; cursor: pointer;">
                                            <span>Gants</span>
                                        </span>
                                    </label>
                                    <label class="check-item ${checklist.precursor_legs ? 'completed' : ''}" style="cursor: pointer; padding: 8px 10px; margin: 0; font-size: 12px; display: flex; align-items: center;">
                                        <span class="check-label">
                                            <input type="checkbox" id="chk-precursor-legs" ${checklist.precursor_legs ? 'checked' : ''} style="margin-right: 8px; cursor: pointer;">
                                            <span>Jambières</span>
                                        </span>
                                    </label>
                                    <label class="check-item ${checklist.precursor_boots ? 'completed' : ''}" style="cursor: pointer; padding: 8px 10px; margin: 0; font-size: 12px; display: flex; align-items: center;">
                                        <span class="check-label">
                                            <input type="checkbox" id="chk-precursor-boots" ${checklist.precursor_boots ? 'checked' : ''} style="margin-right: 8px; cursor: pointer;">
                                            <span>Bottes</span>
                                        </span>
                                    </label>
                                </div>
                            ` : `
                                <label class="check-item ${checklist.precursor_generic ? 'completed' : ''}" style="cursor: pointer; padding: 10px 12px; margin: 0; display: flex; align-items: center;">
                                    <span class="check-label">
                                        <input type="checkbox" id="chk-precursor-generic" ${checklist.precursor_generic ? 'checked' : ''} style="margin-right: 10px; cursor: pointer;">
                                        <span class="check-title">Précurseur purifié obtenu</span>
                                    </span>
                                </label>
                            `}

                            <!-- Exploration & Lyhr -->
                            <div style="font-weight: 700; font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-top: 10px; margin-bottom: 5px; border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">Exploration & Obscure</div>
                            <label class="check-item ${checklist.gift_nayos ? 'completed' : ''}" style="cursor: pointer; padding: 10px 12px; margin: 0; display: flex; align-items: center;">
                                <span class="check-label">
                                    <input type="checkbox" id="chk-gift-nayos" ${checklist.gift_nayos ? 'checked' : ''} style="margin-right: 10px; cursor: pointer;">
                                    <span class="check-title">Dons de Nayos intérieur</span>
                                </span>
                            </label>
                            <label class="check-item ${checklist.gift_support ? 'completed' : ''}" style="cursor: pointer; padding: 10px 12px; margin: 0; display: flex; align-items: center;">
                                <span class="check-label">
                                    <input type="checkbox" id="chk-gift-support" ${checklist.gift_support ? 'checked' : ''} style="margin-right: 10px; cursor: pointer;">
                                    <span class="check-title">Certificats de soutien (Lyhr)</span>
                                </span>
                            </label>
                            <label class="check-item ${checklist.gift_court ? 'completed' : ''}" style="cursor: pointer; padding: 10px 12px; margin: 0; display: flex; align-items: center;">
                                <span class="check-label">
                                    <input type="checkbox" id="chk-gift-court" ${checklist.gift_court ? 'checked' : ''} style="margin-right: 10px; cursor: pointer;">
                                    <span class="check-title">Dons de la cour astrale (Archipel)</span>
                                </span>
                            </label>
                            <label class="check-item ${checklist.gift_outpost ? 'completed' : ''}" style="cursor: pointer; padding: 10px 12px; margin: 0; display: flex; align-items: center;">
                                <span class="check-label">
                                    <input type="checkbox" id="chk-gift-outpost" ${checklist.gift_outpost ? 'checked' : ''} style="margin-right: 10px; cursor: pointer;">
                                    <span class="check-title">Dons de l'avant-poste d'obsidienne (Amnytas)</span>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            `;

            // Wire piece toggle buttons
            document.getElementById('btn-obsidian-1').addEventListener('click', () => {
                this.obsidianPiecesCount = 1;
                this.renderContent();
            });
            document.getElementById('btn-obsidian-6').addEventListener('click', () => {
                this.obsidianPiecesCount = 6;
                this.renderContent();
            });

            // Wire guide toggle button
            const guideBtn = document.getElementById('btn-toggle-craft-guide');
            if (guideBtn) {
                guideBtn.addEventListener('click', () => {
                    this.showCraftGuide = !this.showCraftGuide;
                    const guideCard = document.getElementById('obsidian-craft-guide-card');
                    if (guideCard) {
                        guideCard.style.display = this.showCraftGuide ? 'block' : 'none';
                        guideBtn.querySelector('span').textContent = this.showCraftGuide ? 'Masquer le Guide de Craft' : 'Afficher le Guide de Craft';
                        const icon = guideBtn.querySelector('i');
                        if (icon) {
                            icon.className = `fa-solid ${this.showCraftGuide ? 'fa-book-open-reader' : 'fa-book'}`;
                        }
                    }
                });
            }

            // Wire manual checkboxes events to save state and update overall progress bar instantly in the DOM
            const checkboxIds = [
                'chk-skins-astral', 'chk-skins-oneiros',
                'chk-gift-nayos', 'chk-gift-support', 'chk-gift-court', 'chk-gift-outpost'
            ];
            
            if (factor === 6) {
                checkboxIds.push(
                    'chk-precursor-helm', 'chk-precursor-shoulders', 'chk-precursor-chest',
                    'chk-precursor-gloves', 'chk-precursor-legs', 'chk-precursor-boots'
                );
            } else {
                checkboxIds.push('chk-precursor-generic');
            }

            checkboxIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('change', () => {
                        const currentChecklist = this.getManualChecklist();
                        const key = id.replace('chk-', '').replace(/-/g, '_');
                        currentChecklist[key] = el.checked;
                        this.saveManualChecklist(currentChecklist);
                        
                        // Toggle completed class
                        const itemContainer = el.closest('.check-item');
                        if (itemContainer) {
                            itemContainer.classList.toggle('completed', el.checked);
                        }
                        
                        // Instantly update overall progress bar in the DOM
                        this.updateOverallProgressBar(characters, bank, materials, wallet);
                    });
                }
            });

        } catch (error) {
            pane.innerHTML = `<p class="text-danger">Erreur : ${error.message}</p>`;
        }
    },

    getOrraxChecklist() {
        const stored = localStorage.getItem('gw2_orrax_checklist');
        const defaults = {
            story: false,
            research: false
        };
        if (!stored) return defaults;
        try {
            return { ...defaults, ...JSON.parse(stored) };
        } catch (e) {
            return defaults;
        }
    },

    saveOrraxChecklist(checklist) {
        localStorage.setItem('gw2_orrax_checklist', JSON.stringify(checklist));
    },

    async renderOrrax(pane) {
        try {
            pane.innerHTML = `
                <div class="loader-container">
                    <div class="spinner"></div>
                    <p>Scrutage de votre banque, de vos matériaux et de vos personnages...</p>
                </div>
            `;

            let wallet = [];
            let bank = [];
            let materials = [];
            let characters = [];
            let currencies = [];

            try {
                const results = await Promise.allSettled([
                    GW2Api.getWallet(),
                    GW2Api.getBank(),
                    GW2Api.fetchWithCache('/account/materials', 'account_materials', 3 * 60 * 1000, true),
                    GW2Api.getCharacters(),
                    GW2Api.getCurrencies()
                ]);
                
                wallet = results[0].status === 'fulfilled' ? results[0].value || [] : [];
                bank = results[1].status === 'fulfilled' ? results[1].value || [] : [];
                materials = results[2].status === 'fulfilled' ? results[2].value || [] : [];
                characters = results[3].status === 'fulfilled' ? results[3].value || [] : [];
                currencies = results[4].status === 'fulfilled' ? results[4].value || [] : [];
            } catch (e) {
                console.error("Error loading orrax inputs", e);
            }

            const itemIds = [
                104857, 104690, 104777, 96137, 102367, 104704, // Legendary, Precursor, Binding, Tribute, Salmon, Askur
                104962, 104763, 104699, 104846, 19631, 75299, 104791, 104872, 104965, 104932, 104839, 104717, 104844,
                103351, 79418, 100930, 19675, 104229, 105004, 104282, 104855, 102569, 103316
            ];
            const itemDetails = await GW2Api.getItemDetails(itemIds);

            // Helpers
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

            const count = (id) => this.countTotalItem(id, bank, materials, characters);

            // Checking ownerships
            const orraxLegendaryCount = count(104857);
            const orraxPrecursorCount = count(104690);
            const bindingCount = count(104777);
            const tributeCount = count(96137);
            const salmonCount = count(102367);
            const askurCount = count(104704);
            const mistburnedIslesGiftCount = count(104962);
            const mursaatRuinsGiftCount = count(104763);
            const janthirWanderlustGiftCount = count(104699);
            const shadowsGiftCount = count(104846);
            const titanUnderstandingGiftCount = count(104791);
            const feastGiftCount = count(104872);
            const appetizerGiftCount = count(104965);
            const entreeGiftCount = count(104932);
            const sideCourseGiftCount = count(104839);
            const dessertGiftCount = count(104717);
            const shadowFruitCount = count(104844);
            const mursaatRunestoneCount = count(103351);
            const mysticRunestoneCount = count(79418);
            const amalgamatedRiftEssenceCount = count(100930);
            const mysticCloverCount = count(19675);
            const liquidObsidianCount = count(104229);
            const mistsGateResidueCount = count(105004);
            const shardMistburnedCount = count(104282);
            const shardBavaCount = count(104855);

            const ursusObligeCount = wallet.find(c => c.id === 76)?.value || 0;

            // Flags
            const legendaryOwned = orraxLegendaryCount > 0;
            const precursorOwned = orraxPrecursorCount > 0 || legendaryOwned;
            const hasBinding = bindingCount > 0 || precursorOwned;
            const hasTribute = tributeCount > 0 || precursorOwned;
            const hasSalmon = salmonCount > 0 || precursorOwned;
            const hasAskur = askurCount > 0 || precursorOwned;

            const hasMistburnedIslesGift = mistburnedIslesGiftCount > 0 || legendaryOwned;
            const hasMursaatRuinsGift = mursaatRuinsGiftCount > 0 || hasMistburnedIslesGift;
            const hasJanthirWanderlustGift = janthirWanderlustGiftCount > 0 || hasMistburnedIslesGift;
            const hasShadowsGift = shadowsGiftCount > 0 || legendaryOwned;
            const hasTitanUnderstandingGift = titanUnderstandingGiftCount > 0 || hasShadowsGift;
            const hasFeastGift = feastGiftCount > 0 || legendaryOwned;

            const hasAppetizer = appetizerGiftCount > 0 || hasFeastGift;
            const hasEntree = entreeGiftCount > 0 || hasFeastGift;
            const hasSideCourse = sideCourseGiftCount > 0 || hasFeastGift;
            const hasDessert = dessertGiftCount > 0 || hasFeastGift;

            // Derived counts (incorporating crafted gifts)
            const currentClover = mysticCloverCount + (hasTribute ? 38 : 0) + (hasSideCourse ? 30 : 0);
            const currentMursaatRunestone = mursaatRunestoneCount + (hasMistburnedIslesGift ? 250 : 0);
            const currentMysticRunestone = mysticRunestoneCount + (hasMistburnedIslesGift ? 250 : 0);
            const currentShadowFruit = shadowFruitCount + (hasAppetizer ? 5 : 0) + (hasEntree ? 5 : 0) + (hasSideCourse ? 5 : 0) + (hasDessert ? 5 : 0);
            const currentAmalgamated = amalgamatedRiftEssenceCount + (hasTitanUnderstandingGift ? 25 : 0) + (hasDessert ? 2 : 0);
            const currentLiquidObsidian = liquidObsidianCount + (hasMursaatRuinsGift ? 100 : 0);
            const currentMistsGateResidue = mistsGateResidueCount + (hasMursaatRuinsGift ? 50 : 0);
            const currentShardMistburned = shardMistburnedCount + (hasMursaatRuinsGift ? 100 : 0);
            const currentShardBava = shardBavaCount + (hasMursaatRuinsGift ? 100 : 0);
            const currentUrsusOblige = ursusObligeCount + (hasTitanUnderstandingGift ? 1250 : 0);

            // Progress Bar Math
            let totalSteps = 0;
            let completedSteps = 0;

            const apiSteps = [
                { actual: Math.min(68, currentClover), req: 68 },
                { actual: Math.min(250, currentMursaatRunestone), req: 250 },
                { actual: Math.min(250, currentMysticRunestone), req: 250 },
                { actual: Math.min(20, currentShadowFruit), req: 20 },
                { actual: Math.min(27, currentAmalgamated), req: 27 },
                { actual: Math.min(100, currentLiquidObsidian), req: 100 },
                { actual: Math.min(50, currentMistsGateResidue), req: 50 },
                { actual: Math.min(100, currentShardMistburned), req: 100 },
                { actual: Math.min(100, currentShardBava), req: 100 },
                { actual: Math.min(1250, currentUrsusOblige), req: 1250 },
                { actual: hasBinding ? 1 : 0, req: 1 },
                { actual: hasSalmon ? 1 : 0, req: 1 },
                { actual: hasAskur ? 1 : 0, req: 1 },
                { actual: precursorOwned ? 1 : 0, req: 1 },
                { actual: (hasJanthirWanderlustGift || count(102929) > 0) ? 1 : 0, req: 1 },
                { actual: (hasJanthirWanderlustGift || count(102958) > 0) ? 1 : 0, req: 1 },
                { actual: (hasJanthirWanderlustGift || count(104313) > 0) ? 1 : 0, req: 1 },
                { actual: (hasJanthirWanderlustGift || count(104896) > 0) ? 1 : 0, req: 1 },
                { actual: hasShadowsGift ? 1 : 0, req: 1 },
                { actual: hasFeastGift ? 1 : 0, req: 1 },
                { actual: hasMistburnedIslesGift ? 1 : 0, req: 1 },
                { actual: hasTribute ? 1 : 0, req: 1 }
            ];

            apiSteps.forEach(s => {
                totalSteps += s.req * 100;
                completedSteps += s.actual * 100;
            });

            const orraxChecklist = this.getOrraxChecklist();
            const manualSteps = [
                orraxChecklist.story,
                orraxChecklist.research
            ];

            manualSteps.forEach(val => {
                totalSteps += 100;
                if (val) completedSteps += 100;
            });

            const overallPercent = Math.min(100, Math.round((completedSteps / totalSteps) * 100)) || 0;

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

            const renderMatRow = (id, name, actual, req, defaultIcon = 'https://render.guildwars2.com/file/1856A01E331452E4C14E4C9CF4F818E3FAEF9B79/3124964.png') => {
                const item = itemDetails[id] || { name: name, icon: defaultIcon, rarity: 'Fine' };
                const percent = Math.min(100, Math.round((actual / req) * 100));
                const isDone = actual >= req;
                
                return `
                    <div class="mat-item" data-item-id="${id}">
                        <div class="mat-details">
                            <img src="${item.icon}" alt="${name}" title="${getTooltipAttr(item)}" style="border: 1px solid ${getRarityColor(item.rarity)}; border-radius: var(--radius-sm);" onerror="this.onerror=null;this.src='${defaultIcon}';">
                            <span class="mat-name" style="font-weight: 500;">${item.name || name}</span>
                        </div>
                        <div class="mat-count-box" style="display: flex; align-items: center; gap: 15px;">
                            <span class="mat-numbers" style="font-size: 13px; font-weight: 700; ${isDone ? 'color: var(--color-success);' : ''}">${actual} / ${req}</span>
                            <div class="mat-progressbar" style="width: 100px; margin-top: 0; background-color: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; height: 6px;">
                                <div class="mat-bar" style="width: ${percent}%; height: 100%; border-radius: 4px; background: linear-gradient(to right, var(--color-primary), var(--color-accent));"></div>
                            </div>
                        </div>
                    </div>
                `;
            };

            // Setup view layout
            pane.innerHTML = `
                <!-- Orrax Header -->
                <div class="card" style="margin-bottom: 25px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 48px; height: 48px; background: rgba(160, 32, 240, 0.1); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(160, 32, 240, 0.3);">
                                <img src="${itemDetails[104857]?.icon || 'https://render.guildwars2.com/file/C61975234AD30103EF7DAD0BD52578F00B0CDF5B/3629148.png'}" alt="Orrax Conjuré" style="width: 32px; height: 32px;">
                            </div>
                            <div>
                                <h3 style="font-size: 16px; font-weight: 800; margin: 0; font-family: var(--font-heading); color: var(--color-success);">Orrax Conjuré</h3>
                                <p style="font-size: 12px; color: var(--text-secondary); margin: 2px 0 0 0;">Dos & Deltaplane Légendaires de Janthir Wilds</p>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <span id="orrax-overall-progress-percent" style="font-size: 24px; font-weight: 800; color: var(--color-success); font-family: var(--font-heading);">${overallPercent}%</span>
                            <span id="orrax-overall-progress-steps" style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 2px;">Progression Globale</span>
                        </div>
                    </div>
                    <div class="mat-progressbar" style="height: 10px; background-color: rgba(255, 255, 255, 0.05); border-radius: 10px; overflow: hidden; margin-top: 0;">
                        <div class="mat-bar" id="orrax-overall-progress-bar" style="width: ${overallPercent}%; background: linear-gradient(to right, var(--color-primary), var(--color-success)); height: 100%; border-radius: 10px; transition: width 0.5s ease;"></div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; align-items: flex-start; flex-wrap: wrap;">
                    
                    <!-- Left Column: Components Calculator -->
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <!-- Map Resources -->
                        <div class="card">
                            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 15px; color: var(--color-accent); display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-map-location-dot"></i> Ressources des Cartes (Janthir)
                            </h3>
                            <div class="material-list" style="margin-top: 0;">
                                ${renderMatRow(103351, "Pierre de rune mursaat", currentMursaatRunestone, 250)}
                                ${renderMatRow(104282, "Fragment des Landes de Feu-de-Brume", currentShardMistburned, 100)}
                                ${renderMatRow(104855, "Fragment de Bava Nisos", currentShardBava, 100)}
                                ${renderMatRow(104229, "Viole d'obsidienne de titan", currentLiquidObsidian, 100)}
                                ${renderMatRow(105004, "Résidu de porte des Brumes", currentMistsGateResidue, 50)}
                                ${renderMatRow(76, "Ursus Oblige", currentUrsusOblige, 1250, 'https://render.guildwars2.com/file/1856A01E331452E4C14E4C9CF4F818E3FAEF9B79/3124964.png')}
                            </div>
                        </div>

                        <!-- Crafting & Cooking -->
                        <div class="card">
                            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 15px; color: var(--color-accent); display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-bowl-food"></i> Artisanat & Cuisine (Le Festin)
                            </h3>
                            <div class="material-list" style="margin-top: 0;">
                                ${renderMatRow(19675, "Trèfles mystiques", currentClover, 68)}
                                ${renderMatRow(104844, "Fruit de l'ombre", currentShadowFruit, 20)}
                                ${renderMatRow(100930, "Essence de faille amalgamée", currentAmalgamated, 27)}
                                ${renderMatRow(79418, "Pierre de rune mystique", currentMysticRunestone, 250)}
                            </div>
                        </div>

                        <!-- Major Forge Components -->
                        <div class="card">
                            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 15px; color: var(--color-accent); display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-gift"></i> Composants Majeurs & Précurseurs
                            </h3>
                            <div class="material-list" style="margin-top: 0;">
                                ${renderMatRow(104690, "Orrax réprimé (Précurseur)", precursorOwned ? 1 : 0, 1)}
                                ${renderMatRow(104777, "Lien du dragon", hasBinding ? 1 : 0, 1)}
                                ${renderMatRow(96137, "Tribut draconique", hasTribute ? 1 : 0, 1)}
                                ${renderMatRow(102367, "Dos de saumon du savoir", hasSalmon ? 1 : 0, 1)}
                                ${renderMatRow(104704, "Dos de camping en frêne", hasAskur ? 1 : 0, 1)}
                            </div>
                        </div>

                    </div>

                    <!-- Right Column: Step-by-Step Guide & Quest Checklist -->
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <!-- Quests Checklist -->
                        <div class="card">
                            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 15px; color: var(--color-accent); display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-list-check"></i> Étapes de Progression & Quêtes
                            </h3>
                            <div class="checklist-container">
                                <!-- Story Checkbox -->
                                <div class="check-item ${orraxChecklist.story ? 'completed' : ''}" style="margin-bottom: 10px;">
                                    <label class="checkbox-container" style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; width: 100%;">
                                        <input type="checkbox" id="chk-orrax-story" ${orraxChecklist.story ? 'checked' : ''} style="margin-top: 3px;">
                                        <div>
                                            <span style="font-weight: 600; font-size: 13px;">Histoire : Salvation's Cost Complete</span>
                                            <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 2px;">
                                                Terminer ce chapitre de Janthir Wilds pour débloquer les collections de craft d'Orrax.
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                <!-- Research Checkbox -->
                                <div class="check-item ${orraxChecklist.research ? 'completed' : ''}" style="margin-bottom: 10px;">
                                    <label class="checkbox-container" style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; width: 100%;">
                                        <input type="checkbox" id="chk-orrax-research" ${orraxChecklist.research ? 'checked' : ''} style="margin-top: 3px;">
                                        <div>
                                            <span style="font-weight: 600; font-size: 13px;">Recherche : Professeur Jorvik</span>
                                            <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 2px;">
                                                Parler à Jorvik Jorundsson à Bava Nisos pour déverrouiller la quête "Cauchemars innommés".
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                <!-- Precursor Forge Guide -->
                                <div style="border-top: 1px solid var(--border-color); padding-top: 15px; margin-top: 15px;">
                                    <h4 style="font-size: 11px; font-weight: 700; margin-bottom: 10px; color: var(--text-secondary); text-transform: uppercase;">
                                        Forge du Précurseur : Orrax réprimé
                                    </h4>
                                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: var(--text-secondary); line-height: 1.4;">
                                        <p>Combinez dans la Forge Mystique :</p>
                                        <ul style="padding-left: 20px; display: flex; flex-direction: column; gap: 4px;">
                                            <li><strong>Lien du dragon</strong> (${hasBinding ? '<span class="text-success">Possédé</span>' : '<span class="text-danger">Manquant</span>'})</li>
                                            <li><strong>Tribut draconique</strong> (${hasTribute ? '<span class="text-success">Possédé</span>' : '<span class="text-danger">Manquant</span>'})</li>
                                            <li><strong>Saumon du savoir</strong> (${hasSalmon ? '<span class="text-success">Possédé</span>' : '<span class="text-danger">Manquant</span>'})</li>
                                            <li><strong>Nécessaire de camping en frêne</strong> (${hasAskur ? '<span class="text-success">Possédé</span>' : '<span class="text-danger">Manquant</span>'})</li>
                                        </ul>
                                    </div>
                                </div>

                                <!-- Final Forge Guide -->
                                <div style="border-top: 1px solid var(--border-color); padding-top: 15px; margin-top: 15px;">
                                    <h4 style="font-size: 11px; font-weight: 700; margin-bottom: 10px; color: var(--text-secondary); text-transform: uppercase;">
                                        Forge Finale : Orrax conjuré
                                    </h4>
                                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: var(--text-secondary); line-height: 1.4;">
                                        <p>Combinez dans la Forge Mystique :</p>
                                        <ul style="padding-left: 20px; display: flex; flex-direction: column; gap: 4px;">
                                            <li><strong>Orrax réprimé</strong> (Précurseur) (${precursorOwned ? '<span class="text-success">Possédé</span>' : '<span class="text-danger">Manquant</span>'})</li>
                                            <li><strong>Don des îles de Feu-de-Brume</strong> (${hasMistburnedIslesGift ? '<span class="text-success">Possédé</span>' : '<span class="text-danger">Manquant</span>'})</li>
                                            <li><strong>Don des ombres</strong> (${hasShadowsGift ? '<span class="text-success">Possédé</span>' : '<span class="text-danger">Manquant</span>'})</li>
                                            <li><strong>Don du festin</strong> (${hasFeastGift ? '<span class="text-success">Possédé</span>' : '<span class="text-danger">Manquant</span>'})</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Recipe Explanations / How-To -->
                        <div class="card">
                            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 15px; color: var(--color-accent); display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-circle-info"></i> Détails d'obtention des Dons
                            </h3>
                            <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.5; display: flex; flex-direction: column; gap: 12px;">
                                <div>
                                    <strong style="color: var(--text-primary); display: block; margin-bottom: 3px;">Don de la Côte de Bas-Langue, etc.</strong>
                                    Chaque carte possède un Don d'exploration qui s'obtient en complétant l'exploration complète ou certains succès liés à la carte (Côte de Bas-Langue, Janthir Syntri, Landes de Feu-de-Brume, Bava Nisos).
                                </div>
                                <div>
                                    <strong style="color: var(--text-primary); display: block; margin-bottom: 3px;">Don de la compréhension des Titans (Sampaguita)</strong>
                                    S'achète auprès de la vendeuse Sampaguita à Bava Nisos après avoir complété son cœur de renommée. Nécessite 25 Essences de faille amalgamées, 25 Restes curieux de Mursaat, 25 Fragments de ruines curieux de Mursaat et 1 250 Ursus Oblige.
                                </div>
                                <div>
                                    <strong style="color: var(--text-primary); display: block; margin-bottom: 3px;">Le Festin culinaire (Fruit de l'ombre)</strong>
                                    Chaque Don de plat culinaire (Mise en bouche, Plat principal, Accompagnement, Dessert) requiert 5 Fruits de l'ombre (cultivés dans votre Pavillon à partir de graines achetées à Deft Lahar) combinés avec de grandes quantités de nourriture de haut niveau (Chef 500 recommandé).
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            `;

            // Wire manual checkboxes
            const orraxCheckboxIds = ['chk-orrax-story', 'chk-orrax-research'];
            orraxCheckboxIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('change', () => {
                        const currentChecklist = this.getOrraxChecklist();
                        const key = id.replace('chk-orrax-', '').replace(/-/g, '_');
                        currentChecklist[key] = el.checked;
                        this.saveOrraxChecklist(currentChecklist);
                        
                        const itemContainer = el.closest('.check-item');
                        if (itemContainer) {
                            itemContainer.classList.toggle('completed', el.checked);
                        }
                        
                        this.renderContent();
                    });
                }
            });

        } catch (error) {
            pane.innerHTML = `<p class="text-danger">Erreur : ${error.message}</p>`;
        }
    },

    countItemInList(list, itemId) {
        return list
            .filter(item => item.id === itemId)
            .reduce((sum, item) => sum + item.count, 0);
    },

    countTotalItem(itemId, bank, materials, characters) {
        let total = 0;
        
        // 1. Count in Bank
        if (Array.isArray(bank)) {
            bank.forEach(item => {
                if (item && item.id === itemId) {
                    total += item.count;
                }
            });
        }
        
        // 2. Count in Materials Storage
        if (Array.isArray(materials)) {
            materials.forEach(item => {
                if (item && item.id === itemId) {
                    total += item.count;
                }
            });
        }
        
        // 3. Count in Characters Inventories
        if (Array.isArray(characters)) {
            characters.forEach(char => {
                if (char.bags) {
                    char.bags.forEach(bag => {
                        if (bag && bag.inventory) {
                            bag.inventory.forEach(slot => {
                                if (slot && slot.id === itemId) {
                                    total += slot.count;
                                }
                            });
                        }
                    });
                }
            });
        }
        
        return total;
    },

    getManualChecklist() {
        const stored = localStorage.getItem('gw2_obsidian_checklist');
        const defaults = {
            skins_astral: false,
            skins_oneiros: false,
            precursor_helm: false,
            precursor_shoulders: false,
            precursor_chest: false,
            precursor_gloves: false,
            precursor_legs: false,
            precursor_boots: false,
            precursor_generic: false,
            gift_nayos: false,
            gift_support: false,
            gift_court: false,
            gift_outpost: false
        };
        if (!stored) return defaults;
        try {
            return { ...defaults, ...JSON.parse(stored) };
        } catch (e) {
            return defaults;
        }
    },

    saveManualChecklist(data) {
        localStorage.setItem('gw2_obsidian_checklist', JSON.stringify(data));
    },

    calculateProgress(characters, bank, materials, wallet, factor) {
        const checklist = this.getManualChecklist();
        
        const reqs = {
            amalgamated: 10 * factor,
            clover: 50 * factor,
            ecto: 375 * factor,
            obsidian: 1000 * factor,
            darkEnergy: 5 * factor,
            giftBattle: 1 * factor,
            visionCrystal: 1 * factor,
            
            static: 500 * factor,
            stardust: 500 * factor,
            calcified: 500 * factor,
            
            fine: 2500 * factor,
            master: 1000 * factor,
            rare: 500 * factor,
            
            blood: 100 * factor,
            venom: 100 * factor,
            totem: 100 * factor,
            dust: 100 * factor
        };

        const amalgamatedCount = this.countTotalItem(100930, bank, materials, characters);
        const cloverCount = this.countTotalItem(19675, bank, materials, characters);
        const ectoCount = this.countTotalItem(19721, bank, materials, characters);
        const obsidianCount = this.countTotalItem(19925, bank, materials, characters);
        const darkEnergyCount = this.countTotalItem(81840, bank, materials, characters);
        const giftBattleCount = this.countTotalItem(19678, bank, materials, characters);
        
        const visionCrystalCount = this.countTotalItem(46746, bank, materials, characters);
        const lesserVisionCrystalCount = this.countTotalItem(46745, bank, materials, characters);
        const visionCrystalTotal = visionCrystalCount + lesserVisionCrystalCount;

        const staticCount = wallet.find(c => c.id === 72)?.value || 0;
        const stardustCount = wallet.find(c => c.id === 73)?.value || 0;
        const calcifiedCount = wallet.find(c => c.id === 75)?.value || 0;

        const fineCount = wallet.find(c => c.id === 78)?.value || 0;
        const masterworkCount = wallet.find(c => c.id === 80)?.value || 0;
        const rareCount = wallet.find(c => c.id === 79)?.value || 0;

        const giftBloodCount = this.countTotalItem(71655, bank, materials, characters);
        const giftVenomCount = this.countTotalItem(71787, bank, materials, characters);
        const giftTotemCount = this.countTotalItem(73236, bank, materials, characters);
        const giftDustCount = this.countTotalItem(73196, bank, materials, characters);

        const bloodCount = this.countTotalItem(24295, bank, materials, characters) + (giftBloodCount * 100);
        const venomCount = this.countTotalItem(24283, bank, materials, characters) + (giftVenomCount * 100);
        const totemCount = this.countTotalItem(24300, bank, materials, characters) + (giftTotemCount * 100);
        const dustCount = this.countTotalItem(24277, bank, materials, characters) + (giftDustCount * 100);

        let completedSteps = 0;
        let totalSteps = 0;

        const apiItems = [
            { actual: amalgamatedCount, req: reqs.amalgamated },
            { actual: cloverCount, req: reqs.clover },
            { actual: ectoCount, req: reqs.ecto },
            { actual: obsidianCount, req: reqs.obsidian },
            { actual: darkEnergyCount, req: reqs.darkEnergy },
            { actual: giftBattleCount, req: reqs.giftBattle },
            { actual: visionCrystalTotal, req: reqs.visionCrystal },
            { actual: staticCount, req: reqs.static },
            { actual: stardustCount, req: reqs.stardust },
            { actual: calcifiedCount, req: reqs.calcified },
            { actual: fineCount, req: reqs.fine },
            { actual: masterworkCount, req: reqs.master },
            { actual: rareCount, req: reqs.rare },
            { actual: bloodCount, req: reqs.blood },
            { actual: venomCount, req: reqs.venom },
            { actual: totemCount, req: reqs.totem },
            { actual: dustCount, req: reqs.dust }
        ];

        apiItems.forEach(item => {
            totalSteps += 100;
            completedSteps += Math.min(1, item.actual / item.req) * 100;
        });

        const manualItems = [
            checklist.skins_astral,
            checklist.skins_oneiros,
            checklist.gift_nayos,
            checklist.gift_support,
            checklist.gift_court,
            checklist.gift_outpost
        ];

        if (factor === 6) {
            manualItems.push(
                checklist.precursor_helm,
                checklist.precursor_shoulders,
                checklist.precursor_chest,
                checklist.precursor_gloves,
                checklist.precursor_legs,
                checklist.precursor_boots
            );
        } else {
            manualItems.push(checklist.precursor_generic);
        }

        manualItems.forEach(val => {
            totalSteps += 100;
            if (val) completedSteps += 100;
        });

        completedSteps = Math.round(completedSteps);
        const percent = Math.min(100, Math.round((completedSteps / totalSteps) * 100)) || 0;

        return {
            percent,
            completedSteps,
            totalSteps,
            reqs
        };
    },

    updateOverallProgressBar(characters, bank, materials, wallet) {
        const factor = this.obsidianPiecesCount;
        const progressObj = this.calculateProgress(characters, bank, materials, wallet, factor);
        
        const percentEl = document.getElementById('obsidian-overall-progress-percent');
        const stepsEl = document.getElementById('obsidian-overall-progress-steps');
        const barEl = document.getElementById('obsidian-overall-progress-bar');
        
        if (percentEl) percentEl.textContent = `${progressObj.percent}%`;
        if (stepsEl) stepsEl.textContent = `(${progressObj.completedSteps.toLocaleString()} / ${progressObj.totalSteps.toLocaleString()})`;
        if (barEl) barEl.style.width = `${progressObj.percent}%`;
    }
};
