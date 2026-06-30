import { GW2Api } from '../api.js';

// Capitalized English names for GW2 API query
const PROFESSION_NAMES = {
    1: 'Guardian',
    2: 'Warrior',
    3: 'Engineer',
    4: 'Ranger',
    5: 'Thief',
    6: 'Elementalist',
    7: 'Mesmer',
    8: 'Necromancer',
    9: 'Revenant'
};

const PROFESSION_LABELS_FR = {
    'guardian': 'Gardien',
    'warrior': 'Guerrier',
    'engineer': 'Ingénieur',
    'ranger': 'Rôdeur',
    'thief': 'Voleur',
    'elementalist': 'Élémentaliste',
    'mesmer': 'Envoûteur',
    'necromancer': 'Nécromant',
    'revenant': 'Revenant'
};

const PROF_COLORS = {
    'guardian': '#72c1c6',
    'warrior': '#ffd166',
    'revenant': '#9e2a2b',
    'engineer': '#d08c3f',
    'ranger': '#8cb369',
    'thief': '#c08a8a',
    'elementalist': '#f28482',
    'mesmer': '#b5179e',
    'necromancer': '#2ec4b6'
};

const PROF_ICONS = {
    'warrior': 'fa-shield-halved',
    'guardian': 'fa-shield',
    'revenant': 'fa-eye-slash',
    'thief': 'fa-mask',
    'ranger': 'fa-crosshairs',
    'engineer': 'fa-gear',
    'elementalist': 'fa-fire',
    'necromancer': 'fa-skull',
    'mesmer': 'fa-wand-magic-sparkles'
};

const STAT_OPTIONS = [
    { value: '', label: 'Non défini' },
    { value: 'Berserker (Puissance, Précision, Férocité)', label: 'Berserker (Puissance, Précision, Férocité)' },
    { value: 'Viper (Condition, Puissance, Précision, Expertise)', label: 'Viper (Condition, Puissance, Précision, Expertise)' },
    { value: 'Celestial (Toutes les statistiques)', label: 'Céleste (Toutes les statistiques)' },
    { value: 'Harrier (Puissance, Guérison, Concentration)', label: 'Harrier (Puissance, Guérison, Concentration)' },
    { value: 'Minstrel (Robustesse, Guérison, Vitalité, Concentration)', label: 'Ménestrel (Robustesse, Guérison, Vitalité, Concentration)' },
    { value: 'Trailblazer (Robustesse, Condition, Vitalité, Expertise)', label: 'Pionnier (Robustesse, Condition, Vitalité, Expertise)' },
    { value: 'Diviner (Puissance, Concentration, Précision, Férocité)', label: 'Divin (Puissance, Concentration, Précision, Férocité)' },
    { value: 'Ritualist (Condition, Vitalité, Concentration, Expertise)', label: 'Ritualiste (Condition, Vitalité, Concentration, Expertise)' },
    { value: 'Assassin (Précision, Puissance, Férocité)', label: 'Assassin (Précision, Puissance, Férocité)' },
    { value: 'Dragon (Puissance, Férocité, Précision, Vitalité)', label: 'Dragon (Puissance, Férocité, Précision, Vitalité)' },
    { value: 'Magi (Guérison, Précision, Vitalité)', label: 'Mage (Guérison, Précision, Vitalité)' },
    { value: 'Giver (Guérison, Concentration, Robustesse)', label: 'Généreux (Guérison, Concentration, Robustesse)' },
    { value: 'Plaguedoctor (Condition, Guérison, Vitalité, Concentration)', label: 'Médecin de la peste (Condition, Guérison, Vitalité, Concentration)' }
];

const CURATED_ITEMS = {
    // Runes
    'runes': [
        { id: 0, name: 'Aucune' },
        { id: 24836, name: "Rune de l'érudit (Scholar)" },
        { id: 24815, name: "Rune de cauchemar (Nightmare)" },
        { id: 24859, name: "Rune de tourment (Tormenting)" },
        { id: 80800, name: "Rune de pyromancien (Firebrand)" },
        { id: 24754, name: "Rune d'élémentaliste (Elementalist)" },
        { id: 24784, name: "Rune de voleur (Thief)" },
        { id: 24818, name: "Rune d'altruisme (Altruism)" },
        { id: 24839, name: "Rune d'eau (Water)" },
        { id: 24842, name: "Rune de moine (Monk)" }
    ],
    // Sigils
    'sigils': [
        { id: 0, name: 'Aucun' },
        { id: 24615, name: "Cachet de force (Force)" },
        { id: 82012, name: "Cachet d'impact (Impact)" },
        { id: 48911, name: "Cachet de malice (Malice)" },
        { id: 48907, name: "Cachet d'éclatement (Bursting)" },
        { id: 24607, name: "Cachet de paralysie (Paralyzing)" },
        { id: 24554, name: "Cachet de géomancie (Geomancy)" },
        { id: 24562, name: "Cachet de fléau (Doom)" },
        { id: 24555, name: "Cachet de terre (Earth)" },
        { id: 24589, name: "Cachet d'agonie (Agony)" }
    ],
    // Relics
    'relics': [
        { id: 0, name: 'Aucune' },
        { id: 100453, name: "Relique de voleur (Thief)" },
        { id: 100429, name: "Relique de Peitha (Peitha)" },
        { id: 100947, name: "Relique d'Acala (Acala)" },
        { id: 100068, name: "Relique de Mabon (Mabon)" },
        { id: 100153, name: "Relique de Febe (Febe)" },
        { id: 100343, name: "Relique de Karakosa (Karakosa)" },
        { id: 100854, name: "Relique de feu d'artifice (Fireworks)" },
        { id: 100031, name: "Relique de fractale (Fractal)" },
        { id: 100465, name: "Relique de moine (Monk)" }
    ]
};

// Pure JS Build Link Decoder
function decodeBuildChatLink(chatLink) {
    if (!chatLink) return null;
    const cleanLink = chatLink.trim();
    if (!cleanLink.startsWith('[&') || !cleanLink.endsWith(']')) return null;
    
    try {
        const base64 = cleanLink.replace(/^\[&|\]$/g, '');
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        if (bytes[0] !== 0x0D) {
            throw new Error("Lien de build template invalide.");
        }
        
        const professionId = bytes[1];
        
        const specializations = [];
        const specIndices = [2, 4, 6];
        for (let idx of specIndices) {
            const specId = bytes[idx];
            const traitByte = bytes[idx + 1];
            if (specId > 0) {
                const t1 = traitByte & 0x03;          // Adept
                const t2 = (traitByte >> 2) & 0x03;   // Master
                const t3 = (traitByte >> 4) & 0x03;   // Grandmaster
                specializations.push({
                    id: specId,
                    traits: [t1, t2, t3]
                });
            }
        }
        
        const skills = {
            heal: bytes[8] | (bytes[9] << 8),
            utilities: [
                bytes[10] | (bytes[11] << 8),
                bytes[12] | (bytes[13] << 8),
                bytes[14] | (bytes[15] << 8)
            ],
            elite: bytes[16] | (bytes[17] << 8)
        };
        
        let legends = [];
        let legendUtilities = [];
        if (professionId === 9) {
            legends = [bytes[28], bytes[29]];
            legendUtilities = [
                [bytes[32] | (bytes[33] << 8), bytes[34] | (bytes[35] << 8), bytes[36] | (bytes[37] << 8)],
                [bytes[38] | (bytes[39] << 8), bytes[40] | (bytes[41] << 8), bytes[42] | (bytes[43] << 8)]
            ];
        }
        
        return {
            professionId,
            specializations,
            skills,
            legends,
            legendUtilities
        };
    } catch (e) {
        console.error("Decode template link error", e);
        return null;
    }
}

export const Builds = {
    // Layout and Routes State
    activeMode: 'api', // 'api' (Mes Personnages) ou 'custom' (Carnet de builds locaux)
    activeCharacter: null, // character object selected
    activeBuildTab: 0, // Build tab active (0 to 5)
    activeEquipmentTab: 0, // Equipment tab active (0-indexed)
    activeSubTab: 'equipment', // 'equipment', 'traits', 'skills'
    
    // Legacy Editor Modal State
    editingBuild: null,

    // Data lists
    characters: [],
    builds: [],
    syncConfig: { type: 'local', gistToken: '', gistId: '', webdavUrl: '', webdavUser: '', webdavPass: '' },
    isSyncing: false,
    syncStatusMsg: '',

    // Active local target build selected in API Mode Left Sidebar
    activeLocalBuildId: null,
    viewingType: 'api', // 'api' (read-only) ou 'local' (editable target templates)

    apiDataCache: {
        profDetails: null,
        profDetailsMap: {},
        specs: {},
        traits: {},
        skills: {},
        legends: {},
        items: {}
    },

    async render(container) {
        this.domContainer = container;
        this.loadLocalData();
        
        container.innerHTML = `
            <div class="builds-container" style="display:flex; flex-direction:column; gap:20px; width:100%;">
                <!-- Sync Alert & Status Bar -->
                <div class="builds-sync-bar card" id="builds-sync-status-bar" style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:var(--radius-md);">
                    <div class="sync-status-info" style="display:flex; align-items:center; gap:8px;">
                        <i class="fa-solid fa-cloud-arrow-up status-icon" style="color:var(--color-accent);"></i>
                        <span id="sync-status-text">Stockage : Local uniquement</span>
                    </div>
                    <div class="sync-actions" style="display:flex; gap:10px;">
                        <button id="btn-sync-now" class="btn btn-secondary btn-sm" style="display:none; align-items:center; gap:6px;">
                            <i class="fa-solid fa-arrows-rotate"></i> Synchroniser
                        </button>
                        <button id="btn-sync-config" class="btn btn-secondary btn-sm" style="display:flex; align-items:center; gap:6px;">
                            <i class="fa-solid fa-sliders"></i> Configuration Cloud
                        </button>
                    </div>
                </div>

                <!-- Mode Selectors Tab Header -->
                <div class="mode-selector-tabs" style="display:flex; gap:15px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px;">
                    <button id="btn-mode-api" class="btn btn-secondary ${this.activeMode === 'api' ? 'active' : ''}" style="display:flex; align-items:center; gap:8px; padding:10px 20px; border-radius:var(--radius-md);">
                        <i class="fa-solid fa-users"></i> Mes Personnages (API)
                    </button>
                    <button id="btn-mode-custom" class="btn btn-secondary ${this.activeMode === 'custom' ? 'active' : ''}" style="display:flex; align-items:center; gap:8px; padding:10px 20px; border-radius:var(--radius-md);">
                        <i class="fa-solid fa-folder-open"></i> Carnet de Builds
                    </button>
                </div>

                <!-- Content Area -->
                <div id="builds-mode-content-area" style="width:100%;">
                    <div class="loader-container" style="text-align:center; padding:50px;">
                        <div class="spinner"></div>
                        <p style="margin-top:15px;">Chargement des informations...</p>
                    </div>
                </div>

                <!-- Sync Config Dialog/Panel (Hidden by default) -->
                <div id="sync-config-modal" class="modal-overlay">
                    <div class="modal-content" style="max-width:500px;">
                        <div class="modal-header">
                            <h3>Paramètres de Synchronisation Cloud</h3>
                            <button class="close-modal" id="btn-close-sync-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="sync-type-select">Type de persistance</label>
                                <select id="sync-type-select" class="form-select" style="width: 100%;">
                                    <option value="local">Local uniquement (Dans ce navigateur)</option>
                                    <option value="gist">GitHub Gist Sync (Recommandé)</option>
                                    <option value="webdav">Serveur WebDAV (Nextcloud / Synology)</option>
                                </select>
                            </div>

                            <!-- Gist Form -->
                            <div id="sync-form-gist" class="sync-form-section" style="display:none;">
                                <div class="api-instructions" style="margin-bottom:15px;">
                                    <h4 style="font-size:12px; margin-bottom:5px;">Comment synchroniser avec GitHub Gist :</h4>
                                    <ol style="font-size:11px; padding-left:15px; color:var(--text-secondary);">
                                        <li>Créez un compte sur <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>.</li>
                                        <li>Générez un <strong>Personal Access Token (PAT)</strong> classique avec la permission <code>gist</code> sur <a href="https://github.com/settings/tokens" target="_blank" rel="noopener">github.com/settings/tokens</a>.</li>
                                        <li>Collez le jeton ci-dessous. Vos builds seront sauvés dans un Gist privé.</li>
                                    </ol>
                                </div>
                                <div class="form-group">
                                    <label for="sync-gist-token">GitHub Jeton d'accès (PAT) :</label>
                                    <input type="password" id="sync-gist-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx">
                                </div>
                                <div class="form-group">
                                    <label for="sync-gist-id">Gist ID existant (Optionnel) :</label>
                                    <input type="text" id="sync-gist-id" placeholder="Laissez vide pour créer un nouveau Gist">
                                </div>
                            </div>

                            <!-- WebDAV Form -->
                            <div id="sync-form-webdav" class="sync-form-section" style="display:none;">
                                <div class="api-instructions" style="margin-bottom:15px; border-left-color:var(--color-warning);">
                                    <h4 style="font-size:12px; margin-bottom:5px; color:var(--color-warning);">Attention CORS :</h4>
                                    <p style="font-size:11px; color:var(--text-secondary);">
                                        Votre serveur WebDAV doit autoriser les requêtes cross-origin (CORS) pour que votre navigateur puisse écrire directement le fichier.
                                    </p>
                                </div>
                                <div class="form-group">
                                    <label for="sync-webdav-url">URL du dossier WebDAV :</label>
                                    <input type="text" id="sync-webdav-url" placeholder="https://cloud.example.com/remote.php/dav/files/user/dossier/">
                                </div>
                                <div class="form-group">
                                    <label for="sync-webdav-user">Nom d'utilisateur :</label>
                                    <input type="text" id="sync-webdav-user" placeholder="mon_username">
                                </div>
                                <div class="form-group">
                                    <label for="sync-webdav-pass">Mot de passe / Jeton d'application :</label>
                                    <input type="password" id="sync-webdav-pass" placeholder="mot_de_passe">
                                </div>
                            </div>

                            <!-- Backup Import/Export -->
                            <div class="api-instructions" style="background: rgba(255,255,255,0.02); border-left: 3px solid var(--text-muted); margin-top:20px;">
                                <h4 style="font-size:12px; margin-bottom:8px;">Sauvegarde de secours physique</h4>
                                <div style="display:flex; gap:10px;">
                                    <button id="btn-export-json" class="btn btn-secondary btn-sm" style="flex:1;">
                                        <i class="fa-solid fa-download"></i> Exporter (JSON)
                                    </button>
                                    <button id="btn-import-json-trigger" class="btn btn-secondary btn-sm" style="flex:1;">
                                        <i class="fa-solid fa-upload"></i> Importer (JSON)
                                    </button>
                                    <input type="file" id="input-import-json" style="display:none;" accept=".json">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <span id="sync-config-error" style="color:var(--color-danger); font-size:12px; margin-right:auto;"></span>
                            <button id="btn-save-sync-config" class="btn btn-primary">Enregistrer</button>
                        </div>
                    </div>
                </div>

                <!-- Custom/Legacy Build Creator/Editor Modal -->
                <div id="build-editor-modal" class="modal-overlay">
                    <div class="modal-content" style="max-width:960px; width:95%; height:90vh; display:flex; flex-direction:column; padding:0;">
                        <div class="modal-header" style="padding:20px; border-bottom:1px solid var(--border-color);">
                            <h3 id="editor-modal-title">Créer un Nouveau Build</h3>
                            <button class="close-modal" id="btn-close-editor-modal">&times;</button>
                        </div>
                        <div class="modal-body" style="flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:20px;">
                            <div class="editor-section-card card">
                                <h4>1. Informations Générales</h4>
                                <div class="grid-2" style="margin-top:15px;">
                                    <div class="form-group">
                                        <label for="edit-build-name">Nom du Build :</label>
                                        <input type="text" id="edit-build-name" placeholder="Ex: Power Reaper - Open World">
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-build-profession">Profession :</label>
                                        <select id="edit-build-profession" class="form-select" style="width: 100%;">
                                            <option value="">Sélectionnez une profession</option>
                                            ${Object.entries(PROFESSION_LABELS_FR).map(([key, val]) => `
                                                <option value="${key}">${val}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="grid-3" style="margin-top:15px;">
                                    <div class="form-group">
                                        <label for="edit-build-mode">Mode de jeu :</label>
                                        <select id="edit-build-mode" class="form-select" style="width: 100%;">
                                            <option value="pve">PvE (Monde ouvert / Raids)</option>
                                            <option value="pvp">PvP (JcJ)</option>
                                            <option value="wvw">WvW (MvM)</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-build-type">Type de Preset :</label>
                                        <select id="edit-build-type" class="form-select" style="width: 100%;">
                                            <option value="aptitudes">Preset d'Aptitudes (Traits & Compétences)</option>
                                            <option value="equipment">Preset d'Équipement (Stuff)</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-build-favorite" style="display:flex; align-items:center; gap:8px; margin-top:28px; cursor:pointer;">
                                            <input type="checkbox" id="edit-build-favorite">
                                            Ajouter aux favoris
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="editor-section-card card">
                                <h4>2. Code de Build en jeu</h4>
                                <div class="form-group" style="margin-top:15px;">
                                    <label for="edit-build-chatlink">Lien de Chat du build (GW2 Build Template Link) :</label>
                                    <input type="text" id="edit-build-chatlink" placeholder="Ex: [&DQYfFhUXOhXuFh4XBhgGGAUbBxsHGwcZCRkZGQAAAAAAAAAAAAAAAAAAAAA=]" style="font-family:monospace;">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer" style="padding:20px; border-top:1px solid var(--border-color);">
                            <span id="editor-error-msg" style="color:var(--color-danger); font-size:12px; margin-right:auto;"></span>
                            <button id="btn-save-build" class="btn btn-primary">Enregistrer le Build</button>
                        </div>
                    </div>
                </div>

                <!-- Skill Selection Modal -->
                <div id="skill-selector-modal" class="modal-overlay" style="z-index: 1200;">
                    <div class="modal-content" style="max-width: 450px;">
                        <div class="modal-header">
                            <h3 id="skill-selector-title">Sélectionner une compétence</h3>
                            <button class="close-modal" id="btn-close-skill-modal">&times;</button>
                        </div>
                        <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                            <div class="skills-selector-grid" id="skill-selector-grid"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents(container);
        this.updateSyncStatusBar();

        // 1. Fetch Cloud Gist or WebDAV configurations
        await this.loadCloudBuilds();
        
        // 2. Fetch API characters
        await this.loadApiCharacters();

        // 3. Prefetch all details
        await this.prefetchAllBuildsApiData();

        // 4. Render correct active view
        this.renderActiveView();
    },

    loadLocalData() {
        try {
            const savedBuilds = localStorage.getItem('gw2_builds');
            this.builds = savedBuilds ? JSON.parse(savedBuilds) : [];
            
            // Validate local target builds properties
            this.builds.forEach(b => {
                b.weapons = b.weapons || { set1: '', set2: '' };
                b.equipment = b.equipment || {
                    armorStat: '', weaponsStat: '', trinketsStat: '',
                    runeId: 0, relicId: 0, sigils1Ids: [0, 0], sigils2Ids: [0, 0],
                    food: '', utility: ''
                };
            });

            const savedSync = localStorage.getItem('gw2_builds_sync_config');
            if (savedSync) {
                this.syncConfig = JSON.parse(savedSync);
            }
        } catch (e) {
            console.error("Failed to load local storage data", e);
        }
    },

    saveLocalData() {
        try {
            localStorage.setItem('gw2_builds', JSON.stringify(this.builds));
            localStorage.setItem('gw2_builds_sync_config', JSON.stringify(this.syncConfig));
        } catch (e) {
            console.error("Failed to save local data", e);
        }
    },

    async loadApiCharacters() {
        if (!GW2Api.hasKey()) return;
        try {
            this.characters = await GW2Api.getCharacters();
            if (this.characters && this.characters.length > 0) {
                // Set default character
                if (!this.activeCharacter) {
                    this.activeCharacter = this.characters[0];
                } else {
                    // Update activeCharacter from fresh array
                    const found = this.characters.find(c => c.name === this.activeCharacter.name);
                    if (found) this.activeCharacter = found;
                }
                this.activeEquipmentTab = (this.activeCharacter?.active_equipment_tab || 1) - 1;
            }
        } catch (e) {
            console.error("Failed to load API characters", e);
        }
    },

    updateSyncStatusBar() {
        const textEl = document.getElementById('sync-status-text');
        const syncBtn = document.getElementById('btn-sync-now');
        if (!textEl) return;

        let statusText = 'Stockage : Local uniquement';
        let showSync = false;

        if (this.syncConfig.type === 'gist') {
            statusText = `GitHub Gist : ${this.syncConfig.gistId ? 'Connecté' : 'Non synchronisé'}`;
            showSync = !!this.syncConfig.gistToken;
        } else if (this.syncConfig.type === 'webdav') {
            statusText = 'Stockage : WebDAV';
            showSync = !!this.syncConfig.webdavUrl;
        }

        if (this.isSyncing) {
            statusText += ' (Synchronisation en cours...)';
        } else if (this.syncStatusMsg) {
            statusText = this.syncStatusMsg;
        }

        textEl.textContent = statusText;
        if (syncBtn) {
            syncBtn.style.display = showSync ? 'inline-flex' : 'none';
            if (this.isSyncing) {
                syncBtn.disabled = true;
                syncBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
            } else {
                syncBtn.disabled = false;
                syncBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> Synchroniser`;
            }
        }
    },

    renderActiveView() {
        const contentArea = document.getElementById('builds-mode-content-area');
        if (!contentArea) return;

        if (this.activeMode === 'api') {
            contentArea.innerHTML = this.renderApiViewHTML();
        } else {
            contentArea.innerHTML = this.renderCustomViewHTML();
        }
    },

    // --- Decoders and Encoders ---

    encodeBuildChatLink(professionId, specializations, skills, legends = [], legendUtilities = []) {
        try {
            const bytes = new Uint8Array(44);
            bytes[0] = 0x0D;
            bytes[1] = professionId;
            
            for (let i = 0; i < 3; i++) {
                const spec = specializations[i] || { id: 0, traits: [0, 0, 0] };
                const idx = 2 + i * 2;
                bytes[idx] = spec.id;
                
                let traitByte = 0;
                if (spec.traits) {
                    traitByte |= (spec.traits[0] & 0x03);
                    traitByte |= ((spec.traits[1] & 0x03) << 2);
                    traitByte |= ((spec.traits[2] & 0x03) << 4);
                }
                bytes[idx + 1] = traitByte;
            }
            
            bytes[8] = (skills.heal || 0) & 0xFF;
            bytes[9] = ((skills.heal || 0) >> 8) & 0xFF;
            
            bytes[10] = (skills.utilities?.[0] || 0) & 0xFF;
            bytes[11] = ((skills.utilities?.[0] || 0) >> 8) & 0xFF;
            
            bytes[12] = (skills.utilities?.[1] || 0) & 0xFF;
            bytes[13] = ((skills.utilities?.[1] || 0) >> 8) & 0xFF;
            
            bytes[14] = (skills.utilities?.[2] || 0) & 0xFF;
            bytes[15] = ((skills.utilities?.[2] || 0) >> 8) & 0xFF;
            
            bytes[16] = (skills.elite || 0) & 0xFF;
            bytes[17] = ((skills.elite || 0) >> 8) & 0xFF;
            
            if (professionId === 9) {
                bytes[28] = legends[0] || 0;
                bytes[29] = legends[1] || 0;
                
                const legUtils1 = legendUtilities[0] || [0, 0, 0];
                bytes[32] = legUtils1[0] & 0xFF;
                bytes[33] = (legUtils1[0] >> 8) & 0xFF;
                bytes[34] = legUtils1[1] & 0xFF;
                bytes[35] = (legUtils1[1] >> 8) & 0xFF;
                bytes[36] = legUtils1[2] & 0xFF;
                bytes[37] = (legUtils1[2] >> 8) & 0xFF;
                
                const legUtils2 = legendUtilities[1] || [0, 0, 0];
                bytes[38] = legUtils2[0] & 0xFF;
                bytes[39] = (legUtils2[0] >> 8) & 0xFF;
                bytes[40] = legUtils2[1] & 0xFF;
                bytes[41] = (legUtils2[1] >> 8) & 0xFF;
                bytes[42] = legUtils2[2] & 0xFF;
                bytes[43] = (legUtils2[2] >> 8) & 0xFF;
            }
            
            let binaryString = '';
            for (let i = 0; i < bytes.length; i++) {
                binaryString += String.fromCharCode(bytes[i]);
            }
            return `[&${btoa(binaryString)}]`;
        } catch (e) {
            console.error("Failed to encode link", e);
            return '';
        }
    },

    decodeBuildChatLink(chatLink) {
        return decodeBuildChatLink(chatLink);
    },

    // --- API Data Fetching & Prefetching ---

    async prefetchAllBuildsApiData() {
        const specIds = [];
        const skillIds = [];
        const traitIds = [];
        const itemIds = [];
        const professionsToFetch = new Set();

        try {
            const legendsList = await GW2Api.getLegendDetails();
            this.apiDataCache.legends = {};
            
            const legendMappings = {
                'Legend1': { code: 6, name: 'Glint (Dragon Légendaire)' },
                'Legend2': { code: 3, name: 'Shiro (Assassin Légendaire)' },
                'Legend3': { code: 2, name: 'Jalis (Nain Légendaire)' },
                'Legend4': { code: 1, name: 'Mallyx (Démon Légendaire)' },
                'Legend5': { code: 7, name: 'Kalla (Renégat Légendaire)' },
                'Legend6': { code: 4, name: 'Ventari (Centaure Légendaire)' },
                'Legend7': { code: 8, name: 'Alliance Légendaire (Justicier)' },
                'Legend8': { code: 9, name: 'Razah (Entité Légendaire)' }
            };

            legendsList.forEach(l => {
                const mapping = legendMappings[l.id];
                if (mapping) {
                    l.code = mapping.code;
                    l.name = mapping.name;
                } else {
                    l.code = 0;
                    l.name = l.id;
                }
                this.apiDataCache.legends[l.id] = l;
            });
        } catch (e) {
            console.error("Failed to fetch legends list", e);
        }

        // 2. Scan API characters
        this.characters.forEach(c => {
            professionsToFetch.add(c.profession.toLowerCase());
            
            const tabs = c.build_tabs || [];
            tabs.forEach(t => {
                const b = t.build;
                if (!b) return;
                
                b.specializations?.forEach(s => {
                    if (s.id) specIds.push(s.id);
                });
                
                if (b.skills?.terrestrial) {
                    if (b.skills.terrestrial.heal) skillIds.push(b.skills.terrestrial.heal);
                    if (b.skills.terrestrial.elite) skillIds.push(b.skills.terrestrial.elite);
                    if (b.skills.terrestrial.utilities) {
                        b.skills.terrestrial.utilities.forEach(id => { if (id) skillIds.push(id); });
                    }
                }
            });

            // Scan all equipment tabs
            const eqTabs = c.equipment_tabs || [];
            if (eqTabs.length > 0) {
                eqTabs.forEach(tab => {
                    const eq = tab.equipment || [];
                    eq.forEach(item => {
                        if (item.id) itemIds.push(item.id);
                        if (item.upgrades) itemIds.push(...item.upgrades);
                    });
                });
            } else {
                const eq = c.equipment || [];
                eq.forEach(item => {
                    if (item.id) itemIds.push(item.id);
                    if (item.upgrades) itemIds.push(...item.upgrades);
                });
            }
        });

        // 3. Scan local target templates
        this.builds.forEach(b => {
            if (b.profession) professionsToFetch.add(b.profession.toLowerCase());
            
            const decoded = this.decodeBuildChatLink(b.chatLink);
            if (decoded) {
                decoded.specializations.forEach(s => {
                    if (s.id) specIds.push(s.id);
                });
            }

            const eq = b.equipment;
            if (eq) {
                if (eq.runeId) itemIds.push(eq.runeId);
                if (eq.relicId) itemIds.push(eq.relicId);
                if (eq.sigils1Ids) itemIds.push(...eq.sigils1Ids);
                if (eq.sigils2Ids) itemIds.push(...eq.sigils2Ids);
            }
        });

        // 4. Fetch details from API
        try {
            for (const profName of professionsToFetch) {
                const details = await GW2Api.getProfessionDetails(profName);
                this.apiDataCache.profDetailsMap[profName.toLowerCase()] = details;
                
                if (details.specializations) {
                    specIds.push(...details.specializations);
                }
                
                if (details.skills_by_palette) {
                    details.skills_by_palette.forEach(([palId, skId]) => {
                        skillIds.push(skId);
                    });
                }
            }

            // Specs
            const uniqueSpecs = [...new Set(specIds)].filter(id => id && id > 0);
            if (uniqueSpecs.length > 0) {
                const specsMap = await GW2Api.getSpecializationDetails(uniqueSpecs);
                Object.assign(this.apiDataCache.specs, specsMap);

                Object.values(specsMap).forEach(spec => {
                    if (spec.minor_traits) traitIds.push(...spec.minor_traits);
                    if (spec.major_traits) traitIds.push(...spec.major_traits);
                });
            }

            // Traits
            const uniqueTraits = [...new Set(traitIds)].filter(id => id && id > 0);
            if (uniqueTraits.length > 0) {
                const traitsMap = await GW2Api.getTraitDetails(uniqueTraits);
                Object.assign(this.apiDataCache.traits, traitsMap);
            }

            // Skills
            const uniqueSkills = [...new Set(skillIds)];
            Object.values(this.apiDataCache.legends || {}).forEach(leg => {
                if (leg.heal) uniqueSkills.push(leg.heal);
                if (leg.elite) uniqueSkills.push(leg.elite);
                if (leg.swap) uniqueSkills.push(leg.swap);
                if (leg.utilities) uniqueSkills.push(...leg.utilities);
            });
            const finalSkills = [...new Set(uniqueSkills)].filter(id => id && id > 0);
            if (finalSkills.length > 0) {
                const skillsMap = await GW2Api.getSkillDetails(finalSkills);
                Object.assign(this.apiDataCache.skills, skillsMap);
            }

            // Items
            Object.values(CURATED_ITEMS).forEach(list => {
                list.forEach(item => {
                    if (item.id > 0) itemIds.push(item.id);
                });
            });
            const uniqueItems = [...new Set(itemIds)].filter(id => id && id > 0);
            if (uniqueItems.length > 0) {
                const itemsMap = await GW2Api.getItemDetails(uniqueItems);
                Object.assign(this.apiDataCache.items, itemsMap);
            }
        } catch (e) {
            console.error("Failed to prefetch build manager API data", e);
        }
    },

    // --- Normalized Mappers ---

    normalizeLocalBuild(localBuild) {
        const decoded = this.decodeBuildChatLink(localBuild.chatLink) || {
            professionId: 1,
            specializations: [],
            skills: { heal: 0, utilities: [0, 0, 0], elite: 0 },
            legends: [0, 0],
            legendUtilities: [[0, 0, 0], [0, 0, 0]]
        };

        // Enforce Revenant rules on load/decode
        const isRev = String(localBuild.profession).toLowerCase() === 'revenant';
        if (isRev) {
            const spec3 = decoded.specializations?.[2]?.id || 0;
            // Validate elite stances
            decoded.legends = decoded.legends.map((code, idx) => {
                if (code === 6 && spec3 !== 52) return idx === 0 ? 3 : 2; // Glint -> Herald
                if (code === 7 && spec3 !== 63) return idx === 0 ? 3 : 2; // Kalla -> Renegade
                if (code === 8 && spec3 !== 69) return idx === 0 ? 3 : 2; // Alliance -> Vindicator
                if (code === 9 && spec3 !== 79) return idx === 0 ? 3 : 2; // Razah -> Conduit
                return code;
            });

            // Ensure no duplicate legends
            if (decoded.legends[0] === decoded.legends[1]) {
                decoded.legends[1] = decoded.legends[0] === 2 ? 3 : 2; // Jalis/Shiro swap fallback
            }
        }

        return {
            id: localBuild.id,
            name: localBuild.name,
            profession: localBuild.profession,
            chatLink: localBuild.chatLink,
            rotation: localBuild.rotation,
            notes: localBuild.notes,
            weapons: localBuild.weapons,
            equipment: localBuild.equipment,
            specializations: decoded.specializations,
            skills: decoded.skills,
            legends: decoded.legends,
            legendUtilities: decoded.legendUtilities
        };
    },

    normalizeApiBuild(apiBuild, character) {
        const profName = character.profession.toLowerCase();
        const profDetails = this.apiDataCache.profDetailsMap[profName];
        
        const reversePaletteMap = new Map();
        if (profDetails?.skills_by_palette) {
            profDetails.skills_by_palette.forEach(([pal, sk]) => {
                reversePaletteMap.set(sk, pal);
            });
        }

        const toPalette = (skId) => reversePaletteMap.get(skId) || 0;

        const skillsPalettes = {
            heal: toPalette(apiBuild.skills?.terrestrial?.heal),
            utilities: [
                toPalette(apiBuild.skills?.terrestrial?.utilities?.[0]),
                toPalette(apiBuild.skills?.terrestrial?.utilities?.[1]),
                toPalette(apiBuild.skills?.terrestrial?.utilities?.[2])
            ],
            elite: toPalette(apiBuild.skills?.terrestrial?.elite)
        };

        const legendsCodes = [0, 0];
        if (apiBuild.legends?.terrestrial) {
            apiBuild.legends.terrestrial.forEach((lId, idx) => {
                const leg = Object.values(this.apiDataCache.legends || {}).find(cl => cl.id === lId);
                if (leg) {
                    legendsCodes[idx] = leg.code;
                }
            });
        }

        const legendUtilities = [[0, 0, 0], [0, 0, 0]];
        if (String(character.profession).toLowerCase() === 'revenant') {
            legendUtilities[0] = [...skillsPalettes.utilities];
        }

        const eq = this.extractEquipmentFromAPI(character);

        const activeTab = character.equipment_tabs?.[this.activeEquipmentTab] || character.equipment_tabs?.find(t => t.is_active) || { equipment: character.equipment || [] };
        const eqItems = activeTab.equipment || [];
        const getWeaponName = (slot) => {
            const item = eqItems.find(i => i.slot === slot);
            if (!item) return '';
            const dbItem = this.apiDataCache.items?.[item.id];
            return dbItem?.name || '';
        };

        const w1_1 = getWeaponName('WeaponA1');
        const w1_2 = getWeaponName('WeaponA2');
        const w2_1 = getWeaponName('WeaponB1');
        const w2_2 = getWeaponName('WeaponB2');

        const weapons = {
            set1: w1_1 + (w1_2 ? ' + ' + w1_2 : ''),
            set2: w2_1 + (w2_2 ? ' + ' + w2_2 : '')
        };

        const profCode = Object.keys(PROFESSION_NAMES).find(k => PROFESSION_NAMES[k].toLowerCase() === profName);

        const mappedSpecs = (apiBuild.specializations || []).map(s => {
            const spec = this.apiDataCache.specs[s.id];
            const traitChoices = [0, 0, 0];
            if (spec && spec.major_traits && s.traits) {
                const majors = spec.major_traits;
                s.traits.forEach(tId => {
                    if (!tId) return;
                    const idx = majors.indexOf(tId);
                    if (idx !== -1) {
                        const tier = Math.floor(idx / 3);
                        const choice = (idx % 3) + 1;
                        traitChoices[tier] = choice;
                    }
                });
            }
            return {
                id: s.id,
                traits: traitChoices
            };
        });

        const chatLink = this.encodeBuildChatLink(
            parseInt(profCode),
            mappedSpecs,
            skillsPalettes,
            legendsCodes,
            legendUtilities
        );

        return {
            name: apiBuild.name || 'Preset sans nom',
            profession: profName,
            chatLink,
            rotation: '',
            notes: `Modèle importé en direct de l'API de jeu pour ${character.name}.`,
            weapons,
            equipment: eq,
            specializations: mappedSpecs,
            skills: skillsPalettes,
            legends: legendsCodes,
            legendUtilities
        };
    },

    extractEquipmentFromAPI(character) {
        const activeTab = character.equipment_tabs?.[this.activeEquipmentTab] || character.equipment_tabs?.find(t => t.is_active) || { equipment: character.equipment || [] };
        const eqItems = activeTab.equipment || [];

        const getUpgradeId = (slotName) => {
            const item = eqItems.find(i => i.slot === slotName);
            return item?.upgrades?.[0] || 0;
        };

        const getStatName = (slotName) => {
            const item = eqItems.find(i => i.slot === slotName);
            if (!item) return '';
            const statId = item.stats?.id;
            if (statId) {
                const statsMap = {
                    161: 'Berserker (Puissance, Précision, Férocité)', 
                    1097: 'Viper (Condition, Puissance, Précision, Expertise)', 
                    1038: 'Celestial (Toutes les statistiques)', 
                    1363: 'Harrier (Puissance, Guérison, Concentration)',
                    1211: 'Minstrel (Robustesse, Guérison, Vitalité, Concentration)', 
                    1115: 'Trailblazer (Robustesse, Condition, Vitalité, Expertise)', 
                    1226: 'Diviner (Puissance, Concentration, Précision, Férocité)', 
                    1709: 'Ritualist (Condition, Vitalité, Concentration, Expertise)',
                    162: 'Assassin (Précision, Puissance, Férocité)', 
                    1740: 'Dragon (Puissance, Férocité, Précision, Vitalité)', 
                    159: 'Magi (Guérison, Précision, Vitalité)', 
                    156: 'Giver (Guérison, Concentration, Robustesse)', 
                    1225: 'Plaguedoctor (Condition, Guérison, Vitalité, Concentration)'
                };
                return statsMap[statId] || `Stat ID: ${statId}`;
            }
            return '';
        };

        const sigil1_1 = getUpgradeId('WeaponA1');
        const sigil1_2 = getUpgradeId('WeaponA2');
        const sigil2_1 = getUpgradeId('WeaponB1');
        const sigil2_2 = getUpgradeId('WeaponB2');

        const armorStat = getStatName('Coat') || getStatName('Helm') || getStatName('Leggings') || 'Berserker (Puissance, Précision, Férocité)';
        const weaponsStat = getStatName('WeaponA1') || getStatName('WeaponB1') || 'Berserker (Puissance, Précision, Férocité)';
        const trinketsStat = getStatName('Amulet') || getStatName('Ring1') || 'Berserker (Puissance, Précision, Férocité)';

        return {
            armorStat,
            weaponsStat,
            trinketsStat,
            runeId: getUpgradeId('Coat') || getUpgradeId('Helm') || 0,
            relicId: getUpgradeId('Relic') || 0,
            sigils1Ids: [sigil1_1, sigil1_2],
            sigils2Ids: [sigil2_1, sigil2_2],
            food: '',
            utility: ''
        };
    },

    // --- HTML Render subtabs ---

    getSyntheticAttributesForPrefix(prefix) {
        if (!prefix) return [];
        const clean = prefix.toLowerCase();
        
        if (clean.includes('berserker')) {
            return [
                { attribute: 'Power', modifier: 120 },
                { attribute: 'Precision', modifier: 85 },
                { attribute: 'CritDamage', modifier: 85 }
            ];
        }
        if (clean.includes('viper')) {
            return [
                { attribute: 'Power', modifier: 100 },
                { attribute: 'ConditionDamage', modifier: 100 },
                { attribute: 'Precision', modifier: 70 },
                { attribute: 'ConditionDuration', modifier: 70 }
            ];
        }
        if (clean.includes('celestial') || clean.includes('céleste')) {
            return [
                { attribute: 'Power', modifier: 60 },
                { attribute: 'Precision', modifier: 60 },
                { attribute: 'CritDamage', modifier: 60 },
                { attribute: 'Toughness', modifier: 60 },
                { attribute: 'Vitality', modifier: 60 },
                { attribute: 'ConditionDamage', modifier: 60 },
                { attribute: 'Healing', modifier: 60 },
                { attribute: 'BoonDuration', modifier: 60 },
                { attribute: 'ConditionDuration', modifier: 60 }
            ];
        }
        if (clean.includes('harrier')) {
            return [
                { attribute: 'Power', modifier: 120 },
                { attribute: 'Healing', modifier: 85 },
                { attribute: 'BoonDuration', modifier: 85 }
            ];
        }
        if (clean.includes('minstrel') || clean.includes('ménestrel')) {
            return [
                { attribute: 'Toughness', modifier: 100 },
                { attribute: 'Healing', modifier: 100 },
                { attribute: 'Vitality', modifier: 70 },
                { attribute: 'BoonDuration', modifier: 70 }
            ];
        }
        if (clean.includes('trailblazer') || clean.includes('pionnier')) {
            return [
                { attribute: 'Toughness', modifier: 100 },
                { attribute: 'ConditionDamage', modifier: 100 },
                { attribute: 'Vitality', modifier: 70 },
                { attribute: 'ConditionDuration', modifier: 70 }
            ];
        }
        
        return [
            { attribute: 'Power', modifier: 100 },
            { attribute: 'Precision', modifier: 70 }
        ];
    },

    getVirtualItem(slotName, build) {
        const eq = build.equipment || {
            armorStat: '', weaponsStat: '', trinketsStat: '',
            runeId: 0, relicId: 0, sigils1Ids: [0, 0], sigils2Ids: [0, 0],
            food: '', utility: ''
        };

        const isArmor = ['Helm', 'Shoulders', 'Coat', 'Gloves', 'Leggings', 'Boots'].includes(slotName);
        const isWeapon = ['WeaponA1', 'WeaponA2', 'WeaponB1', 'WeaponB2'].includes(slotName);
        const isTrinket = ['Backpack', 'Accessory1', 'Accessory2', 'Amulet', 'Ring1', 'Ring2'].includes(slotName);
        const isRelic = slotName === 'Relic';

        let stat = '';
        if (isArmor) stat = eq.armorStat;
        else if (isWeapon) stat = eq.weaponsStat;
        else if (isTrinket) stat = eq.trinketsStat;

        let upgradeId = 0;
        if (isArmor) upgradeId = eq.runeId;
        else if (slotName === 'WeaponA1') upgradeId = eq.sigils1Ids?.[0] || 0;
        else if (slotName === 'WeaponA2') upgradeId = eq.sigils1Ids?.[1] || 0;
        else if (slotName === 'WeaponB1') upgradeId = eq.sigils2Ids?.[0] || 0;
        else if (slotName === 'WeaponB2') upgradeId = eq.sigils2Ids?.[1] || 0;
        else if (isRelic) upgradeId = eq.relicId;

        // Fallback default slot icon
        let defaultIcon = '';
        if (slotName === 'Helm') defaultIcon = 'https://render.guildwars2.com/file/33B0D235F60B8E3D23985F2C8431872140A4D383/223010.png';
        else if (slotName === 'Shoulders') defaultIcon = 'https://render.guildwars2.com/file/204856CC8CDA730D3597D9F88A22223D3F2C4C34/223011.png';
        else if (slotName === 'Coat') defaultIcon = 'https://render.guildwars2.com/file/640C40ED6B8281ABDF196A398283B4628D8A3DFD/223012.png';
        else if (slotName === 'Gloves') defaultIcon = 'https://render.guildwars2.com/file/F4A6F144D976403A2B1D7A73F37D33180A4E384A/223013.png';
        else if (slotName === 'Leggings') defaultIcon = 'https://render.guildwars2.com/file/48AA8FF51A5AD56985F2C46F8E8028D69A4C346B/223014.png';
        else if (slotName === 'Boots') defaultIcon = 'https://render.guildwars2.com/file/F4A0A4B1A00B70438A0A47B1E46271180A4E384D/223015.png';
        else if (isWeapon) defaultIcon = 'https://render.guildwars2.com/file/71F7E9B4BD87C7E9A9B487A4F1D77A23C7DA3D6A/223019.png';
        else if (slotName === 'Backpack') defaultIcon = 'https://render.guildwars2.com/file/68032D56CC8CDA730D3597D9F88A22223D3F2C4C36/223023.png';
        else if (slotName === 'Amulet') defaultIcon = 'https://render.guildwars2.com/file/68032D56CC8CDA730D3597D9F88A22223D3F2C4C36/223021.png';
        else if (slotName.startsWith('Ring')) defaultIcon = 'https://render.guildwars2.com/file/68032D56CC8CDA730D3597D9F88A22223D3F2C4C36/223022.png';
        else if (slotName.startsWith('Accessory')) defaultIcon = 'https://render.guildwars2.com/file/68032D56CC8CDA730D3597D9F88A22223D3F2C4C36/223020.png';
        else if (isRelic) defaultIcon = 'https://render.guildwars2.com/file/A1A6C28938BD4B20EB7B04D4DA94E7AC4D94CA82/3013898.png';

        return {
            stat,
            upgradeId,
            defaultIcon
        };
    },

    getItemTooltipHTML(item, upgrade, instanceStats = null) {
        if (!item) return '';

        let attributesHtml = '';
        if (instanceStats && instanceStats.attributes) {
            const attrs = Object.entries(instanceStats.attributes).map(([attrName, modifier]) => ({
                modifier,
                attribute: attrName
            }));
            if (attrs.length > 0) {
                attributesHtml = `
                    <div style="margin-top:8px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:6px; color:#4cc9f0;">
                        ${attrs.map(a => `
                            <div>+${a.modifier} ${a.attribute.replace('Power', 'Puissance').replace('Precision', 'Précision').replace('CritDamage', 'Férocité').replace('Toughness', 'Robustesse').replace('Vitality', 'Vitalité').replace('ConditionDamage', 'Altération').replace('Healing', 'Guérison').replace('BoonDuration', 'Concentration').replace('ConditionDuration', 'Expertise')}</div>
                        `).join('')}
                    </div>
                `;
            }
        } else if (item.details?.infix_upgrade?.attributes) {
            attributesHtml = `
                <div style="margin-top:8px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:6px; color:#4cc9f0;">
                    ${item.details.infix_upgrade.attributes.map(a => `
                        <div>+${a.modifier} ${a.attribute.replace('Power', 'Puissance').replace('Precision', 'Précision').replace('CritDamage', 'Férocité').replace('Toughness', 'Robustesse').replace('Vitality', 'Vitalité').replace('ConditionDamage', 'Altération').replace('Healing', 'Guérison').replace('BoonDuration', 'Concentration').replace('ConditionDuration', 'Expertise')}</div>
                    `).join('')}
                </div>
            `;
        }

        let upgradeHtml = '';
        if (upgrade) {
            upgradeHtml = `
                <div style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.15); padding-top:8px; display:flex; align-items:center; gap:8px;">
                    <img src="${upgrade.icon}" style="width:20px; height:20px; border-radius:2px;">
                    <div style="display:flex; flex-direction:column; min-width:0; flex:1;">
                        <strong style="color:var(--color-warning); font-size:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${upgrade.name}</strong>
                        <div style="font-size:9px; color:var(--text-secondary); line-height:1.2; white-space:normal; margin-top:2px;">
                            ${upgrade.details?.bonuses ? upgrade.details.bonuses.map((b, i) => `(${i+1}): ${b}`).join('<br>') : upgrade.description || 'Amélioration active.'}
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="skill-tooltip" style="width:220px; pointer-events:none; white-space:normal;">
                <strong style="color:#f72585; font-size:12px; display:block;">${item.name}</strong>
                <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">${item.details?.defense ? `Défense : ${item.details.defense}` : ''} ${item.details?.min_power ? `Dégâts : ${item.details.min_power}-${item.details.max_power}` : ''}</div>
                ${attributesHtml}
                ${upgradeHtml}
            </div>
        `;
    },

    renderSlotCellHTML(slotName, build, character, isEditable) {
        const slotLabels = {
            Helm: 'Casque', Shoulders: 'Épaulières', Coat: 'Torse',
            Gloves: 'Gants', Leggings: 'Jambières', Boots: 'Pieds',
            WeaponA1: 'Set 1 Main D.', WeaponA2: 'Set 1 Main G.',
            WeaponB1: 'Set 2 Main D.', WeaponB2: 'Set 2 Main G.',
            Backpack: 'Dossier', Amulet: 'Amulette',
            Ring1: 'Anneau 1', Ring2: 'Anneau 2',
            Accessory1: 'Accessoire 1', Accessory2: 'Accessoire 2',
            Relic: 'Relique'
        };

        const label = slotLabels[slotName] || slotName;

        const rarityColors = {
            Junk: '#aaaaaa',
            Basic: '#ffffff',
            Fine: '#61d8ff',
            Masterwork: '#1aeb4b',
            Rare: '#ffdf10',
            Exotic: '#ffa500',
            Ascended: '#fb79b7',
            Legendary: '#b042ff'
        };

        let icon = '';
        let name = '';
        let subtitle = '';
        let tooltipHtml = '';
        let hasItem = false;
        let rarityColor = 'rgba(255,255,255,0.7)';

        if (this.viewingType === 'api') {
            const activeTab = character.equipment_tabs?.[this.activeEquipmentTab] || character.equipment_tabs?.find(t => t.is_active) || { equipment: character.equipment || [] };
            const eqItem = activeTab.equipment?.find(i => i.slot === slotName);
            if (eqItem) {
                hasItem = true;
                const dbItem = this.apiDataCache.items?.[eqItem.id];
                icon = dbItem?.icon || 'https://render.guildwars2.com/file/71F7E9B4BD87C7E9A9B487A4F1D77A23C7DA3D6A/223019.png';
                name = dbItem?.name || `Objet ID: ${eqItem.id}`;
                
                rarityColor = dbItem && dbItem.rarity ? (rarityColors[dbItem.rarity] || '#ffffff') : '#ffffff';

                const upgradeId = eqItem.upgrades?.[0];
                const upgradeItem = upgradeId ? this.apiDataCache.items?.[upgradeId] : null;
                subtitle = upgradeItem ? upgradeItem.name : 'Pas d\'amélioration';

                tooltipHtml = this.getItemTooltipHTML(dbItem, upgradeItem, eqItem.stats);
            }
        } else {
            const vItem = this.getVirtualItem(slotName, build);
            if (vItem.stat) {
                hasItem = true;
                icon = vItem.defaultIcon;
                name = `${vItem.stat.split(' ')[0]} ${label}`;
                
                // Virtual target builds default to Ascended (Pink) rarity color!
                rarityColor = rarityColors.Ascended;

                const upgradeItem = vItem.upgradeId ? this.apiDataCache.items?.[vItem.upgradeId] : null;
                subtitle = upgradeItem ? upgradeItem.name : (slotName.startsWith('Ring') || slotName === 'Amulet' || slotName.startsWith('Accessory') || slotName === 'Backpack') ? 'Statistiques bijoux' : 'Pas d\'amélioration';

                const syntheticItem = {
                    name,
                    details: {
                        defense: ['Helm', 'Coat', 'Shoulders', 'Gloves', 'Leggings', 'Boots'].includes(slotName) ? 300 : undefined,
                        infix_upgrade: {
                            attributes: this.getSyntheticAttributesForPrefix(vItem.stat)
                        }
                    }
                };
                tooltipHtml = this.getItemTooltipHTML(syntheticItem, upgradeItem);
            }
        }

        if (!hasItem) {
            const vItem = this.getVirtualItem(slotName, build);
            icon = vItem.defaultIcon;
            name = 'Emplacement vide';
            subtitle = label;
            tooltipHtml = `
                <div class="skill-tooltip" style="width:180px;">
                    <strong>${label}</strong>
                    <p style="font-size:10px; color:var(--text-muted); margin:4px 0 0 0;">Aucun objet équipé dans cet emplacement.</p>
                </div>
            `;
        }

        const borderColor = hasItem ? `border: 2px solid ${rarityColor}` : 'border: 1px dashed rgba(255,255,255,0.15)';
        const opacity = hasItem ? '1' : '0.5';

        return `
            <div class="gear-slot-row" style="display:flex; align-items:center; gap:10px; background:rgba(0,0,0,0.15); padding:8px 10px; border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.03); width:100%;">
                <div class="mini-skill-wrapper" style="width:36px; height:36px; flex-shrink:0; border-radius:4px; overflow:visible; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.3); ${borderColor}; opacity:${opacity};">
                    <img src="${icon}" style="width:100%; height:100%; border-radius:3px;">
                    ${tooltipHtml}
                </div>
                <div style="display:flex; flex-direction:column; min-width:0; flex:1;">
                    <span style="font-size:11px; font-weight:bold; color:${rarityColor}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${name}">${name}</span>
                    <span style="font-size:9px; color:var(--text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${subtitle}">${subtitle}</span>
                </div>
            </div>
        `;
    },

    renderEquipmentTab(build, isEditable, character = null) {
        const eq = build.equipment || {
            armorStat: '', weaponsStat: '', trinketsStat: '',
            runeId: 0, relicId: 0, sigils1Ids: [0, 0], sigils2Ids: [0, 0],
            food: '', utility: ''
        };

        return `
            <div class="equipment-sheet-container" style="display:flex; flex-direction:column; gap:20px;">
                <!-- Config Editors (Only if Target Template is editable) -->
                ${isEditable ? `
                    <div class="equipment-editors card" style="padding:15px; display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:15px; background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.05);">
                        <!-- Armor Config -->
                        <div class="edit-group" style="display:flex; flex-direction:column; gap:8px;">
                            <span style="font-size:10px; font-weight:bold; text-transform:uppercase; color:var(--color-accent);">Armure & Rune</span>
                            <div class="form-group" style="margin-bottom:0;">
                                <label style="font-size:9px; color:var(--text-muted);">Statistiques :</label>
                                <select id="edit-equip-armor-stat" class="form-select form-select-sm" style="width:100%;">
                                    ${STAT_OPTIONS.map(o => `<option value="${o.value}" ${eq.armorStat === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom:0;">
                                <label style="font-size:9px; color:var(--text-muted);">Rune :</label>
                                <select id="edit-equip-rune" class="form-select form-select-sm" style="width:100%;">
                                    ${CURATED_ITEMS.runes.map(r => `<option value="${r.id}" ${eq.runeId === r.id ? 'selected' : ''}>${r.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <!-- Weapons Config -->
                        <div class="edit-group" style="display:flex; flex-direction:column; gap:8px;">
                            <span style="font-size:10px; font-weight:bold; text-transform:uppercase; color:var(--color-accent);">Armes & Cachets</span>
                            <div class="form-group" style="margin-bottom:0;">
                                <label style="font-size:9px; color:var(--text-muted);">Statistiques :</label>
                                <select id="edit-equip-weapons-stat" class="form-select form-select-sm" style="width:100%;">
                                    ${STAT_OPTIONS.map(o => `<option value="${o.value}" ${eq.weaponsStat === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom:0;">
                                <label style="font-size:9px; color:var(--text-muted);">Armes Set 1 / Set 2 :</label>
                                <div style="display:flex; gap:6px;">
                                    <input type="text" id="edit-equip-weapons-1" value="${build.weapons?.set1 || ''}" class="form-control form-control-sm" placeholder="Ex: Espadon" style="flex:1; font-size:10px; padding:3px 6px;">
                                    <input type="text" id="edit-equip-weapons-2" value="${build.weapons?.set2 || ''}" class="form-control form-control-sm" placeholder="Ex: Sceptre + Cor" style="flex:1; font-size:10px; padding:3px 6px;">
                                </div>
                            </div>
                            <div class="form-group" style="margin-bottom:0;">
                                <label style="font-size:9px; color:var(--text-muted);">Cachets Set 1 / Set 2 :</label>
                                <div style="display:flex; flex-direction:column; gap:4px;">
                                    <div style="display:flex; gap:6px;">
                                        <select id="edit-equip-sigil1-1" class="form-select form-select-sm" style="flex:1; font-size:9px; padding:2px 4px;">
                                            ${CURATED_ITEMS.sigils.map(s => `<option value="${s.id}" ${eq.sigils1Ids?.[0] === s.id ? 'selected' : ''}>S1: ${s.name.split(' (')[0]}</option>`).join('')}
                                        </select>
                                        <select id="edit-equip-sigil1-2" class="form-select form-select-sm" style="flex:1; font-size:9px; padding:2px 4px;">
                                            ${CURATED_ITEMS.sigils.map(s => `<option value="${s.id}" ${eq.sigils1Ids?.[1] === s.id ? 'selected' : ''}>S2: ${s.name.split(' (')[0]}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div style="display:flex; gap:6px;">
                                        <select id="edit-equip-sigil2-1" class="form-select form-select-sm" style="flex:1; font-size:9px; padding:2px 4px;">
                                            ${CURATED_ITEMS.sigils.map(s => `<option value="${s.id}" ${eq.sigils2Ids?.[0] === s.id ? 'selected' : ''}>S1: ${s.name.split(' (')[0]}</option>`).join('')}
                                        </select>
                                        <select id="edit-equip-sigil2-2" class="form-select form-select-sm" style="flex:1; font-size:9px; padding:2px 4px;">
                                            ${CURATED_ITEMS.sigils.map(s => `<option value="${s.id}" ${eq.sigils2Ids?.[1] === s.id ? 'selected' : ''}>S2: ${s.name.split(' (')[0]}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Bijoux & Consumables Config -->
                        <div class="edit-group" style="display:flex; flex-direction:column; gap:8px;">
                            <span style="font-size:10px; font-weight:bold; text-transform:uppercase; color:var(--color-accent);">Bijoux & Relique</span>
                            <div class="form-group" style="margin-bottom:0;">
                                <label style="font-size:9px; color:var(--text-muted);">Statistiques :</label>
                                <select id="edit-equip-trinkets-stat" class="form-select form-select-sm" style="width:100%;">
                                    ${STAT_OPTIONS.map(o => `<option value="${o.value}" ${eq.trinketsStat === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom:0;">
                                <label style="font-size:9px; color:var(--text-muted);">Relique :</label>
                                <select id="edit-equip-relic" class="form-select form-select-sm" style="width:100%;">
                                    ${CURATED_ITEMS.relics.map(r => `<option value="${r.id}" ${eq.relicId === r.id ? 'selected' : ''}>${r.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom:0; display:flex; gap:6px;">
                                <div style="flex:1;">
                                    <label style="font-size:9px; color:var(--text-muted);">Nourriture :</label>
                                    <input type="text" id="edit-equip-food" value="${eq.food || ''}" class="form-control form-control-sm" placeholder="Ex: Soupe" style="width:100%; font-size:10px; padding:3px 6px;">
                                </div>
                                <div style="flex:1;">
                                    <label style="font-size:9px; color:var(--text-muted);">Utilitaire :</label>
                                    <input type="text" id="edit-equip-utility" value="${eq.utility || ''}" class="form-control form-control-sm" placeholder="Ex: Huile" style="width:100%; font-size:10px; padding:3px 6px;">
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Character Equipment Sheet Visual Grid -->
                <div class="equipment-visual-sheet-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
                    
                    <!-- Left Column: Armor Slots -->
                    <div class="equipment-column-visual card" style="padding:15px; display:flex; flex-direction:column; gap:10px;">
                        <h4 style="font-size:12px; font-weight:bold; text-transform:uppercase; color:var(--color-accent); border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px; margin-bottom:4px;"><i class="fa-solid fa-shirt"></i> Pièces d'Armure</h4>
                        ${this.renderSlotCellHTML('Helm', build, character, isEditable)}
                        ${this.renderSlotCellHTML('Shoulders', build, character, isEditable)}
                        ${this.renderSlotCellHTML('Coat', build, character, isEditable)}
                        ${this.renderSlotCellHTML('Gloves', build, character, isEditable)}
                        ${this.renderSlotCellHTML('Leggings', build, character, isEditable)}
                        ${this.renderSlotCellHTML('Boots', build, character, isEditable)}
                    </div>

                    <!-- Center Column: Weapons & Consumables -->
                    <div class="equipment-column-visual card" style="padding:15px; display:flex; flex-direction:column; gap:10px;">
                        <h4 style="font-size:12px; font-weight:bold; text-transform:uppercase; color:var(--color-accent); border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px; margin-bottom:4px;"><i class="fa-solid fa-khanda"></i> Armes Actives</h4>
                        <div style="font-size:9px; font-weight:bold; color:var(--text-muted); text-transform:uppercase; margin-top:2px;">Set d'armes 1</div>
                        ${this.renderSlotCellHTML('WeaponA1', build, character, isEditable)}
                        ${this.renderSlotCellHTML('WeaponA2', build, character, isEditable)}
                        
                        <div style="font-size:9px; font-weight:bold; color:var(--text-muted); text-transform:uppercase; margin-top:6px; border-top:1px dashed rgba(255,255,255,0.05); padding-top:8px;">Set d'armes 2</div>
                        ${this.renderSlotCellHTML('WeaponB1', build, character, isEditable)}
                        ${this.renderSlotCellHTML('WeaponB2', build, character, isEditable)}

                        <!-- Consumables View -->
                        ${!isEditable && (eq.food || eq.utility) ? `
                            <div style="font-size:9px; font-weight:bold; color:var(--text-muted); text-transform:uppercase; margin-top:6px; border-top:1px dashed rgba(255,255,255,0.05); padding-top:8px;">Consommables</div>
                            <div style="display:flex; flex-direction:column; gap:4px; font-size:11px; padding:4px 8px; background:rgba(0,0,0,0.1); border-radius:4px;">
                                ${eq.food ? `<div><span style="color:var(--text-secondary);">Nourriture :</span> <strong style="color:var(--color-warning);">${eq.food}</strong></div>` : ''}
                                ${eq.utility ? `<div><span style="color:var(--text-secondary);">Utilitaire :</span> <strong style="color:var(--color-warning);">${eq.utility}</strong></div>` : ''}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Right Column: Trinkets & Relics -->
                    <div class="equipment-column-visual card" style="padding:15px; display:flex; flex-direction:column; gap:10px;">
                        <h4 style="font-size:12px; font-weight:bold; text-transform:uppercase; color:var(--color-accent); border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px; margin-bottom:4px;"><i class="fa-solid fa-gem"></i> Bijoux & Relique</h4>
                        ${this.renderSlotCellHTML('Backpack', build, character, isEditable)}
                        ${this.renderSlotCellHTML('Amulet', build, character, isEditable)}
                        ${this.renderSlotCellHTML('Ring1', build, character, isEditable)}
                        ${this.renderSlotCellHTML('Ring2', build, character, isEditable)}
                        ${this.renderSlotCellHTML('Accessory1', build, character, isEditable)}
                        ${this.renderSlotCellHTML('Accessory2', build, character, isEditable)}
                        ${this.renderSlotCellHTML('Relic', build, character, isEditable)}
                    </div>
                </div>
            </div>
        `;
    },

    renderTraitsTreeHTML(build, isEditable = false) {
        const specializations = build.specializations || [];
        
        // Always render exactly 3 specialization slots
        const specSlots = [
            specializations[0] || { id: 0, traits: [0, 0, 0] },
            specializations[1] || { id: 0, traits: [0, 0, 0] },
            specializations[2] || { id: 0, traits: [0, 0, 0] }
        ];

        return specSlots.map((s, rowIdx) => {
            const spec = s.id ? this.apiDataCache.specs[s.id] : null;

            // Generate dropdown selection if editable
            let specDropdownHtml = '';
            if (isEditable) {
                const details = this.apiDataCache.profDetailsMap[String(build.profession).toLowerCase()];
                const allSpecIds = details?.specializations || [];
                const availableSpecs = allSpecIds.map(id => this.apiDataCache.specs[id]).filter(Boolean);
                
                // Filter out specs equipped in other slots, and respect elite spec position (slot 3 only)
                const filteredSpecs = availableSpecs.filter(sp => {
                    if (rowIdx < 2 && sp.elite) return false;
                    const isEquippedElsewhere = specSlots.some((slot, idx) => idx !== rowIdx && slot.id === sp.id);
                    if (isEquippedElsewhere) return false;
                    return true;
                });

                specDropdownHtml = `
                    <select class="spec-select-field form-select form-select-sm" data-row-idx="${rowIdx}" style="width:100%; font-size:10px; margin-top:5px; padding:3px 6px; background:rgba(20,20,30,0.85); border:1px solid rgba(255,255,255,0.15); border-radius:4px; color:var(--text-primary); cursor:pointer; font-weight:600;">
                        <option value="0">Choisir...</option>
                        ${filteredSpecs.map(sp => `<option value="${sp.id}" ${s.id === sp.id ? 'selected' : ''}>${sp.name}</option>`).join('')}
                    </select>
                `;
            }

            if (!spec) {
                return `
                    <div class="trait-row-container card placeholder-row" style="background:rgba(0,0,0,0.15); border:1px dashed rgba(255,255,255,0.15); display:flex; align-items:center; padding:15px; margin-bottom:15px; gap:20px;">
                        <div class="spec-icon-col" style="display:flex; flex-direction:column; align-items:center; gap:5px; width:75px; border-right:1px solid rgba(255,255,255,0.08); padding-right:12px; flex-shrink:0;">
                            <div style="width:48px; height:48px; border-radius:8px; border:2px dashed rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.2);">
                                <i class="fa-solid fa-plus" style="color:var(--text-muted);"></i>
                            </div>
                            <span style="font-size:9px; font-weight:bold; color:var(--text-muted); text-transform:uppercase;">Vide</span>
                        </div>
                        <div style="flex-grow:1; display:flex; flex-direction:column; gap:4px; max-width:250px;">
                            <label style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Slot ${rowIdx + 1}</label>
                            ${specDropdownHtml || `<span style="font-style:italic; font-size:11px; color:var(--text-muted);">Aucune spécialisation</span>`}
                        </div>
                    </div>
                `;
            }

            const majors = spec.major_traits || [];
            const minors = spec.minor_traits || [];
            const traitsMap = this.apiDataCache.traits;

            const getMinorNodeHtml = (id) => {
                const trait = traitsMap[id];
                if (!trait) return `<div class="trait-node minor"></div>`;
                return `
                    <div class="trait-node minor active" title="${trait.name}">
                        <img src="${trait.icon}" class="trait-node-img" alt="${trait.name}">
                        <div class="skill-tooltip">
                            <strong style="color:var(--color-accent);">${trait.name}</strong>
                            <span style="font-size:9px; color:var(--text-muted); display:block; margin-top:2px; font-weight:bold; text-transform:uppercase;">Trait Mineur (Fixe)</span>
                            <p style="font-size:11px; margin-top:5px; color:var(--text-secondary); line-height:1.3;">
                                ${trait.description || 'Pas de description.'}
                            </p>
                        </div>
                    </div>
                `;
            };

            const getTraitNode = (id, tierIdx, choiceIdx) => {
                const trait = traitsMap[id];
                if (!trait) return `<div class="trait-node major"></div>`;
                
                const isSelected = s.traits[tierIdx] === choiceIdx;
                const activeClass = isSelected ? 'active' : '';
                const editableAttr = isEditable ? `data-editable="true" data-row-idx="${rowIdx}" data-tier-idx="${tierIdx}" data-choice-idx="${choiceIdx}"` : '';

                return `
                    <div class="trait-node major ${activeClass}" ${editableAttr} title="${trait.name}">
                        <img src="${trait.icon}" class="trait-node-img" alt="${trait.name}">
                        <div class="skill-tooltip">
                            <strong>${trait.name}</strong>
                            <span style="font-size:9px; color:var(--color-primary); display:block; margin-top:2px; font-weight:bold; text-transform:uppercase;">Trait Majeur</span>
                            <p style="font-size:11px; margin-top:5px; color:var(--text-secondary); line-height:1.3;">
                                ${trait.description || 'Pas de description.'}
                            </p>
                        </div>
                    </div>
                `;
            };

            return `
                <div class="trait-row-container card" style="background-image: linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%), url('${spec.background}'); background-size: cover; background-position: center right; border: 1px solid var(--border-color); display:flex; align-items:center; padding:15px; margin-bottom:15px; gap:20px;">
                    <div class="spec-icon-col" style="display:flex; flex-direction:column; align-items:center; gap:5px; width:75px; border-right:1px solid rgba(255,255,255,0.08); padding-right:12px; flex-shrink:0;">
                        <img src="${spec.icon}" class="trait-spec-icon" title="${spec.name}" style="width:48px; height:48px; border-radius:8px;">
                        <span style="font-size:9px; font-weight:bold; color:var(--text-secondary); text-align:center; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:65px;">${spec.name}</span>
                        ${specDropdownHtml}
                    </div>

                    <div class="trait-tier-grid" style="display:flex; gap:20px; flex-grow:1; align-items:center; justify-content:space-around;">
                        <!-- Minor 1 -->
                        ${getMinorNodeHtml(minors[0])}

                        <!-- Tier 1 Majors -->
                        <div class="trait-tier-column" style="display:flex; flex-direction:column; gap:8px; justify-content:center;">
                            ${getTraitNode(majors[0], 0, 1)}
                            ${getTraitNode(majors[1], 0, 2)}
                            ${getTraitNode(majors[2], 0, 3)}
                        </div>

                        <!-- Minor 2 -->
                        ${getMinorNodeHtml(minors[1])}

                        <!-- Tier 2 Majors -->
                        <div class="trait-tier-column" style="display:flex; flex-direction:column; gap:8px; justify-content:center;">
                            ${getTraitNode(majors[3], 1, 1)}
                            ${getTraitNode(majors[4], 1, 2)}
                            ${getTraitNode(majors[5], 1, 3)}
                        </div>

                        <!-- Minor 3 -->
                        ${getMinorNodeHtml(minors[2])}

                        <!-- Tier 3 Majors -->
                        <div class="trait-tier-column" style="display:flex; flex-direction:column; gap:8px; justify-content:center;">
                            ${getTraitNode(majors[6], 2, 1)}
                            ${getTraitNode(majors[7], 2, 2)}
                            ${getTraitNode(majors[8], 2, 3)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderSkillsTabHTML(build, isEditable = false) {
        const isRevenant = String(build.profession).toLowerCase() === 'revenant';
        const details = this.apiDataCache.profDetailsMap[String(build.profession).toLowerCase()];
        const paletteMap = details?.skills_by_palette ? new Map(details.skills_by_palette) : new Map();

        const getSkillCard = (skillId, slotIdx, isLegendUtil = false, legendIdx = 0, utilIdx = 0) => {
            const skill = this.apiDataCache.skills[skillId];
            const canEdit = isEditable && !isRevenant;
            const editableAttr = canEdit ? `data-editable="true" data-slot-idx="${slotIdx}" data-legend-idx="${legendIdx}" data-util-idx="${utilIdx}" data-is-legend-util="${isLegendUtil}"` : '';

            return `
                <div class="skill-editor-slot" ${editableAttr} style="cursor:${canEdit ? 'pointer' : 'default'};">
                    <div class="skill-icon-wrapper" style="width:48px; height:48px; position:relative; border-radius:4px; border:1px solid rgba(255,255,255,0.1); overflow:visible;">
                        ${skill ? `
                            <img src="${skill.icon}" alt="${skill.name}" style="width:100%; height:100%; border-radius:3px;" class="skill-icon-img">
                            <div class="skill-tooltip">
                                <strong>${skill.name}</strong>
                                <p style="font-size:11px; margin-top:5px; color:var(--text-secondary); line-height:1.3;">
                                    ${skill.description || 'Pas de description.'}
                                </p>
                            </div>
                        ` : `
                            <div class="skill-icon-placeholder" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.3); border-radius:3px;">
                                <i class="fa-solid fa-plus" style="font-size:12px; color:var(--text-muted);"></i>
                            </div>
                        `}
                    </div>
                </div>
            `;
        };

        if (isRevenant) {
            const specs = build.specializations || [];
            const eliteSpecId = specs[2]?.id || 0;

            const filteredLegends = Object.values(this.apiDataCache.legends || {}).filter(l => {
                const id = l.id;
                if (id === 'Legend1') return eliteSpecId === 52; // Glint -> Herald
                if (id === 'Legend5') return eliteSpecId === 63; // Kalla -> Renegade
                if (id === 'Legend7') return eliteSpecId === 69; // Alliance -> Vindicator
                if (id === 'Legend8') return eliteSpecId === 79; // Razah -> Conduit
                return true; // Legend2 (Shiro), Legend3 (Jalis), Legend4 (Mallyx), Legend6 (Ventari) are core stances
            });

            const legendCodeMap = {};
            filteredLegends.forEach(l => {
                legendCodeMap[l.code] = l;
            });

            const leg1 = legendCodeMap[build.legends?.[0]];
            const leg2 = legendCodeMap[build.legends?.[1]];

            const renderLegendBar = (leg, legendIdx) => {
                const label = leg ? (leg.name || leg.id) : `Légende ${legendIdx + 1} non configurée`;
                const swapSkill = leg ? this.apiDataCache.skills[leg.swap] : null;
                const swapIcon = swapSkill?.icon || 'https://render.guildwars2.com/file/A1A6C28938BD4B20EB7B04D4DA94E7AC4D94CA82/3013898.png';

                const utilsSkillIds = leg ? (leg.utilities || [0, 0, 0]) : [0, 0, 0];

                const legendSelectionHtml = isEditable ? `
                    <div class="legend-selectors-row" style="display:flex; gap:6px; margin-left:auto; align-items:center; background:rgba(0,0,0,0.3); padding:4px 8px; border-radius:30px; border:1px solid rgba(255,255,255,0.08);">
                        ${filteredLegends.map(l => {
                            const otherSlotIdx = legendIdx === 0 ? 1 : 0;
                            const isEquippedElsewhere = build.legends?.[otherSlotIdx] === l.code;
                            if (isEquippedElsewhere) return '';

                            const isSel = leg && leg.code === l.code;
                            const lSwapSkill = this.apiDataCache.skills[l.swap];
                            const lSwapIcon = lSwapSkill?.icon || 'https://render.guildwars2.com/file/A1A6C28938BD4B20EB7B04D4DA94E7AC4D94CA82/3013898.png';
                            return `
                                <button class="legend-icon-btn ${isSel ? 'active' : ''}" data-legend-idx="${legendIdx}" data-legend-code="${l.code}" title="${l.name}" style="background:none; border:none; padding:0; cursor:pointer; display:flex; align-items:center; outline:none;">
                                    <img src="${lSwapIcon}" style="width:26px; height:26px; border-radius:50%; border:2px solid ${isSel ? 'var(--color-accent)' : 'transparent'}; opacity:${isSel ? '1' : '0.45'}; transform:${isSel ? 'scale(1.1)' : 'scale(1)'}; transition:all 0.2s; box-shadow:${isSel ? '0 0 6px var(--color-accent)' : 'none'};">
                                </button>
                            `;
                        }).join('')}
                    </div>
                ` : '';

                if (!leg) {
                    return `
                        <div class="legend-bar card" style="flex:1; min-width:300px; padding:15px; display:flex; flex-direction:column; gap:12px; border:1px dashed rgba(255,255,255,0.15); background:rgba(0,0,0,0.15);">
                            <div class="legend-header" style="display:flex; align-items:center; gap:12px; width:100%;">
                                <div style="width:40px; height:40px; border-radius:4px; border:2px dashed rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.2);">
                                    <i class="fa-solid fa-plus" style="color:var(--text-muted);"></i>
                                </div>
                                <div style="display:flex; flex-direction:column;">
                                    <span style="font-size:8px; font-weight:bold; color:var(--text-muted); text-transform:uppercase;">Posture ${legendIdx + 1}</span>
                                    <strong style="font-size:12px; color:var(--text-muted);">Non configurée</strong>
                                </div>
                                ${legendSelectionHtml}
                            </div>
                        </div>
                    `;
                }

                return `
                    <div class="legend-bar card" style="flex:1; min-width:300px; padding:15px; display:flex; flex-direction:column; gap:12px; border:1px solid var(--border-color);">
                        <div class="legend-header" style="display:flex; align-items:center; gap:12px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px; width:100%;">
                            <img src="${swapIcon}" style="width:40px; height:40px; border-radius:4px; border:1px solid var(--color-accent);" title="${label}">
                            <div style="display:flex; flex-direction:column;">
                                <span style="font-size:8px; font-weight:bold; color:var(--text-muted); text-transform:uppercase;">Posture active</span>
                                <strong style="font-size:14px; color:var(--text-primary);">${label.replace(' Stance', '').replace('Legendary ', '')}</strong>
                            </div>
                            ${legendSelectionHtml}
                        </div>
                        <div class="skills-action-bar" style="display:flex; gap:10px; justify-content:center; margin-top:5px;">
                            <!-- Heal -->
                            <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                                ${getSkillCard(leg.heal, 0)}
                                <span style="font-size:8px; color:var(--text-muted); text-transform:uppercase;">Soin</span>
                            </div>
                            <!-- Utilities -->
                            ${[0, 1, 2].map(uIdx => `
                                <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                                    ${getSkillCard(utilsSkillIds[uIdx], 1 + uIdx, true, legendIdx, uIdx)}
                                    <span style="font-size:8px; color:var(--text-muted); text-transform:uppercase;">Util ${uIdx+1}</span>
                                </div>
                            `).join('')}
                            <!-- Elite -->
                            <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                                ${getSkillCard(leg.elite, 4)}
                                <span style="font-size:8px; color:var(--text-muted); text-transform:uppercase;">Élite</span>
                            </div>
                        </div>
                    </div>
                `;
            };

            return `
                <div class="revenant-legends-bars" style="display:flex; gap:20px; flex-wrap:wrap; width:100%;">
                    ${renderLegendBar(leg1, 0)}
                    ${renderLegendBar(leg2, 1)}
                </div>
            `;
        } else {
            // Standard profession bar
            const slotNames = ['Soin', 'Utilitaire 1', 'Utilitaire 2', 'Utilitaire 3', 'Élite'];
            
            return `
                <div class="skills-action-bar" style="display:flex; justify-content:center; gap:15px; padding:20px; background-color:rgba(0,0,0,0.15); border:1px solid var(--border-color); border-radius:var(--radius-md);">
                    ${[0, 1, 2, 3, 4].map(idx => {
                        const isHeal = idx === 0;
                        const isElite = idx === 4;
                        const palId = isHeal ? build.skills.heal : isElite ? build.skills.elite : build.skills.utilities[idx - 1];
                        const skillId = paletteMap.get(palId);
                        
                        return `
                            <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
                                ${getSkillCard(skillId, idx)}
                                <span style="font-size:10px; font-weight:bold; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">${slotNames[idx]}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
    },

    renderRotationTimelineHTML(rotationString) {
        if (!rotationString) {
            return `<div style="font-style:italic; color:var(--text-muted); font-size:12px;">Aucune rotation définie.</div>`;
        }

        const steps = rotationString.split('->').map(s => s.trim());
        if (steps.length === 0 || (steps.length === 1 && steps[0] === '')) {
            return `<div style="font-style:italic; color:var(--text-muted); font-size:12px;">Aucune rotation définie.</div>`;
        }

        const htmlSteps = [];

        steps.forEach((step, idx) => {
            const matchBracket = step.match(/^\[(.*)\]$/);
            if (matchBracket) {
                const skillName = matchBracket[1].trim();
                const skill = Object.values(this.apiDataCache.skills).find(sk => sk.name.toLowerCase() === skillName.toLowerCase());
                if (skill) {
                    htmlSteps.push(`
                        <div class="rotation-step">
                            <div class="rotation-skill-card">
                                <div class="mini-skill-wrapper" style="width:36px; height:36px; flex-shrink:0;">
                                    <img src="${skill.icon}" class="rotation-skill-icon" alt="${skill.name}" style="border: 1px solid var(--color-primary); border-radius:6px;">
                                    <div class="skill-tooltip">
                                        <strong>${skill.name}</strong>
                                        <p style="font-size:11px; margin-top:5px; color:var(--text-secondary);">${skill.description || 'Compétence.'}</p>
                                    </div>
                                </div>
                                <span style="font-size:8px; color:var(--text-secondary); text-align:center; max-width:65px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px;">${skill.name}</span>
                            </div>
                        </div>
                    `);
                } else {
                    htmlSteps.push(`
                        <div class="rotation-step">
                            <div class="rotation-action-badge">${skillName}</div>
                        </div>
                    `);
                }
            } else {
                htmlSteps.push(`
                    <div class="rotation-step">
                        <div class="rotation-action-badge">${step}</div>
                    </div>
                `);
            }
        });

        return `
            <div class="rotation-timeline">
                ${htmlSteps.map((hStep, idx) => `
                    ${hStep}
                    ${idx < htmlSteps.length - 1 ? `<i class="fa-solid fa-arrow-right rotation-arrow"></i>` : ''}
                `).join('')}
            </div>
        `;
    },

    // --- API View Layout ---

    renderApiViewHTML() {
        if (!GW2Api.hasKey()) {
            return `
                <div class="card" style="text-align:center; padding:50px; background:rgba(255,255,255,0.02); border:1px solid var(--border-color);">
                    <i class="fa-solid fa-key" style="font-size:40px; color:var(--color-primary); margin-bottom:15px;"></i>
                    <h4>Clé API Requise</h4>
                    <p style="color:var(--text-secondary); margin-top:5px; max-width:400px; margin-left:auto; margin-right:auto; font-size:13px; line-height:1.4;">
                        Pour voir vos personnages du jeu et synchroniser leurs presets d'équipements et builds, veuillez configurer une clé API valide dans les paramètres de l'application.
                    </p>
                    <button id="btn-switch-to-custom" class="btn btn-primary" style="margin-top:20px;">
                        <i class="fa-solid fa-folder-open"></i> Utiliser le Carnet de Builds local
                    </button>
                </div>
            `;
        }

        if (this.characters.length === 0) {
            return `
                <div class="card" style="text-align:center; padding:50px; background:rgba(255,255,255,0.02); border:1px solid var(--border-color);">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size:32px; color:var(--color-accent); margin-bottom:15px;"></i>
                    <h4>Chargement de vos personnages...</h4>
                    <p style="color:var(--text-secondary); margin-top:5px; font-size:12px;">Récupération des données depuis l'API d'ArenaNet...</p>
                </div>
            `;
        }

        const char = this.activeCharacter || this.characters[0];
        const profKey = char.profession.toLowerCase();
        const color = PROF_COLORS[profKey] || '#7209b7';
        const icon = PROF_ICONS[profKey] || 'fa-user';

        // Horizontal character band
        const charBand = `
            <div class="characters-select-band" style="display:flex; gap:10px; overflow-x:auto; padding-bottom:12px; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.05);">
                ${this.characters.map(c => {
                    const isSel = c.name === char.name;
                    const cKey = c.profession.toLowerCase();
                    const cColor = PROF_COLORS[cKey] || '#7209b7';
                    const cIcon = PROF_ICONS[cKey] || 'fa-user';
                    return `
                        <button class="char-tab-btn ${isSel ? 'active' : ''}" data-char-name="${c.name}" style="display:flex; align-items:center; gap:8px; padding:8px 16px; border:1px solid ${isSel ? cColor : 'rgba(255,255,255,0.08)'}; background:${isSel ? cColor + '15' : 'rgba(0,0,0,0.2)'}; border-radius:var(--radius-md); cursor:pointer; color:${isSel ? 'var(--text-primary)' : 'var(--text-secondary)'}; font-weight:${isSel ? '600' : '400'}; transition:all 0.2s ease;">
                            <i class="fa-solid ${cIcon}" style="color:${cColor};"></i>
                            <span>${c.name}</span>
                        </button>
                    `;
                }).join('')}
            </div>
        `;

        // Game Templates: Builds (Aptitudes)
        const apiBuildTabs = char.build_tabs || [];
        let apiBuildTemplatesList = '';
        if (apiBuildTabs.length === 0) {
            apiBuildTemplatesList = `
                <div style="font-size:11px; color:var(--color-danger); line-height:1.4; padding:8px; background:rgba(239, 71, 111, 0.08); border:1px solid rgba(239, 71, 111, 0.2); border-radius:var(--radius-sm); margin-top:5px;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Vos modèles de build ne sont pas visibles. Votre clé API actuelle ne possède pas la permission <strong>"builds"</strong>.<br><br>Veuillez recréer une clé API sur le site d'ArenaNet en cochant la case <strong>"builds"</strong> et la mettre à jour dans les paramètres.
                </div>
            `;
        } else {
            apiBuildTemplatesList = apiBuildTabs.map((t, idx) => {
                const isSel = this.activeBuildTab === idx && this.viewingType === 'api';
                return `
                    <div class="build-tab-item ${isSel ? 'active' : ''}" data-type="api-build" data-tab-idx="${idx}" style="padding:10px 12px; border-radius:var(--radius-sm); display:flex; align-items:center; gap:8px; cursor:pointer; background:${isSel ? 'rgba(255,255,255,0.05)' : 'transparent'}; margin-bottom:4px; font-size:12px; transition:all 0.2s;">
                        <i class="fa-solid fa-bolt" style="color:${isSel ? 'var(--color-accent)' : 'var(--text-muted)'};"></i>
                        <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${t.build.name || `Modèle d'Aptitudes ${idx + 1}`}</span>
                        ${t.is_active ? '<span style="font-size:8px; background:var(--color-success); color:white; padding:1px 4px; border-radius:3px; font-weight:700; text-transform:uppercase; flex-shrink:0;">Actif</span>' : ''}
                    </div>
                `;
            }).join('');
        }

        // Game Templates: Equipment (Stuff)
        const apiEquipmentTabs = char.equipment_tabs || [];
        let apiEquipmentTemplatesList = '';
        if (apiEquipmentTabs.length === 0) {
            apiEquipmentTemplatesList = `
                <span style="font-style:italic; font-size:11px; color:var(--text-muted);">Aucun modèle d'équipement trouvé</span>
            `;
        } else {
            apiEquipmentTemplatesList = apiEquipmentTabs.map((t, idx) => {
                const isSel = this.activeEquipmentTab === idx && this.viewingType === 'api';
                return `
                    <div class="build-tab-item ${isSel ? 'active' : ''}" data-type="api-equip" data-tab-idx="${idx}" style="padding:10px 12px; border-radius:var(--radius-sm); display:flex; align-items:center; gap:8px; cursor:pointer; background:${isSel ? 'rgba(255,255,255,0.05)' : 'transparent'}; margin-bottom:4px; font-size:12px; transition:all 0.2s;">
                        <i class="fa-solid fa-shirt" style="color:${isSel ? 'var(--color-accent)' : 'var(--text-muted)'};"></i>
                        <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${t.name || `Modèle d'Équipement ${t.tab}`}</span>
                        ${t.is_active ? '<span style="font-size:8px; background:var(--color-success); color:white; padding:1px 4px; border-radius:3px; font-weight:700; text-transform:uppercase; flex-shrink:0;">Actif</span>' : ''}
                    </div>
                `;
            }).join('');
        }

        // Target Templates (Locals for this profession)
        const localTargetBuilds = this.builds.filter(b => b.profession === profKey);
        const targetTemplatesList = localTargetBuilds.map(b => {
            const isSel = this.activeLocalBuildId === b.id && this.viewingType === 'local';
            return `
                <div class="build-tab-item build-item-target ${isSel ? 'active' : ''}" data-type="local" data-build-id="${b.id}" style="padding:10px 12px; border-radius:var(--radius-sm); display:flex; align-items:center; gap:8px; cursor:pointer; margin-bottom:6px; font-size:12px; transition:all 0.2s;">
                    <i class="fa-solid fa-bullseye" style="color:var(--color-primary);"></i>
                    <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:600;">${b.name}</span>
                    <span class="badge-target-template">Cible</span>
                    <button class="btn-edit-target-meta" data-build-id="${b.id}" style="background:none; border:none; color:var(--text-muted); cursor:pointer; padding:2px; font-size:10px;"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-delete-target" data-build-id="${b.id}" style="background:none; border:none; color:var(--color-danger); cursor:pointer; padding:2px; font-size:10px; margin-left:2px;"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
        }).join('');

        // Active build selection details
        let normalizedBuild = null;
        let isEditable = false;
        let activePresetType = 'aptitudes';

        if (this.viewingType === 'api') {
            const currentTab = apiBuildTabs[this.activeBuildTab];
            if (currentTab) {
                normalizedBuild = this.normalizeApiBuild(currentTab.build, char);
            }
        } else {
            const currentLocal = localTargetBuilds.find(b => b.id === this.activeLocalBuildId) || localTargetBuilds[0];
            if (currentLocal) {
                this.activeLocalBuildId = currentLocal.id;
                normalizedBuild = this.normalizeLocalBuild(currentLocal);
                isEditable = true;
                activePresetType = currentLocal.presetType || 'aptitudes';
            }
        }

        let centerArea = '';
        if (normalizedBuild) {
            const chatLinkValue = normalizedBuild.chatLink || '';
            centerArea = `
                <div class="build-center-panel" style="flex:1; display:flex; flex-direction:column; gap:15px;">
                    <!-- Main Content Area -->
                    <div class="preset-content-area" style="min-height:200px;">
                        ${this.viewingType === 'api' ? `
                            ${this.activeSubTab === 'equipment' ? 
                                this.renderEquipmentTab(normalizedBuild, false, char) : 
                                `
                                <div style="display:flex; flex-direction:column; gap:20px;">
                                    <div>
                                        <h4 style="font-size:12px; font-weight:bold; text-transform:uppercase; color:var(--color-accent); margin-bottom:10px;"><i class="fa-solid fa-diagram-project"></i> Spécialisations & Traits</h4>
                                        ${this.renderTraitsTreeHTML(normalizedBuild, false)}
                                    </div>
                                    <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top:20px;">
                                        <h4 style="font-size:12px; font-weight:bold; text-transform:uppercase; color:var(--color-accent); margin-bottom:10px;"><i class="fa-solid fa-bolt"></i> Compétences & Légendes</h4>
                                        ${this.renderSkillsTabHTML(normalizedBuild, false)}
                                    </div>
                                </div>
                                `
                            }
                        ` : `
                            ${activePresetType === 'equipment' ? 
                                this.renderEquipmentTab(normalizedBuild, isEditable, char) : 
                                activePresetType === 'aptitudes' ? 
                                `
                                <div style="display:flex; flex-direction:column; gap:20px;">
                                    <div>
                                        <h4 style="font-size:12px; font-weight:bold; text-transform:uppercase; color:var(--color-accent); margin-bottom:10px;"><i class="fa-solid fa-diagram-project"></i> Spécialisations & Traits</h4>
                                        ${this.renderTraitsTreeHTML(normalizedBuild, isEditable)}
                                    </div>
                                    <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top:20px;">
                                        <h4 style="font-size:12px; font-weight:bold; text-transform:uppercase; color:var(--color-accent); margin-bottom:10px;"><i class="fa-solid fa-bolt"></i> Compétences & Légendes</h4>
                                        ${this.renderSkillsTabHTML(normalizedBuild, isEditable)}
                                    </div>
                                </div>
                                ` : 
                                `
                                <div style="display:flex; flex-direction:column; gap:30px;">
                                    <div>
                                        <h4 style="font-size:12px; font-weight:bold; text-transform:uppercase; color:var(--color-accent); margin-bottom:10px;"><i class="fa-solid fa-shirt"></i> Équipement</h4>
                                        ${this.renderEquipmentTab(normalizedBuild, isEditable, char)}
                                    </div>
                                    <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top:20px;">
                                        <h4 style="font-size:12px; font-weight:bold; text-transform:uppercase; color:var(--color-accent); margin-bottom:10px;"><i class="fa-solid fa-diagram-project"></i> Spécialisations & Traits</h4>
                                        ${this.renderTraitsTreeHTML(normalizedBuild, isEditable)}
                                    </div>
                                    <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top:20px;">
                                        <h4 style="font-size:12px; font-weight:bold; text-transform:uppercase; color:var(--color-accent); margin-bottom:10px;"><i class="fa-solid fa-bolt"></i> Compétences & Légendes</h4>
                                        ${this.renderSkillsTabHTML(normalizedBuild, isEditable)}
                                    </div>
                                </div>
                                `
                            }
                        `}
                    </div>

                    ${isEditable ? `
                        <div class="preset-actions-bar card" style="padding:15px; display:flex; align-items:center; justify-content:flex-end; gap:10px; margin-top:15px; background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.05);">
                            <span id="target-save-feedback" style="font-size:11px; color:var(--color-success); font-weight:500; margin-right:auto;"></span>
                            <button id="btn-save-target-build" class="btn btn-primary btn-sm" style="display:inline-flex; align-items:center; gap:6px; padding:8px 16px;">
                                <i class="fa-solid fa-floppy-disk"></i> Enregistrer les Modifications
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            centerArea = `
                <div class="card" style="flex:1; text-align:center; padding:50px; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <i class="fa-solid fa-folder-open" style="font-size:40px; color:var(--text-muted); margin-bottom:15px;"></i>
                    <h4>Aucun Preset Sélectionné</h4>
                    <p style="color:var(--text-secondary); margin-top:5px; font-size:12px;">Veuillez sélectionner un preset de jeu à gauche, ou créer un preset cible.</p>
                </div>
            `;
        }

        return `
            ${charBand}
            
            <div class="api-view-layout" style="display:flex; gap:20px; flex-wrap:wrap; width:100%;">
                <!-- Left Sidebar: Templates -->
                <div class="api-view-sidebar" style="width:240px; display:flex; flex-direction:column; gap:15px; flex-shrink:0;">
                    <!-- Game Templates: Aptitudes -->
                    <div class="sidebar-section card" style="padding:12px;">
                        <h4 style="font-size:11px; font-weight:bold; text-transform:uppercase; color:var(--text-secondary); margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">Presets d'Aptitudes (API)</h4>
                        <div class="templates-list-container">
                            ${apiBuildTemplatesList}
                        </div>
                    </div>

                    <!-- Game Templates: Équipements -->
                    <div class="sidebar-section card" style="padding:12px;">
                        <h4 style="font-size:11px; font-weight:bold; text-transform:uppercase; color:var(--color-accent); margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">Presets d'Équipement (API)</h4>
                        <div class="templates-list-container">
                            ${apiEquipmentTemplatesList}
                        </div>
                    </div>

                    <!-- Target Templates -->
                    <div class="sidebar-section card" style="padding:12px;">
                        <h4 style="font-size:11px; font-weight:bold; text-transform:uppercase; color:var(--text-secondary); margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">Presets Cibles (Locaux)</h4>
                        <div class="templates-list-container">
                            ${targetTemplatesList || `<span style="font-style:italic; font-size:11px; color:var(--text-muted); display:block; margin-bottom:10px;">Aucun preset cible</span>`}
                        </div>
                        <button id="btn-create-target-template" class="btn btn-secondary btn-sm btn-block" style="margin-top:10px; font-size:11px; padding:6px;">
                            <i class="fa-solid fa-plus"></i> Créer preset cible
                        </button>
                    </div>
                </div>

                <!-- Center Display Area -->
                ${centerArea}
            </div>
        `;
    },

    // --- Custom Mode View Layout (Legacy Cards Grid) ---

    renderCustomViewHTML() {
        const localBuilds = this.builds;

        // Custom Mode Sidebar Panel Controls
        const sidebar = `
            <div class="builds-controls-panel card" style="width:240px; flex-shrink:0;">
                <h3>Gestion des Builds</h3>
                <p class="text-secondary" style="font-size:12px; margin-bottom:15px;">
                    Enregistrez vos configurations, décodez des codes de build, et organisez vos builds personnalisés.
                </p>
                
                <button id="btn-add-build" class="btn btn-primary btn-block" style="margin-bottom:15px;">
                    <i class="fa-solid fa-plus"></i> Nouveau Build
                </button>

                <div class="form-group">
                    <label for="filter-search"><i class="fa-solid fa-magnifying-glass"></i> Rechercher</label>
                    <input type="text" id="filter-search" placeholder="Nom du build, notes...">
                </div>

                <div class="form-group">
                    <label for="filter-profession">Profession</label>
                    <select id="filter-profession" class="form-select" style="width: 100%;">
                        <option value="all">Toutes les professions</option>
                        ${Object.entries(PROFESSION_LABELS_FR).map(([key, val]) => `
                            <option value="${key}">${val}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="filter-mode">Mode de Jeu</label>
                    <select id="filter-mode" class="form-select" style="width: 100%;">
                        <option value="all">Tous les modes</option>
                        <option value="pve">PvE (Monde / Raids)</option>
                        <option value="pvp">PvP (JcJ)</option>
                        <option value="wvw">WvW (MvM)</option>
                    </select>
                </div>

                <div style="margin-top:20px; font-size:12px; color:var(--text-secondary);">
                    Total de builds : <span id="stat-total-builds" style="color:var(--text-primary); font-weight:bold;">${localBuilds.length}</span>
                </div>
            </div>
        `;

        return `
            <div class="builds-layout" style="display:flex; gap:20px; flex-wrap:wrap; width:100%;">
                ${sidebar}
                <div class="builds-list-area" id="builds-list-grid" style="flex:1; min-width:300px; display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
                    <!-- Cards Grid will be populated by renderBuildsList -->
                </div>
            </div>
        `;
    },

    renderBuildsList() {
        const grid = document.getElementById('builds-list-grid');
        if (!grid) return;

        const searchVal = document.getElementById('filter-search')?.value.toLowerCase() || '';
        const profVal = document.getElementById('filter-profession')?.value || 'all';
        const modeVal = document.getElementById('filter-mode')?.value || 'all';

        const filtered = this.builds.filter(b => {
            const matchesSearch = b.name.toLowerCase().includes(searchVal) || (b.notes && b.notes.toLowerCase().includes(searchVal));
            const matchesProf = profVal === 'all' || b.profession === profVal;
            const matchesMode = modeVal === 'all' || b.gameMode === modeVal;
            return matchesSearch && matchesProf && matchesMode;
        });

        filtered.sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return (b.updatedAt || 0) - (a.updatedAt || 0);
        });

        const statTotal = document.getElementById('stat-total-builds');
        if (statTotal) statTotal.textContent = filtered.length;

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="card" style="text-align:center; padding:50px; grid-column: 1 / -1;">
                    <i class="fa-solid fa-folder-open" style="font-size:40px; color:var(--text-muted); margin-bottom:15px;"></i>
                    <h4>Aucun build trouvé</h4>
                    <p style="color:var(--text-secondary); margin-top:5px; font-size:12px;">Cliquez sur 'Nouveau Build' pour commencer !</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(b => {
            const profClass = b.profession;
            const color = PROF_COLORS[profClass] || '#7209b7';
            const icon = PROF_ICONS[profClass] || 'fa-user';
            const label = PROFESSION_LABELS_FR[profClass] || b.profession;
            const modeBadge = b.gameMode === 'pve' ? '<span class="mode-badge pve">PvE</span>' : b.gameMode === 'pvp' ? '<span class="mode-badge pvp">PvP</span>' : '<span class="mode-badge wvw">WvW</span>';

            const decoded = this.decodeBuildChatLink(b.chatLink);
            let specPreviewHtml = '';
            let skillsPreviewHtml = '';

            if (decoded) {
                const details = this.apiDataCache.profDetailsMap[profClass];
                const paletteMap = details?.skills_by_palette ? new Map(details.skills_by_palette) : new Map();

                specPreviewHtml = `<div class="card-spec-preview-icons">`;
                decoded.specializations.forEach(s => {
                    const spec = this.apiDataCache.specs[s.id];
                    if (spec) {
                        specPreviewHtml += `<img src="${spec.icon}" title="${spec.name}" class="mini-spec-icon">`;
                    }
                });
                specPreviewHtml += `</div>`;

                skillsPreviewHtml = `<div class="card-skills-preview-icons">`;
                const healId = paletteMap.get(decoded.skills.heal);
                const eliteId = paletteMap.get(decoded.skills.elite);
                const skillIds = [healId, ...decoded.skills.utilities.map(p => paletteMap.get(p)), eliteId];

                skillIds.forEach(skId => {
                    const sk = this.apiDataCache.skills[skId];
                    if (sk) {
                        skillsPreviewHtml += `<img src="${sk.icon}" title="${sk.name}" class="mini-skill-icon">`;
                    } else {
                        skillsPreviewHtml += `<div class="mini-skill-placeholder" title="Vide"></div>`;
                    }
                });
                skillsPreviewHtml += `</div>`;
            }

            return `
                <div class="build-card card" style="border-top: 3px solid ${color};" data-build-id="${b.id}">
                    <div class="build-card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div class="prof-badge" style="background-color:${color}15; border:1px solid ${color}33; color:${color}; padding:3px 8px; border-radius:4px; font-size:11px; font-weight:bold; display:flex; align-items:center; gap:5px;">
                            <i class="fa-solid ${icon}"></i>
                            <span>${label}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            ${modeBadge}
                            <button class="btn-favorite-toggle star-btn ${b.isFavorite ? 'active' : ''}" title="Favori">
                                <i class="fa-${b.isFavorite ? 'solid' : 'regular'} fa-star"></i>
                            </button>
                        </div>
                    </div>
                    
                    <h3 class="build-card-title" style="font-size:14px; font-weight:bold; margin-bottom:10px;">${b.name}</h3>
                    
                    ${decoded ? `
                        <div class="build-card-previews-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; background:rgba(0,0,0,0.1); padding:8px; border-radius:4px;">
                            ${specPreviewHtml}
                            ${skillsPreviewHtml}
                        </div>
                    ` : ''}

                    ${b.equipment?.armorStat ? `<div style="font-size:11px; color:var(--text-secondary); margin-bottom:5px;"><i class="fa-solid fa-shirt"></i> Équipement : <strong>${b.equipment.armorStat.split(' ')[0]}</strong></div>` : ''}
                    
                    ${b.chatLink ? `
                        <div style="display:flex; gap:6px; margin-bottom:12px;">
                            <input type="text" value="${b.chatLink}" readonly style="flex:1; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); padding:4px 8px; font-size:10px; font-family:monospace; border-radius:3px; outline:none;" class="chatlink-input-copy">
                            <button class="btn-copy-chatlink btn btn-secondary btn-sm" style="padding:2px 8px; font-size:10px;" title="Copier le code">
                                <i class="fa-regular fa-copy"></i>
                            </button>
                        </div>
                    ` : ''}

                    <div class="build-card-footer" style="display:flex; gap:10px; margin-top:10px; border-top:1px solid rgba(255,255,255,0.05); padding-top:10px;">
                        <button class="btn-edit-build btn btn-secondary btn-sm" style="flex:1;">
                            <i class="fa-solid fa-pen-to-square"></i> Modifier
                        </button>
                        <button class="btn-delete-build btn btn-danger btn-sm" title="Supprimer">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Bind events inside grid cards
        grid.querySelectorAll('.btn-favorite-toggle').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.closest('.build-card').getAttribute('data-build-id');
                this.toggleFavorite(id);
            };
        });

        grid.querySelectorAll('.btn-copy-chatlink').forEach(btn => {
            btn.onclick = (e) => {
                const input = e.target.closest('.build-card').querySelector('.chatlink-input-copy');
                input.select();
                navigator.clipboard.writeText(input.value);
                
                const originalHtml = btn.innerHTML;
                btn.innerHTML = `<i class="fa-solid fa-check" style="color:var(--color-success);"></i>`;
                setTimeout(() => { btn.innerHTML = originalHtml; }, 1500);
            };
        });

        grid.querySelectorAll('.btn-edit-build').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.closest('.build-card').getAttribute('data-build-id');
                this.openEditor(id);
            };
        });

        grid.querySelectorAll('.btn-delete-build').forEach(btn => {
            btn.onclick = (e) => {
                if (confirm("Voulez-vous vraiment supprimer ce build ?")) {
                    const id = e.target.closest('.build-card').getAttribute('data-build-id');
                    this.deleteBuild(id);
                }
            };
        });
    },

    toggleFavorite(id) {
        const build = this.builds.find(b => b.id === id);
        if (build) {
            build.isFavorite = !build.isFavorite;
            build.updatedAt = Date.now();
            this.saveLocalData();
            this.renderBuildsList();
            this.syncWithCloud();
        }
    },

    deleteBuild(id) {
        this.builds = this.builds.filter(b => b.id !== id);
        this.saveLocalData();
        this.renderActiveView();
        if (this.activeMode === 'custom') {
            this.renderBuildsList();
        }
        this.syncWithCloud();
    },

    // --- Legacy / Custom View Modal Editor ---

    openEditor(buildId = null) {
        const modal = document.getElementById('build-editor-modal');
        const titleEl = document.getElementById('editor-modal-title');
        
        if (buildId) {
            titleEl.textContent = "Modifier le Build";
            const build = this.builds.find(b => b.id === buildId);
            this.editingBuild = { ...build };
        } else {
            titleEl.textContent = "Créer un Nouveau Build";
            this.editingBuild = {
                id: 'b_' + Date.now(),
                name: '',
                profession: '',
                gameMode: 'pve',
                isFavorite: false,
                presetType: 'aptitudes',
                chatLink: '',
                rotation: '',
                weapons: { set1: '', set2: '' },
                equipment: {
                    armorStat: '', weaponsStat: '', trinketsStat: '',
                    runeId: 0, relicId: 0, sigils1Ids: [0, 0], sigils2Ids: [0, 0],
                    food: '', utility: ''
                },
                notes: '',
                updatedAt: Date.now()
            };
        }

        document.getElementById('edit-build-name').value = this.editingBuild.name;
        document.getElementById('edit-build-profession').value = this.editingBuild.profession;
        document.getElementById('edit-build-mode').value = this.editingBuild.gameMode;
        document.getElementById('edit-build-favorite').checked = this.editingBuild.isFavorite;
        document.getElementById('edit-build-type').value = this.editingBuild.presetType || 'aptitudes';
        document.getElementById('edit-build-chatlink').value = this.editingBuild.chatLink;
        document.getElementById('editor-error-msg').textContent = '';

        modal.classList.add('open');
    },

    closeEditor() {
        document.getElementById('build-editor-modal').classList.remove('open');
        this.editingBuild = null;
    },

    // --- Inline Skill Selection list for Target Templates ---

    openSkillSelectorInline(localBuild, slotIdx, type, isLegendUtil, legendIdx, utilIdx) {
        const modal = document.getElementById('skill-selector-modal');
        const grid = document.getElementById('skill-selector-grid');
        const title = document.getElementById('skill-selector-title');
        
        if (!modal || !grid) return;

        title.textContent = `Sélectionner : ${type === 'Heal' ? 'Compétence de Soin' : type === 'Elite' ? 'Compétence d\'Élite' : 'Compétence Utilitaire'}`;

        const details = this.apiDataCache.profDetailsMap[localBuild.profession];
        if (!details) return;

        const matchingSkills = Object.values(this.apiDataCache.skills).filter(s => s.slot === type && s.professions?.includes(details.name));
        
        const reversePaletteMap = new Map();
        if (details.skills_by_palette) {
            details.skills_by_palette.forEach(([palId, skId]) => {
                reversePaletteMap.set(skId, palId);
            });
        }

        grid.innerHTML = `
            <div class="skill-select-item" data-palette-id="0">
                <div class="skill-icon-placeholder" style="width:40px; height:40px; border-radius:4px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.3);">
                    <i class="fa-solid fa-ban" style="font-size:14px; color:var(--text-muted);"></i>
                </div>
                <span>Aucune compétence</span>
            </div>
            ${matchingSkills.map(s => {
                const palId = reversePaletteMap.get(s.id) || 0;
                return `
                    <div class="skill-select-item" data-palette-id="${palId}">
                        <img src="${s.icon}" style="width:40px; height:40px; border-radius:4px;">
                        <div style="display:flex; flex-direction:column; gap:2px;">
                            <strong style="font-size:12px;">${s.name}</strong>
                            <span style="font-size:10px; color:var(--text-secondary); line-height:1.2;">
                                ${s.description ? s.description.substring(0, 60) + (s.description.length > 60 ? '...' : '') : ''}
                            </span>
                        </div>
                    </div>
                `;
            }).join('')}
        `;

        modal.classList.add('open');

        grid.querySelectorAll('.skill-select-item').forEach(item => {
            item.onclick = () => {
                const paletteId = parseInt(item.getAttribute('data-palette-id'));
                const normalized = this.normalizeLocalBuild(localBuild);
                
                if (isLegendUtil) {
                    normalized.legendUtilities[legendIdx][utilIdx] = paletteId;
                } else {
                    if (slotIdx === 0) normalized.skills.heal = paletteId;
                    else if (slotIdx === 4) normalized.skills.elite = paletteId;
                    else normalized.skills.utilities[slotIdx - 1] = paletteId;
                }

                localBuild.chatLink = this.encodeBuildChatLink(
                    parseInt(Object.keys(PROFESSION_NAMES).find(k => PROFESSION_NAMES[k].toLowerCase() === localBuild.profession)),
                    normalized.specializations,
                    normalized.skills,
                    normalized.legends,
                    normalized.legendUtilities
                );

                this.saveLocalData();
                this.renderActiveView();
                modal.classList.remove('open');
            };
        });
    },

    // --- Cloud Sync Implementation ---

    async loadCloudBuilds() {
        if (this.syncConfig.type === 'local' || this.isSyncing) return;

        this.isSyncing = true;
        this.updateSyncStatusBar();

        try {
            if (this.syncConfig.type === 'gist' && this.syncConfig.gistToken) {
                const token = this.syncConfig.gistToken;
                let gistId = this.syncConfig.gistId;

                if (!gistId) {
                    const response = await fetch('https://api.github.com/gists', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const gists = await response.json();
                        const myGist = gists.find(g => g.files && g.files['tyria_companion_builds.json']);
                        if (myGist) {
                            gistId = myGist.id;
                            this.syncConfig.gistId = gistId;
                            this.saveLocalData();
                        }
                    }
                }

                if (gistId) {
                    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const gistData = await response.json();
                        const fileContent = gistData.files['tyria_companion_builds.json']?.content;
                        if (fileContent) {
                            const cloudBuilds = JSON.parse(fileContent);
                            this.mergeBuilds(cloudBuilds);
                        }
                        this.syncStatusMsg = `Synchronisé avec GitHub Gist (À l'instant)`;
                    } else if (response.status === 404) {
                        this.syncConfig.gistId = '';
                        this.saveLocalData();
                        await this.createGist();
                    } else {
                        throw new Error(`Erreur HTTP : ${response.status}`);
                    }
                } else {
                    await this.createGist();
                }
            } else if (this.syncConfig.type === 'webdav' && this.syncConfig.webdavUrl) {
                const url = this.syncConfig.webdavUrl.endsWith('/') ? this.syncConfig.webdavUrl : this.syncConfig.webdavUrl + '/';
                const fileUrl = `${url}tyria_companion_builds.json`;
                const headers = {};
                if (this.syncConfig.webdavUser && this.syncConfig.webdavPass) {
                    headers['Authorization'] = `Basic ${btoa(this.syncConfig.webdavUser + ':' + this.syncConfig.webdavPass)}`;
                }

                const response = await fetch(fileUrl, { headers });
                if (response.ok) {
                    const cloudBuilds = await response.json();
                    this.mergeBuilds(cloudBuilds);
                    this.syncStatusMsg = `Synchronisé avec WebDAV (À l'instant)`;
                } else if (response.status === 404) {
                    await this.uploadWebDAV();
                } else {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                }
            }
        } catch (e) {
            console.error("Cloud sync error", e);
            this.syncStatusMsg = `Erreur : ${e.message}`;
        } finally {
            this.isSyncing = false;
            this.updateSyncStatusBar();
        }
    },

    async createGist() {
        const token = this.syncConfig.gistToken;
        try {
            const response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: "TyriaCompanion Saved Builds Sync file",
                    public: false,
                    files: {
                        'tyria_companion_builds.json': {
                            content: JSON.stringify(this.builds, null, 2)
                        }
                    }
                })
            });
            if (response.ok) {
                const result = await response.json();
                this.syncConfig.gistId = result.id;
                this.saveLocalData();
                this.syncStatusMsg = `Créé et synchronisé avec GitHub Gist`;
            } else {
                throw new Error("Impossible de créer le Gist.");
            }
        } catch (e) {
            console.error("Gist creation failed", e);
            throw e;
        }
    },

    async uploadWebDAV() {
        const url = this.syncConfig.webdavUrl.endsWith('/') ? this.syncConfig.webdavUrl : this.syncConfig.webdavUrl + '/';
        const fileUrl = `${url}tyria_companion_builds.json`;
        const headers = { 'Content-Type': 'application/json' };
        if (this.syncConfig.webdavUser && this.syncConfig.webdavPass) {
            headers['Authorization'] = `Basic ${btoa(this.syncConfig.webdavUser + ':' + this.syncConfig.webdavPass)}`;
        }

        try {
            const response = await fetch(fileUrl, {
                method: 'PUT',
                headers,
                body: JSON.stringify(this.builds, null, 2)
            });
            if (!response.ok) {
                throw new Error(`PUT Error: ${response.status}`);
            }
            this.syncStatusMsg = `Synchronisé avec WebDAV (À l'instant)`;
        } catch (e) {
            console.error("WebDAV upload failed", e);
            throw e;
        }
    },

    async syncWithCloud() {
        if (this.syncConfig.type === 'local') return;
        
        this.isSyncing = true;
        this.updateSyncStatusBar();

        try {
            if (this.syncConfig.type === 'gist' && this.syncConfig.gistToken && this.syncConfig.gistId) {
                const response = await fetch(`https://api.github.com/gists/${this.syncConfig.gistId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${this.syncConfig.gistToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        files: {
                            'tyria_companion_builds.json': {
                                content: JSON.stringify(this.builds, null, 2)
                            }
                        }
                    })
                });
                if (response.ok) {
                    this.syncStatusMsg = `Synchronisé avec GitHub Gist (À l'instant)`;
                } else {
                    throw new Error("La mise à jour du Gist a échoué.");
                }
            } else if (this.syncConfig.type === 'webdav' && this.syncConfig.webdavUrl) {
                await this.uploadWebDAV();
            }
        } catch (e) {
            console.error("Cloud synchronization push failed", e);
            this.syncStatusMsg = `Erreur : ${e.message}`;
        } finally {
            this.isSyncing = false;
            this.updateSyncStatusBar();
        }
    },

    mergeBuilds(cloudBuilds) {
        if (!Array.isArray(cloudBuilds)) return;
        
        let localUpdated = false;
        
        cloudBuilds.forEach(cb => {
            cb.weapons = cb.weapons || { set1: '', set2: '' };
            cb.equipment = cb.equipment || {
                armorStat: '', weaponsStat: '', trinketsStat: '',
                runeId: 0, relicId: 0, sigils1Ids: [0, 0], sigils2Ids: [0, 0],
                food: '', utility: ''
            };

            const lbIdx = this.builds.findIndex(b => b.id === cb.id);
            if (lbIdx === -1) {
                this.builds.push(cb);
                localUpdated = true;
            } else {
                const lb = this.builds[lbIdx];
                if ((cb.updatedAt || 0) > (lb.updatedAt || 0)) {
                    this.builds[lbIdx] = cb;
                    localUpdated = true;
                }
            }
        });

        const needsPush = this.builds.some(lb => {
            const cb = cloudBuilds.find(b => b.id === lb.id);
            return !cb || (lb.updatedAt || 0) > (cb.updatedAt || 0);
        });

        if (localUpdated) {
            this.saveLocalData();
        }

        if (needsPush) {
            this.syncWithCloud();
        }
    },

    // --- DOM Event Bindings ---

    bindEvents(container) {
        // --- 1. Mode Selectors ---
        container.addEventListener('click', (e) => {
            const btnApi = e.target.closest('#btn-mode-api');
            const btnCustom = e.target.closest('#btn-mode-custom');
            const btnSwitch = e.target.closest('#btn-switch-to-custom');

            if (btnApi) {
                this.activeMode = 'api';
                container.querySelectorAll('.mode-selector-tabs button').forEach(b => b.classList.remove('active'));
                btnApi.classList.add('active');
                this.renderActiveView();
                if (this.activeMode === 'custom') this.renderBuildsList();
            }
            if (btnCustom || btnSwitch) {
                this.activeMode = 'custom';
                container.querySelectorAll('.mode-selector-tabs button').forEach(b => b.classList.remove('active'));
                document.getElementById('btn-mode-custom')?.classList.add('active');
                this.renderActiveView();
                this.renderBuildsList();
            }
        });

        // --- 2. API Mode Elements Click ---
        container.addEventListener('click', async (e) => {
            // Character selection tab
            const charBtn = e.target.closest('.char-tab-btn');
            if (charBtn) {
                const name = charBtn.getAttribute('data-char-name');
                const found = this.characters.find(c => c.name === name);
                if (found) {
                    this.activeCharacter = found;
                    this.activeBuildTab = 0;
                    this.activeEquipmentTab = (found.active_equipment_tab || 1) - 1;
                    this.viewingType = 'api';
                    this.renderActiveView();
                }
                return;
            }

            // Equipment template tab
            const eqTabBtn = e.target.closest('.eq-tab-btn');
            if (eqTabBtn) {
                this.activeEquipmentTab = parseInt(eqTabBtn.getAttribute('data-eq-tab-idx'));
                this.renderActiveView();
                return;
            }

            // Build template tab (API or Target Local)
            const tabItem = e.target.closest('.build-tab-item');
            if (tabItem && !e.target.closest('.btn-edit-target-meta') && !e.target.closest('.btn-delete-target')) {
                const type = tabItem.getAttribute('data-type');
                if (type === 'api-build') {
                    this.viewingType = 'api';
                    this.activeBuildTab = parseInt(tabItem.getAttribute('data-tab-idx'));
                    if (this.activeSubTab === 'equipment') {
                        this.activeSubTab = 'traits';
                    }
                } else if (type === 'api-equip') {
                    this.viewingType = 'api';
                    this.activeEquipmentTab = parseInt(tabItem.getAttribute('data-tab-idx'));
                    this.activeSubTab = 'equipment';
                } else {
                    this.viewingType = 'local';
                    this.activeLocalBuildId = tabItem.getAttribute('data-build-id');
                }
                this.renderActiveView();
                return;
            }

            // Subtab button selection
            const subtabBtn = e.target.closest('.subtab-btn');
            if (subtabBtn) {
                this.activeSubTab = subtabBtn.getAttribute('data-subtab');
                this.renderActiveView();
                return;
            }

            // Create target template local build
            const btnCreateTarget = e.target.closest('#btn-create-target-template');
            if (btnCreateTarget && this.activeCharacter) {
                const profKey = this.activeCharacter.profession.toLowerCase();
                this.openEditor();
                document.getElementById('editor-modal-title').textContent = "Créer un Nouveau Preset Cible";
                document.getElementById('edit-build-name').value = `Preset Cible - ${this.activeCharacter.name}`;
                document.getElementById('edit-build-profession').value = profKey;
                document.getElementById('edit-build-profession').disabled = true;
                this.editingBuild.profession = profKey;
                
                // For target templates, the type selector is active
                this.viewingType = 'local'; // switch view once saved
                return;
            }

            // Edit target template meta
            const btnEditMeta = e.target.closest('.btn-edit-target-meta');
            if (btnEditMeta) {
                const id = btnEditMeta.getAttribute('data-build-id');
                this.openEditor(id);
                document.getElementById('editor-modal-title').textContent = "Modifier le Preset Cible";
                document.getElementById('edit-build-profession').disabled = true;
                return;
            }

            // Delete target template
            const btnDeleteTarget = e.target.closest('.btn-delete-target');
            if (btnDeleteTarget) {
                const id = btnDeleteTarget.getAttribute('data-build-id');
                if (confirm("Supprimer ce preset cible ?")) {
                    this.builds = this.builds.filter(b => b.id !== id);
                    this.saveLocalData();
                    this.viewingType = 'api';
                    this.activeBuildTab = 0;
                    this.renderActiveView();
                    this.syncWithCloud();
                }
                return;
            }

            // Copy chatlink button
            const btnCopy = e.target.closest('.btn-copy-chatlink');
            if (btnCopy) {
                const input = container.querySelector('.chatlink-input-copy');
                input.select();
                navigator.clipboard.writeText(input.value);
                
                const originalHtml = btnCopy.innerHTML;
                btnCopy.innerHTML = `<i class="fa-solid fa-check" style="color:var(--color-success);"></i> Copié`;
                setTimeout(() => { btnCopy.innerHTML = originalHtml; }, 1500);
                return;
            }

            // Save Target build button
            const btnSaveTarget = e.target.closest('#btn-save-target-build');
            if (btnSaveTarget) {
                const localTargetBuilds = this.builds.filter(b => b.profession === this.activeCharacter.profession.toLowerCase());
                const currentLocal = localTargetBuilds.find(b => b.id === this.activeLocalBuildId);
                if (currentLocal) {
                    // Update stats
                    currentLocal.equipment.armorStat = document.getElementById('edit-equip-armor-stat').value;
                    currentLocal.equipment.weaponsStat = document.getElementById('edit-equip-weapons-stat').value;
                    currentLocal.equipment.trinketsStat = document.getElementById('edit-equip-trinkets-stat').value;

                    // Update upgrades
                    currentLocal.equipment.runeId = parseInt(document.getElementById('edit-equip-rune').value) || 0;
                    currentLocal.equipment.relicId = parseInt(document.getElementById('edit-equip-relic').value) || 0;
                    
                    if (document.getElementById('edit-equip-sigil1-1')) {
                        currentLocal.equipment.sigils1Ids = [
                            parseInt(document.getElementById('edit-equip-sigil1-1').value) || 0,
                            parseInt(document.getElementById('edit-equip-sigil1-2').value) || 0
                        ];
                    }
                    if (document.getElementById('edit-equip-sigil2-1')) {
                        currentLocal.equipment.sigils2Ids = [
                            parseInt(document.getElementById('edit-equip-sigil2-1').value) || 0,
                            parseInt(document.getElementById('edit-equip-sigil2-2').value) || 0
                        ];
                    }

                    // Weapons text
                    currentLocal.weapons = {
                        set1: document.getElementById('edit-equip-weapons-1')?.value.trim() || '',
                        set2: document.getElementById('edit-equip-weapons-2')?.value.trim() || ''
                    };

                    // Consumables & Notes
                    currentLocal.equipment.food = document.getElementById('edit-equip-food')?.value.trim() || '';
                    currentLocal.equipment.utility = document.getElementById('edit-equip-utility')?.value.trim() || '';
                    
                    const rotationEl = document.getElementById('edit-rotation-string');
                    if (rotationEl) currentLocal.rotation = rotationEl.value.trim();
                    
                    const notesEl = document.getElementById('edit-target-notes');
                    if (notesEl) currentLocal.notes = notesEl.value.trim();
                    
                    currentLocal.updatedAt = Date.now();

                    this.saveLocalData();
                    
                    const feedback = document.getElementById('target-save-feedback');
                    feedback.textContent = "Preset sauvegardé !";
                    setTimeout(() => { feedback.textContent = ''; }, 2000);

                    await this.prefetchAllBuildsApiData();
                    this.renderActiveView();
                    this.syncWithCloud();
                }
            }
        });

        // Live Rotation Parser Render on inputs
        container.addEventListener('input', (e) => {
            if (e.target.id === 'edit-rotation-string') {
                const renderTimelineDiv = container.querySelector('.rotation-render-timeline');
                if (renderTimelineDiv) {
                    renderTimelineDiv.innerHTML = this.renderRotationTimelineHTML(e.target.value);
                }
            }
        });

        // Editable trait node clicks delegation
        container.addEventListener('click', async (e) => {
            const traitNode = e.target.closest('.trait-node[data-editable="true"]');
            if (traitNode) {
                const rowIdx = parseInt(traitNode.getAttribute('data-row-idx'));
                const tierIdx = parseInt(traitNode.getAttribute('data-tier-idx'));
                const choiceIdx = parseInt(traitNode.getAttribute('data-choice-idx'));
                
                const localTargetBuilds = this.builds.filter(b => b.profession === this.activeCharacter.profession.toLowerCase());
                const currentLocal = localTargetBuilds.find(b => b.id === this.activeLocalBuildId) || localTargetBuilds[0];
                if (currentLocal) {
                    const normalized = this.normalizeLocalBuild(currentLocal);
                    const currentTraits = normalized.specializations[rowIdx].traits;
                    currentTraits[tierIdx] = currentTraits[tierIdx] === choiceIdx ? 0 : choiceIdx;

                    currentLocal.chatLink = this.encodeBuildChatLink(
                        parseInt(Object.keys(PROFESSION_NAMES).find(k => PROFESSION_NAMES[k].toLowerCase() === currentLocal.profession)),
                        normalized.specializations,
                        normalized.skills,
                        normalized.legends,
                        normalized.legendUtilities
                    );

                    this.saveLocalData();
                    this.renderActiveView();
                }
            }
        });

        // Editable active skill slots clicks delegation
        container.addEventListener('click', (e) => {
            const skillNode = e.target.closest('.skill-editor-slot[data-editable="true"]');
            if (skillNode) {
                const slotIdx = parseInt(skillNode.getAttribute('data-slot-idx'));
                const isLegendUtil = skillNode.getAttribute('data-is-legend-util') === 'true';
                const legendIdx = parseInt(skillNode.getAttribute('data-legend-idx'));
                const utilIdx = parseInt(skillNode.getAttribute('data-util-idx'));
                
                const localTargetBuilds = this.builds.filter(b => b.profession === this.activeCharacter.profession.toLowerCase());
                const currentLocal = localTargetBuilds.find(b => b.id === this.activeLocalBuildId) || localTargetBuilds[0];
                if (currentLocal) {
                    const normalized = this.normalizeLocalBuild(currentLocal);
                    
                    let type = 'Utility';
                    if (!isLegendUtil) {
                        if (slotIdx === 0) type = 'Heal';
                        else if (slotIdx === 4) type = 'Elite';
                    }
                    
                    this.openSkillSelectorInline(currentLocal, slotIdx, type, isLegendUtil, legendIdx, utilIdx);
                }
            }
        });

        // Legend icon switcher clicks delegation
        container.addEventListener('click', (e) => {
            const legendBtn = e.target.closest('.legend-icon-btn');
            if (legendBtn) {
                const legendIdx = parseInt(legendBtn.getAttribute('data-legend-idx'));
                const newLegendCode = parseInt(legendBtn.getAttribute('data-legend-code'));

                const localTargetBuilds = this.builds.filter(b => b.profession === this.activeCharacter.profession.toLowerCase());
                const currentLocal = localTargetBuilds.find(b => b.id === this.activeLocalBuildId) || localTargetBuilds[0];
                if (currentLocal) {
                    const normalized = this.normalizeLocalBuild(currentLocal);
                    normalized.legends[legendIdx] = newLegendCode;

                    // Automatically load the stance's native skills (heal, utilities, elite)
                    const selectedLegend = Object.values(this.apiDataCache.legends || {}).find(l => l.code === newLegendCode);
                    if (selectedLegend) {
                        const details = this.apiDataCache.profDetailsMap[currentLocal.profession.toLowerCase()];
                        if (details?.skills_by_palette) {
                            const reversePaletteMap = new Map();
                            details.skills_by_palette.forEach(([palId, skId]) => {
                                reversePaletteMap.set(skId, palId);
                            });
                            
                            normalized.legendUtilities[legendIdx] = selectedLegend.utilities.map(skId => reversePaletteMap.get(skId) || 0);
                        }
                    }

                    currentLocal.chatLink = this.encodeBuildChatLink(
                        parseInt(Object.keys(PROFESSION_NAMES).find(k => PROFESSION_NAMES[k].toLowerCase() === currentLocal.profession)),
                        normalized.specializations,
                        normalized.skills,
                        normalized.legends,
                        normalized.legendUtilities
                    );

                    this.saveLocalData();
                    this.renderActiveView();
                }
            }
        });

        // Specs select change delegation
        container.addEventListener('change', (e) => {

            const specSelect = e.target.closest('.spec-select-field');
            if (specSelect) {
                const rowIdx = parseInt(specSelect.getAttribute('data-row-idx'));
                const specId = parseInt(specSelect.value);

                const localTargetBuilds = this.builds.filter(b => b.profession === this.activeCharacter.profession.toLowerCase());
                const currentLocal = localTargetBuilds.find(b => b.id === this.activeLocalBuildId) || localTargetBuilds[0];
                if (currentLocal) {
                    const normalized = this.normalizeLocalBuild(currentLocal);
                    
                    // Ensure the array has 3 slots
                    while (normalized.specializations.length < 3) {
                        normalized.specializations.push({ id: 0, traits: [0, 0, 0] });
                    }

                    normalized.specializations[rowIdx] = {
                        id: specId,
                        traits: [0, 0, 0]
                    };

                    // Validate legends if this is a Revenant and we changed the elite spec (Slot 3)
                    const isRev = currentLocal.profession.toLowerCase() === 'revenant';
                    if (isRev && rowIdx === 2) {
                        normalized.legends = normalized.legends.map((code, idx) => {
                            // Glint (6) -> Herald (52)
                            if (code === 6 && specId !== 52) return idx === 0 ? 3 : 2;
                            // Kalla (7) -> Renegade (63)
                            if (code === 7 && specId !== 63) return idx === 0 ? 3 : 2;
                            // Alliance (8) -> Vindicator (69)
                            if (code === 8 && specId !== 69) return idx === 0 ? 3 : 2;
                            // Razah (9) -> Conduit (79)
                            if (code === 9 && specId !== 79) return idx === 0 ? 3 : 2;
                            return code;
                        });

                        // Ensure legends are not duplicates
                        if (normalized.legends[0] === normalized.legends[1]) {
                            normalized.legends[1] = normalized.legends[0] === 2 ? 3 : 2; // Fallback Jalis/Shiro swap
                        }

                        // Also auto-refresh legend utilities
                        normalized.legends.forEach((code, lIdx) => {
                            const selectedLegend = Object.values(this.apiDataCache.legends || {}).find(l => l.code === code);
                            if (selectedLegend) {
                                const details = this.apiDataCache.profDetailsMap[currentLocal.profession.toLowerCase()];
                                if (details?.skills_by_palette) {
                                    const reversePaletteMap = new Map();
                                    details.skills_by_palette.forEach(([palId, skId]) => {
                                        reversePaletteMap.set(skId, palId);
                                    });
                                    normalized.legendUtilities[lIdx] = selectedLegend.utilities.map(skId => reversePaletteMap.get(skId) || 0);
                                }
                            }
                        });
                    }

                    currentLocal.chatLink = this.encodeBuildChatLink(
                        parseInt(Object.keys(PROFESSION_NAMES).find(k => PROFESSION_NAMES[k].toLowerCase() === currentLocal.profession)),
                        normalized.specializations,
                        normalized.skills,
                        normalized.legends,
                        normalized.legendUtilities
                    );

                    this.saveLocalData();
                    this.renderActiveView();
                }
            }
        });

        // --- 3. Traditional Custom Mode Control events ---
        container.addEventListener('input', (e) => {
            if (e.target.id === 'filter-search') {
                this.renderBuildsList();
            }
        });

        container.addEventListener('change', (e) => {
            if (e.target.id === 'filter-profession' || e.target.id === 'filter-mode') {
                this.renderBuildsList();
            }
        });

        // Custom Mode Add Build
        container.addEventListener('click', (e) => {
            if (e.target.id === 'btn-add-build') {
                this.openEditor();
            }
        });

        // Custom View Editor Modal Save Button
        document.getElementById('btn-save-build')?.addEventListener('click', () => {
            const name = document.getElementById('edit-build-name').value.trim();
            const prof = document.getElementById('edit-build-profession').value;
            const errorEl = document.getElementById('editor-error-msg');

            if (!name) {
                errorEl.textContent = "Veuillez saisir un nom pour ce build.";
                return;
            }
            if (!prof) {
                errorEl.textContent = "Veuillez sélectionner une profession.";
                return;
            }

            this.editingBuild.name = name;
            this.editingBuild.profession = prof;
            this.editingBuild.gameMode = document.getElementById('edit-build-mode').value;
            this.editingBuild.isFavorite = document.getElementById('edit-build-favorite').checked;
            this.editingBuild.presetType = document.getElementById('edit-build-type').value;
            
            let chatLinkVal = document.getElementById('edit-build-chatlink').value.trim();
            if (!chatLinkVal) {
                const profId = parseInt(Object.keys(PROFESSION_NAMES).find(k => PROFESSION_NAMES[k].toLowerCase() === prof.toLowerCase())) || 1;
                chatLinkVal = this.encodeBuildChatLink(
                    profId,
                    [{ id: 0, traits: [0, 0, 0] }, { id: 0, traits: [0, 0, 0] }, { id: 0, traits: [0, 0, 0] }],
                    { heal: 0, utilities: [0, 0, 0], elite: 0 },
                    [0, 0],
                    [[0, 0, 0], [0, 0, 0]]
                );
            }
            this.editingBuild.chatLink = chatLinkVal;
            this.editingBuild.updatedAt = Date.now();

            const idx = this.builds.findIndex(b => b.id === this.editingBuild.id);
            if (idx === -1) {
                this.builds.push(this.editingBuild);
                this.activeLocalBuildId = this.editingBuild.id;
                this.viewingType = 'local';
            } else {
                this.builds[idx] = this.editingBuild;
            }

            this.saveLocalData();
            this.closeEditor();
            
            this.prefetchAllBuildsApiData().then(() => {
                this.renderActiveView();
                if (this.activeMode === 'custom') this.renderBuildsList();
            });

            this.syncWithCloud();
        });

        document.getElementById('btn-close-editor-modal')?.addEventListener('click', () => this.closeEditor());
        document.getElementById('btn-close-skill-modal')?.addEventListener('click', () => {
            document.getElementById('skill-selector-modal').classList.remove('open');
        });

        // --- 4. Sync Settings and Config Dialog triggers ---
        const syncModal = document.getElementById('sync-config-modal');
        const syncTypeSelect = document.getElementById('sync-type-select');

        document.getElementById('btn-sync-config')?.addEventListener('click', () => {
            syncTypeSelect.value = this.syncConfig.type || 'local';
            document.getElementById('sync-gist-token').value = this.syncConfig.gistToken || '';
            document.getElementById('sync-gist-id').value = this.syncConfig.gistId || '';
            document.getElementById('sync-webdav-url').value = this.syncConfig.webdavUrl || '';
            document.getElementById('sync-webdav-user').value = this.syncConfig.webdavUser || '';
            document.getElementById('sync-webdav-pass').value = this.syncConfig.webdavPass || '';
            document.getElementById('sync-config-error').textContent = '';

            this.toggleSyncFormSections(syncTypeSelect.value);
            syncModal.classList.add('open');
        });

        document.getElementById('btn-close-sync-modal')?.addEventListener('click', () => {
            syncModal.classList.remove('open');
        });

        syncTypeSelect?.addEventListener('change', (e) => {
            this.toggleSyncFormSections(e.target.value);
        });

        document.getElementById('btn-save-sync-config')?.addEventListener('click', async () => {
            const type = syncTypeSelect.value;
            this.syncConfig = {
                type,
                gistToken: document.getElementById('sync-gist-token').value.trim(),
                gistId: document.getElementById('sync-gist-id').value.trim(),
                webdavUrl: document.getElementById('sync-webdav-url').value.trim(),
                webdavUser: document.getElementById('sync-webdav-user').value.trim(),
                webdavPass: document.getElementById('sync-webdav-pass').value.trim()
            };

            this.saveLocalData();
            syncModal.classList.remove('open');
            this.syncStatusMsg = '';
            this.updateSyncStatusBar();

            if (type !== 'local') {
                await this.loadCloudBuilds();
                await this.prefetchAllBuildsApiData();
                this.renderActiveView();
                if (this.activeMode === 'custom') this.renderBuildsList();
            }
        });

        document.getElementById('btn-sync-now')?.addEventListener('click', async () => {
            await this.loadCloudBuilds();
            await this.prefetchAllBuildsApiData();
            this.renderActiveView();
            if (this.activeMode === 'custom') this.renderBuildsList();
        });

        // Manual backup JSON Export
        document.getElementById('btn-export-json')?.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.builds, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `tyria_companion_builds_export_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });

        const fileInput = document.getElementById('input-import-json');
        document.getElementById('btn-import-json-trigger')?.addEventListener('click', () => {
            fileInput?.click();
        });

        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (Array.isArray(imported)) {
                        this.mergeBuilds(imported);
                        this.prefetchAllBuildsApiData().then(() => {
                            this.renderActiveView();
                            if (this.activeMode === 'custom') this.renderBuildsList();
                        });
                        alert(`${imported.length} builds importés et fusionnés !`);
                    } else {
                        alert("Le fichier de sauvegarde est invalide.");
                    }
                } catch (err) {
                    alert("Erreur de lecture du fichier.");
                }
            };
            reader.readAsText(file);
        });
    },

    toggleSyncFormSections(type) {
        document.getElementById('sync-form-gist').style.display = type === 'gist' ? 'block' : 'none';
        document.getElementById('sync-form-webdav').style.display = type === 'webdav' ? 'block' : 'none';
    }
};
