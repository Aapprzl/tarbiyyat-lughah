import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const storageService = {
    /**
     * Uploads a file to Firebase Storage and returns the download URL.
     * @param {File} file - The file object to upload
     * @param {string} path - The folder path (e.g., 'images' or 'pdfs')
     * @returns {Promise<string>} - The public download URL
     */
    async uploadFile(file, path = 'uploads') {
        try {
            // Create a unique filename to prevent overwrites
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const uniqueName = `${timestamp}_${safeName}`;
            
            const storageRef = ref(storage, `${path}/${uniqueName}`);
            
            // Upload with Metadata
            const metadata = {
                contentType: file.type || 'application/octet-stream' // Ensure type is set
            };
            const snapshot = await uploadBytes(storageRef, file, metadata);
            
            // Get URL
            const url = await getDownloadURL(snapshot.ref);
            return url;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    },

    /**
     * Deletes a file from Firebase Storage using its download URL.
     * @param {string} url - The download URL of the file to delete
     */
    async deleteFile(url) {
        if (!url) return;
        try {
            let fileRef;
            
            // Extract path specifically from Firebase Storage URL
            // Format: .../b/{bucket}/o/{path}?token=...
            if (url.includes('/o/')) {
                const matches = url.match(/\/o\/(.+?)(\?|$)/);
                if (matches && matches[1]) {
                    // Firebase encodes slashes as %2F, we must decode
                    const fullPath = decodeURIComponent(matches[1]);
                    fileRef = ref(storage, fullPath);
                } else {
                    fileRef = ref(storage, url);
                }
            } else {
                // Assume it's a gs:// path or raw path
                fileRef = ref(storage, url);
            }

            await deleteObject(fileRef);
            console.log(`[Storage] Deleted file: ${url}`);
        } catch (error) {
            console.warn(`[Storage] Failed to delete file (might not exist): ${url}`, error);
        }
    }
};
