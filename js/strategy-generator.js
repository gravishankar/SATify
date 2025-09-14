/**
 * Strategy Generator - Vanilla JavaScript adaptation of podcast components
 * Handles pattern recognition and strategy generation for Words in Context questions
 */

class StrategyGenerator {
    constructor() {
        this.patterns = {
            TENSION_DETAIL: {
                signals: ["tension", ":"],
                keyWords: ["different", "various", "diverse"],
                redFlagWords: ["harmonious", "uniform", "integrated", "complementary"],
                reasoning: "Different types create tension",
                description: "When you see 'tension' followed by a colon, the blank needs a word that shows different/conflicting elements."
            },
            CONTRAST: {
                signals: ["However", "Despite", "While", "Unlike", "But"],
                keyWords: ["opposite", "different", "contrasting"],
                redFlagWords: ["similar", "same", "consistent"],
                reasoning: "Signal word requires opposite meaning",
                description: "Contrast signals like 'However' or 'Despite' mean the blank should contrast with what came before."
            },
            PROCESS_RESULT: {
                signals: ["found that", "showed that", "study", "research"],
                keyWords: ["promote", "increase", "support", "enable"],
                redFlagWords: ["prevent", "decrease", "hinder"],
                reasoning: "Study result needs logical outcome",
                description: "Research results should logically connect to their findings."
            },
            EVIDENCE_DETAIL: {
                signals: [":", "such as", "including", "for example"],
                keyWords: ["define", "specify", "characterize"],
                redFlagWords: ["contradict", "oppose"],
                reasoning: "Examples define the blank",
                description: "When examples follow a colon, they define what the blank should be."
            },
            EVALUATION: {
                signals: ["praised", "criticized", "successful", "failed"],
                keyWords: ["positive", "negative", "judgment"],
                redFlagWords: ["neutral", "objective"],
                reasoning: "Match the evaluative tone",
                description: "Evaluative language requires the blank to match the positive or negative tone."
            },
            DESCRIPTION: {
                signals: ["characterized by", "known for", "defined as"],
                keyWords: ["appropriate", "fitting", "suitable"],
                redFlagWords: ["inappropriate", "unsuitable"],
                reasoning: "Context provides definition",
                description: "The surrounding context defines what word logically fits the blank."
            }
        };
    }

    analyzeQuestion(passage, choices, correctIndex) {
        // Clean passage for analysis
        const cleanPassage = this.cleanPassage(passage);

        // Identify primary pattern
        const pattern = this.identifyPattern(cleanPassage);

        // Extract key elements
        const keySignal = this.extractKeySignal(cleanPassage, pattern);
        const prediction = this.makePrediction(cleanPassage, pattern);
        const redFlags = this.identifyRedFlags(cleanPassage, choices, pattern);
        const correctWord = choices[correctIndex];

        return {
            pattern: pattern,
            keySignal: keySignal,
            prediction: prediction,
            redFlags: redFlags,
            correctWord: correctWord,
            reasoning: this.patterns[pattern]?.reasoning || "Context-based logic",
            description: this.patterns[pattern]?.description || "Analyze the context to find the best fit."
        };
    }

    cleanPassage(passage) {
        // Remove HTML tags and extract text content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = passage;
        return tempDiv.textContent || tempDiv.innerText || '';
    }

    identifyPattern(passage) {
        // Check for tension + detail pattern
        if (passage.includes("tension") && passage.includes(":")) {
            return "TENSION_DETAIL";
        }

        // Check for contrast signals
        const contrastSignals = ["However", "Despite", "While", "Unlike", "But"];
        if (contrastSignals.some(signal => passage.includes(signal))) {
            return "CONTRAST";
        }

        // Check for research/study patterns
        const researchSignals = ["found that", "showed that", "study", "research"];
        if (researchSignals.some(signal => passage.includes(signal))) {
            return "PROCESS_RESULT";
        }

        // Check for evidence/detail patterns
        if (passage.includes(":") || passage.includes("such as") || passage.includes("for example")) {
            return "EVIDENCE_DETAIL";
        }

        // Check for evaluative language
        const evaluativeSignals = ["praised", "criticized", "successful", "failed"];
        if (evaluativeSignals.some(signal => passage.includes(signal))) {
            return "EVALUATION";
        }

        // Default to description pattern
        return "DESCRIPTION";
    }

    extractKeySignal(passage, pattern) {
        const patternData = this.patterns[pattern];
        if (!patternData) return "context";

        for (const signal of patternData.signals) {
            if (passage.includes(signal)) return signal;
        }
        return patternData.signals[0];
    }

    makePrediction(passage, pattern) {
        switch(pattern) {
            case "TENSION_DETAIL": return "different/diverse";
            case "CONTRAST": return "opposite meaning";
            case "PROCESS_RESULT": return "logical outcome";
            case "EVIDENCE_DETAIL": return "defined by examples";
            case "EVALUATION": return "matching tone";
            default: return "context-appropriate";
        }
    }

    identifyRedFlags(passage, choices, pattern) {
        const flags = [];
        const patternData = this.patterns[pattern];

        if (patternData?.redFlagWords) {
            choices.forEach((choice, i) => {
                const cleanChoice = this.cleanPassage(choice);
                patternData.redFlagWords.forEach(flagWord => {
                    if (cleanChoice.toLowerCase().includes(flagWord.toLowerCase())) {
                        flags.push({
                            choice: String.fromCharCode(65 + i),
                            word: cleanChoice,
                            reason: `"${flagWord}" contradicts ${pattern.toLowerCase().replace('_', ' ')}`
                        });
                    }
                });
            });
        }

        return flags;
    }

    generateSocraticScript(analysis) {
        const script = [
            {
                speaker: "tutor",
                text: `Let's break down this Words in Context question step by step. I notice this follows a ${analysis.pattern.replace('_', ' ')} pattern.`
            },
            {
                speaker: "student",
                text: `How can you tell it's that pattern?`
            },
            {
                speaker: "tutor",
                text: `Great question! The key signal here is "${analysis.keySignal}". ${this.patterns[analysis.pattern]?.description}`
            },
            {
                speaker: "student",
                text: `So what should I predict for the blank?`
            },
            {
                speaker: "tutor",
                text: `Based on this pattern, we should predict something like "${analysis.prediction}". Now let's look at the choices and eliminate any red flags.`
            }
        ];

        if (analysis.redFlags.length > 0) {
            script.push({
                speaker: "student",
                text: "Which choices should I eliminate?"
            });

            const redFlagText = analysis.redFlags.map(flag =>
                `Choice ${flag.choice}: ${flag.reason}`
            ).join(". ");

            script.push({
                speaker: "tutor",
                text: `Watch out for these red flags: ${redFlagText}. These contradict our pattern.`
            });
        }

        script.push({
            speaker: "tutor",
            text: `The correct answer is "${analysis.correctWord}" because ${analysis.reasoning}.`
        });

        return script;
    }

    // Method to generate text-based strategy breakdown
    generateTextStrategy(questionData) {
        const passage = questionData.stem_html;
        const choices = questionData.choices.map(choice =>
            typeof choice === 'string' ? choice : choice.text || choice
        );
        const correctIndex = questionData.correct_choice_index;

        const analysis = this.analyzeQuestion(passage, choices, correctIndex);

        return {
            pattern: analysis.pattern,
            step1: `Context Analysis → ${this.patterns[analysis.pattern]?.description}`,
            step2: `Key Signal → "${analysis.keySignal}"`,
            step3: `Prediction → Look for "${analysis.prediction}"`,
            step4: `Red Flags → ${analysis.redFlags.length > 0 ?
                analysis.redFlags.map(flag => flag.reason).join(', ') :
                'No major red flags identified'}`,
            step5: `Verification → "${analysis.correctWord}" ${analysis.reasoning}`
        };
    }

    // Future method for voice generation (placeholder for ElevenLabs integration)
    async generateVoiceStrategy(questionData) {
        const script = this.generateSocraticScript(
            this.analyzeQuestion(
                questionData.stem_html,
                questionData.choices,
                questionData.correct_choice_index
            )
        );

        // TODO: Integrate with ElevenLabs API for voice generation
        // For now, return text-to-speech fallback structure
        return {
            script: script,
            audioUrl: null, // Will be populated when voice cloning is implemented
            fallbackText: script.map(line => `${line.speaker}: ${line.text}`).join('\n\n')
        };
    }
}

// Export for global use
window.StrategyGenerator = StrategyGenerator;