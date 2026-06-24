// --- Guild Wars 2 API Service Wrapper ---

const BASE_URL = 'https://api.guildwars2.com/v2';
const CACHE_PREFIX = 'gw2_cache_';
const PERMANENT_CACHE_PREFIX = 'gw2_perm_';

export const GW2Api = {
    apiKey: localStorage.getItem('gw2_api_key') || '',

    setApiKey(key) {
        this.apiKey = key.trim();
        if (this.apiKey) {
            localStorage.setItem('gw2_api_key', this.apiKey);
        } else {
            localStorage.removeItem('gw2_api_key');
        }
    },

    clearApiKey() {
        this.apiKey = '';
        localStorage.removeItem('gw2_api_key');
        // Clear non-permanent cache
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    },

    clearCache() {
        // Clear only the non-permanent API data cache
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    },

    hasKey() {
        return !!this.apiKey;
    },

    // Generic Fetch with caching
    async fetchWithCache(endpoint, cacheKey, ttlMs = 5 * 60 * 1000, requiresAuth = false) {
        // Auto-invalidate all API caches on daily reset (00:00 UTC)
        const todayUtcStr = new Date().toUTCString().slice(5, 16);
        const lastResetDate = localStorage.getItem('gw2_last_daily_reset_date');
        if (lastResetDate !== todayUtcStr) {
            localStorage.setItem('gw2_last_daily_reset_date', todayUtcStr);
            this.clearCache();
        }

        const fullCacheKey = CACHE_PREFIX + cacheKey;
        const cached = localStorage.getItem(fullCacheKey);
        
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                const age = Date.now() - parsed.timestamp;
                if (age < ttlMs) {
                    return parsed.data;
                }
            } catch (e) {
                console.error("Cache parsing error", e);
            }
        }

        // Fetch fresh data
        let url = `${BASE_URL}${endpoint}`;
        
        if (requiresAuth) {
            if (!this.apiKey) throw new Error("API Key is required for this endpoint.");
            const separator = url.includes('?') ? '&' : '?';
            url = `${url}${separator}access_token=${this.apiKey}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                this.clearApiKey();
                throw new Error("Clé API invalide ou expirée.");
            }
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Save to cache
        try {
            localStorage.setItem(fullCacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: data
            }));
        } catch (e) {
            console.warn("Storage quota exceeded, could not write to cache");
        }

        return data;
    },

    // Permanent item details cache (since items details never change)
    async getItemDetails(ids) {
        if (!ids || ids.length === 0) return {};
        
        // Filter out nulls and duplicates
        const uniqueIds = [...new Set(ids.filter(id => id !== null && id !== undefined))];
        const results = {};
        const missingIds = [];

        // Check permanent local cache first
        uniqueIds.forEach(id => {
            const cached = localStorage.getItem(PERMANENT_CACHE_PREFIX + 'item_' + id);
            if (cached) {
                try {
                    results[id] = JSON.parse(cached);
                } catch (e) {
                    missingIds.push(id);
                }
            } else {
                missingIds.push(id);
            }
        });

        if (missingIds.length === 0) return results;

        // Chunk missing IDs (max 100 per API request)
        const chunkSize = 100;
        for (let i = 0; i < missingIds.length; i += chunkSize) {
            const chunk = missingIds.slice(i, i + chunkSize);
            try {
                const url = `${BASE_URL}/items?ids=${chunk.join(',')}&lang=fr`;
                const response = await fetch(url);
                if (response.ok) {
                    const itemsData = await response.json();
                    itemsData.forEach(item => {
                        results[item.id] = item;
                        try {
                            localStorage.setItem(PERMANENT_CACHE_PREFIX + 'item_' + item.id, JSON.stringify(item));
                        } catch (e) {
                            // Local storage full, ignore caching
                        }
                    });
                }
            } catch (e) {
                console.error("Error fetching items details chunk", e);
            }
        }

        return results;
    },

    // Get English name of item or currency for Wiki redirection
    async getEnglishName(id) {
        if (!id) return null;
        
        const currencyIds = [72, 73, 75, 78, 79, 80];
        const isCurrency = currencyIds.includes(Number(id));
        const endpoint = isCurrency ? `/currencies/${id}?lang=en` : `/items/${id}?lang=en`;
        const cacheKey = `en_name_${isCurrency ? 'curr_' : 'item_'}${id}`;
        
        try {
            // Cache for 30 days since item/currency names don't change
            const data = await this.fetchWithCache(endpoint, cacheKey, 30 * 24 * 60 * 60 * 1000, false);
            return data?.name || null;
        } catch (e) {
            console.error(`Error fetching English name for ${id}`, e);
            return null;
        }
    },

    // Validate key and permissions
    async validateApiKey(key) {
        const url = `${BASE_URL}/tokeninfo?access_token=${key}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Clé API incorrecte.");
        
        const info = await response.json();
        const requiredPermissions = ['account', 'progression', 'wallet', 'inventories', 'characters'];
        const missing = requiredPermissions.filter(p => !info.permissions.includes(p));
        
        if (missing.length > 0) {
            throw new Error(`Permissions manquantes : ${missing.join(', ')}.`);
        }
        return info;
    },

    // Account data
    async getAccountInfo() {
        return this.fetchWithCache('/account', 'account_info', 10 * 60 * 1000, true);
    },

    async getWallet() {
        return this.fetchWithCache('/account/wallet', 'wallet', 2 * 60 * 1000, true);
    },

    async getBank() {
        return this.fetchWithCache('/account/bank', 'bank', 3 * 60 * 1000, true);
    },

    async getGuildStash(guildId) {
        return this.fetchWithCache(`/guild/${guildId}/stash`, `guild_stash_${guildId}`, 5 * 60 * 1000, true);
    },

    async getAccountMaterials() {
        return this.fetchWithCache('/account/materials', 'account_materials', 5 * 60 * 1000, true);
    },

    async getMaterialsCategories() {
        const ids = [5, 6, 29, 30, 37, 38, 46, 49, 50];
        return this.fetchWithCache(`/materials?ids=${ids.join(',')}&lang=fr`, 'materials_categories', 24 * 60 * 60 * 1000, false);
    },

    async getGuildInfo(guildId) {
        return this.fetchWithCache(`/guild/${guildId}`, `guild_info_${guildId}`, 24 * 60 * 60 * 1000, false);
    },

    async getCharacters() {
        // Step 1: Get character names list
        const names = await this.fetchWithCache('/characters', 'char_names', 5 * 60 * 1000, true);
        if (!names || names.length === 0) return [];
        
        // Step 2: Fetch detailed characters
        // We do it in chunks of 50 to avoid URL length issues
        const results = [];
        const chunkSize = 50;
        for (let i = 0; i < names.length; i += chunkSize) {
            const chunk = names.slice(i, i + chunkSize);
            const encodedNames = chunk.map(encodeURIComponent).join(',');
            const endpoint = `/characters?ids=${encodedNames}`;
            const details = await this.fetchWithCache(endpoint, `chars_chunk_${i}`, 5 * 60 * 1000, true);
            if (Array.isArray(details)) {
                results.push(...details);
            } else {
                results.push(details);
            }
        }
        return results;
    },

    async getAccountAchievements() {
        return this.fetchWithCache('/account/achievements', 'account_achievements', 2 * 60 * 1000, true);
    },

    // Currencies list (all)
    async getCurrencies() {
        return this.fetchWithCache('/currencies?ids=all&lang=fr', 'all_currencies', 24 * 60 * 60 * 1000, false);
    },

    // Real-time market prices
    async getMarketPrices(ids) {
        if (!ids || ids.length === 0) return {};
        
        const uniqueIds = [...new Set(ids)];
        const results = {};
        const missingIds = [];

        // Try short term price cache (1 minute) to save API calls
        uniqueIds.forEach(id => {
            const cached = localStorage.getItem(CACHE_PREFIX + 'price_' + id);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (Date.now() - parsed.timestamp < 60 * 1000) {
                        results[id] = parsed.data;
                    } else {
                        missingIds.push(id);
                    }
                } catch (e) {
                    missingIds.push(id);
                }
            } else {
                missingIds.push(id);
            }
        });

        if (missingIds.length === 0) return results;

        // Chunk calls (max 200 items per call)
        const chunkSize = 150;
        for (let i = 0; i < missingIds.length; i += chunkSize) {
            const chunk = missingIds.slice(i, i + chunkSize);
            try {
                const url = `${BASE_URL}/commerce/prices?ids=${chunk.join(',')}`;
                const response = await fetch(url);
                if (response.ok) {
                    const pricesData = await response.json();
                    pricesData.forEach(price => {
                        results[price.id] = price;
                        localStorage.setItem(CACHE_PREFIX + 'price_' + price.id, JSON.stringify({
                            timestamp: Date.now(),
                            data: price
                        }));
                    });
                }
            } catch (e) {
                console.error("Error fetching market prices", e);
            }
        }

        return results;
    },

    // Seasons of the Dragons meta data and user progress
    async getSeasonsOfTheDragonsProgress() {
        const subAchievementIds = [
            5773, 5804, 5829, 5758, 5742, 5743, 5779, 5756, 5751, 5748,
            5948, 5884, 6005, 5901, 6023, 5995, 5888, 5991, 6024, 5886,
            5869, 5926, 5861, 5823
        ];
        
        // Fetch all 24 sub-achievements descriptions & names (caches for 24 hours)
        const subAchievementsDetailsList = await this.fetchWithCache(`/achievements?ids=${subAchievementIds.join(',')}&lang=fr`, 'sub_ach_details_all', 24 * 60 * 60 * 1000, false);
        if (!subAchievementsDetailsList) return null;
        
        // Fetch user progress
        const userProgressList = await this.getAccountAchievements();
        
        // Map details together in chronological order
        return subAchievementIds.map(id => {
            const ach = subAchievementsDetailsList.find(a => a.id === id);
            if (!ach) return null;
            const userProg = userProgressList.find(p => p.id === id);
            const maxCount = ach.tiers && ach.tiers.length > 0 ? ach.tiers[ach.tiers.length - 1].count : 1;
            return {
                id: ach.id,
                name: ach.name,
                description: ach.description,
                requirement: ach.requirement,
                done: userProg ? userProg.done : false,
                current: userProg ? (userProg.current !== undefined ? userProg.current : (userProg.done ? maxCount : 0)) : 0,
                max: maxCount
            };
        }).filter(Boolean);
    },

    // Get sub-achievements for a specific "Return to" achievement
    async getSeasonsAchievementDetails(metaId) {
        const metaToCategoryMap = {
            5773: 291, // Dry Top 1
            5804: 292, // Dry Top 2
            5829: 295, // Silverwastes 1
            5758: 286, // Silverwastes 2
            5742: 285, // Bloodstone Fen
            5743: 290, // Ember Bay
            5779: 289, // Bitterfrost Frontier
            5756: 288, // Lake Doric
            5751: 287, // Draconis Mons
            5748: 294, // Siren's Landing
            5948: 310, // Istan
            5884: 309, // Sandswept Isles
            6005: 300, // Kourna
            5901: 306, // Jahai Bluffs
            6023: 307, // Thunderhead Peaks
            5995: 304, // Dragonfall
            5888: 299, // Grothmar Valley
            5991: 298, // Bjora Marches 1
            6024: 303, // Bjora Marches 2
            5886: 301, // Eye of the North
            5869: 305, // Drizzlewood 1
            5926: 302, // Drizzlewood 2
            5861: 308, // Dragonstorm
            5823: 137  // Research (Current Events)
        };
        
        const catId = metaToCategoryMap[metaId];
        if (!catId) return null;
        
        // Fetch category details
        const category = await this.fetchWithCache(`/achievements/categories/${catId}?lang=fr`, `cat_${catId}`, 24 * 60 * 60 * 1000, false);
        if (!category || !category.achievements) return null;
        
        // Fetch details of all achievements in this category
        const achievementsDetails = await this.fetchWithCache(`/achievements?ids=${category.achievements.join(',')}&lang=fr`, `ach_details_cat_${catId}`, 24 * 60 * 60 * 1000, false);
        if (!achievementsDetails) return null;
        
        // Fetch user progress
        const userProgressList = await this.getAccountAchievements();
        
        // Map together
        return achievementsDetails
            .filter(ach => ach.id !== metaId) // Exclude the meta-achievement itself
            .map(ach => {
                const userProg = userProgressList.find(p => p.id === ach.id);
                return {
                    id: ach.id,
                    name: ach.name,
                    description: ach.description,
                    requirement: ach.requirement,
                    done: userProg ? userProg.done : false,
                    current: userProg ? userProg.current : 0,
                    max: userProg ? userProg.max : ach.tiers[0]?.count || 1
                };
            });
    }
};
