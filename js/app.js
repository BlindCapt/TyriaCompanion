import { GW2Api } from './api.js';
import { Dashboard } from './components/dashboard.js';
import { Legendaries } from './components/legendaries.js';
import { Timers } from './components/timers.js';
import { Vault } from './components/vault.js';
import { TradingPost } from './components/tradingpost.js';
import { Inventories } from './components/inventories.js';
import { Builds } from './components/builds.js';

// Application Orchestrator
const App = {
    currentTab: 'dashboard',
    views: {
        dashboard: { title: 'Tableau de Bord', component: Dashboard, elementId: 'dashboard-view' },
        builds: { title: 'Équipements & Builds', component: Builds, elementId: 'builds-view' },
        legendaries: { title: 'Progression Légendaire', component: Legendaries, elementId: 'legendaries-view' },
        timers: { title: 'Minuteurs des Méta-Événements', component: Timers, elementId: 'timers-view' },
        vault: { title: 'Chambre du Sorcier', component: Vault, elementId: 'vault-view' },
        tradingpost: { title: 'Optimisation Comptoir', component: TradingPost, elementId: 'tradingpost-view' },
        inventories: { title: 'Sacs des Personnages', component: Inventories, elementId: 'inventories-view' }
    },

    async init() {
        console.log("Initializing TyriaCompanion...");
        
        this.setupModal();
        this.setupNavigation();
        this.setupGlobalReload();
        this.setupWikiRedirects();
        
        // Initial connection check
        if (GW2Api.hasKey()) {
            await this.connectAccount(GW2Api.apiKey);
        } else {
            this.updateStatus(false);
            this.openApiModal();
        }

        // Handle initial hash routing
        const hash = window.location.hash.substring(1);
        if (this.views[hash]) {
            this.switchTab(hash);
        } else {
            this.switchTab('dashboard');
        }
    },

    // Navigation and Routing
    setupNavigation() {
        // Tab buttons click
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Let the hashchange event handle the actual tab switching to keep back button working
                const tab = item.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Hash change routing
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (this.views[hash] && hash !== this.currentTab) {
                this.switchTab(hash);
            }
        });
    },

    setupGlobalReload() {
        const reloadBtn = document.getElementById('btn-global-reload');
        if (!reloadBtn) return;
        
        reloadBtn.addEventListener('click', async () => {
            const originalHtml = reloadBtn.innerHTML;
            reloadBtn.disabled = true;
            reloadBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Synchronisation...`;
            
            try {
                // 1. Clear API cache
                GW2Api.clearCache();
                
                // 2. Clear HTML of all views except the current one (to force fresh render on visit)
                Object.keys(this.views).forEach(key => {
                    if (key !== this.currentTab) {
                        const el = document.getElementById(this.views[key].elementId);
                        if (el) el.innerHTML = '';
                    }
                });
                
                // 3. Force re-render the current view
                const currentContainer = document.getElementById(this.views[this.currentTab].elementId);
                if (currentContainer) {
                    await this.views[this.currentTab].component.render(currentContainer);
                }
                
                // 4. Refresh account connection
                if (GW2Api.hasKey()) {
                    await this.connectAccount(GW2Api.apiKey);
                }
            } catch (error) {
                console.error("Global reload failed", error);
            } finally {
                reloadBtn.disabled = false;
                reloadBtn.innerHTML = originalHtml;
            }
        });
    },

    setupWikiRedirects() {
        document.addEventListener('click', async (e) => {
            const target = e.target.closest('[data-item-id]');
            if (!target) return;
            
            // Ignore if clicking on interactive form controls, buttons, etc.
            if (e.target.closest('button, input, select, textarea, .btn, .checkbox-container, .star-btn, .btn-favorite-toggle, .btn-row-favorite-toggle')) {
                return;
            }
            
            const itemId = target.getAttribute('data-item-id');
            if (!itemId) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            // Open window immediately to prevent pop-up blocker
            const newTab = window.open('', '_blank');
            if (newTab) {
                newTab.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Wiki Guild Wars 2</title>
                        <meta charset="utf-8">
                        <style>
                            body {
                                background: #131217;
                                color: #e2e2e7;
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                                text-align: center;
                            }
                            .spinner {
                                border: 3px solid rgba(255,255,255,0.05);
                                border-radius: 50%;
                                border-top: 3px solid #7209b7;
                                border-right: 3px solid #4cc9f0;
                                width: 32px;
                                height: 32px;
                                animation: spin 0.8s linear infinite;
                                margin-bottom: 20px;
                            }
                            .text {
                                font-size: 14px;
                                font-weight: 500;
                                letter-spacing: 0.5px;
                                color: #a1a1aa;
                            }
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="spinner"></div>
                        <div class="text">Recherche du nom anglais de l'objet et redirection vers le Wiki...</div>
                    </body>
                    </html>
                `);
                newTab.document.close();
            }
            
            try {
                const englishName = await GW2Api.getEnglishName(itemId);
                if (englishName) {
                    const wikiUrl = `https://wiki.guildwars2.com/wiki/${encodeURIComponent(englishName.replace(/ /g, '_'))}`;
                    if (newTab) {
                        newTab.location.href = wikiUrl;
                    } else {
                        window.open(wikiUrl, '_blank');
                    }
                } else {
                    if (newTab) newTab.close();
                    alert("Impossible de trouver le nom en anglais pour cet objet.");
                }
            } catch (err) {
                console.error("Redirection to wiki failed", err);
                if (newTab) newTab.close();
            }
        });
    },

    async switchTab(tab) {
        if (!this.views[tab]) return;

        // Save active tab
        this.currentTab = tab;
        window.location.hash = tab;

        // Update active class in sidebar
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('data-tab') === tab) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update header title
        document.getElementById('current-tab-title').textContent = this.views[tab].title;

        // Toggle section visibility
        Object.keys(this.views).forEach(key => {
            const viewEl = document.getElementById(this.views[key].elementId);
            if (key === tab) {
                viewEl.classList.add('active');
            } else {
                // If exiting the Timers view, destroy its intervals
                if (key === 'timers' && typeof Timers.destroy === 'function') {
                    Timers.destroy();
                }
                viewEl.classList.remove('active');
            }
        });

        // Render component
        const container = document.getElementById(this.views[tab].elementId);
        
        // Check API key requirement (builds and timers don't strictly require a user API key)
        if (tab !== 'timers' && tab !== 'builds' && !GW2Api.hasKey()) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px;">
                    <i class="fa-solid fa-key" style="font-size: 40px; color: var(--text-muted); margin-bottom: 20px;"></i>
                    <h3>Clé API requise</h3>
                    <p style="color: var(--text-secondary); margin-top: 10px; margin-bottom: 20px;">
                        Cette section nécessite une connexion à l'API de Guild Wars 2 pour lire les données de votre compte.
                    </p>
                    <button class="btn btn-primary" id="btn-prompt-api">
                        <i class="fa-solid fa-key"></i> Saisir une clé API
                    </button>
                </div>
            `;
            document.getElementById('btn-prompt-api')?.addEventListener('click', () => this.openApiModal());
            return;
        }

        // Render actual component (only render if empty, if it contains the API key prompt, or if it's a dynamic view)
        const isRendered = container.innerHTML.trim().length > 0;
        const hasApiKeyPrompt = container.querySelector('#btn-prompt-api');
        
        if (tab === 'timers' || tab === 'builds' || tab === 'vault' || tab === 'dashboard' || !isRendered || hasApiKeyPrompt) {
            await this.views[tab].component.render(container);
        }
    },

    // API Key Modal Operations
    setupModal() {
        const modal = document.getElementById('api-modal');
        const btnOpen = document.getElementById('btn-api-config');
        const btnClose = document.getElementById('btn-close-modal');
        const btnSave = document.getElementById('btn-save-api');
        const btnDelete = document.getElementById('btn-delete-api');
        const input = document.getElementById('api-key-input');
        const errorMsg = document.getElementById('api-error-msg');

        // Open modal
        btnOpen.addEventListener('click', () => {
            input.value = GW2Api.apiKey;
            errorMsg.textContent = '';
            this.openApiModal();
        });

        // Close modal
        btnClose.addEventListener('click', () => this.closeApiModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeApiModal();
        });

        // Save key
        btnSave.addEventListener('click', async () => {
            const key = input.value.trim();
            if (!key) {
                errorMsg.textContent = "Veuillez saisir une clé API.";
                return;
            }

            btnSave.disabled = true;
            btnSave.textContent = "Validation...";
            errorMsg.textContent = "";

            try {
                // Test key validity
                await GW2Api.validateApiKey(key);
                
                // Key is valid, save it
                GW2Api.setApiKey(key);
                await this.connectAccount(key);
                
                // Clear all view contents to force a fresh render with the new key
                Object.keys(this.views).forEach(k => {
                    const el = document.getElementById(this.views[k].elementId);
                    if (el) el.innerHTML = '';
                });

                this.closeApiModal();
                this.switchTab(this.currentTab);
            } catch (error) {
                errorMsg.textContent = error.message;
            } finally {
                btnSave.disabled = false;
                btnSave.textContent = "Enregistrer";
            }
        });

        // Delete key
        btnDelete.addEventListener('click', () => {
            GW2Api.clearApiKey();
            input.value = '';
            this.updateStatus(false);
            
            // Clear all view contents to force a clean slate
            Object.keys(this.views).forEach(k => {
                const el = document.getElementById(this.views[k].elementId);
                if (el) el.innerHTML = '';
            });

            this.closeApiModal();
            this.switchTab('timers'); // fallback to utility timers
        });
    },

    openApiModal() {
        document.getElementById('api-modal').classList.add('open');
    },

    closeApiModal() {
        document.getElementById('api-modal').classList.remove('open');
    },

    // Account connection status indicator helper
    async connectAccount(key) {
        try {
            this.updateStatus(true, "Connexion...");
            const account = await GW2Api.getAccountInfo();
            this.updateStatus(true, `Connecté : ${account.name}`);
        } catch (error) {
            console.error("Connection failed", error);
            this.updateStatus(false, error.message);
            this.openApiModal();
        }
    },

    updateStatus(online, text = '') {
        const indicator = document.getElementById('account-status-indicator');
        if (!indicator) return;

        const dot = indicator.querySelector('.status-dot');
        const label = indicator.querySelector('.status-text');

        if (online) {
            dot.className = 'status-dot online';
            label.textContent = text || 'En ligne';
        } else {
            dot.className = 'status-dot offline';
            label.textContent = text || 'Hors ligne (Clé API requise)';
        }

        const reloadBtn = document.getElementById('btn-global-reload');
        if (reloadBtn) {
            reloadBtn.style.display = GW2Api.hasKey() ? 'inline-flex' : 'none';
        }
    }
};

// Start application on page load
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
