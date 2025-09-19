/**
 * SAT Skill Practice Module
 * Manages skill-based practice sessions with strategy integration
 * Follows design patterns from existing Words in Context system
 */

class SkillPracticeManager {
    constructor() {
        this.config = null;
        this.questionData = null;
        this.currentSession = null;
        this.strategyEngine = null;
        this.questionEngine = null;
        this.isInitialized = false;

        // UI elements
        this.container = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.sessionStartTime = null;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Load configuration
            await this.loadConfig();

            // Initialize sub-engines
            this.strategyEngine = new StrategyEngine(this.config);
            this.questionEngine = new QuestionEngine(this.config);

            // Load question data
            await this.loadQuestionData();

            this.isInitialized = true;
            console.log('SkillPracticeManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize SkillPracticeManager:', error);
            throw error;
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('data/skill-practice-config.json?v=' + Date.now());
            if (!response.ok) {
                throw new Error(`Failed to load config: ${response.status}`);
            }
            this.config = await response.json();
        } catch (error) {
            console.error('Error loading skill practice config:', error);
            throw error;
        }
    }

    async loadQuestionData() {
        try {
            const response = await fetch(`${this.config.skillPracticeConfig.dataSettings.primaryDataSource}?v=${Date.now()}`);
            if (!response.ok) {
                throw new Error(`Failed to load question data: ${response.status}`);
            }
            const data = await response.json();

            // Filter for reading-writing questions only
            this.questionData = data.filter(question =>
                question.module === 'reading-writing'
            );

            console.log(`Loaded ${this.questionData.length} reading-writing questions`);
        } catch (error) {
            console.error('Error loading question data:', error);
            throw error;
        }
    }

    // Check if skill practice is enabled via feature flags
    isSkillPracticeEnabled() {
        if (!this.config) return false;
        return this.config.skillPracticeConfig.featureFlags.skillPracticeEnabled;
    }

    // Get all available skills
    getAvailableSkills() {
        if (!this.config) return [];
        return Object.values(this.config.skillPracticeConfig.skillMappings);
    }

    // Get skills grouped by domain
    getSkillsByDomain() {
        if (!this.config) return {};

        const skillsByDomain = {};
        const domains = this.config.skillPracticeConfig.domainOrganization;

        Object.keys(domains).forEach(domainId => {
            const domain = domains[domainId];
            skillsByDomain[domainId] = {
                ...domain,
                skills: domain.skills.map(skillCode =>
                    this.config.skillPracticeConfig.skillMappings[skillCode]
                ).filter(Boolean)
            };
        });

        return skillsByDomain;
    }

    // Get questions for a specific skill
    getQuestionsForSkill(skillCode, options = {}) {
        if (!this.questionData) return [];

        const skillQuestions = this.questionData.filter(question =>
            question.skill_cd === skillCode
        );

        // Apply filtering options
        if (options.difficulty) {
            return skillQuestions.filter(q => q.difficulty === options.difficulty);
        }

        if (options.shuffle) {
            return this.shuffleArray([...skillQuestions]);
        }

        return skillQuestions;
    }

    // Get questions for all skills in a domain (topic practice)
    getQuestionsForDomain(domainId, options = {}) {
        if (!this.config || !this.questionData) return [];

        const domain = this.config.skillPracticeConfig.domainOrganization[domainId];
        if (!domain) return [];

        const domainQuestions = this.questionData.filter(question =>
            domain.skills.includes(question.skill_cd)
        );

        if (options.shuffle) {
            return this.shuffleArray([...domainQuestions]);
        }

        return domainQuestions;
    }

    // Start a practice session
    async startPracticeSession(practiceType, targetId, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const sessionConfig = {
            practiceType, // 'skill' or 'domain'
            targetId, // skill code or domain id
            options,
            startTime: new Date(),
            questionLimit: options.questionLimit || this.config.skillPracticeConfig.dataSettings.maxQuestionsPerSession
        };

        // Get questions for session
        let questions;
        if (practiceType === 'skill') {
            questions = this.getQuestionsForSkill(targetId, { shuffle: true });
            sessionConfig.skillInfo = this.config.skillPracticeConfig.skillMappings[targetId];
        } else if (practiceType === 'domain') {
            questions = this.getQuestionsForDomain(targetId, { shuffle: true });
            sessionConfig.domainInfo = this.config.skillPracticeConfig.domainOrganization[targetId];
        }

        // Limit questions for session
        questions = questions.slice(0, sessionConfig.questionLimit);

        if (questions.length === 0) {
            throw new Error(`No questions available for ${practiceType}: ${targetId}`);
        }

        // Create session object
        this.currentSession = {
            ...sessionConfig,
            questions,
            currentIndex: 0,
            answers: [],
            completed: false
        };

        // Load strategy if enabled and available
        if (this.config.skillPracticeConfig.featureFlags.strategyIntegrationEnabled) {
            this.currentSession.strategy = await this.strategyEngine.getStrategyForTarget(practiceType, targetId);
        }

        console.log(`Started ${practiceType} practice session for ${targetId} with ${questions.length} questions`);
        return this.currentSession;
    }

    // Get current session info
    getCurrentSession() {
        return this.currentSession;
    }

    // Submit answer for current question
    submitAnswer(answerIndex, timeSpent) {
        if (!this.currentSession || this.currentSession.completed) {
            throw new Error('No active session or session already completed');
        }

        const currentQuestion = this.currentSession.questions[this.currentSession.currentIndex];
        const isCorrect = answerIndex === currentQuestion.correct_choice_index;

        const answerRecord = {
            questionId: currentQuestion.questionId,
            userAnswer: answerIndex,
            correctAnswer: currentQuestion.correct_choice_index,
            isCorrect,
            timeSpent,
            skillCode: currentQuestion.skill_cd,
            difficulty: currentQuestion.difficulty
        };

        this.currentSession.answers.push(answerRecord);
        this.currentSession.currentIndex++;

        // Check if session is complete
        if (this.currentSession.currentIndex >= this.currentSession.questions.length) {
            this.currentSession.completed = true;
            this.currentSession.endTime = new Date();
            this.currentSession.summary = this.generateSessionSummary();
        }

        return answerRecord;
    }

    // Get next question in session
    getNextQuestion() {
        if (!this.currentSession || this.currentSession.completed) {
            return null;
        }

        return this.currentSession.questions[this.currentSession.currentIndex];
    }

    // Generate session summary
    generateSessionSummary() {
        if (!this.currentSession) return null;

        const answers = this.currentSession.answers;
        const totalQuestions = answers.length;
        const correctAnswers = answers.filter(a => a.isCorrect).length;
        const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

        const totalTime = this.currentSession.endTime - this.currentSession.startTime;
        const avgTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;

        // Group by skill for detailed breakdown
        const skillBreakdown = {};
        answers.forEach(answer => {
            if (!skillBreakdown[answer.skillCode]) {
                skillBreakdown[answer.skillCode] = {
                    skillInfo: this.config.skillPracticeConfig.skillMappings[answer.skillCode],
                    total: 0,
                    correct: 0,
                    accuracy: 0
                };
            }
            skillBreakdown[answer.skillCode].total++;
            if (answer.isCorrect) {
                skillBreakdown[answer.skillCode].correct++;
            }
        });

        // Calculate accuracy for each skill
        Object.keys(skillBreakdown).forEach(skillCode => {
            const skill = skillBreakdown[skillCode];
            skill.accuracy = skill.total > 0 ? (skill.correct / skill.total) * 100 : 0;
        });

        return {
            totalQuestions,
            correctAnswers,
            accuracy: Math.round(accuracy),
            totalTime,
            avgTimePerQuestion: Math.round(avgTimePerQuestion),
            skillBreakdown,
            practiceType: this.currentSession.practiceType,
            targetId: this.currentSession.targetId,
            completedAt: this.currentSession.endTime
        };
    }

    // Utility function to shuffle array
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Reset current session
    resetSession() {
        this.currentSession = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.sessionStartTime = null;
    }

    // Get feature flag status
    getFeatureFlags() {
        return this.config?.skillPracticeConfig?.featureFlags || {};
    }

    // Update feature flag (for admin/testing)
    updateFeatureFlag(flagName, value) {
        if (this.config && this.config.skillPracticeConfig.featureFlags.hasOwnProperty(flagName)) {
            this.config.skillPracticeConfig.featureFlags[flagName] = value;
            // In a real implementation, this would also update the server-side config
            console.log(`Feature flag ${flagName} updated to ${value}`);
        }
    }
}

// Strategy Engine for managing lesson-based strategies
class StrategyEngine {
    constructor(config) {
        this.config = config;
        this.strategyCache = new Map();
    }

    async getStrategyForTarget(practiceType, targetId) {
        const cacheKey = `${practiceType}_${targetId}`;

        if (this.strategyCache.has(cacheKey)) {
            return this.strategyCache.get(cacheKey);
        }

        try {
            let strategy = null;

            if (practiceType === 'skill') {
                strategy = await this.loadSkillStrategy(targetId);
            } else if (practiceType === 'domain') {
                strategy = await this.loadDomainStrategy(targetId);
            }

            if (strategy) {
                this.strategyCache.set(cacheKey, strategy);
            }

            return strategy;
        } catch (error) {
            console.error(`Failed to load strategy for ${practiceType} ${targetId}:`, error);
            return null;
        }
    }

    async loadSkillStrategy(skillCode) {
        const skillMapping = this.config.skillPracticeConfig.skillMappings[skillCode];
        if (!skillMapping) return null;

        // Try to load from corresponding lesson file
        const lessonPath = `lessons/${skillMapping.domainId}/${skillMapping.skillId}`;

        try {
            // Look for strategy slides in lesson files
            const manifestResponse = await fetch('lessons/manifest.json?v=' + Date.now());
            if (manifestResponse.ok) {
                const manifest = await manifestResponse.json();

                // Find lessons that match the skill
                const matchingLessons = Object.values(manifest.lessons || {}).filter(lesson =>
                    lesson.filepath.includes(skillMapping.skillId) ||
                    lesson.filepath.includes(skillMapping.domainId)
                );

                if (matchingLessons.length > 0) {
                    const lessonResponse = await fetch(matchingLessons[0].filepath + '?v=' + Date.now());
                    if (lessonResponse.ok) {
                        const lessonData = await lessonResponse.json();
                        return this.extractStrategyFromLesson(lessonData);
                    }
                }
            }
        } catch (error) {
            console.error(`Error loading strategy for skill ${skillCode}:`, error);
        }

        return null;
    }

    async loadDomainStrategy(domainId) {
        // For domain-level strategy, look for fundamentals lesson
        try {
            const manifestResponse = await fetch('lessons/manifest.json?v=' + Date.now());
            if (manifestResponse.ok) {
                const manifest = await manifestResponse.json();

                // Look for fundamentals lesson for this domain
                const fundamentalsLesson = Object.values(manifest.lessons || {}).find(lesson =>
                    lesson.filepath.includes(domainId) && lesson.filepath.includes('fundamentals')
                );

                if (fundamentalsLesson) {
                    const lessonResponse = await fetch(fundamentalsLesson.filepath + '?v=' + Date.now());
                    if (lessonResponse.ok) {
                        const lessonData = await lessonResponse.json();
                        return this.extractStrategyFromLesson(lessonData);
                    }
                }
            }
        } catch (error) {
            console.error(`Error loading strategy for domain ${domainId}:`, error);
        }

        return null;
    }

    extractStrategyFromLesson(lessonData) {
        if (!lessonData.slides) return null;

        // Find strategy-related slides
        const strategySlides = lessonData.slides.filter(slide =>
            slide.type === 'strategy' ||
            slide.id.includes('strategy') ||
            slide.title.toLowerCase().includes('strategy')
        );

        if (strategySlides.length === 0) return null;

        return {
            title: lessonData.title,
            skillTitle: lessonData.skill_title,
            slides: strategySlides,
            learningObjectives: lessonData.learning_objectives
        };
    }
}

// Question Engine for managing question flow and state
class QuestionEngine {
    constructor(config) {
        this.config = config;
    }

    formatQuestionForDisplay(question) {
        return {
            id: question.questionId,
            stem: question.stem_html,
            choices: question.choices || [],
            type: question.question_type,
            skillCode: question.skill_cd,
            skillDesc: question.skill_desc,
            difficulty: question.difficulty,
            domain: question.primary_class_cd_desc
        };
    }

    validateAnswer(question, answerIndex) {
        if (question.question_type === 'mcq') {
            return answerIndex === question.correct_choice_index;
        }
        // For numerical questions, validation would be different
        return false;
    }

    getExplanation(question) {
        return question.explanation_html || 'No explanation available';
    }
}

// Export for use in other modules
window.SkillPracticeManager = SkillPracticeManager;
window.StrategyEngine = StrategyEngine;
window.QuestionEngine = QuestionEngine;