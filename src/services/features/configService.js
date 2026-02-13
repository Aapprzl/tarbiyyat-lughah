import contentServiceV2 from '../contentServiceV2';

// In-memory cache to prevent blinking on navigation
const configCache = {};

// Helper to get from storage safely
const getFromStorage = (key) => {
    if (typeof window !== 'undefined') {
        try {
            const item = localStorage.getItem(`config_${key}`);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from localStorage', e);
            return null;
        }
    }
    return null;
};

// Helper to save to storage safely
const saveToStorage = (key, value) => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(`config_${key}`, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage', e);
        }
    }
};

export const configService = {
    async getFontConfig() {
        try {
            const config = await contentServiceV2.siteConfig.getFontConfig();
            if (config) {
                configCache['font_config'] = config;
                saveToStorage('font_config', config);
            }
            return config || {};
        } catch (error) {
            return getFromStorage('font_config') || {};
        }
    },

    getFontConfigSync() {
        return configCache['font_config'] || getFromStorage('font_config') || null;
    },

    async saveFontConfig(config) {
        try {
            await contentServiceV2.siteConfig.saveFontConfig(config);
            configCache['font_config'] = config;
            saveToStorage('font_config', config);
            return config;
        } catch (error) { throw error; }
    },

    async getHomeConfig() {
        try {
            const config = await contentServiceV2.siteConfig.getHomeConfig();
            if (config) {
                configCache['home_config'] = config;
                saveToStorage('home_config', config);
            }
            return config || {};
        } catch (error) {
             return getFromStorage('home_config') || {};
        }
    },

    getHomeConfigSync() {
        return configCache['home_config'] || getFromStorage('home_config') || null;
    },

    async saveHomeConfig(config) {
        try {
            await contentServiceV2.siteConfig.saveHomeConfig(config);
            configCache['home_config'] = config;
            saveToStorage('home_config', config);
            return config;
        } catch (error) { throw error; }
    },

    async getIntroConfig() {
         try {
            const config = await contentServiceV2.siteConfig.getIntroConfig();
            return config || {};
        } catch { return {}; }
    },

    async saveIntroConfig(config) {
         try {
            await contentServiceV2.siteConfig.saveIntroConfig(config);
            return config;
        } catch (error) { throw error; }
    },

    async getLibraryConfig() {
         try {
            const config = await contentServiceV2.siteConfig.getLibraryConfig();
            return config || { categories: [] };
        } catch (error) { return { categories: [] }; }
    },

    async saveLibraryConfig(config) {
         try {
            await contentServiceV2.siteConfig.saveLibraryConfig(config);
            return config;
        } catch (error) { throw error; }
    },

    getTheme() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('arp_theme') || 'light';
        }
        return 'light';
    },

    saveTheme(newTheme) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('arp_theme', newTheme);
        }
        return newTheme;
    }
};
