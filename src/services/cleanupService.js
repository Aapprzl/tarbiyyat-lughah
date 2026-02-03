import { db } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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
      const count = await this.clearCollection('lessons');
      return { success: true, count };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
