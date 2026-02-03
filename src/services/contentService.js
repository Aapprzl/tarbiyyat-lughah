import { curriculum as initialCurriculum, specialPrograms } from '../data/curriculum';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; // Added import
import { storageService } from './storageService';
import { auth } from '../firebaseConfig'; // Ensure auth is imported

const STORAGE_KEYS = {
  CURRICULUM: 'arp_curriculum',
  CONTENT_PREFIX: 'arp_content_',
};

// Helper: Simulate delay for realistic feel (can be removed later for pure speed)
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Timeout Promise
const timeout = (ms, promise) => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error("Request timed out"));
        }, ms);
        promise
            .then(value => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch(reason => {
                clearTimeout(timer);
                reject(reason);
            });
    });
};

// Helper: Stale-While-Revalidate for Single Docs
// Fetches from Firestore, Updates LocalStorage, Returns Data
// Helper: Stale-While-Revalidate for Single Docs
// STRICT MODE: Always fetch from Cloud. Update Local for backup only.
async function fetchAndCache(collectionName, docId, storageKey, defaultValue) {
    try {
        const docRef = doc(db, collectionName, docId);
        
        // Strict Fetch
        const snapshot = await getDoc(docRef);
        
        if (snapshot.exists()) {
            const data = snapshot.data();
            localStorage.setItem(storageKey, JSON.stringify(data));
            return data;
        } else {
            // Document missing in cloud. 
            // We can return default, but we should NOT return stale local data that conflicts with "missing".
            // However, if it's truly missing, maybe we want to seed it? 
            // Let's return default.
            if (defaultValue) {
                 // Optional: Auto-create default
                 setDoc(docRef, defaultValue).catch(e => console.warn("Background Init Failed:", e));
                 return defaultValue;
            }
            return null; // Or empty object?
        }
    } catch (e) {
        console.error(`[Sync] Error fetching ${docId}:`, e);
        // STRICT: Throw error or return default, but DO NOT return valid-looking stale data.
        throw new Error("Gagal mengambil data dari server.");
    }
}

// Helper: Save to Firestore & LocalStorage
// Helper: Save to Firestore & LocalStorage (Strict Sync)
// Helper: Save to Firestore & LocalStorage (Strict Sync)
async function saveToCloud(collectionName, docId, storageKey, data) {
    try {
        console.log(`[Sync] Saving ${docId} to Firestore...`);
        // Direct write without timeout
        await setDoc(doc(db, collectionName, docId), data);
        console.log(`[Sync] Success: ${docId}`);
        // Note: We do NOT save to localStorage here to avoid format conflicts (wrapper vs array).
        // The caller function (saveCurriculum etc) is responsible for updating LS with the correct format.
        return data;
    } catch (e) {
         console.error(`[Sync] FAILED saving ${docId} to cloud:`, e);
         throw new Error("Gagal menyimpan ke database. Periksa koneksi internet Anda atau permissions.");
    }
}

export const contentService = {
  // --- Curriculum Management ---
  async getCurriculum() {
    // Strict Sync: Use _fetchCurriculum to ensure fresh data from Cloud.
    // _fetchCurriculum handles the unwrap and LS update.
    return await this._fetchCurriculum();
  },
  
  async saveCurriculum(newCurriculum) {
      // Wrapper needed for Firestore
      await saveToCloud('settings', 'curriculum', STORAGE_KEYS.CURRICULUM, { items: newCurriculum });
      // Restore the simple array in LS for sync access legality
      localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(newCurriculum));
      return newCurriculum;
  },

  // Patched Internal Get for Curriculum that handles the wrapper logic for the helper
  // We'll manually override the helpers above for Curriculum to be safe.
  async _fetchCurriculum() {
      try {
        const docRef = doc(db, 'settings', 'curriculum');
        // STRICT READ: No fallback to LS if this fails.
        const snapshot = await getDoc(docRef);
        
        if (snapshot.exists()) {
             const val = snapshot.data().items || [];
             localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(val));
             return val;
        } else {
             // If document doesn't exist in cloud yet, we can try to initialize it?
             // Or return empty array?
             // Let's check LS for migration ONLY if doc is confirmed missing (not error).
             console.warn("Curriculum doc missing in cloud. Checking local...");
             const local = localStorage.getItem(STORAGE_KEYS.CURRICULUM);
             if (local) {
                  return JSON.parse(local);
             }
             return initialCurriculum;
        }
      } catch(e) { 
          console.error("[Sync] Error fetching curriculum:", e);
          // STRICT MODE: Throw error so we don't edit stale data
          throw new Error("Gagal memuat data terbaru dari server. Periksa koneksi Anda.");
      }
  },

  async updateTopicMetadata(topicId, { title, desc }) {
    const curr = await this._fetchCurriculum();
    let found = false;
    
    // Search in Main Curriculum
    for (const section of curr) {
      const topic = section.topics.find(t => t.id === topicId);
      if (topic) {
        if (title) topic.title = title;
        if (desc !== undefined) topic.desc = desc; 
        found = true;
        break;
      }
    }

    if (found) {
      await this.saveCurriculum(curr);
      return true;
    }

    const progs = await this.getSpecialPrograms();
    for (const category of progs) {
        if (category.topics) {
            const topic = category.topics.find(t => t.id === topicId);
            if (topic) {
                if (title) topic.title = title;
                if (desc !== undefined) topic.desc = desc;
                await this.saveSpecialPrograms(progs);
                return true;
            }
        }
    }
    return false;
  },

  // Deprecated/Alias
  async updateTopicTitle(topicId, newTitle) {
    return this.updateTopicMetadata(topicId, { title: newTitle });
  },

  async addNewTopic(sectionId, title) {
    const curr = await this._fetchCurriculum();
    const section = curr.find(s => s.id === sectionId);
    
    if (section) {
      let newId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (!newId) newId = `topic-${Date.now()}`;
      
      const newTopic = {
        id: newId,
        title: title,
        type: 'grammar' 
      };
      
      section.topics.push(newTopic);
      await this.saveCurriculum(curr);
      
      // Auto-initialize empty lesson document in cloud
      try {
          await setDoc(doc(db, 'lessons', newId), { content: "" });
          console.log(`[Content] Initialized empty lesson doc for: ${newId}`);
      } catch (e) {
          console.warn(`[Content] Failed to auto-initialize lesson doc: ${e.message}`);
      }
      
      return newTopic;
    }
    return null;
  },

  async addNewSection(title, iconName = 'BookOpen') {
    const curr = await this._fetchCurriculum();
    let newId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!newId) newId = `section-${Date.now()}`;
    
    const newSection = {
      id: newId,
      title: title,
      icon: iconName,
      topics: []
    };

    curr.push(newSection);
    await this.saveCurriculum(curr);

    // Auto-initialize category document in lessons collection for console visibility
    try {
        await setDoc(doc(db, 'lessons', newId), { content: "" });
        console.log(`[Content] Initialized category doc: ${newId}`);
    } catch (e) {
        console.warn(`[Content] Failed to auto-initialize category doc: ${e.message}`);
    }

    return newSection;
  },

  async updateSection(id, title, iconName) {
    const curr = await this._fetchCurriculum();
    const section = curr.find(s => s.id === id);
    
    if (section) {
      section.title = title;
      section.icon = iconName;
      await this.saveCurriculum(curr);
      return true;
    }
    return false;
  },

  async deleteSection(id) {
    const curr = await this._fetchCurriculum();
    const section = curr.find(s => s.id === id);
    if (!section) return false;

    // Cascade delete all topics in this section
    for (const topic of section.topics) {
        await this.cleanupLesson(topic.id);
    }

    const newCurr = curr.filter(s => s.id !== id);
    await this.saveCurriculum(newCurr);

    // Also delete the category document itself from lessons collection
    try {
        await deleteDoc(doc(db, 'lessons', id));
        console.log(`[Content] Deleted category doc: ${id}`);
    } catch (e) {
        console.warn(`[Content] Failed to delete category doc: ${e.message}`);
    }

    return true;
  },

  async deleteTopic(topicId) {
    const curr = await this._fetchCurriculum();
    let found = false;
    
    for (const section of curr) {
       const initialLength = section.topics.length;
       if (section.topics.some(t => t.id === topicId)) {
           // Cleanup files and doc first
           await this.cleanupLesson(topicId);
           
           section.topics = section.topics.filter(t => t.id !== topicId);
           found = true;
           break; 
       }
    }
    
    if (found) {
       await this.saveCurriculum(curr);
       return true;
    }
    return false;
  },

  // Helper: Cleanup Lesson (Files + Doc)
  async cleanupLesson(topicId) {
      try {
          console.log(`[Content] Cleaning up lesson: ${topicId}`);
          // 1. Get Content
          // We bypass cache and get straight from FS or attempt to load from getLessonContent logic
          // But getLessonContent might return static file if missing in DB. We only care about DB.
          const docRef = doc(db, 'lessons', topicId);
          const snapshot = await getDoc(docRef);
          
          if (snapshot.exists()) {
              const data = snapshot.data();
              const contentStr = typeof data.content === 'string' ? data.content : JSON.stringify(data); // Handle both string and object formats
              
              // 2. Find URLs (Regex is fastest for string dump)
              // Matches: https://firebasestorage.googleapis.com... ending with " or space or \n
              const urlRegex = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^"\s]+/g;
              const matches = contentStr.match(urlRegex) || [];
              
              // Use Set to remove duplicates
              const uniqueUrls = [...new Set(matches)];

              // 3. Delete Files
              if (uniqueUrls.length > 0) {
                  console.log(`[Content] Found ${uniqueUrls.length} file references. Deleting...`);
                  // Use Promise.allSettled to ensure one failure doesn't stop the rest
                  await Promise.allSettled(uniqueUrls.map(url => storageService.deleteFile(url)));
              }

              // 4. Delete Document
              await deleteDoc(docRef);
              console.log(`[Content] Deleted lesson doc: ${topicId}`);
          }
          
          // Clear LocalStorage Cache
          localStorage.removeItem(STORAGE_KEYS.CONTENT_PREFIX + topicId);
          localStorage.removeItem(`arp_materials_${topicId}`); // Legacy key just in case

      } catch (e) {
          console.error(`[Content] Failed to cleanup lesson ${topicId}:`, e);
      }
  },

  // --- Special Programs Management ---

  async getSpecialPrograms() {
      // Manually handle for strict sync
      try {
        const docRef = doc(db, 'settings', 'special_programs');
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
             const val = snapshot.data().items || [];
             localStorage.setItem('arp_special_programs', JSON.stringify(val));
             return val;
        }
        // If missing in cloud
        console.warn("Special Programs doc missing. checking local...");
        const local = localStorage.getItem('arp_special_programs');
        if (local) {
            // Migration opportunity?
             const parsed = JSON.parse(local);
             // Ensure it's wrapped
             let data = parsed;
              if (data.length > 0 && !data[0].topics) {
                data = [{ id: 'sp-migrated', title: 'Program Khusus', icon: 'Star', topics: parsed }];
             }
             return data;
        }
        return [];
      } catch(e) {
          console.error("[Sync] Error fetching special programs:", e);
           throw new Error("Gagal memuat data Program Khusus dari server.");
      }
  },

  async saveSpecialPrograms(progs) {
    await saveToCloud('settings', 'special_programs', 'arp_special_programs', { items: progs });
    localStorage.setItem('arp_special_programs', JSON.stringify(progs));
    return progs;
  },

  async updateSpecialProgram(id, newTitle, newDesc, newIcon) {
      const progs = await this.getSpecialPrograms();
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
      let newId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (!newId) newId = `program-${Date.now()}`;
      const newProg = {
          id: newId,
          title,
          desc,
          icon: iconName,
          path: `/program/${newId}`
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
              await this.cleanupLesson(topicId);
              
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
      let newId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (!newId) newId = `category-${Date.now()}`;
      
      const newCategory = {
          id: newId,
          title,
          icon: iconName,
          desc,
          topics: []
      };
      progs.push(newCategory);
      await this.saveSpecialPrograms(progs);

      // Auto-initialize category document in lessons collection for console visibility
      try {
          await setDoc(doc(db, 'lessons', newId), { content: "" });
          console.log(`[Content] Initialized special category doc: ${newId}`);
      } catch (e) {
          console.warn(`[Content] Failed to auto-initialize category doc: ${e.message}`);
      }

      return newCategory;
  },

  async updateSpecialCategory(categoryId, title, iconName, desc) {
      const progs = await this.getSpecialPrograms();
      const category = progs.find(c => c.id === categoryId);
      if (category) {
          category.title = title;
          if (iconName) category.icon = iconName;
          if (desc !== undefined) category.desc = desc;
          await this.saveSpecialPrograms(progs);
          return true;
      }
      return false;
  },

  async deleteSpecialCategory(categoryId) {
      const progs = await this.getSpecialPrograms();
      const category = progs.find(c => c.id === categoryId);
      
      if (category) {
          // Cascade delete topics
          if (category.topics) {
              for (const topic of category.topics) {
                  await this.cleanupLesson(topic.id);
              }
          }
          
          const newProgs = progs.filter(c => c.id !== categoryId);
          await this.saveSpecialPrograms(newProgs);

          // Also delete the category document itself from lessons collection
          try {
              await deleteDoc(doc(db, 'lessons', categoryId));
              console.log(`[Content] Deleted special category doc: ${categoryId}`);
          } catch (e) {
              console.warn(`[Content] Failed to delete category doc: ${e.message}`);
          }

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
          
          // Auto-initialize empty lesson document in cloud
          try {
              await setDoc(doc(db, 'lessons', uniqueId), { content: "" });
              console.log(`[Content] Initialized empty lesson doc for: ${uniqueId}`);
          } catch (e) {
              console.warn(`[Content] Failed to auto-initialize lesson doc: ${e.message}`);
          }

          return newTopic;
      }
      return null;
  },

  async getAllContent() {
    const [curr, special] = await Promise.all([
      this.getCurriculum(), // calling public method which calls _fetchCurriculum internally? No wait, getCurriculum calls fetchAndCache. I should update getCurriculum to use _fetchCurriculum logic or fix fetchAndCache. 
                            // Update: getCurriculum above uses fetchAndCache but wrapped logic was commented. Let's redirect to _fetchCurriculum for consistency.
      this.getSpecialPrograms()
    ]);
    
    // NOTE: If getCurriculum via fetchAndCache failed to return array, curr might be object {items:[]}. 
    // Ideally getCurriculum returns the array.
    const currArray = Array.isArray(curr) ? curr : (curr.items || initialCurriculum);
    const specialArray = Array.isArray(special) ? special : [];

    const items = [];
    
    specialArray.forEach(category => {
        if (category.topics) {
            category.topics.forEach(topic => {
                items.push({
                    id: topic.id,
                    title: topic.title,
                    desc: topic.desc,
                    type: 'special',
                    path: `/program/${topic.id}`,
                    icon: category.icon || 'Star',
                    categoryTitle: category.title
                });
            });
        }
    });

    currArray.forEach(section => {
        section.topics.forEach(topic => {
            items.push({
                id: topic.id,
                title: topic.title,
                desc: topic.desc,
                type: 'topic',
                path: `/materi/${topic.id}`, 
                icon: section.icon || 'BookOpen',
                sectionTitle: section.title
            });
        });
    });

    return items;
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
        sidebarTitle: 'اللغة العربية',
        headerTitleSize: 'text-lg',
        sidebarTitleSize: 'text-xl'
      };
      
      const stored = await fetchAndCache('settings', 'home_config', 'arp_home_config', defaults);
      return { ...defaults, ...stored }; 
  },

  getHomeConfigSync() {
    try {
        const stored = localStorage.getItem('arp_home_config');
        if (!stored) return null;
        return JSON.parse(stored);
    } catch (e) {
        return null; 
    }
  },

  async saveHomeConfig(config) {
    return await saveToCloud('settings', 'home_config', 'arp_home_config', config);
  },

  // --- About Page Config ---

  async getAboutConfig() {
      const defaults = {
          title: 'Tentang Kami',
          description: 'Kami berdedikasi untuk mempermudah pembelajaran bahasa Arab bagi penutur Indonesia dengan metode yang praktis, sistematis, dan modern.',
          content: 'Website ini didirikan oleh Ustadzah Maria Ulfah Syarif dengan visi mencetak generasi yang fasih berbahasa Al-Quran. Metode kami menggabungkan kaidah klasik (Nahwu Shorof) dengan pendekatan digital yang interaktif.\n\n### Visi Kami\nMenjadi platform rujukan utama belajar bahasa Arab di Indonesia.\n\n### Misi Kami\n1. Menyediakan materi yang mudah dipahami.\n2. Menggunakan teknologi untuk mempercepat pemahaman.\n3. Membangun komunitas pembelajar yang aktif.',
          email: 'info@bahasaarabpraktis.com',
          phone: '+62 812 3456 7890'
      };
      const stored = await fetchAndCache('settings', 'about_config', 'arp_about_config', defaults);
      return { ...defaults, ...stored };
  },

  async saveAboutConfig(config) {
      return await saveToCloud('settings', 'about_config', 'arp_about_config', config);
  },

  // --- Profile Config ---

    async getProfileConfig() {
        const defaults = { name: '', title: '', bio: '', photoUrl: '', email: '', socials: {}, pdfUrl: '' };
        const stored = await fetchAndCache('settings', 'profile_config', 'arp_profile_config', defaults);
        return { ...defaults, ...stored };
    },

    async saveProfileConfig(config) {
        return await saveToCloud('settings', 'profile_config', 'arp_profile_config', config);
    },

  // --- Copyright Config ---

  async getCopyrightConfig() {
      return await fetchAndCache('settings', 'copyright_config', 'arp_copyright_config', { pdfUrl: '' });
  },

  async saveCopyrightConfig(config) {
      return await saveToCloud('settings', 'copyright_config', 'arp_copyright_config', config);
  },

  // --- Content/Lesson Management ---

  async getLessonContent(topicId) {
    // Strategy: Cloud-Only Fetch
    try {
        const docRef = doc(db, 'lessons', topicId);
        const snapshot = await getDoc(docRef);
        
        if (snapshot.exists()) {
             const content = snapshot.data().content;
             localStorage.setItem(STORAGE_KEYS.CONTENT_PREFIX + topicId, content);
             return content;
        }
        
        // If not found in cloud, return empty string.
        // Legacy local file backup (/materi/*.md) has been removed.
        console.warn(`[Content] Lesson ${topicId} not found in Firestore.`);
        return "";
    } catch(e) {
        console.error(`Error loading lesson ${topicId}`, e);
        throw new Error("Gagal memuat konten materi dari server.");
    }
  },

  async saveLessonContent(topicId, content) {
    // Save to Cloud & Local
    await setDoc(doc(db, 'lessons', topicId), { content });
    localStorage.setItem(STORAGE_KEYS.CONTENT_PREFIX + topicId, content);
    return true;
  },

  // --- Auth (Firebase) ---
  
  async login(email, password) {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Throw to let UI handle specific error messages
    }
  },

  async logout() {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("Logout failed:", error);
      return false;
    }
  },

  // Auth State Listener
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Helper: Synchronous check for legacy compatibility or UI rendering
  // Note: auth.currentUser might be null on initial load even if logged in.
  isAuthenticated() {
    return !!auth.currentUser;
  },

  // --- Font Configuration ---

  async getFontConfig() {
    const defaults = {
        fontFamily: 'Cairo',
        latinFontFamily: 'Plus Jakarta Sans',
        titleSize: 'text-4xl',
        contentSize: 'text-xl',
        sidebarSize: 'text-2xl',
        sidebarLinkSize: 'text-lg',
        indexTopicSize: 'text-xl'
      };
    const stored = await fetchAndCache('settings', 'font_config', 'arp_font_config', defaults);
    return { ...defaults, ...stored };
  },

  async saveFontConfig(config) {
    return await saveToCloud('settings', 'font_config', 'arp_font_config', config);
  },

  // --- Theme Management ---
  getTheme() {
    return localStorage.getItem('arp_theme') || 'light';
  },

  saveTheme(theme) {
    localStorage.setItem('arp_theme', theme);
    return theme;
  }
};
