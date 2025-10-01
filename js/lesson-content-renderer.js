/**
 * 🌊 SATify Lesson Content Renderer - Hawaiian Sea Theme
 * Generic, data-driven rendering system for all lesson content types
 * Optimized for high school students with progressive disclosure
 */

class LessonContentRenderer {
    constructor() {
        this.seaTheme = this.initializeSeaTheme();
        this.interactiveElements = new Map();
    }

    /**
     * 🎨 Initialize Hawaiian Sea Theme Color Palette
     */
    initializeSeaTheme() {
        return {
            colors: {
                deepOcean: '#0369a1',      // Core principles, main headings
                turquoise: '#06b6d4',      // Strategy steps, interactive
                seaFoam: '#a7f3d0',        // Backgrounds, highlights
                coral: '#f97316',          // Warnings, flaws
                pearlWhite: '#f8fafc',     // Content backgrounds
                sand: '#fef3c7',           // Examples, insights
                wave: '#0284c7',           // Accents
                oceanMist: '#e0f2fe'       // Light backgrounds
            },
            typography: {
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                heading: { size: '1.5rem', weight: '600', lineHeight: '1.3' },
                subtitle: { size: '1.1rem', weight: '500', lineHeight: '1.4' },
                body: { size: '1rem', weight: '400', lineHeight: '1.6' },
                emphasis: { size: '1rem', weight: '600', lineHeight: '1.6' },
                small: { size: '0.875rem', weight: '400', lineHeight: '1.5' }
            },
            spacing: {
                xs: '0.25rem',
                sm: '0.5rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem'
            },
            borderRadius: {
                sm: '0.375rem',
                md: '0.5rem',
                lg: '0.75rem'
            }
        };
    }

    /**
     * 🎯 Main render method - routes content to appropriate renderer
     */
    renderSlideContent(slide) {
        if (!slide || !slide.content) {
            return this.renderEmptySlide();
        }

        const content = slide.content;
        let html = `<div class="sea-slide-container">`;

        // Always render heading first
        if (content.heading) {
            html += this.renderHeading(content.heading);
        }

        // Render subtitle if present
        if (content.subtitle) {
            html += this.renderSubtitle(content.subtitle);
        }

        // Render main text if present
        if (content.text) {
            html += this.renderText(content.text);
        }

        // Route to specific content renderers based on content structure
        html += this.renderContentSections(content);

        html += `</div>`;
        return html;
    }

    /**
     * 🌊 Route content to appropriate specialized renderers
     */
    renderContentSections(content) {
        let html = '';

        // Progressive rendering of all content types
        const renderOrder = [
            'core_principle',
            'strategy_steps',
            'bullet_points',
            'steps',
            'tactics',
            'worked_example',
            'example',
            'key_points',
            'categories',
            'table',
            'examples',
            'key_insight',
            'instructions'
        ];

        renderOrder.forEach(contentType => {
            if (content[contentType]) {
                html += this.renderByType(contentType, content[contentType]);
            }
        });

        return html;
    }

    /**
     * 🎯 Generic content type router
     */
    renderByType(type, data) {
        const renderers = {
            'core_principle': () => this.renderCorePrinciple(data),
            'strategy_steps': () => this.renderStrategySteps(data),
            'bullet_points': () => this.renderBulletPoints(data),
            'steps': () => this.renderSteps(data),
            'tactics': () => this.renderTactics(data),
            'worked_example': () => this.renderWorkedExample(data),
            'example': () => this.renderExample(data),
            'key_points': () => this.renderKeyPoints(data),
            'categories': () => this.renderCategories(data),
            'table': () => this.renderTable(data),
            'examples': () => this.renderExamples(data),
            'key_insight': () => this.renderKeyInsight(data),
            'instructions': () => this.renderInstructions(data)
        };

        const renderer = renderers[type];
        return renderer ? renderer() : this.renderUnknownContent(type, data);
    }

    /**
     * 📝 Basic content renderers
     */
    renderHeading(heading) {
        const { colors, typography } = this.seaTheme;
        return `
            <h3 style="
                color: ${colors.deepOcean};
                font-family: ${typography.fontFamily};
                font-size: ${typography.heading.size};
                font-weight: ${typography.heading.weight};
                line-height: ${typography.heading.lineHeight};
                margin: 0 0 ${this.seaTheme.spacing.lg} 0;
                text-align: center;
            ">${heading}</h3>
        `;
    }

    renderSubtitle(subtitle) {
        const { colors, typography } = this.seaTheme;
        return `
            <p style="
                color: ${colors.turquoise};
                font-family: ${typography.fontFamily};
                font-size: ${typography.subtitle.size};
                font-weight: ${typography.subtitle.weight};
                line-height: ${typography.subtitle.lineHeight};
                margin: 0 0 ${this.seaTheme.spacing.lg} 0;
                text-align: center;
                font-style: italic;
            ">${subtitle}</p>
        `;
    }

    renderText(text) {
        const { colors, typography } = this.seaTheme;
        return `
            <p style="
                color: ${colors.deepOcean};
                font-family: ${typography.fontFamily};
                font-size: ${typography.body.size};
                font-weight: ${typography.body.weight};
                line-height: ${typography.body.lineHeight};
                margin: 0 0 ${this.seaTheme.spacing.lg} 0;
                text-align: center;
            ">${text}</p>
        `;
    }

    /**
     * 🔵 Core Principle - Deep Ocean Blue Theme
     */
    renderCorePrinciple(principle) {
        const { colors, spacing, borderRadius } = this.seaTheme;
        return `
            <div style="
                background: linear-gradient(135deg, ${colors.deepOcean}, ${colors.wave});
                color: white;
                padding: ${spacing.xl};
                border-radius: ${borderRadius.lg};
                margin: 0 0 ${spacing.xl} 0;
                text-align: center;
                box-shadow: 0 8px 25px rgba(3, 105, 161, 0.3);
            ">
                <h4 style="
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0 0 ${spacing.md} 0;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">🎯 ${principle.title}</h4>
                <p style="
                    margin: 0;
                    line-height: 1.6;
                    opacity: 0.95;
                ">${principle.description}</p>
            </div>
        `;
    }

    /**
     * 🟦 Strategy Steps - Turquoise Numbered Cards
     */
    renderStrategySteps(steps) {
        const { colors, spacing, borderRadius } = this.seaTheme;
        let html = `<div style="margin: 0 0 ${spacing.xl} 0;">`;

        steps.forEach((step, index) => {
            html += `
                <div style="
                    background: ${colors.pearlWhite};
                    border: 2px solid ${colors.turquoise};
                    border-radius: ${borderRadius.lg};
                    padding: ${spacing.lg};
                    margin: 0 0 ${spacing.lg} 0;
                    position: relative;
                    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.1);
                ">
                    <div style="
                        position: absolute;
                        top: -12px;
                        left: ${spacing.lg};
                        background: ${colors.turquoise};
                        color: white;
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 600;
                        font-size: 1.1rem;
                    ">${step.step || index + 1}</div>

                    <div style="margin-top: ${spacing.md};">
                        <h5 style="
                            color: ${colors.deepOcean};
                            font-size: 1.1rem;
                            font-weight: 600;
                            margin: 0 0 ${spacing.sm} 0;
                        ">${step.title}</h5>

                        ${step.description ? `
                            <p style="
                                color: ${colors.deepOcean};
                                margin: 0 0 ${spacing.md} 0;
                                line-height: 1.6;
                            ">${step.description}</p>
                        ` : ''}

                        ${this.renderStepSubcontent(step)}
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        return html;
    }

    /**
     * 🔸 Strategy Step Sub-content (points, examples, categories)
     */
    renderStepSubcontent(step) {
        let html = '';

        if (step.points && step.points.length > 0) {
            html += this.renderStepPoints(step.points);
        }

        if (step.examples && step.examples.length > 0) {
            html += this.renderStepExamples(step.examples);
        }

        if (step.categories) {
            html += this.renderStepCategories(step.categories);
        }

        return html;
    }

    renderStepPoints(points) {
        const { colors, spacing } = this.seaTheme;
        let html = `<ul style="margin: ${spacing.sm} 0 0 ${spacing.md}; padding: 0;">`;

        points.forEach(point => {
            html += `
                <li style="
                    color: ${colors.deepOcean};
                    margin: 0 0 ${spacing.sm} 0;
                    list-style: none;
                    position: relative;
                    padding-left: ${spacing.lg};
                ">
                    <span style="
                        position: absolute;
                        left: 0;
                        color: ${colors.turquoise};
                        font-weight: 600;
                    ">•</span>
                    ${point}
                </li>
            `;
        });

        html += `</ul>`;
        return html;
    }

    renderStepExamples(examples) {
        const { colors, spacing, borderRadius } = this.seaTheme;
        let html = `
            <div style="
                background: ${colors.sand};
                border: 1px solid #f59e0b;
                border-radius: ${borderRadius.md};
                padding: ${spacing.md};
                margin: ${spacing.md} 0 0 0;
            ">
                <h6 style="
                    color: #92400e;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin: 0 0 ${spacing.sm} 0;
                ">💡 Examples:</h6>
        `;

        examples.forEach(example => {
            html += `
                <p style="
                    color: #451a03;
                    margin: 0 0 ${spacing.sm} 0;
                    font-style: italic;
                    line-height: 1.5;
                ">${example}</p>
            `;
        });

        html += `</div>`;
        return html;
    }

    renderStepCategories(categories) {
        const { colors, spacing, borderRadius } = this.seaTheme;
        let html = `
            <div style="
                background: ${colors.oceanMist};
                border-radius: ${borderRadius.md};
                padding: ${spacing.md};
                margin: ${spacing.md} 0 0 0;
            ">
                <h6 style="
                    color: ${colors.deepOcean};
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin: 0 0 ${spacing.sm} 0;
                ">📝 Categories:</h6>
        `;

        Object.entries(categories).forEach(([category, description]) => {
            html += `
                <div style="margin: 0 0 ${spacing.sm} 0;">
                    <strong style="color: ${colors.turquoise};">${category}:</strong>
                    <span style="color: ${colors.deepOcean}; margin-left: ${spacing.sm};">${description}</span>
                </div>
            `;
        });

        html += `</div>`;
        return html;
    }

    /**
     * 📋 Simple content renderers
     */
    renderBulletPoints(points) {
        const { colors, spacing } = this.seaTheme;
        let html = `<ul style="max-width: 600px; margin: 0 auto ${spacing.xl} auto; padding: 0;">`;

        points.forEach(point => {
            html += `
                <li style="
                    background: ${colors.pearlWhite};
                    border-left: 4px solid ${colors.turquoise};
                    padding: ${spacing.md};
                    margin: 0 0 ${spacing.md} 0;
                    list-style: none;
                    color: ${colors.deepOcean};
                    line-height: 1.6;
                    border-radius: 0 ${this.seaTheme.borderRadius.md} ${this.seaTheme.borderRadius.md} 0;
                ">${point}</li>
            `;
        });

        html += `</ul>`;
        return html;
    }

    renderKeyInsight(insight) {
        const { colors, spacing, borderRadius } = this.seaTheme;
        return `
            <div style="
                background: linear-gradient(135deg, ${colors.sand}, #fde68a);
                border: 2px solid #f59e0b;
                border-radius: ${borderRadius.lg};
                padding: ${spacing.lg};
                margin: ${spacing.lg} 0;
                text-align: center;
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
            ">
                <div style="
                    color: #92400e;
                    font-size: 1.1rem;
                    font-weight: 600;
                    line-height: 1.5;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
                ">${insight}</div>
            </div>
        `;
    }

    /**
     * 🚨 Tactics - Organized with Clear Visual Hierarchy
     */
    renderTactics(tactics) {
        const { colors, spacing, borderRadius } = this.seaTheme;
        let html = `<div style="margin: 0 0 ${spacing.xl} 0;">`;

        tactics.forEach((tactic, index) => {
            html += `
                <div style="
                    background: ${colors.pearlWhite};
                    border: 1px solid ${colors.turquoise};
                    border-radius: ${borderRadius.lg};
                    padding: ${spacing.lg};
                    margin: 0 0 ${spacing.lg} 0;
                    box-shadow: 0 2px 8px rgba(6, 182, 212, 0.1);
                ">
                    <h5 style="
                        color: ${colors.deepOcean};
                        font-size: 1.1rem;
                        font-weight: 600;
                        margin: 0 0 ${spacing.sm} 0;
                    ">${tactic.name}</h5>

                    <p style="
                        color: ${colors.deepOcean};
                        margin: 0 0 ${spacing.md} 0;
                        line-height: 1.6;
                    ">${tactic.description}</p>

                    ${tactic.application ? `
                        <div style="
                            background: ${colors.oceanMist};
                            padding: ${spacing.md};
                            border-radius: ${borderRadius.md};
                            margin: 0 0 ${spacing.md} 0;
                        ">
                            <strong style="color: ${colors.turquoise};">Application:</strong>
                            <span style="color: ${colors.deepOcean}; margin-left: ${spacing.sm};">${tactic.application}</span>
                        </div>
                    ` : ''}

                    ${tactic.red_flags ? this.renderRedFlags(tactic.red_flags) : ''}
                    ${tactic.example ? this.renderTacticExample(tactic.example) : ''}
                </div>
            `;
        });

        html += `</div>`;
        return html;
    }

    renderRedFlags(redFlags) {
        const { colors, spacing, borderRadius } = this.seaTheme;
        let html = `
            <div style="
                background: #fef2f2;
                border: 1px solid ${colors.coral};
                border-radius: ${borderRadius.md};
                padding: ${spacing.md};
                margin: 0 0 ${spacing.md} 0;
            ">
                <h6 style="
                    color: ${colors.coral};
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin: 0 0 ${spacing.sm} 0;
                ">🚨 Red Flags:</h6>
                <ul style="margin: 0; padding-left: ${spacing.lg};">
        `;

        redFlags.forEach(flag => {
            html += `
                <li style="
                    color: #991b1b;
                    margin: 0 0 ${spacing.xs} 0;
                    line-height: 1.5;
                ">${flag}</li>
            `;
        });

        html += `</ul></div>`;
        return html;
    }

    renderTacticExample(example) {
        const { colors, spacing, borderRadius } = this.seaTheme;
        return `
            <div style="
                background: ${colors.sand};
                border: 1px solid #f59e0b;
                border-radius: ${borderRadius.md};
                padding: ${spacing.md};
            ">
                <strong style="color: #92400e;">Example:</strong>
                <span style="color: #451a03; margin-left: ${spacing.sm}; font-style: italic;">${example}</span>
            </div>
        `;
    }

    /**
     * 📊 Worked Example - Progressive Reveal (One-by-One)
     */
    renderWorkedExample(workedExample) {
        const { colors, spacing, borderRadius } = this.seaTheme;
        const exampleId = `worked-example-${Date.now()}`;

        let html = `
            <div style="
                background: ${colors.pearlWhite};
                border: 2px solid ${colors.deepOcean};
                border-radius: ${borderRadius.lg};
                padding: ${spacing.xl};
                margin: ${spacing.xl} 0;
                box-shadow: 0 8px 25px rgba(3, 105, 161, 0.15);
            ">
                <h4 style="
                    color: ${colors.deepOcean};
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin: 0 0 ${spacing.lg} 0;
                    text-align: center;
                ">🎯 Worked Example</h4>

                <div style="
                    background: ${colors.sand};
                    border: 1px solid #f59e0b;
                    border-radius: ${borderRadius.md};
                    padding: ${spacing.lg};
                    margin: 0 0 ${spacing.lg} 0;
                ">
                    <p style="
                        color: #451a03;
                        margin: 0;
                        font-style: italic;
                        line-height: 1.6;
                        text-align: center;
                    ">${workedExample.question}</p>
                </div>

                <p style="
                    text-align: center;
                    color: ${colors.deepOcean};
                    font-weight: 600;
                    margin: ${spacing.md} 0;
                    font-size: 0.95rem;
                ">👆 Click each answer choice to reveal category and analysis</p>

                <div id="${exampleId}" style="margin-top: ${spacing.lg};">
                    ${this.renderProgressiveChoices(workedExample.choices, exampleId)}
                </div>
            </div>
        `;

        return html;
    }

    renderProgressiveChoices(choices, containerId) {
        const { colors, spacing, borderRadius } = this.seaTheme;
        let html = `
            <div style="
                display: grid;
                gap: ${spacing.md};
                margin: 0 0 ${spacing.lg} 0;
            ">
        `;

        Object.entries(choices).forEach(([letter, choice], index) => {
            const isCorrect = choice.validation;
            const choiceId = `${containerId}-choice-${letter}`;

            html += `
                <div class="choice-card"
                     onclick="window.lessonContentRenderer.revealChoice('${choiceId}')"
                     style="
                        background: ${colors.oceanMist};
                        border: 2px solid ${colors.turquoise};
                        border-radius: ${borderRadius.md};
                        padding: ${spacing.lg};
                        cursor: pointer;
                        transition: all 0.3s ease;
                        position: relative;
                    "
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(6, 182, 212, 0.2)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">

                    <div style="
                        font-weight: 600;
                        color: ${colors.deepOcean};
                        margin: 0 0 ${spacing.sm} 0;
                    ">
                        ${letter}. ${choice.text}
                    </div>

                    <div id="${choiceId}-analysis" style="display: none; margin-top: ${spacing.md};">
                        <div style="
                            background: ${isCorrect ? colors.seaFoam : '#fef2f2'};
                            border: 2px solid ${isCorrect ? '#22c55e' : colors.coral};
                            border-radius: ${borderRadius.md};
                            padding: ${spacing.md};
                        ">
                            <div style="
                                color: ${isCorrect ? '#166534' : '#991b1b'};
                                font-weight: 600;
                                margin: 0 0 ${spacing.sm} 0;
                            ">
                                ${isCorrect ? '✅' : '❌'} ${choice.category}
                            </div>
                            <div style="
                                color: ${isCorrect ? '#166534' : '#991b1b'};
                                line-height: 1.5;
                            ">
                                ${choice.validation || choice.flaw}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        return html;
    }

    /**
     * 🎯 Interactive Methods
     */
    revealChoice(choiceId) {
        const analysis = document.getElementById(`${choiceId}-analysis`);
        if (analysis) {
            analysis.style.display = analysis.style.display === 'none' ? 'block' : 'none';
        }
    }

    /**
     * 📝 Additional content renderers for completeness
     */
    renderExample(example) {
        // This handles the example with breakdown we implemented earlier
        const { colors, spacing, borderRadius } = this.seaTheme;
        let html = `<div style="margin: ${spacing.xl} 0;">`;

        // Example text
        html += `
            <div style="
                background: ${colors.sand};
                border: 1px solid #f59e0b;
                border-radius: ${borderRadius.md};
                padding: ${spacing.lg};
                margin: 0 0 ${spacing.lg} 0;
            ">
                <h6 style="
                    color: #92400e;
                    margin: 0 0 ${spacing.md} 0;
                    font-weight: 600;
                ">📝 Example Question</h6>
                <p style="
                    margin: 0;
                    color: #451a03;
                    font-style: italic;
                    line-height: 1.6;
                ">${example.text}</p>
            </div>
        `;

        // Breakdown analysis
        if (example.breakdown) {
            html += this.renderExampleBreakdown(example.breakdown);
        }

        html += `</div>`;
        return html;
    }

    renderExampleBreakdown(breakdown) {
        const { colors, spacing, borderRadius } = this.seaTheme;
        let html = `
            <div style="
                background: ${colors.seaFoam};
                border: 1px solid #22c55e;
                border-radius: ${borderRadius.md};
                padding: ${spacing.lg};
            ">
                <h6 style="
                    color: #166534;
                    margin: 0 0 ${spacing.md} 0;
                    font-weight: 600;
                ">🔍 Analysis Breakdown</h6>
                <div style="display: grid; gap: ${spacing.md};">
        `;

        if (breakdown.idea_a) {
            html += `
                <div style="
                    background: white;
                    padding: ${spacing.md};
                    border-radius: ${borderRadius.sm};
                    border-left: 3px solid ${colors.turquoise};
                ">
                    <strong style="color: ${colors.deepOcean};">Idea A (Before blank):</strong>
                    <p style="margin: ${spacing.sm} 0 0 0; color: #374151;">${breakdown.idea_a}</p>
                </div>
            `;
        }

        if (breakdown.idea_b) {
            html += `
                <div style="
                    background: white;
                    padding: ${spacing.md};
                    border-radius: ${borderRadius.sm};
                    border-left: 3px solid #8b5cf6;
                ">
                    <strong style="color: #7c3aed;">Idea B (After blank):</strong>
                    <p style="margin: ${spacing.sm} 0 0 0; color: #374151;">${breakdown.idea_b}</p>
                </div>
            `;
        }

        if (breakdown.relationship) {
            html += `
                <div style="
                    background: white;
                    padding: ${spacing.md};
                    border-radius: ${borderRadius.sm};
                    border-left: 3px solid #10b981;
                ">
                    <strong style="color: #059669;">Logical Relationship:</strong>
                    <p style="margin: ${spacing.sm} 0 0 0; color: #374151;">${breakdown.relationship}</p>
                </div>
            `;
        }

        html += `</div></div>`;
        return html;
    }

    /**
     * 🔄 Additional specialized renderers
     */
    renderSteps(steps) {
        return this.renderBulletPoints(steps.map(step => `<strong>${step.step}:</strong> ${step.detail}`));
    }

    renderKeyPoints(keyPoints) {
        const { colors, spacing, borderRadius } = this.seaTheme;
        let html = `<div style="margin: 0 0 ${spacing.xl} 0;">`;

        keyPoints.forEach(point => {
            html += `
                <div style="
                    background: ${colors.oceanMist};
                    border: 2px solid ${colors.turquoise};
                    border-radius: ${borderRadius.lg};
                    padding: ${spacing.lg};
                    margin: 0 0 ${spacing.lg} 0;
                    text-align: center;
                ">
                    <h5 style="
                        color: ${colors.deepOcean};
                        font-size: 1.1rem;
                        font-weight: 600;
                        margin: 0 0 ${spacing.sm} 0;
                    ">${point.icon ? point.icon + ' ' : ''}${point.title}</h5>
                    <p style="
                        color: ${colors.deepOcean};
                        margin: 0;
                        line-height: 1.6;
                    ">${point.description}</p>
                </div>
            `;
        });

        html += `</div>`;
        return html;
    }

    renderCategories(categories) {
        const { colors, spacing, borderRadius } = this.seaTheme;
        let html = `<div style="margin: 0 0 ${spacing.xl} 0;">`;

        Object.entries(categories).forEach(([category, items]) => {
            html += `
                <div style="
                    background: ${colors.pearlWhite};
                    border: 1px solid ${colors.turquoise};
                    border-radius: ${borderRadius.md};
                    padding: ${spacing.lg};
                    margin: 0 0 ${spacing.lg} 0;
                ">
                    <h6 style="
                        color: ${colors.deepOcean};
                        margin: 0 0 ${spacing.sm} 0;
                        font-weight: 600;
                    ">${category}</h6>
                    <p style="
                        color: ${colors.wave};
                        margin: 0;
                        line-height: 1.6;
                    ">${Array.isArray(items) ? items.join(', ') : items}</p>
                </div>
            `;
        });

        html += `</div>`;
        return html;
    }

    renderTable(table) {
        const { colors, spacing, borderRadius } = this.seaTheme;
        let html = `
            <div style="
                margin: ${spacing.xl} 0;
                overflow-x: auto;
                border-radius: ${borderRadius.lg};
                border: 1px solid ${colors.turquoise};
                background: ${colors.pearlWhite};
            ">
                <table style="
                    width: 100%;
                    border-collapse: collapse;
                ">
        `;

        // Table header
        if (table.columns) {
            html += `<thead><tr>`;
            table.columns.forEach(column => {
                html += `
                    <th style="
                        background: ${colors.turquoise};
                        color: white;
                        padding: ${spacing.lg};
                        text-align: left;
                        font-weight: 600;
                        border-bottom: 2px solid ${colors.deepOcean};
                    ">${column}</th>
                `;
            });
            html += `</tr></thead>`;
        }

        // Table body
        html += `<tbody>`;
        table.rows.forEach((row, index) => {
            html += `
                <tr style="background: ${index % 2 === 0 ? 'white' : colors.oceanMist};">
            `;
            row.forEach(cell => {
                html += `
                    <td style="
                        padding: ${spacing.lg};
                        border-bottom: 1px solid ${colors.turquoise};
                        color: ${colors.deepOcean};
                        line-height: 1.6;
                        vertical-align: top;
                    ">${cell}</td>
                `;
            });
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;

        return html;
    }

    renderExamples(examples) {
        // Handle examples object (different from single example)
        const { colors, spacing, borderRadius } = this.seaTheme;
        let html = `<div style="margin: 0 0 ${spacing.xl} 0;">`;

        Object.entries(examples).forEach(([key, value]) => {
            html += `
                <div style="
                    background: ${colors.sand};
                    border-left: 4px solid #f59e0b;
                    padding: ${spacing.lg};
                    margin: 0 0 ${spacing.lg} 0;
                    border-radius: 0 ${borderRadius.md} ${borderRadius.md} 0;
                ">
                    <h6 style="
                        color: #92400e;
                        margin: 0 0 ${spacing.sm} 0;
                        font-weight: 600;
                        text-transform: capitalize;
                    ">${key.replace('_', ' ')}</h6>
                    <p style="
                        color: #451a03;
                        margin: 0;
                        line-height: 1.6;
                    ">${value}</p>
                </div>
            `;
        });

        html += `</div>`;
        return html;
    }

    renderInstructions(instructions) {
        const { colors, spacing, borderRadius } = this.seaTheme;
        return `
            <div style="
                background: ${colors.oceanMist};
                border: 1px solid ${colors.turquoise};
                border-radius: ${borderRadius.md};
                padding: ${spacing.lg};
                margin: ${spacing.lg} 0;
                text-align: center;
            ">
                <p style="
                    color: ${colors.deepOcean};
                    margin: 0;
                    line-height: 1.6;
                    font-style: italic;
                ">${instructions}</p>
            </div>
        `;
    }

    /**
     * 🔧 Utility methods
     */
    renderEmptySlide() {
        return `
            <div style="
                text-align: center;
                padding: 2rem;
                color: #64748b;
            ">
                Slide content not found
            </div>
        `;
    }

    renderUnknownContent(type, data) {
        console.warn(`Unknown content type: ${type}`, data);
        return `
            <div style="
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 0.5rem;
                padding: 1rem;
                margin: 1rem 0;
            ">
                <p style="margin: 0; color: #92400e;">
                    <strong>Unknown content type:</strong> ${type}
                </p>
            </div>
        `;
    }
}

// Global instance for interactive elements
window.lessonContentRenderer = new LessonContentRenderer();