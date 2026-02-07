import { supabase } from '../supabaseClient';
import { curriculum as initialCurriculum } from '../data/curriculum';

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

// Fetch data from a table, returning default if error/empty
const fetchConfig = async (tableName, configId, defaultValue) => {
    // 1. Check Memory Cache
    if (configCache[configId]) {
        return configCache[configId];
    }

    // 2. Check LocalStorage (Sync Fallback for next reload)
    const stored = getFromStorage(configId);
    if (stored) {
        configCache[configId] = stored; // Hydrate memory cache
        // We still fetch fresh data in background to update, but we can return stored for now?
        // Better strategy: Return stored immediately if we were sync? 
        // For async fetchConfig, we prefer fresh data, but we can use stored as placeholder.
        // Let's rely on standard fetch but allow getSync to use stored.
    }

    try {
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('id', configId)
            .maybeSingle(); 

        if (error) {
            console.error(`[Supabase] Error fetching ${configId}:`, error);
            // Fallback to stored if available, else default
            return stored || defaultValue;
        }
        
        const val = data?.value || defaultValue;
        configCache[configId] = val; 
        saveToStorage(configId, val); // Persist
        return val;
    } catch (err) {
        console.error(`[Supabase] Unexpected error fetching ${configId}:`, err);
        return stored || defaultValue;
    }
};

// Save config to settings table (Key-Value Store pattern)
const saveConfig = async (configId, value) => {
    try {
        const { error } = await supabase
            .from('settings')
            .upsert({ id: configId, value: value });

        if (error) throw error;
        
        configCache[configId] = value; 
        saveToStorage(configId, value); // Persist
        return value;
    } catch (err) {
        console.error(`[Supabase] Error saving ${configId}:`, err);
        throw err;
    }
};


export const contentService = {
    // --- Curriculum Management ---
    
    async getCurriculum() {
        // In the future, this should be a real relational query.
        // For migration speed, we might store the whole JSON blob in 'settings' table first.
        return await fetchConfig('settings', 'curriculum', initialCurriculum);
    },

    async saveCurriculum(newCurriculum) {
        return await saveConfig('curriculum', newCurriculum);
    },

    // --- Granular Updates (Mirroring Firebase Service) ---

    async updateTopicMetadata(topicId, metadata) {
        const curr = await this.getCurriculum();
        // Handle array vs object wrapper if necessary, but getCurriculum should return array
        const curriculumArray = Array.isArray(curr) ? curr : (curr.items || []);
        
        let found = false;
        
        // Search in Main Curriculum
        for (const section of curriculumArray) {
            const topic = section.topics.find(t => t.id === topicId);
            if (topic) {
                if (metadata.title !== undefined && metadata.title !== null) topic.title = metadata.title;
                if (metadata.desc !== undefined) topic.desc = metadata.desc; 
                if (metadata.hasOwnProperty('isLocked')) topic.isLocked = metadata.isLocked;
                found = true;
                break;
            }
        }

        if (found) {
            await this.saveCurriculum(curriculumArray);
            return true;
        }

        // Search in Special Programs
        const progs = await this.getSpecialPrograms();
        const programsArray = Array.isArray(progs) ? progs : [];

        for (const category of programsArray) {
            if (category.topics) {
                const topic = category.topics.find(t => t.id === topicId);
                if (topic) {
                    if (metadata.title !== undefined && metadata.title !== null) topic.title = metadata.title;
                    if (metadata.desc !== undefined) topic.desc = metadata.desc;
                    if (metadata.hasOwnProperty('isLocked')) topic.isLocked = metadata.isLocked;
                    await this.saveSpecialPrograms(programsArray);
                    return true;
                }
            }
        }
        return false;
    },

    async updateTopicTitle(topicId, newTitle) {
        return this.updateTopicMetadata(topicId, { title: newTitle });
    },

    async addNewTopic(sectionId, title) {
        const curr = await this.getCurriculum();
        const curriculumArray = Array.isArray(curr) ? curr : (curr.items || []);
        
        const section = curriculumArray.find(s => s.id === sectionId);
        
        if (section) {
            let newId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            if (!newId) newId = `topic-${Date.now()}`;
            
            const newTopic = {
                id: newId,
                title: title,
                type: 'grammar' 
            };
            
            if (!section.topics) section.topics = [];
            section.topics.push(newTopic);
            
            await this.saveCurriculum(curriculumArray);
            
            // In Supabase version, we create the row to ensure consistency
            await this.initialiseLessonRow(newId);
            
            return newTopic;
        }
        return null;
    },

    async addNewSection(title, iconName = 'BookOpen', desc = '') {
        const curr = await this.getCurriculum();
        const curriculumArray = Array.isArray(curr) ? curr : (curr.items || []);

        let newId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        if (!newId) newId = `section-${Date.now()}`;
        
        const newSection = {
            id: newId,
            title: title,
            icon: iconName,
            desc: desc,
            topics: []
        };

        curriculumArray.push(newSection);
        await this.saveCurriculum(curriculumArray);
        return newSection;
    },

    async updateSection(id, title, icon, desc = null, options = {}) {
        const curr = await this.getCurriculum();
        const curriculumArray = Array.isArray(curr) ? curr : (curr.items || []);

        const section = curriculumArray.find(s => s.id === id);
        
        if (section) {
            if (title) section.title = title;
            if (icon) section.icon = icon;
            if (desc !== undefined && desc !== null) section.desc = desc;
            if (options.hasOwnProperty('isLocked')) section.isLocked = options.isLocked;
            await this.saveCurriculum(curriculumArray);
            return true;
        }
        return false;
    },

    async deleteSection(id) {
        const curr = await this.getCurriculum();
        const curriculumArray = Array.isArray(curr) ? curr : (curr.items || []);

        const section = curriculumArray.find(s => s.id === id);
        if (!section) return false;

        // Cascade delete topics? In JSON store, removing the section removes topics from the tree.
        // But we should cleanup 'lessons' table rows too.
        if (section.topics) {
            for (const topic of section.topics) {
                await this.deleteLessonRow(topic.id);
            }
        }

        const newCurr = curriculumArray.filter(s => s.id !== id);
        await this.saveCurriculum(newCurr);
        return true;
    },

    async deleteTopic(topicId) {
        const curr = await this.getCurriculum();
        const curriculumArray = Array.isArray(curr) ? curr : (curr.items || []);

        let found = false;
        
        for (const section of curriculumArray) {
            if (section.topics && section.topics.some(t => t.id === topicId)) {
                await this.deleteLessonRow(topicId);
                section.topics = section.topics.filter(t => t.id !== topicId);
                found = true;
                break; 
            }
        }
        
        if (found) {
            await this.saveCurriculum(curriculumArray);
            return true;
        }
        return false;
    },

    // --- Helper for Lessons Table ---
    async initialiseLessonRow(topicId) {
        try {
            const { error } = await supabase
                .from('lessons')
                .insert([{ id: topicId, content: "" }]); // content as JSONB or Text? Schema said JSONB or Text.
            if (error) console.error("Error init lesson row:", error);
        } catch(e) { console.error("Error init lesson row:", e); }
    },

    async deleteLessonRow(topicId) {
        try {
            const { error } = await supabase.from('lessons').delete().eq('id', topicId);
            if (error) console.error("Error deleting lesson row:", error);
        } catch(e) { console.error("Error deleting lesson row:", e); }
    },

    // --- Content / Lesson Management ---

    async getLessonContent(topicId) {
        try {
            const { data, error } = await supabase
                .from('lessons')
                .select('content')
                .eq('id', topicId)
                .maybeSingle();

            if (error) throw error;
            
            // If data exists, return content. If not, return null? 
            // The UI might expect a certain format.
            if (!data) return null;
            
            // Content is stored as JSONB or Text.
            // If it's a JSON object/string, we returns it as is.
            return data.content;
        } catch (e) {
            console.error(`[Supabase] Error fetching lesson content ${topicId}:`, e);
            throw e; 
        }
    },

    async saveLessonContent(topicId, content) {
        try {
            // Upsert (Insert or Update)
            const { error } = await supabase
                .from('lessons')
                .upsert({ id: topicId, content: content }, { onConflict: 'id' });

            if (error) throw error;
            return true;
        } catch (e) {
            console.error(`[Supabase] Error saving lesson content ${topicId}:`, e);
            throw e;
        }
    },

    
    // --- Special Programs Management ---
    // Ensure we handle the "Array" vs "Wrapped Object" structure consistently.
    // getSpecialPrograms returns an ARRAY.

    async getSpecialPrograms() {
        const data = await fetchConfig('settings', 'special_programs', { items: [] });
        // Handle both wrapped { items: [...] } and direct array formats
        if (Array.isArray(data)) return data;
        return data?.items || [];
    },

    async saveSpecialPrograms(progs) {
        return await saveConfig('special_programs', { items: progs });
    },

    async updateSpecialProgram(id, newTitle, newDesc, newIcon) {
        const progs = await this.getSpecialPrograms();
        // progs is an ARRAY here because getSpecialPrograms unwraps it.
        
        const p = progs.find(p => p.id === id);
        if (p) {
            p.title = newTitle;
            if (newDesc) p.desc = newDesc;
            if (newIcon) p.icon = newIcon;
            await this.saveSpecialPrograms(progs);
            return true;
        }
        return false;
    },

    async addNewSpecialProgram(title, desc, iconName) {
        const progs = await this.getSpecialPrograms();
        
        let baseId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const newId = `${baseId}-${Date.now()}`;
        
        const newProg = {
            id: newId,
            title,
            desc,
            icon: iconName,
            path: `/program/${newId}`,
            items: []
        };
        progs.push(newProg);
        await this.saveSpecialPrograms(progs);
        return newProg;
    },

    async deleteSpecialProgram(categoryId, topicId) {
        const progs = await this.getSpecialPrograms();
        
        const category = progs.find(c => c.id === categoryId);
        if (category && category.topics) {
            if (category.topics.some(t => t.id === topicId)) {
                await this.deleteLessonRow(topicId); // Clean DB row
                category.topics = category.topics.filter(t => t.id !== topicId);
                await this.saveSpecialPrograms(progs);
                return true;
            }
        }
        return false;
    },

    // --- Special Programs Category ---

    async addSpecialCategory(title, iconName, desc = '') {
        const progs = await this.getSpecialPrograms();

        let baseId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const newId = `${baseId}-${Date.now()}`;
        
        const newCategory = {
            id: newId,
            title,
            icon: iconName,
            desc,
            topics: [],
            items: []
        };
        progs.push(newCategory);
        await this.saveSpecialPrograms(progs);
        
        await this.initialiseLessonRow(newId);

        return newCategory;
    },

    async updateSpecialCategory(categoryId, title, iconName, desc, options = {}) {
        const progs = await this.getSpecialPrograms();
        
        const category = progs.find(c => c.id === categoryId);
        if (category) {
            if (title) category.title = title;
            if (iconName) category.icon = iconName;
            if (desc !== undefined && desc !== null) category.desc = desc;
            if (options.hasOwnProperty('isLocked')) category.isLocked = options.isLocked;
            
            await this.saveSpecialPrograms(progs);
            return true;
        }
        return false;
    },

    async syncCategoryItems(categoryId, syncItems) {
        const progs = await this.getSpecialPrograms();
        
        const category = progs.find(c => c.id === categoryId);
        if (category) {
            category.items = syncItems.map(item => ({
                id: item.id,
                type: item.type,
                title: item.data?.title || item.title || 'Untitled',
                thumbnail: item.data?.thumbnail || null
            }));
            await this.saveSpecialPrograms(progs);
            return true;
        }
        return false;
    },

    async deleteSpecialCategory(categoryId) {
        const progs = await this.getSpecialPrograms();
        
        const category = progs.find(c => c.id === categoryId);
        
        if (category) {
            if (category.topics) {
                for (const topic of category.topics) {
                    await this.deleteLessonRow(topic.id);
                }
            }
            
            const newProgs = progs.filter(c => c.id !== categoryId);
            await this.saveSpecialPrograms(newProgs);
            await this.deleteLessonRow(categoryId);

            return true;
        }
        return false;
    },

    async addSpecialTopic(categoryId, title) {
        const progs = await this.getSpecialPrograms();
        
        const category = progs.find(c => c.id === categoryId);
        if (category) {
            const baseId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            const uniqueId = `${baseId}-${Date.now().toString(36)}`;
            
            const newTopic = { id: uniqueId, title };
            if (!category.topics) category.topics = [];
            category.topics.push(newTopic);
            await this.saveSpecialPrograms(progs);
            
            await this.initialiseLessonRow(uniqueId);

            return newTopic;
        }
        return null;
    },
    
    // --- Home Page Config ---

    async getHomeConfig() {
         const defaults = {
            heroTitleArabic: 'العربيّة لغة عملية',
            heroTitleLatin: 'Bahasa Arab Praktis',
            heroDescription: 'Media pembelajaran bahasa Arab terstruktur untuk penutur Indonesia. Kuasai Nahwu dan Shorof dengan metode yang sistematis dan mudah dipahami.',
            heroButtonText: 'Mulai Belajar',
            heroButtonSecondaryText: 'Tentang Kami',
            programsSectionTitle: 'Program Unggulan',
            footerText: `© ${new Date().getFullYear()} Maria Ulfah Syarif. All rights reserved.`,
            siteTitle: 'Bahasa Arab Praktis',
            siteLogoType: 'icon', 
            siteLogoIcon: 'BookOpen',
            siteLogoUrl: '',
            sidebarTitle: 'Platform Pembelajaran Modern',
            headerTitleSize: 'text-lg',
            sidebarTitleSize: 'text-[10px]',
            visionTitle: 'Visi Tarbiyyat Al-Lughah',
            visionDesc: 'Tarbiyyat al-Lughah adalah ekosistem Next-Gen Interactive Learning yang dirancang khusus untuk merevolusi cara siswa MTs menguasai Maharah Qira\'ah (Kemampuan Membaca).',
            visionStep1Title: 'Kosakata Visual',
            visionStep1Desc: 'Penguasaan mufradat melalui kartu kosakata 3D yang interaktif.',
            visionStep2Title: 'Qira\'ah Digital',
            visionStep2Desc: 'Praktik membaca teks terstruktur dengan dukungan multimedia.',
            visionStep3Title: 'Game Edukasi',
            visionStep3Desc: 'Evaluasi pemahaman melalui tantangan gamifikasi yang seru.',
            contactPhone: '0822 6686 2306',
            contactEmail: 'icalafrizal550790@gmail.com',
            contactAddress: '(Alamat akan segera diperbarui)',
            devName: 'Muh. Aprizal',
            devRole: 'Developer',
            devCampus: 'PBA IAIN BONE',
            visionBadgeText: 'Skripsi Original Project',
            footerStackTitle: 'Development Stack',
            footerToolsTitle: 'Tools & Editors',
            footerToolsList: 'VS Code • Google Antigravity • Sublime Text',
            footerBackendTitle: 'Backend & Infrastructure',
            footerBackendList: 'Supabase • PostgreSQL • Vercel • Node.js',
            footerAiTitle: 'Powered by AI Technology',
            footerAiList: 'Powered by AI Technology', 
            footerRightText: 'PBA IAIN Bone'
        };
        // We will need to copy the full defaults object here eventually
        return await fetchConfig('settings', 'home_config', defaults);
    },

    // Sync version for initial render in Header.jsx (returns null to force default)
    getHomeConfigSync() {
        return configCache['home_config'] || getFromStorage('home_config') || null; 
    },

    async saveHomeConfig(config) {
        return await saveConfig('home_config', config);
    },

    // --- Access Configs (Intro, About, Library, etc) ---
    async getIntroConfig() {
        const defaults = {
            intro_active: true,
            intro_title_ar: 'تربية اللغة',
            intro_title_en: 'Tarbiyyat Lughah',
            intro_typing_texts: [
                "Menghubungkan Hati dengan Bahasa Al-Qur'an",
                "Media Pembelajaran Interaktif & Terstruktur",
                "Kuasai Maharah Qira'ah dengan Menyenangkan",
                "Teknologi Digital untuk Pendidikan Bahasa"
            ],
            intro_button_text: 'Mulai Belajar'
        };
        const stored = await fetchConfig('settings', 'intro_config', {});
        return { ...defaults, ...stored };
    },
    async saveIntroConfig(config) {
        return await saveConfig('intro_config', config);
    },
    
    async getAboutConfig() {
        const defaults = {
            title: 'Tentang Kami',
            description: 'Kami berdedikasi untuk mempermudah pembelajaran bahasa Arab bagi penutur Indonesia dengan metode yang praktis, sistematis, dan modern.',
            content: 'Website ini didirikan oleh Ustadzah Maria Ulfah Syarif dengan visi mencetak generasi yang fasih berbahasa Al-Quran. Metode kami menggabungkan kaidah klasik (Nahwu Shorof) dengan pendekatan digital yang interaktif.\n\n### Visi Kami\nMenjadi platform rujukan utama belajar bahasa Arab di Indonesia.\n\n### Misi Kami\n1. Menyediakan materi yang mudah dipahami.\n2. Menggunakan teknologi untuk mempercepat pemahaman.\n3. Membangun komunitas pembelajar yang aktif.',
            email: 'info@bahasaarabpraktis.com',
            phone: '+62 812 3456 7890'
        };
        const stored = await fetchConfig('settings', 'about_config', {});
        return { ...defaults, ...stored };
    },
    async saveAboutConfig(config) {
        return await saveConfig('about_config', config);
    },

    async getLibraryConfig() {
        return await fetchConfig('settings', 'library_config', { categories: ['Umum', 'Nahwu', 'Shorof', 'Lughah'] });
    },
    async saveLibraryConfig(config) {
        return await saveConfig('library_config', config);
    },

    async getGameHubConfig() {
        return await fetchConfig('settings', 'game_hub_config', {});
    },
    async saveGameHubConfig(config) {
        return await saveConfig('game_hub_config', config);
    },

    // --- Theme Config ---
    getTheme() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    },

    saveTheme(newTheme) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', newTheme);
        }
        return newTheme;
    },

    async getFontConfig() {
        return await fetchConfig('settings', 'font_config', {});
    },

    getFontConfigSync() {
        return configCache['font_config'] || getFromStorage('font_config') || null;
    },
    async saveFontConfig(config) {
        return await saveConfig('font_config', config);
    },

    
    // --- Supabase Auth Implementation ---
    
    async login(email, password) {
         const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data.user;
    },

    async register(email, password) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
        return data.user;
    },
    
    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return true;
    },
    
    // Auth State Listener
    onAuthStateChange(callback) {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
            // event: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
            // callback expects 'user' object or null
            callback(session?.user || null);
        });
        
        // Return unsubscribe function
        return () => data.subscription.unsubscribe();
    },

    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },
    
    isAuthenticated() {
         // Using synchronous check of session from localStorage if possible would be ideal,
         // but Supabase is async. 
         // For now, we return a promise or usage in AdminLayout handles the waiting.
         // However, if some code expects sync true/false, this is tricky.
         // Let's rely on onAuthStateChange for critical flows.
         // This is a "best guess" sync check for UI bits that don't want to wait.
         // We can check if the token exists in localStorage.
         if (typeof window !== 'undefined') {
             const key = `sb-${import.meta.env.VITE_SUPABASE_URL?.split('//')[1].split('.')[0]}-auth-token`;
             // Actually Supabase key generation is complex.
             // Simpler: Check if we have any key starting with 'sb-' and ending with '-auth-token'
             // Or just return null and let the async listener handle it.
             return false; // Deprecated in favor of async listener
         }
         return false;
    },

    // --- Unified Search Content ---
    async getAllContent() {
        const content = [];
        
        // 1. Main Curriculum
        const curriculum = await this.getCurriculum();
        const currArray = Array.isArray(curriculum) ? curriculum : (curriculum.items || []);
        
        currArray.forEach(section => {
            if (section.topics) {
                section.topics.forEach(topic => {
                    content.push({
                        title: topic.title,
                        desc: topic.desc || 'Materi pembelajaran',
                        path: `/materi/${section.id}/${topic.id}`,
                        icon: section.icon || 'BookOpen',
                        sectionTitle: section.title
                    });
                });
            }
        });

        // 2. Special Programs
        const programs = await this.getSpecialPrograms();
        const progArray = Array.isArray(programs) ? programs : (programs.items || []);

        progArray.forEach(prog => {
             // Program Category
             content.push({
                 title: prog.title,
                 desc: prog.desc || 'Program Khusus',
                 path: `/program/${prog.id}`,
                 icon: prog.icon || 'Star',
                 sectionTitle: 'Program Unggulan'
             });
             
             // Program Items/Topics
             if (prog.topics) {
                 prog.topics.forEach(topic => {
                     content.push({
                        title: topic.title,
                        desc: 'Topik Program Khusus',
                        path: `/program/${prog.id}?item=${topic.id}`, // Assuming query param or sub-route
                        icon: prog.icon,
                        sectionTitle: prog.title
                     });
                 });
             }
             if (prog.items) {
                 prog.items.forEach(item => {
                     content.push({
                        title: item.title || item.data?.title || 'Item',
                        desc: 'Konten Program Khusus',
                        path: `/program/${prog.id}?item=${item.id}`,
                        icon: prog.icon,
                        sectionTitle: prog.title
                     });
                 });
             }
        });
        
        return content;
    },

    // --- Library Management ---
    async getBooks() {
        return await fetchConfig('settings', 'library_books', []);
    },

    async addBook(bookData) {
        const books = await this.getBooks();
        const newBook = { ...bookData, id: bookData.id || `book-${Date.now()}` };
        books.push(newBook);
        await saveConfig('library_books', books);
        return newBook;
    },

    async deleteBook(bookId) {
        const books = await this.getBooks();
        const newBooks = books.filter(b => b.id !== bookId);
        await saveConfig('library_books', newBooks);
        return true;
    }
};
