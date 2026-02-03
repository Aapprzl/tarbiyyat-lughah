import { db } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { storageService } from './storageService';

/**
 * Service untuk membersihkan data lama dari LocalStorage dan Firestore
 */
export const cleanupService = {
  /**
   * Membersihkan semua LocalStorage yang terkait dengan aplikasi
   */
  clearLocalStorage() {
    const keysToRemove = [];
    
    // Collect all keys that start with 'arp_'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('arp_')) {
        keysToRemove.push(key);
      }
    }
    
    // Remove collected keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`[Cleanup] Removed LocalStorage key: ${key}`);
    });
    
    console.log(`[Cleanup] Cleared ${keysToRemove.length} LocalStorage items`);
    return keysToRemove.length;
  },

  /**
   * Membersihkan semua documents dalam collection tertentu
   */
  async clearCollection(collectionName) {
    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      const deletePromises = [];
      snapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
      });
      
      await Promise.all(deletePromises);
      console.log(`[Cleanup] Deleted ${deletePromises.length} documents from ${collectionName}`);
      return deletePromises.length;
    } catch (error) {
      console.error(`[Cleanup] Error clearing collection ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Membersihkan semua data Firestore
   */
  async clearAllFirestoreData() {
    const collections = [
      'lessons',
      'settings'
    ];
    
    const results = {};
    
    for (const collectionName of collections) {
      try {
        const count = await this.clearCollection(collectionName);
        results[collectionName] = { success: true, count };
      } catch (error) {
        results[collectionName] = { success: false, error: error.message };
      }
    }
    
    return results;
  },

  /**
   * Membersihkan semua data (LocalStorage + Firestore)
   */
  async clearAllData() {
    console.log('[Cleanup] Starting full data cleanup...');
    
    // Clear LocalStorage
    const localStorageCount = this.clearLocalStorage();
    
    // Clear Firestore
    const firestoreResults = await this.clearAllFirestoreData();
    
    const summary = {
      localStorage: {
        success: true,
        itemsCleared: localStorageCount
      },
      firestore: firestoreResults
    };
    
    console.log('[Cleanup] Full cleanup completed:', summary);
    return summary;
  },

  /**
   * Membersihkan hanya data settings di Firestore
   */
  async clearSettingsOnly() {
    try {
      console.log('[Cleanup] Scanning Settings for storage files...');
      
      const collections = ['home_config', 'about_config', 'profile_config', 'copyright_config'];
      const allUrls = [];
      
      for (const docId of collections) {
          const docRef = doc(db, 'settings', docId);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
              const dataStr = JSON.stringify(snap.data());
              const urlRegex = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^"\s]+/g;
              const matches = dataStr.match(urlRegex) || [];
              allUrls.push(...matches);
          }
      }

      const uniqueUrls = [...new Set(allUrls)];
      if (uniqueUrls.length > 0) {
          console.log(`[Cleanup] Found ${uniqueUrls.length} storage files in Settings. Deleting...`);
          await Promise.allSettled(uniqueUrls.map(url => storageService.deleteFile(url)));
      }

      const count = await this.clearCollection('settings');
      return { success: true, count };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Membersihkan hanya data lessons di Firestore
   */
  async clearLessonsOnly() {
    try {
      console.log('[Cleanup] Scanning Lessons for storage files...');
      const snapshot = await getDocs(collection(db, 'lessons'));
      
      const allUrls = [];
      snapshot.forEach(doc => {
          const dataStr = JSON.stringify(doc.data());
          const urlRegex = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^"\s]+/g;
          const matches = dataStr.match(urlRegex) || [];
          allUrls.push(...matches);
      });

      const uniqueUrls = [...new Set(allUrls)];
      if (uniqueUrls.length > 0) {
          console.log(`[Cleanup] Found ${uniqueUrls.length} storage files in Lessons. Deleting...`);
          await Promise.allSettled(uniqueUrls.map(url => storageService.deleteFile(url)));
      }

      const count = await this.clearCollection('lessons');
      return { success: true, count };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
