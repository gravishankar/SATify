/**
 * SAT Practice Pro - Analytics Module
 * Performance tracking, insights, and progress visualization
 */

class SATAnalytics {
    constructor(app) {
        this.app = app;
        this.charts = {};
        this.init();
    }

    init() {
        this.setupAnalyticsEventListeners();
    }

    setupAnalyticsEventListeners() {
        // Listen for session completion to update analytics
        document.addEventListener('sessionCompleted', (event) => {
            this.processSessionData(event.detail);
            this.updateDashboardCharts();
        });
        
        // Progress page navigation
        document.querySelector('[data-page="progress"]')?.addEventListener('click', () => {
            setTimeout(() => this.renderProgressPage(), 100);
        });
    }

    processSessionData(sessionData) {
        // Analyze performance patterns
        const insights = this.generateInsights(sessionData);
        
        // Update streak tracking
        this.updateStreak(sessionData);
        
        // Identify learning opportunities
        this.updateWeakAreas(sessionData);
        
        // Store processed analytics
        this.saveAnalyticsData(insights);
    }

    generateInsights(sessionData) {
        const insights = {
            timestamp: Date.now(),
            sessionId: sessionData.id,
            overallPerformance: this.analyzeOverallPerformance(sessionData),
            topicBreakdown: this.analyzeTopicPerformance(sessionData),
            difficultyAnalysis: this.analyzeDifficultyPerformance(sessionData),
            timeAnalysis: this.analyzeTimeUsage(sessionData),
            recommendedActions: this.generateRecommendations(sessionData)
        };
        
        return insights;
    }

    analyzeOverallPerformance(sessionData) {
        const { questions } = sessionData;
        const total = questions.length;
        const correct = questions.filter(q => q.correct).length;
        const accuracy = (correct / total) * 100;
        
        const avgTime = questions.reduce((acc, q) => acc + (q.timeSpent || 0), 0) / total / 1000; // seconds
        
        return {
            accuracy: Math.round(accuracy),
            totalQuestions: total,
            correctAnswers: correct,
            averageTime: Math.round(avgTime),
            improvement: this.calculateImprovement(accuracy)
        };
    }

    analyzeTopicPerformance(sessionData) {
        const topicStats = {};
        
        sessionData.questions.forEach(q => {
            const topic = q.primary_class_cd_desc || 'Unknown';
            if (!topicStats[topic]) {
                topicStats[topic] = { correct: 0, total: 0, timeSpent: 0 };
            }
            
            topicStats[topic].total++;
            if (q.correct) topicStats[topic].correct++;
            topicStats[topic].timeSpent += q.timeSpent || 0;
        });
        
        // Calculate percentages and average times
        Object.keys(topicStats).forEach(topic => {
            const stats = topicStats[topic];
            stats.accuracy = Math.round((stats.correct / stats.total) * 100);
            stats.avgTime = Math.round((stats.timeSpent / stats.total) / 1000);
        });
        
        return topicStats;
    }

    analyzeDifficultyPerformance(sessionData) {
        const difficultyStats = { E: { correct: 0, total: 0 }, M: { correct: 0, total: 0 }, H: { correct: 0, total: 0 } };
        
        sessionData.questions.forEach(q => {
            const diff = q.difficulty || 'M';
            difficultyStats[diff].total++;
            if (q.correct) difficultyStats[diff].correct++;
        });
        
        // Calculate percentages
        Object.keys(difficultyStats).forEach(diff => {
            const stats = difficultyStats[diff];
            stats.accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        });
        
        return difficultyStats;
    }

    analyzeTimeUsage(sessionData) {
        const times = sessionData.questions
            .map(q => q.timeSpent || 0)
            .filter(t => t > 0)
            .map(t => t / 1000); // Convert to seconds
        
        if (times.length === 0) return null;
        
        times.sort((a, b) => a - b);
        const median = times[Math.floor(times.length / 2)];
        const average = times.reduce((acc, t) => acc + t, 0) / times.length;
        const fastest = Math.min(...times);
        const slowest = Math.max(...times);
        
        return {
            average: Math.round(average),
            median: Math.round(median),
            fastest: Math.round(fastest),
            slowest: Math.round(slowest),
            consistency: this.calculateTimeConsistency(times)
        };
    }

    calculateTimeConsistency(times) {
        const mean = times.reduce((acc, t) => acc + t, 0) / times.length;
        const variance = times.reduce((acc, t) => acc + Math.pow(t - mean, 2), 0) / times.length;
        const stdDev = Math.sqrt(variance);
        
        // Lower coefficient of variation = more consistent
        const cv = stdDev / mean;
        return Math.round((1 - Math.min(cv, 1)) * 100); // 0-100 scale
    }

    generateRecommendations(sessionData) {
        const recommendations = [];
        const performance = this.analyzeOverallPerformance(sessionData);
        const topicPerf = this.analyzeTopicPerformance(sessionData);
        const diffPerf = this.analyzeDifficultyPerformance(sessionData);
        
        // Accuracy-based recommendations
        if (performance.accuracy < 60) {
            recommendations.push({
                type: 'focus',
                priority: 'high',
                title: 'Focus on Fundamentals',
                message: 'Consider reviewing basic concepts before attempting more practice questions.',
                action: 'review_concepts'
            });
        } else if (performance.accuracy >= 85) {
            recommendations.push({
                type: 'challenge',
                priority: 'medium',
                title: 'Challenge Yourself',
                message: 'Great accuracy! Try harder questions to push your limits.',
                action: 'increase_difficulty'
            });
        }
        
        // Topic-based recommendations
        const weakTopics = Object.entries(topicPerf)
            .filter(([topic, stats]) => stats.accuracy < 70 && stats.total >= 2)
            .sort((a, b) => a[1].accuracy - b[1].accuracy)
            .slice(0, 2);
        
        weakTopics.forEach(([topic, stats]) => {
            recommendations.push({
                type: 'topic_focus',
                priority: 'high',
                title: `Improve ${topic}`,
                message: `Only ${stats.accuracy}% accuracy in ${topic}. Focus practice here.`,
                action: 'practice_topic',
                data: { topic }
            });
        });
        
        // Time-based recommendations
        if (performance.averageTime > 120) { // More than 2 minutes per question
            recommendations.push({
                type: 'speed',
                priority: 'medium',
                title: 'Work on Speed',
                message: 'Try to solve questions more quickly. Aim for 90 seconds per question.',
                action: 'timed_practice'
            });
        }
        
        // Difficulty progression
        if (diffPerf.E.accuracy >= 90 && diffPerf.M.accuracy >= 80 && diffPerf.H.accuracy < 60) {
            recommendations.push({
                type: 'progression',
                priority: 'medium',
                title: 'Ready for Hard Questions',
                message: 'Your fundamentals are strong. Practice more challenging questions.',
                action: 'practice_hard'
            });
        }
        
        return recommendations.slice(0, 3); // Limit to top 3 recommendations
    }

    calculateImprovement(currentAccuracy) {
        const userData = this.app.getUserData();
        const sessions = userData.sessions || [];
        
        if (sessions.length < 2) return null;
        
        const recentSessions = sessions.slice(-5);
        const oldAvg = recentSessions.slice(0, -1).reduce((acc, s) => acc + s.score, 0) / (recentSessions.length - 1);
        
        return Math.round(currentAccuracy - oldAvg);
    }

    updateStreak(sessionData) {
        const userData = this.app.getUserData();
        const today = new Date().toDateString();
        const lastActivity = userData.lastActivityDate;
        
        let newStreak = userData.streak || 0;
        
        if (lastActivity === today) {
            // Already practiced today, streak unchanged
        } else if (this.isConsecutiveDay(lastActivity, today)) {
            // Consecutive day, increment streak
            newStreak++;
        } else {
            // Gap in practice, reset streak
            newStreak = 1;
        }
        
        this.app.saveUserData({
            streak: newStreak,
            lastActivityDate: today
        });
    }

    isConsecutiveDay(lastDate, currentDate) {
        if (!lastDate) return false;
        
        const last = new Date(lastDate);
        const current = new Date(currentDate);
        const diffTime = current.getTime() - last.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays === 1;
    }

    updateWeakAreas(sessionData) {
        const userData = this.app.getUserData();
        const weakAreas = userData.weakAreas || {};
        const topicPerf = this.analyzeTopicPerformance(sessionData);
        
        Object.entries(topicPerf).forEach(([topic, stats]) => {
            if (!weakAreas[topic]) {
                weakAreas[topic] = { attempts: 0, correct: 0, sessions: 0 };
            }
            
            weakAreas[topic].attempts += stats.total;
            weakAreas[topic].correct += stats.correct;
            weakAreas[topic].sessions++;
            weakAreas[topic].lastPracticed = Date.now();
        });
        
        this.app.saveUserData({ weakAreas });
    }

    saveAnalyticsData(insights) {
        const userData = this.app.getUserData();
        const analytics = userData.analytics || { sessions: [], insights: [] };
        
        analytics.insights.push(insights);
        
        // Keep only last 50 insights to avoid storage bloat
        if (analytics.insights.length > 50) {
            analytics.insights = analytics.insights.slice(-50);
        }
        
        this.app.saveUserData({ analytics });
    }

    // Dashboard visualization
    renderPerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const userData = this.app.getUserData();
        const sessions = (userData.sessions || []).slice(-10); // Last 10 sessions
        
        if (sessions.length === 0) {
            ctx.fillStyle = '#64748b';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Complete some practice sessions to see your progress', canvas.width/2, canvas.height/2);
            return;
        }
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw axes
        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        // Y-axis (0-100%)
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.stroke();
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Y-axis labels
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 100; i += 20) {
            const y = canvas.height - padding - (i / 100) * chartHeight;
            ctx.fillText(`${i}%`, padding - 10, y + 4);
        }
        
        // Plot performance line
        if (sessions.length > 1) {
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            sessions.forEach((session, index) => {
                const x = padding + (index / (sessions.length - 1)) * chartWidth;
                const y = canvas.height - padding - (session.score / 100) * chartHeight;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
        
        // Plot points
        ctx.fillStyle = '#2563eb';
        sessions.forEach((session, index) => {
            const x = padding + (index / Math.max(1, sessions.length - 1)) * chartWidth;
            const y = canvas.height - padding - (session.score / 100) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    // Progress page rendering
    renderProgressPage() {
        const progressPage = document.getElementById('progressPage');
        if (!progressPage || !progressPage.classList.contains('active')) return;
        
        const userData = this.app.getUserData();
        const sessions = userData.sessions || [];
        const analytics = userData.analytics || {};
        
        progressPage.innerHTML = `
            <div class="container">
                <div class="progress-header">
                    <h1>Your Progress Analytics</h1>
                    <p class="subtitle">Detailed insights into your SAT preparation journey</p>
                </div>
                
                <div class="progress-grid">
                    <div class="progress-section">
                        <h2>Performance Trends</h2>
                        <div class="chart-container">
                            <canvas id="detailedPerformanceChart" width="500" height="300"></canvas>
                        </div>
                    </div>
                    
                    <div class="progress-section">
                        <h2>Subject Breakdown</h2>
                        <div class="subject-stats" id="subjectStats">
                            ${this.renderSubjectStats(sessions)}
                        </div>
                    </div>
                    
                    <div class="progress-section">
                        <h2>Difficulty Analysis</h2>
                        <div class="difficulty-chart" id="difficultyChart">
                            ${this.renderDifficultyChart(sessions)}
                        </div>
                    </div>
                    
                    <div class="progress-section">
                        <h2>Recommendations</h2>
                        <div class="recommendations" id="recommendations">
                            ${this.renderRecommendations(analytics)}
                        </div>
                    </div>
                    
                    <div class="progress-section">
                        <h2>Study Habits</h2>
                        <div class="study-habits" id="studyHabits">
                            ${this.renderStudyHabits(sessions)}
                        </div>
                    </div>
                    
                    <div class="progress-section">
                        <h2>Goal Tracking</h2>
                        <div class="goal-tracking" id="goalTracking">
                            ${this.renderGoalTracking(userData)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Render detailed chart
        setTimeout(() => this.renderDetailedPerformanceChart(), 100);
    }

    renderSubjectStats(sessions) {
        const subjectStats = { math: { correct: 0, total: 0 }, 'reading-writing': { correct: 0, total: 0 } };
        
        sessions.forEach(session => {
            session.questions?.forEach(q => {
                const subject = q.module || 'math';
                subjectStats[subject].total++;
                if (q.correct) subjectStats[subject].correct++;
            });
        });
        
        return Object.entries(subjectStats).map(([subject, stats]) => {
            const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            const displayName = subject === 'math' ? 'Math' : 'Reading & Writing';
            
            return `
                <div class="subject-stat">
                    <div class="subject-header">
                        <h3>${displayName}</h3>
                        <span class="accuracy">${accuracy}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${accuracy}%"></div>
                    </div>
                    <p class="subject-detail">${stats.correct} correct out of ${stats.total} questions</p>
                </div>
            `;
        }).join('');
    }

    renderDifficultyChart(sessions) {
        const diffStats = { E: { correct: 0, total: 0 }, M: { correct: 0, total: 0 }, H: { correct: 0, total: 0 } };
        
        sessions.forEach(session => {
            session.questions?.forEach(q => {
                const diff = q.difficulty || 'M';
                diffStats[diff].total++;
                if (q.correct) diffStats[diff].correct++;
            });
        });
        
        const diffNames = { E: 'Easy', M: 'Medium', H: 'Hard' };
        
        return Object.entries(diffStats).map(([diff, stats]) => {
            const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            
            return `
                <div class="difficulty-stat">
                    <div class="difficulty-header">
                        <span class="difficulty-label ${diff.toLowerCase()}">${diffNames[diff]}</span>
                        <span class="accuracy">${accuracy}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill difficulty-${diff.toLowerCase()}" style="width: ${accuracy}%"></div>
                    </div>
                    <p class="difficulty-detail">${stats.total} questions attempted</p>
                </div>
            `;
        }).join('');
    }

    renderRecommendations(analytics) {
        const insights = analytics.insights || [];
        if (insights.length === 0) {
            return '<p class="text-secondary">Complete some practice sessions to get personalized recommendations.</p>';
        }
        
        const latestInsights = insights[insights.length - 1];
        const recommendations = latestInsights.recommendedActions || [];
        
        if (recommendations.length === 0) {
            return '<p class="text-success">Great job! Keep up your current practice routine.</p>';
        }
        
        return recommendations.map(rec => `
            <div class="recommendation-card priority-${rec.priority}">
                <div class="rec-header">
                    <h4>${rec.title}</h4>
                    <span class="priority-badge ${rec.priority}">${rec.priority}</span>
                </div>
                <p>${rec.message}</p>
                <button class="btn btn-sm btn-primary" onclick="satApp.handleRecommendation('${rec.action}', ${JSON.stringify(rec.data || {})})">
                    Take Action
                </button>
            </div>
        `).join('');
    }

    renderStudyHabits(sessions) {
        if (sessions.length === 0) {
            return '<p class="text-secondary">No study data available yet.</p>';
        }
        
        const totalTime = sessions.reduce((acc, s) => acc + (s.timeSpent || 0), 0);
        const avgSessionTime = totalTime / sessions.length / 1000 / 60; // minutes
        const totalQuestions = sessions.reduce((acc, s) => acc + s.totalQuestions, 0);
        const avgQuestionsPerSession = totalQuestions / sessions.length;
        
        const dates = sessions.map(s => new Date(s.date).toDateString());
        const uniqueDays = [...new Set(dates)].length;
        const avgSessionsPerDay = sessions.length / uniqueDays;
        
        return `
            <div class="habit-stats">
                <div class="habit-stat">
                    <h4>${Math.round(avgSessionTime)} min</h4>
                    <p>Average session length</p>
                </div>
                <div class="habit-stat">
                    <h4>${Math.round(avgQuestionsPerSession)}</h4>
                    <p>Questions per session</p>
                </div>
                <div class="habit-stat">
                    <h4>${Math.round(avgSessionsPerDay * 10) / 10}</h4>
                    <p>Sessions per day</p>
                </div>
                <div class="habit-stat">
                    <h4>${uniqueDays}</h4>
                    <p>Days practiced</p>
                </div>
            </div>
        `;
    }

    renderGoalTracking(userData) {
        const targetScore = this.app.currentUser?.targetScore || 1400;
        const currentEstimate = this.app.getUserStats().estimatedScore || 1200;
        const progress = Math.min(100, ((currentEstimate - 1200) / (targetScore - 1200)) * 100);
        
        return `
            <div class="goal-progress">
                <div class="goal-header">
                    <h4>Target Score: ${targetScore}</h4>
                    <span class="current-score">Current Estimate: ${currentEstimate}</span>
                </div>
                <div class="progress-bar large">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <p class="goal-detail">
                    ${progress >= 100 ? 'Congratulations! You\'ve reached your target score!' : 
                      `${Math.round(progress)}% progress toward your goal`}
                </p>
            </div>
        `;
    }

    renderDetailedPerformanceChart() {
        // More detailed chart for the progress page
        const canvas = document.getElementById('detailedPerformanceChart');
        if (!canvas) return;
        
        // Similar to dashboard chart but with more detail
        this.renderPerformanceChart(); // For now, use the same implementation
    }
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.satApp) {
            window.SATAnalytics = new SATAnalytics(window.satApp);
        }
    }, 100);
});