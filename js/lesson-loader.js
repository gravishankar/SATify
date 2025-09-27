/**
 * Modern Lesson Loader - Handles new lesson format
 * Loads lessons from content/lessons directory
 */

class LessonLoader {
    constructor() {
        this.lessons = new Map();
        this.lessonsBySkill = new Map();
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            await this.loadAllLessons();
            this.buildSkillMapping();
            this.initialized = true;
            console.log(`Loaded ${this.lessons.size} lessons`);
        } catch (error) {
            console.error('Failed to initialize lesson loader:', error);
            throw error;
        }
    }

    async loadAllLessons() {
        // List of lesson files to load
        const lessonFiles = [
            'lesson_01.json',
            'lesson_02.json',
            'lesson_03.json',
            'lesson_04.json',
            'lesson_05.json',
            'lesson_06.json',
            'lesson_07_words_in_context.json'
        ];

        const loadPromises = lessonFiles.map(async (filename) => {
            try {
                const response = await fetch(`content/lessons/${filename}`);
                if (!response.ok) {
                    console.warn(`Failed to load ${filename}: ${response.status}`);
                    return null;
                }

                const lessonData = await response.json();
                this.lessons.set(lessonData.id, lessonData);
                return lessonData;
            } catch (error) {
                console.warn(`Error loading ${filename}:`, error);
                return null;
            }
        });

        await Promise.all(loadPromises);
    }

    buildSkillMapping() {
        // Clear existing mapping
        this.lessonsBySkill.clear();

        // Build skill to lesson mapping
        for (const [lessonId, lesson] of this.lessons) {
            if (lesson.skill_codes && Array.isArray(lesson.skill_codes)) {
                lesson.skill_codes.forEach(skillCode => {
                    if (!this.lessonsBySkill.has(skillCode)) {
                        this.lessonsBySkill.set(skillCode, []);
                    }
                    this.lessonsBySkill.get(skillCode).push(lesson);
                });
            }
        }

        console.log('Skill mapping built:', Object.fromEntries(this.lessonsBySkill));
    }

    async getLessonById(lessonId) {
        if (!this.initialized) {
            await this.initialize();
        }
        return this.lessons.get(lessonId);
    }

    async getLessonsBySkill(skillCode) {
        if (!this.initialized) {
            await this.initialize();
        }
        return this.lessonsBySkill.get(skillCode) || [];
    }

    async getAllLessons() {
        if (!this.initialized) {
            await this.initialize();
        }
        return Array.from(this.lessons.values());
    }

    async getAvailableSkills() {
        if (!this.initialized) {
            await this.initialize();
        }
        return Array.from(this.lessonsBySkill.keys());
    }

    // Get lesson suggestions based on skill
    async getSuggestedLesson(skillCode) {
        const lessonsForSkill = await this.getLessonsBySkill(skillCode);
        if (lessonsForSkill.length > 0) {
            // Return the first lesson for the skill
            return lessonsForSkill[0];
        }
        return null;
    }

    // Check if a skill has lessons available
    async hasLessonsForSkill(skillCode) {
        const lessons = await this.getLessonsBySkill(skillCode);
        return lessons.length > 0;
    }

    // Get lesson metadata for UI display
    getLessonMetadata(lesson) {
        if (!lesson) return null;

        return {
            id: lesson.id,
            title: lesson.title,
            subtitle: lesson.subtitle,
            level: lesson.level,
            duration: lesson.duration,
            skillCodes: lesson.skill_codes,
            objectiveCount: lesson.learning_objectives?.length || 0,
            slideCount: lesson.slides?.length || 0
        };
    }

    // Search lessons by title or content
    async searchLessons(query) {
        if (!this.initialized) {
            await this.initialize();
        }

        const searchTerms = query.toLowerCase().split(' ');
        const results = [];

        for (const lesson of this.lessons.values()) {
            const searchText = [
                lesson.title,
                lesson.subtitle,
                lesson.learning_objectives?.join(' '),
                lesson.skill_codes?.join(' ')
            ].filter(Boolean).join(' ').toLowerCase();

            const matches = searchTerms.every(term => searchText.includes(term));
            if (matches) {
                results.push(lesson);
            }
        }

        return results;
    }

    // Get learning path suggestions
    async getRecommendedLearningPath() {
        const allLessons = await this.getAllLessons();

        // Sort by level (Foundation first) and then by skill progression
        const levelOrder = { 'Foundation': 1, 'Intermediate': 2, 'Advanced': 3 };

        return allLessons.sort((a, b) => {
            const levelA = levelOrder[a.level] || 99;
            const levelB = levelOrder[b.level] || 99;

            if (levelA !== levelB) {
                return levelA - levelB;
            }

            // Secondary sort by lesson ID for consistent ordering
            return a.id.localeCompare(b.id);
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LessonLoader;
}