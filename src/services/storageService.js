import { storage } from '../firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

export const storageService = {
    /**
     * Uploads a file to Firebase Storage with progress reporting.
     * @param {File} file - The file object to upload
     * @param {string} path - The folder path
     * @param {function} onProgress - Callback for upload progress (0-100)
     * @returns {Promise<string>} - The public download URL
     */
    async uploadFile(file, path = 'uploads', onProgress = null) {
        return new Promise((resolve, reject) => {
            try {
                const timestamp = Date.now();
                const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
                const uniqueName = `${timestamp}_${safeName}`;
                const storageRef = ref(storage, `${path}/${uniqueName}`);
                
                const metadata = {
                    contentType: file.type || 'application/octet-stream'
                };

                const uploadTask = uploadBytesResumable(storageRef, file, metadata);

                uploadTask.on('state_changed', 
                    (snapshot) => {
                        if (onProgress) {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            onProgress(progress);
                        }
                    }, 
                    (error) => {
                        console.error("Error uploading file:", error);
                        reject(error);
                    }, 
                    async () => {
                        const url = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(url);
                    }
                );
            } catch (error) {
                console.error("Error in uploadFile setup:", error);
                reject(error);
            }
        });
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
