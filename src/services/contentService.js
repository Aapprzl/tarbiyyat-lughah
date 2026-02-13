// ============================================
// CONTENT SERVICE FACADE
// Refactored into modular feature services
// ============================================

import { curriculumService } from './features/curriculumService';
import { lessonService } from './features/lessonService';
import { configService } from './features/configService';
import { assetService } from './features/assetService';
import { gameService } from './features/gameService';
import { authService } from './features/authService';

export const contentService = {
    // Curriulum Service
    isValidUUID: curriculumService.isValidUUID.bind(curriculumService), // Helper used by multiple, bind for safety
    getCurriculum: curriculumService.getCurriculum.bind(curriculumService),
    saveCurriculum: curriculumService.saveCurriculum.bind(curriculumService),
    updateTopicMetadata: curriculumService.updateTopicMetadata.bind(curriculumService),
    syncCategoryItems: curriculumService.syncCategoryItems.bind(curriculumService),
    updateTopicTitle: curriculumService.updateTopicTitle.bind(curriculumService),
    addNewTopic: curriculumService.addNewTopic.bind(curriculumService),
    addNewSection: curriculumService.addNewSection.bind(curriculumService),
    deleteTopic: curriculumService.deleteTopic.bind(curriculumService),
    deleteSection: curriculumService.deleteSection.bind(curriculumService),
    updateSection: curriculumService.updateSection.bind(curriculumService),

    // Lesson Service
    getLessonContent: lessonService.getLessonContent.bind(lessonService),
    saveLessonContent: lessonService.saveLessonContent.bind(lessonService),
    initialiseLessonRow: lessonService.initialiseLessonRow.bind(lessonService),
    deleteLessonRow: lessonService.deleteLessonRow.bind(lessonService),

    // Config Service
    getFontConfig: configService.getFontConfig.bind(configService),
    getFontConfigSync: configService.getFontConfigSync.bind(configService),
    saveFontConfig: configService.saveFontConfig.bind(configService),
    getHomeConfig: configService.getHomeConfig.bind(configService),
    getHomeConfigSync: configService.getHomeConfigSync.bind(configService),
    saveHomeConfig: configService.saveHomeConfig.bind(configService),
    getIntroConfig: configService.getIntroConfig.bind(configService),
    saveIntroConfig: configService.saveIntroConfig.bind(configService),
    getLibraryConfig: configService.getLibraryConfig.bind(configService),
    saveLibraryConfig: configService.saveLibraryConfig.bind(configService),
    getTheme: configService.getTheme.bind(configService),
    saveTheme: configService.saveTheme.bind(configService),

    // Asset Service
    getBooks: assetService.getBooks.bind(assetService),
    addBook: assetService.addBook.bind(assetService),
    deleteBook: assetService.deleteBook.bind(assetService),
    getCharacters: assetService.getCharacters.bind(assetService),
    saveCharacters: assetService.saveCharacters.bind(assetService),
    getBackgrounds: assetService.getBackgrounds.bind(assetService),
    saveBackgrounds: assetService.saveBackgrounds.bind(assetService),

    // Game Service (including aliases)
    getGamesConfig: gameService.getGamesConfig.bind(gameService),
    saveGamesConfig: gameService.saveGamesConfig.bind(gameService),
    updateGameCategory: gameService.updateGameCategory.bind(gameService),
    addNewGameCategory: gameService.addNewGameCategory.bind(gameService),
    addGameCategory: gameService.addGameCategory.bind(gameService),
    deleteGameCategory: gameService.deleteGameCategory.bind(gameService),
    getSpecialPrograms: gameService.getSpecialPrograms.bind(gameService),
    updateSpecialCategory: gameService.updateSpecialCategory.bind(gameService),
    addSpecialCategory: gameService.addSpecialCategory.bind(gameService),
    deleteSpecialCategory: gameService.deleteSpecialCategory.bind(gameService),

    // Auth Service
    login: authService.login.bind(authService),
    register: authService.register.bind(authService),
    logout: authService.logout.bind(authService),
    onAuthStateChange: authService.onAuthStateChange.bind(authService),
    getUser: authService.getUser.bind(authService),
    isAuthenticated: authService.isAuthenticated.bind(authService),

    // Composite Methods (Facade specific)
    async getAllContent() {
        const content = [];
        try {
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
        } catch (error) {
            console.error('[contentService] Error getting all content:', error);
        }
        return content;
    }
};

export default contentService;
