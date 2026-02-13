import contentServiceV2 from '../contentServiceV2';

import { storageService } from '../storageService';

export const assetService = {
    async getBooks() {
        try {
            const books = await contentServiceV2.siteConfig.get('library_books');
            return Array.isArray(books) ? books : [];
        } catch (error) {
            console.error('[assetService] Error fetching books:', error);
            return [];
        }
    },

    async addBook(bookData) {
        try {
            const books = await this.getBooks();
            const newBook = { ...bookData, id: Date.now() };
            const updatedBooks = [newBook, ...books];
            await contentServiceV2.siteConfig.save('library_books', updatedBooks, 'Library books collection');
            return newBook;
        } catch (error) {
            console.error('[assetService] Error adding book:', error);
            throw error;
        }
    },

    async deleteBook(bookId) {
        try {
            const books = await this.getBooks();
            const bookToDelete = books.find(b => b.id === bookId);

            if (bookToDelete) {
                // Delete associated files from storage
                if (bookToDelete.pdfUrl) await storageService.deleteFile(bookToDelete.pdfUrl);
                if (bookToDelete.coverUrl) await storageService.deleteFile(bookToDelete.coverUrl);
            }

            const updatedBooks = books.filter(b => b.id !== bookId);
            await contentServiceV2.siteConfig.save('library_books', updatedBooks, 'Library books collection');
            return true;
        } catch (error) {
            console.error('[assetService] Error deleting book:', error);
            return false;
        }
    },

    async getCharacters() {
        try {
            const characters = await contentServiceV2.siteConfig.get('interactive_story_characters');
            return Array.isArray(characters) ? characters : [];
        } catch (error) {
            console.error('[assetService] Error fetching characters:', error);
            return [];
        }
    },

    async saveCharacters(characters) {
        try {
            await contentServiceV2.siteConfig.save('interactive_story_characters', characters, 'Interactive story character library');
            return true;
        } catch (error) {
            console.error('[assetService] Error saving characters:', error);
            throw error;
        }
    },

    async getBackgrounds() {
        try {
            const backgrounds = await contentServiceV2.siteConfig.get('interactive_story_backgrounds');
            return Array.isArray(backgrounds) ? backgrounds : [];
        } catch (error) {
            console.error('[assetService] Error fetching backgrounds:', error);
            return [];
        }
    },

    async saveBackgrounds(backgrounds) {
        try {
            await contentServiceV2.siteConfig.save('interactive_story_backgrounds', backgrounds, 'Interactive story background library');
            return true;
        } catch (error) {
            console.error('[assetService] Error saving backgrounds:', error);
            throw error;
        }
    }
};
