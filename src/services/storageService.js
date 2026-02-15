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

            const { error } = await supabase.storage
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
            // URL format: .../storage/v1/object/public/content/path/to/file
            // We need to extract everything after '/public/[BUCKET_NAME]/'
            const urlObj = new URL(url);
            const publicMarker = `/public/${BUCKET_NAME}/`;
            const markerIndex = urlObj.pathname.indexOf(publicMarker);
            
            if (markerIndex !== -1) {
                const fullPath = decodeURIComponent(urlObj.pathname.substring(markerIndex + publicMarker.length));
                
                const { error } = await supabase.storage
                    .from(BUCKET_NAME)
                    .remove([fullPath]);
                
                if (error) {
                    console.error(`[Storage] Supabase error deleting ${fullPath}:`, error);
                    throw error;
                }
                if (import.meta.env.DEV) {
                    console.log(`[Storage] Successfully deleted file: ${fullPath}`);
                }
            } else {
                console.warn(`[Storage] Could not find bucket marker '/public/${BUCKET_NAME}/' in URL: ${url}`);
            }
        } catch (error) {
            console.error(`[Storage] Fatal error deleting file: ${url}`, error);
        }
    },

    /**
     * Extracts all Supabase storage URLs from a content string or object
     * and deletes them.
     * @param {string|object} content - The content to scan for URLs
     */
    async deleteAllFilesFromContent(content) {
        if (!content) return;
        try {
            const str = typeof content === 'string' ? content : JSON.stringify(content);
            // Matches Supabase storage URLs more flexibly, ensuring it targets the configured BUCKET_NAME
            // URL can be /object/public/bucket/... or /render/image/public/bucket/...
            const urlRegex = new RegExp(`https://[^"\\s]+\\.supabase\\.co/storage/v1/(object|render/image)/public/${BUCKET_NAME}/[^"\\s]+`, 'g');
            const matches = str.match(urlRegex) || [];
            const uniqueUrls = [...new Set(matches)];

            if (uniqueUrls.length > 0) {
                if (import.meta.env.DEV) {
                    console.log(`[Storage] Cleaning up ${uniqueUrls.length} files from content...`);
                }
                await Promise.allSettled(uniqueUrls.map(url => this.deleteFile(url)));
            }
        } catch (error) {
            console.warn(`[Storage] Error during content file cleanup:`, error);
        }
    }
};
