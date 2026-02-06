import { curriculum as initialCurriculum, specialPrograms } from '../data/curriculum';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, getDocs, collection, deleteDoc, query, where } from 'firebase/firestore';
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
             // Self-healing check
             const cleaned = Array.isArray(val) ? val.map(section => ({
                 ...section,
                 title: section.title || 'Untitled Category',
                 icon: section.icon || 'BookOpen',
                 topics: (Array.isArray(section.topics) ? section.topics : []).map(t => ({
                     ...t,
                     title: t?.title || 'Untitled Topic'
                 }))
             })) : [];
             localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(cleaned));
             return cleaned;
        } else {
             console.warn("Curriculum doc missing in cloud. Checking local...");
             const local = localStorage.getItem(STORAGE_KEYS.CURRICULUM);
             if (local && local !== "null" && local !== "undefined") {
                  try {
                    const parsed = JSON.parse(local);
                    return Array.isArray(parsed) ? parsed : initialCurriculum;
                  } catch(e) { return initialCurriculum; }
             }
             return initialCurriculum;
        }
      } catch(e) { 
          console.error("[Sync] Error fetching curriculum:", e);
          // STRICT MODE: Throw error so we don't edit stale data
          throw new Error("Gagal memuat data terbaru dari server. Periksa koneksi Anda.");
      }
  },

  async updateTopicMetadata(topicId, metadata) {
    const curr = await this._fetchCurriculum();
    const { title, desc, isLocked } = metadata;
    let found = false;
    
    // Search in Main Curriculum
    for (const section of curr) {
      const topic = section.topics.find(t => t.id === topicId);
      if (topic) {
        if (title !== undefined && title !== null) topic.title = title;
        if (desc !== undefined) topic.desc = desc; 
        if (metadata.hasOwnProperty('isLocked')) topic.isLocked = isLocked;
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
                if (title !== undefined && title !== null) topic.title = title;
                if (desc !== undefined) topic.desc = desc;
                if (metadata.hasOwnProperty('isLocked')) topic.isLocked = isLocked;
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

  async updateSection(id, title, icon, options = {}) {
    const curr = await this._fetchCurriculum();
    const section = curr.find(s => s.id === id);
    
    if (section) {
      if (title) section.title = title;
      if (icon) section.icon = icon;
      if (options.hasOwnProperty('isLocked')) section.isLocked = options.isLocked;
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

    // Also delete the category document itself from lessons collection with proper cleanup
    try {
        await this.cleanupLesson(id);
        console.log(`[Content] Cleaned up category doc: ${id}`);
    } catch (e) {
        console.warn(`[Content] Failed to cleanup category doc: ${e.message}`);
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
             // Self-healing: Ensure no null titles/icons from previous bugs
             const cleaned = Array.isArray(val) ? val.map(cat => ({
                 ...cat,
                 title: cat.title || 'Untitled Category',
                 icon: cat.icon || 'Star',
                 // Preserving legacy topics for safety, but primary data is now 'items'
                 topics: (Array.isArray(cat.topics) ? cat.topics : []).map(t => ({
                     ...t,
                     title: t?.title || 'Untitled Topic'
                 })),
                 items: (Array.isArray(cat.items) ? cat.items : []) // New Content Items
             })) : [];
             localStorage.setItem('arp_special_programs', JSON.stringify(cleaned));
             return cleaned;
        }
        // If missing in cloud
        console.warn("Special Programs doc missing. checking local...");
        const local = localStorage.getItem('arp_special_programs');
        if (local && local !== "null" && local !== "undefined") {
             try {
                 const parsed = JSON.parse(local);
                 if (!Array.isArray(parsed)) return [];
                 // Migration opportunity?
                 let data = parsed;
                 if (data.length > 0 && !data[0].topics) {
                    data = [{ id: 'sp-migrated', title: 'Program Khusus', icon: 'Star', topics: parsed, items: [] }];
                 }
                 return data;
             } catch(e) { return []; }
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
          topics: [],
          items: [] // Initialize with empty items
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

  async syncCategoryItems(categoryId, items) {
      const progs = await this.getSpecialPrograms();
      const category = progs.find(c => c.id === categoryId);
      if (category) {
          // Store minimal metadata for the grid view
          category.items = items.map(item => ({
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
          // Cascade delete topics
          if (category.topics) {
              for (const topic of category.topics) {
                  await this.cleanupLesson(topic.id);
              }
          }
          
          const newProgs = progs.filter(c => c.id !== categoryId);
          await this.saveSpecialPrograms(newProgs);

          // Also delete the category document itself from lessons collection with proper cleanup
          try {
              await this.cleanupLesson(categoryId);
              console.log(`[Content] Cleaned up special category doc: ${categoryId}`);
          } catch (e) {
              console.warn(`[Content] Failed to cleanup category doc: ${e.message}`);
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
        sidebarTitle: 'Platform Pembelajaran Modern',
        headerTitleSize: 'text-lg',
        sidebarTitleSize: 'text-[10px]',
        // Vision Section Defaults
        visionTitle: 'Visi Tarbiyyat Al-Lughah',
        visionDesc: 'Tarbiyyat al-Lughah adalah ekosistem Next-Gen Interactive Learning yang dirancang khusus untuk merevolusi cara siswa MTs menguasai Maharah Qira\'ah (Kemampuan Membaca).',
        visionStep1Title: 'Kosakata Visual',
        visionStep1Desc: 'Penguasaan mufradat melalui kartu kosakata 3D yang interaktif.',
        visionStep2Title: 'Qira\'ah Digital',
        visionStep2Desc: 'Praktik membaca teks terstruktur dengan dukungan multimedia.',
        visionStep3Title: 'Game Edukasi',
        visionStep3Desc: 'Evaluasi pemahaman melalui tantangan gamifikasi yang seru.',
        // Contact Defaults
        contactPhone: '0822 6686 2306',
        contactEmail: 'icalafrizal550790@gmail.com',
        contactAddress: '(Alamat akan segera diperbarui)',
        devName: 'Muh. Aprizal',
        devRole: 'Developer',
        devCampus: 'PBA IAIN BONE',
        visionBadgeText: 'Skripsi Original Project',
        // Footer Stack Defaults
        footerStackTitle: 'Development Stack',
        footerToolsTitle: 'Tools & Editors',
        footerToolsList: 'VS Code • Google Antigravity • Sublime Text',
        footerBackendTitle: 'Backend & Infrastructure',
        footerBackendList: 'Firebase Backend • Google Cloud Console • Git • Node.js',
        footerAiTitle: 'Powered by AI Technology',
        footerAiList: 'ChatGPT • Gemini • GitHub Copilot',
        // Footer Bottom Right
        footerRightText: 'PBA IAIN Bone'
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

  // --- Intro Page Config ---

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
      
      const stored = await fetchAndCache('settings', 'intro_config', 'arp_intro_config', defaults);
      return { ...defaults, ...stored };
  },

  async saveIntroConfig(config) {
      return await saveToCloud('settings', 'intro_config', 'arp_intro_config', config);
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

  // --- Library Management ---
  async getLibraryConfig() {
    const defaults = { categories: ['Umum', 'Nahwu', 'Shorof', 'Lughah'] };
    const stored = await fetchAndCache('settings', 'library_config', 'arp_library_config', defaults);
    return { ...defaults, ...stored };
  },

  async saveLibraryConfig(config) {
    return await saveToCloud('settings', 'library_config', 'arp_library_config', config);
  },

  async getBooks() {
    const q = query(collection(db, 'lessons'), where('type', '==', 'library_book'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addBook(bookData) {
    const docRef = doc(collection(db, 'lessons'));
    const finalData = { ...bookData, type: 'library_book' };
    await setDoc(docRef, finalData);
    return { id: docRef.id, ...finalData };
  },

  async deleteBook(bookId) {
    const bookDoc = await getDoc(doc(db, 'lessons', bookId));
    if (bookDoc.exists()) {
      const { pdfUrl, coverUrl } = bookDoc.data();
      if (pdfUrl) await storageService.deleteFile(pdfUrl);
      if (coverUrl) await storageService.deleteFile(coverUrl);
      await deleteDoc(doc(db, 'lessons', bookId));
      return true;
    }
    return false;
  },



  // --- Content/Lesson Management ---

  async getLessonContent(topicId) {
    // Strategy: Cloud-Only Fetch
    try {
        const docRef = doc(db, 'lessons', topicId);
        const snapshot = await getDoc(docRef);
        
        if (snapshot.exists()) {
             const data = snapshot.data();
             // Robust string recovery
             const content = typeof data.content === 'string' ? data.content : JSON.stringify(data.content || data);
             
             localStorage.setItem(STORAGE_KEYS.CONTENT_PREFIX + topicId, content);
             return content;
        }
        
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
  },

  // --- Game Hub Configuration ---
  async getGameHubConfig() {
    const defaults = {
      hero: {
        badge: 'AREA BERMAIN & BELAJAR',
        title: 'Permainan\nBahasa Arab',
        description: 'Belajar mufradat, nahwu, dan shorof jadi lebih seru dengan berbagai tantangan interaktif. Siap untuk level berikutnya?'
      },
      stats: [
        { icon: 'Gamepad2', label: 'Mode Bermain', value: 'Interaktif', color: 'amber' },
        { icon: 'Sparkles', label: 'Konten Baru', value: 'Mingguan', color: 'teal' },
        { icon: 'Trophy', label: 'Tantangan', value: 'Seru', color: 'indigo' }
      ]
    };
    const stored = await fetchAndCache('settings', 'game_hub_config', 'arp_game_hub_config', defaults);
    return { ...defaults, ...stored };
  },

  async saveGameHubConfig(config) {
    return await saveToCloud('settings', 'game_hub_config', 'arp_game_hub_config', config);
  }
};
