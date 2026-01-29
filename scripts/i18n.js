// ===== Pokechill i18n System =====
// Multi-language support with dynamic templates and lazy loading

const i18n = {
    currentLang: 'en',
    fallbackLang: 'en',
    translations: {
        ui: {},
        moves: {},
        items: {},
        abilities: {},
        pokemon: {},
        buffs: {}
    },
    stats: {
        en: { ui: 0, moves: 0, items: 0, abilities: 0, pokemon: 0, buffs: 0 },
        fr: { ui: 0, moves: 0, items: 0, abilities: 0, pokemon: 0, buffs: 0 }
    },

    // Register translations for a category
    register(category, lang, data) {
        if (!this.translations[category]) this.translations[category] = {};
        if (!this.translations[category][lang]) this.translations[category][lang] = {};

        Object.assign(this.translations[category][lang], data);

        // Update stats
        if (!this.stats[lang]) this.stats[lang] = {};
        this.stats[lang][category] = Object.keys(this.translations[category][lang]).length;
    },

    // Get raw translation with fallback
    get(category, key, lang = null) {
        lang = lang || this.currentLang;

        // Try current language
        if (this.translations[category]?.[lang]?.[key]) {
            return this.translations[category][lang][key];
        }

        // Fallback to English
        if (lang !== this.fallbackLang && this.translations[category]?.[this.fallbackLang]?.[key]) {
            return this.translations[category][this.fallbackLang][key];
        }

        return null;
    },

    // Process template string with dynamic values
    // Example: "Increases damage by x{power}" with {power: 1.5} => "Increases damage by x1.5"
    template(str, values = {}) {
        if (!str) return '';
        return str.replace(/\{(\w+)\}/g, (match, key) => {
            if (values.hasOwnProperty(key)) {
                return values[key];
            }
            // Try to get global tags (tagBurn, tagRainy, etc.)
            if (typeof window !== 'undefined' && window['tag' + key.charAt(0).toUpperCase() + key.slice(1)] !== undefined) {
                return window['tag' + key.charAt(0).toUpperCase() + key.slice(1)];
            }
            return match; // Keep original if not found
        });
    },

    // UI text translation
    t(key, values = {}) {
        const text = this.get('ui', key);
        return this.template(text || key, values);
    },

    // ===== MOVES =====

    getMoveName(moveKey) {
        const translation = this.get('moves', moveKey);
        if (translation?.name) return translation.name;

        // Convert camelCase to Title Case as fallback
        return this._formatKey(moveKey);
    },

    getMoveInfo(moveKey, values = {}) {
        const translation = this.get('moves', moveKey);
        if (translation?.info) {
            return this.template(translation.info, values);
        }
        return '';
    },

    // ===== ITEMS =====

    getItemName(itemKey) {
        const translation = this.get('items', itemKey);
        if (translation?.name) return translation.name;

        return this._formatKey(itemKey);
    },

    getItemInfo(itemKey, values = {}) {
        const translation = this.get('items', itemKey);
        if (translation?.info) {
            return this.template(translation.info, values);
        }
        return '';
    },

    // ===== ABILITIES =====

    getAbilityName(abilityKey) {
        const translation = this.get('abilities', abilityKey);
        if (translation?.name) return translation.name;

        return this._formatKey(abilityKey);
    },

    getAbilityInfo(abilityKey, values = {}) {
        const translation = this.get('abilities', abilityKey);
        if (translation?.info) {
            return this.template(translation.info, values);
        }
        return '';
    },

    // ===== POKEMON =====

    getPokemonName(pkmnKey) {
        const translation = this.get('pokemon', pkmnKey);
        if (translation?.name) return translation.name;

        // Special formatting for pokemon names
        let name = pkmnKey;
        name = name.replace(/^mega/, 'M. ');
        name = name.replace(/^hisuian/, 'Hsn. ');
        name = name.replace(/^alolan/, 'Aln. ');
        name = name.replace(/^galarian/, 'Glr. ');
        name = name.replace(/Gmax$/, ' (Gmax)');
        name = name.replace(/Clone$/, ' (Clone)');

        return name.charAt(0).toUpperCase() + name.slice(1);
    },

    // ===== BUFFS =====

    getBuffName(buffKey) {
        const translation = this.get('buffs', buffKey);
        if (translation?.name) return translation.name;
        return this._formatKey(buffKey);
    },

    getBuffInfo(buffKey) {
        const translation = this.get('buffs', buffKey);
        if (translation?.info) return translation.info;
        return '';
    },

    // ===== UTILITY =====

    // Convert camelCase to Title Case
    _formatKey(key) {
        return key
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\b\w/g, c => c.toUpperCase());
    },

    // Calculate translation progress for a language
    getProgress(lang) {
        if (lang === 'en') return 100;

        const enStats = this.stats.en;
        const langStats = this.stats[lang] || {};

        let totalEn = 0;
        let totalTranslated = 0;

        for (const category in enStats) {
            totalEn += enStats[category] || 0;
            totalTranslated += langStats[category] || 0;
        }

        if (totalEn === 0) return 0;
        return Math.round((totalTranslated / totalEn) * 100);
    },

    // Change language and reload translations
    async setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('pokechill-lang', lang);

        await this.loadLanguage(lang);
        this.refreshUI();
    },

    // Load language files dynamically
    async loadLanguage(lang) {
        const categories = ['ui', 'moves', 'items', 'abilities', 'pokemon', 'buffs'];

        for (const category of categories) {
            try {
                await this.loadScript(`scripts/i18n/${category}/${lang}.js`);
            } catch (err) {
                // Silent fail - file might not exist yet
            }
        }
    },

    // Load script dynamically
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    // Refresh UI with new translations
    refreshUI() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        if (window.refreshTranslations) {
            window.refreshTranslations();
        }
    },

    // Initialize i18n system
    async init() {
        const savedLang = localStorage.getItem('pokechill-lang') || 'en';
        this.currentLang = savedLang;

        // Always load English first (base language)
        await this.loadLanguage('en');

        // Then load selected language if different
        if (savedLang !== 'en') {
            await this.loadLanguage(savedLang);
        }

        setTimeout(() => this.refreshUI(), 100);
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
    i18n.init();
}
