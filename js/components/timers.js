import { GW2Api } from '../api.js';

export const Timers = {
    timerInterval: null,
    selectedExpansion: 'all',
    selectedMap: 'all',
    selectedTab: 'metas', // 'metas' or 'worldbosses'
    
    events: [
        { name: "Assaut de l'Archipel (Skywatch)", map: "Archipel du Verrou de l'Esprit", expansion: "SotO", offset: 0, duration: 25 },
        { name: "Régent Chak (Gerent)", map: "Profondeurs de Maguuma", expansion: "HoT", offset: 30, duration: 20 },
        { name: "Défense d'Amnytas (Spire)", map: "Amnytas", expansion: "SotO", offset: 60, duration: 25 },
        { name: "Octovide (Battle in Tarir)", map: "Bassin Aurique", expansion: "HoT", offset: 60, duration: 20 },
        { name: "La Bataille de Nayos (Zakiros)", map: "Nayos Intérieur", expansion: "SotO", offset: 0, duration: 30 },
        { name: "Le Repli du Dragon (Mouth)", map: "Repli du Dragon", expansion: "HoT", offset: 90, duration: 30 },
        { name: "Casino Blitz", map: "Oasis d'Amnoon", expansion: "PoF", offset: 5, duration: 20 },
        { name: "Tourment de la Désolation", map: "La Désolation", expansion: "PoF", offset: 30, duration: 30 },
        { name: "Bataille de la Mer de Jade (Soo-Won)", map: "Trépas du Dragon", expansion: "EoD", offset: 0, duration: 20 },
        { name: "Assaut Trépas-de-l'Aube", map: "Province de Seitung", expansion: "EoD", offset: 45, duration: 15 },
        { name: "Guerre des Gangs d'Echovald", map: "Terres sauvages d'Echovald", expansion: "EoD", offset: 90, duration: 20 }
    ],

    worldBosses: [
        // Low-level Bosses (spawns every 2 hours)
        { id: "svanir_shaman", name: "Chef chamane svanir", map: "Contreforts de Voyageur", waypoint: "[&BMIDAAA=]", category: "low", offset: 15, interval: 120, duration: 15 },
        { id: "fire_elemental", name: "Élémentaire de feu", map: "Province de Metrica", waypoint: "[&BEcAAAA=]", category: "low", offset: 45, interval: 120, duration: 15 },
        { id: "great_jungle_wurm", name: "Grand Ver de la jungle", map: "Forêt de Caledon", waypoint: "[&BEEAAAA=]", category: "low", offset: 75, interval: 120, duration: 15 },
        { id: "shadow_behemoth", name: "Béhémoth des ombres", map: "Vallée de la reine", waypoint: "[&BPcAAAA=]", category: "low", offset: 105, interval: 120, duration: 15 },

        // Standard Bosses (spawns every 3 hours)
        { id: "taidha_covington", name: "Amirale Taidha Covington", map: "Côte de la marée sanglante", waypoint: "[&BKgCAAA=]", category: "standard", offset: 0, interval: 180, duration: 15 },
        { id: "megadestroyer", name: "Mégadestructeur", map: "Mont Maelström", waypoint: "[&BM0CAAA=]", category: "standard", offset: 30, interval: 180, duration: 15 },
        { id: "shatterer", name: "Le Destructeur", map: "Steppes de la strie flamboyante", waypoint: "[&BE4DAAA=]", category: "standard", offset: 60, interval: 180, duration: 15 },
        { id: "modniir_ulgoth", name: "Modniir Ulgoth", map: "Hinterlands de Harathi", waypoint: "[&BLEAAAA=]", category: "standard", offset: 90, interval: 180, duration: 15 },
        { id: "golem_mark_ii", name: "Golem Marque II", map: "Mont Maelström", waypoint: "[&BNQCAAA=]", category: "standard", offset: 120, interval: 180, duration: 15 },
        { id: "claw_of_jormag", name: "Griffe de Jormag", map: "Détroit des gorges glacées", waypoint: "[&BDoCAAA=]", category: "standard", offset: 150, interval: 180, duration: 15 },

        // Hardcore Bosses (fixed schedule in UTC minutes since midnight)
        { id: "tequatl", name: "Tequatl le Sans-soleil", map: "Marais de la dyle", waypoint: "[&BNABAAA=]", category: "hardcore", times: [0, 180, 420, 690, 960, 1140], duration: 30 },
        { id: "triple_trouble", name: "Triple Terreur", map: "Côte de la marée sanglante", waypoint: "[&BKoCAAA=]", category: "hardcore", times: [60, 240, 480, 750, 1020, 1200], duration: 30 },
        { id: "karka_queen", name: "Reine karka", map: "Crique de Sud-Soleil", waypoint: "[&BNUGAAA=]", category: "hardcore", times: [120, 360, 630, 900, 1080, 1380], duration: 30 }
    ],

    render(container) {
        container.innerHTML = `
            <div class="card" style="margin-bottom: 20px; padding: 15px 20px;">
                <div class="sub-tabs" style="display: flex; gap: 10px;">
                    <button class="sub-tab-btn ${this.selectedTab === 'metas' ? 'active' : ''}" data-subtab="metas">
                        <i class="fa-solid fa-earth-tyria"></i> Méta-Événements
                    </button>
                    <button class="sub-tab-btn ${this.selectedTab === 'worldbosses' ? 'active' : ''}" data-subtab="worldbosses">
                        <i class="fa-solid fa-skull"></i> World Bosses
                    </button>
                </div>
            </div>
            
            <div id="timers-content-area"></div>
        `;

        // Listeners for sub-tabs
        const btns = container.querySelectorAll('.sub-tab-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const subtab = btn.getAttribute('data-subtab');
                this.selectedTab = subtab;
                
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.renderTabContent();
                this.updateTimers();
            });
        });

        // Event delegation for world bosses checklist and waypoint copy
        container.addEventListener('click', (e) => {
            // 1. Waypoint Copy Click
            const waypointEl = e.target.closest('.wb-waypoint');
            if (waypointEl) {
                e.stopPropagation();
                const wp = waypointEl.getAttribute('data-waypoint');
                navigator.clipboard.writeText(wp).then(() => {
                    const originalHtml = waypointEl.innerHTML;
                    waypointEl.innerHTML = `<i class="fa-solid fa-check" style="color: var(--color-success);"></i> Copié !`;
                    setTimeout(() => {
                        waypointEl.innerHTML = originalHtml;
                    }, 1500);
                });
                return;
            }

            // 2. Checkbox Click / Row Toggle
            const rowEl = e.target.closest('.wb-item-row');
            if (rowEl) {
                const bossId = rowEl.getAttribute('data-wb-id');
                const completions = this.getCompletions();
                completions.completed[bossId] = !completions.completed[bossId];
                this.saveCompletions(completions.completed);
                this.updateTimers(); // Redraw instantly
            }
        });

        this.renderTabContent();

        // Start updates loop
        this.updateTimers();
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.timerInterval = setInterval(() => this.updateTimers(), 1000);
    },

    destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    populateMapsDropdown() {
        const mapSelect = document.getElementById('filter-map');
        if (!mapSelect) return;

        let filteredEvents = this.events;
        if (this.selectedExpansion !== 'all') {
            filteredEvents = this.events.filter(e => e.expansion === this.selectedExpansion);
        }

        const uniqueMaps = [...new Set(filteredEvents.map(e => e.map))].sort();

        let optionsHtml = '<option value="all">Toutes les cartes</option>';
        optionsHtml += uniqueMaps.map(map => `<option value="${map}">${map}</option>`).join('');

        mapSelect.innerHTML = optionsHtml;
        mapSelect.value = this.selectedMap;
    },

    renderTabContent() {
        const contentArea = document.getElementById('timers-content-area');
        if (!contentArea) return;

        if (this.selectedTab === 'metas') {
            contentArea.innerHTML = `
                <div class="card">
                    <div class="card-title">
                        <span>Minuteurs des Méta-Événements</span>
                        <i class="fa-solid fa-hourglass-half"></i>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 15px; font-size: 13px;">
                        Les événements mondiaux suivent un cycle de 2 heures synchronisé en temps universel (UTC). Rejoignez les cartes 10 minutes à l'avance !
                    </p>
                    
                    <!-- Filters -->
                    <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Extension</label>
                            <select id="filter-expansion" class="form-select">
                                <option value="all">Toutes les extensions</option>
                                <option value="HoT">Heart of Thorns (HoT)</option>
                                <option value="PoF">Path of Fire (PoF)</option>
                                <option value="EoD">End of Dragons (EoD)</option>
                                <option value="SotO">Secrets of the Obscure (SotO)</option>
                            </select>
                        </div>
                        <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Carte</label>
                            <select id="filter-map" class="form-select">
                                <option value="all">Toutes les cartes</option>
                            </select>
                        </div>
                    </div>

                    <div class="timer-grid" id="timers-grid-container"></div>
                </div>
            `;

            this.populateMapsDropdown();

            const expSelect = document.getElementById('filter-expansion');
            const mapSelect = document.getElementById('filter-map');

            expSelect.value = this.selectedExpansion;
            expSelect.addEventListener('change', (e) => {
                this.selectedExpansion = e.target.value;
                this.selectedMap = 'all';
                this.populateMapsDropdown();
                this.updateTimers();
            });

            mapSelect.value = this.selectedMap;
            mapSelect.addEventListener('change', (e) => {
                this.selectedMap = e.target.value;
                this.updateTimers();
            });
        } else {
            // World Bosses Layout
            contentArea.innerHTML = `
                <div class="worldboss-container">
                    <div class="wb-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-color); padding: 15px 20px; border-radius: var(--radius-md); flex-wrap: wrap; gap: 15px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div class="reset-countdown-box">
                                <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 2px;">Prochain reset quotidien (UTC)</span>
                                <strong id="reset-countdown" style="font-family: var(--font-heading); font-size: 18px; color: var(--color-accent); text-shadow: 0 0 8px rgba(76, 201, 240, 0.2);">00h 00m 00s</strong>
                            </div>
                        </div>
                        <button id="btn-reset-wb" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 8px; border-color: rgba(230, 57, 70, 0.3); transition: all 0.2s ease;">
                            <i class="fa-solid fa-arrows-rotate"></i> Réinitialiser les boss cochés
                        </button>
                    </div>

                    <div class="wb-layout-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        <!-- Low-Level Bosses -->
                        <div class="wb-track-card">
                            <h3 style="font-family: var(--font-heading); font-size: 13px; font-weight: 700; text-transform: uppercase; margin-bottom: 15px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                                <span style="width: 8px; height: 8px; background-color: var(--color-success); border-radius: 50%; box-shadow: 0 0 8px var(--color-success);"></span>
                                Boss de bas niveau (Niveau 1-15)
                            </h3>
                            <div class="wb-list" id="wb-low-list" style="display: flex; flex-direction: column; gap: 10px;"></div>
                        </div>

                        <!-- Standard Bosses -->
                        <div class="wb-track-card">
                            <h3 style="font-family: var(--font-heading); font-size: 13px; font-weight: 700; text-transform: uppercase; margin-bottom: 15px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                                <span style="width: 8px; height: 8px; background-color: var(--color-warning); border-radius: 50%; box-shadow: 0 0 8px var(--color-warning);"></span>
                                Boss standards (Niveau 40-80)
                            </h3>
                            <div class="wb-list" id="wb-standard-list" style="display: flex; flex-direction: column; gap: 10px;"></div>
                        </div>

                        <!-- Hardcore Bosses -->
                        <div class="wb-track-card">
                            <h3 style="font-family: var(--font-heading); font-size: 13px; font-weight: 700; text-transform: uppercase; margin-bottom: 15px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                                <span style="width: 8px; height: 8px; background-color: var(--color-danger); border-radius: 50%; box-shadow: 0 0 8px var(--color-danger);"></span>
                                Boss Hardcore (Mondiaux)
                            </h3>
                            <div class="wb-list" id="wb-hardcore-list" style="display: flex; flex-direction: column; gap: 10px;"></div>
                        </div>
                    </div>
                </div>
            `;

            const resetBtn = document.getElementById('btn-reset-wb');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    this.saveCompletions({});
                    this.updateTimers();
                });
            }
        }
    },

    updateTimers() {
        if (this.selectedTab === 'metas') {
            const grid = document.getElementById('timers-grid-container');
            if (!grid) {
                this.destroy();
                return;
            }

            const now = new Date();
            const utcHours = now.getUTCHours();
            const utcMinutes = now.getUTCMinutes();
            const utcSeconds = now.getUTCSeconds();
            
            const currentCycleMin = (utcHours * 60 + utcMinutes) % 120;
            const currentCycleSec = currentCycleMin * 60 + utcSeconds;

            let filteredEvents = this.events;
            if (this.selectedExpansion !== 'all') {
                filteredEvents = filteredEvents.filter(e => e.expansion === this.selectedExpansion);
            }
            if (this.selectedMap !== 'all') {
                filteredEvents = filteredEvents.filter(e => e.map === this.selectedMap);
            }

            if (filteredEvents.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                        <i class="fa-solid fa-filter" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                        Aucun minuteur actif ne correspond à ces critères.
                    </div>
                `;
                return;
            }

            grid.innerHTML = filteredEvents.map(event => {
                const startSec = event.offset * 60;
                const endSec = (event.offset + event.duration) * 60;
                
                let statusText = '';
                let timeString = '';
                let cardClass = 'upcoming';

                if (currentCycleSec >= startSec && currentCycleSec < endSec) {
                    statusText = 'En Cours !';
                    const remainingSec = endSec - currentCycleSec;
                    timeString = this.formatTime(remainingSec);
                    cardClass = 'active';
                } else {
                    let waitSec = 0;
                    if (currentCycleSec < startSec) {
                        waitSec = startSec - currentCycleSec;
                    } else {
                        waitSec = (120 * 60) - currentCycleSec + startSec;
                    }
                    
                    timeString = this.formatTime(waitSec);
                    
                    if (waitSec < 10 * 60) {
                        statusText = 'Commence bientôt';
                        cardClass = 'upcoming-soon';
                    } else {
                        statusText = 'À Venir';
                    }
                }

                return `
                    <div class="timer-card ${cardClass}">
                        <div class="timer-main-info">
                            <span class="timer-event-name">${event.name}</span>
                            <span class="timer-map"><i class="fa-solid fa-map-pin"></i> ${event.map}</span>
                        </div>
                        <div class="timer-countdown">
                            <div class="time-val">${timeString}</div>
                            <div class="time-state">${statusText}</div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            // World Bosses Live Updates
            const lowList = document.getElementById('wb-low-list');
            const standardList = document.getElementById('wb-standard-list');
            const hardcoreList = document.getElementById('wb-hardcore-list');
            const resetCountdownEl = document.getElementById('reset-countdown');
            
            if (!lowList || !standardList || !hardcoreList) {
                this.destroy();
                return;
            }
            
            if (resetCountdownEl) {
                resetCountdownEl.textContent = this.getResetCountdown();
            }
            
            const completions = this.getCompletions();
            
            const now = new Date();
            const utcHours = now.getUTCHours();
            const utcMinutes = now.getUTCMinutes();
            const utcSeconds = now.getUTCSeconds();
            const currentMinutes = utcHours * 60 + utcMinutes + utcSeconds / 60;
            
            let lowHtml = '';
            let standardHtml = '';
            let hardcoreHtml = '';
            
            this.worldBosses.forEach(boss => {
                const info = this.getBossStatus(boss, currentMinutes);
                const completed = !!completions.completed[boss.id];
                
                let cardClass = 'upcoming';
                let statusText = 'À venir';
                let timeString = '';
                
                if (info.status === 'active') {
                    cardClass = 'active';
                    statusText = 'En cours !';
                    timeString = this.formatTime(info.remainingSec);
                } else {
                    timeString = this.formatTime(info.waitSec);
                    if (info.waitSec < 10 * 60) {
                        cardClass = 'upcoming-soon';
                        statusText = 'Bientôt';
                    }
                }
                
                const html = `
                    <div class="wb-item-row ${completed ? 'completed' : ''} ${cardClass}" data-wb-id="${boss.id}">
                        <div class="wb-check-area">
                            <i class="${completed ? 'fa-solid fa-square-check' : 'fa-regular fa-square'} wb-check-icon"></i>
                        </div>
                        <div class="wb-info-area">
                            <span class="wb-name">${boss.name}</span>
                            <div class="wb-map-box">
                                <span class="wb-map">${boss.map}</span>
                                <span class="wb-waypoint" data-waypoint="${boss.waypoint}" title="Cliquer pour copier le point de passage">
                                    <i class="fa-regular fa-copy"></i> ${boss.waypoint}
                                </span>
                            </div>
                        </div>
                        <div class="wb-time-area">
                            <span class="wb-countdown-val">${timeString}</span>
                            <span class="wb-status-label">${statusText}</span>
                        </div>
                    </div>
                `;
                
                if (boss.category === 'low') {
                    lowHtml += html;
                } else if (boss.category === 'standard') {
                    standardHtml += html;
                } else if (boss.category === 'hardcore') {
                    hardcoreHtml += html;
                }
            });
            
            lowList.innerHTML = lowHtml;
            standardList.innerHTML = standardHtml;
            hardcoreList.innerHTML = hardcoreHtml;
        }
    },

    formatTime(totalSeconds) {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        
        let res = '';
        if (h > 0) res += `${h}h `;
        res += `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
        return res;
    },

    // --- World Boss Helpers ---
    getBossStatus(boss, currentMinutes) {
        let times = boss.times;
        if (!times) {
            times = [];
            for (let t = boss.offset; t < 1440; t += boss.interval) {
                times.push(t);
            }
        }
        
        const duration = boss.duration || 15;
        
        for (let time of times) {
            if (currentMinutes >= time && currentMinutes < time + duration) {
                const remainingMinutes = (time + duration) - currentMinutes;
                return {
                    status: 'active',
                    remainingSec: Math.floor(remainingMinutes * 60),
                    nextSpawnMinutes: time
                };
            }
        }
        
        let upcomingSpawns = [...times];
        upcomingSpawns.push(1440 + times[0]);
        
        let nextSpawn = upcomingSpawns.find(time => time > currentMinutes);
        let waitMinutes = nextSpawn - currentMinutes;
        
        return {
            status: 'upcoming',
            waitSec: Math.floor(waitMinutes * 60),
            nextSpawnMinutes: nextSpawn % 1440
        };
    },

    getResetCountdown() {
        const now = new Date();
        const nextReset = new Date();
        nextReset.setUTCHours(24, 0, 0, 0); // Next UTC midnight
        const diffMs = nextReset - now;
        if (diffMs <= 0) return "00h 00m 00s";
        
        const h = Math.floor(diffMs / 3600000);
        const m = Math.floor((diffMs % 3600000) / 60000);
        const s = Math.floor((diffMs % 60000) / 1000);
        
        return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    },

    getCompletions() {
        const defaultData = { lastResetDate: '', completed: {} };
        try {
            const data = localStorage.getItem('gw2_worldboss_completions');
            if (!data) return defaultData;
            const parsed = JSON.parse(data);
            
            const todayUtcStr = new Date().toUTCString().slice(5, 16);
            if (parsed.lastResetDate !== todayUtcStr) {
                const resetData = { lastResetDate: todayUtcStr, completed: {} };
                localStorage.setItem('gw2_worldboss_completions', JSON.stringify(resetData));
                return resetData;
            }
            return parsed;
        } catch (e) {
            console.error("Failed to load completions", e);
            return defaultData;
        }
    },

    saveCompletions(completed) {
        const todayUtcStr = new Date().toUTCString().slice(5, 16);
        const data = {
            lastResetDate: todayUtcStr,
            completed: completed
        };
        localStorage.setItem('gw2_worldboss_completions', JSON.stringify(data));
    }
};
