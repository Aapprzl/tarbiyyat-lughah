import { supabase } from '../supabaseClient';

const BUCKET_NAME = 'content';

export const storageService = {
    /**
     * Uploads a file to Supabase Storage.
     * @param {File} file - The file object to upload
     * @param {string} path - The folder path (e.g. 'materials/pdfs')
     * @param {function} onProgress - Callback for upload progress (Not fully supported in simple retry upload, simulating 0-100)
     * @returns {Promise<string>} - The public download URL
     */
    async uploadFile(file, path = 'uploads', onProgress = null) {
        try {
            if (onProgress) onProgress(10);

            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const uniquePath = `${path}/${timestamp}_${safeName}`; // e.g. materials/pdfs/123_abc.pdf

            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(uniquePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;
            if (onProgress) onProgress(100);

            // Get Public URL
            const { data: publicData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(uniquePath);
            
            return publicData.publicUrl;
        } catch (error) {
            console.error("Error uploading file to Supabase:", error);
            throw error;
        }
    },

    /**
     * Uploads a thumbnail image with validation.
     * @param {File} file - The image file to upload
     * @param {function} onProgress - Optional progress callback
     * @returns {Promise<string>} - The public download URL
     */
    async uploadThumbnail(file, onProgress = null) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            throw new Error('Format file tidak valid. Gunakan JPG, PNG, atau WebP.');
        }

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (file.size > maxSize) {
            throw new Error('Ukuran file terlalu besar. Maksimal 2MB.');
        }

        // Upload to specific thumbnail path
        return this.uploadFile(file, 'materi/thumbnail_bacaan', onProgress);
    },

    /**
     * Deletes a file from Supabase Storage using its download URL.
     * @param {string} url - The download URL of the file to delete
     */
    async deleteFile(url) {
        if (!url) return;
        try {
            // Extract path from URL. 
            // URL format: .../storage/v1/object/public/content/path/to/file
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split(`/public/${BUCKET_NAME}/`);
            
            if (pathParts.length > 1) {
                const fullPath = decodeURIComponent(pathParts[1]); // path/to/file
                
                const { error } = await supabase.storage
                    .from(BUCKET_NAME)
                    .remove([fullPath]);
                
                if (error) throw error;
                console.log(`[Storage] Deleted file: ${fullPath}`);
            }
        } catch (error) {
            console.warn(`[Storage] Failed to delete file: ${url}`, error);
        }
    }
};
