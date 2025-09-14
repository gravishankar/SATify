// SAT Words in Context Podcast Generator System
// Generates 60-second strategy podcasts for any WIC question

class WICPodcastGenerator {
  constructor() {
    this.strategies = {
      DETAIL: {
        signals: [":", "such as", "including", "for example"],
        approach: "Use examples to define the blank"
      },
      CONTRAST: {
        signals: ["However", "But", "While", "Unlike", "Despite"],
        approach: "Find the opposite relationship"
      },
      TENSION: {
        signals: ["tension", "conflict", "struggle", "competing"],
        approach: "Look for different/opposing forces"
      },
      PROCESS: {
        signals: ["found that", "showed that", "results", "study"],
        approach: "Identify cause and effect"
      },
      EVALUATION: {
        signals: ["praised", "criticized", "successful", "failed"],
        approach: "Match the judgment tone"
      }
    };
    
    this.redFlags = {
      CONTRADICTORY: "Opposite of what context requires",
      LOGICAL_MISMATCH: "Doesn't make logical sense",
      SCOPE_MISMATCH: "Wrong intensity/scale",
      UNWARRANTED: "Not supported by evidence"
    };
  }

  // Main analysis function
  analyzeQuestion(questionData) {
    const { passage, choices, correctAnswer } = questionData;
    
    return {
      strategy: this.identifyStrategy(passage),
      keySignal: this.findKeySignal(passage),
      prediction: this.makePrediction(passage),
      redFlags: this.findRedFlags(passage, choices),
      correctReasoning: this.explainCorrect(passage, choices, correctAnswer)
    };
  }

  identifyStrategy(passage) {
    for (const [strategy, data] of Object.entries(this.strategies)) {
      if (data.signals.some(signal => passage.includes(signal))) {
        return strategy;
      }
    }
    return "DESCRIPTION"; // default
  }

  findKeySignal(passage) {
    // Find the most important context clue
    if (passage.includes("tension")) return "tension";
    if (passage.includes("However")) return "However";
    if (passage.includes(":")) return "colon introducing examples";
    if (passage.includes("found that")) return "study result";
    return "context pattern";
  }

  makePrediction(passage) {
    // Simple word prediction based on context
    if (passage.includes("tension") && passage.includes(":")) {
      return "different";
    }
    if (passage.includes("However") || passage.includes("Despite")) {
      return "opposite";
    }
    if (passage.includes("successful") || passage.includes("effective")) {
      return "positive";
    }
    return "contextual fit";
  }

  findRedFlags(passage, choices) {
    const flags = [];
    
    // Check for contradictory choices
    if (passage.includes("tension")) {
      choices.forEach((choice, i) => {
        if (choice.includes("harmoni") || choice.includes("unifor") || choice.includes("integrat")) {
          flags.push({
            choice: String.fromCharCode(65 + i),
            word: choice,
            flag: "CONTRADICTORY",
            reason: "contradicts tension"
          });
        }
      });
    }
    
    if (passage.includes("However") || passage.includes("Despite")) {
      // Look for choices that don't provide contrast
    }
    
    return flags;
  }

  explainCorrect(passage, choices, correctIndex) {
    const correctChoice = choices[correctIndex.charCodeAt(0) - 65];
    
    // Build reasoning based on context
    let reasoning = "";
    
    if (passage.includes("tension") && passage.includes(":")) {
      reasoning = "Different types create tension, making work distinctive";
    } else if (passage.includes("However")) {
      reasoning = "Provides the contrast needed by 'However'";
    } else if (passage.includes("found that")) {
      reasoning = "Matches the study's result/conclusion";
    }
    
    return {
      word: correctChoice,
      reasoning: reasoning
    };
  }

  // Generate podcast script
  generatePodcastScript(analysis, questionData) {
    const { strategy, keySignal, prediction, redFlags, correctReasoning } = analysis;
    const { choices, correctAnswer } = questionData;
    
    let script = `**TUTOR:** What's the key signal in this passage?\n\n`;
    script += `**STUDENT:** "${keySignal}"?\n\n`;
    script += `**TUTOR:** Right. What does that tell us we need?\n\n`;
    script += `**STUDENT:** ${this.getStrategyHint(strategy, keySignal)}.\n\n`;
    script += `**TUTOR:** Exactly. Predict a simple word.\n\n`;
    script += `**STUDENT:** "${prediction}"?\n\n`;
    script += `**TUTOR:** Perfect. Now check the red flags. Choice ${redFlags[0]?.choice} - "${redFlags[0]?.word}"?\n\n`;
    script += `**STUDENT:** ${redFlags[0]?.reason}.\n\n`;
    
    if (redFlags.length > 1) {
      script += `**TUTOR:** Choice ${redFlags[1]?.choice} - "${redFlags[1]?.word}"?\n\n`;
      script += `**STUDENT:** ${redFlags[1]?.reason}.\n\n`;
    }
    
    script += `**TUTOR:** That leaves ${correctAnswer} - "${correctReasoning.word}". Why does this work?\n\n`;
    script += `**STUDENT:** ${correctReasoning.reasoning}!\n\n`;
    script += `**TUTOR:** Perfect. Key pattern: ${this.getKeyPattern(strategy)}.\n\n`;
    script += `---\n*Strategy: ${strategy} | Duration: ~60 seconds*`;
    
    return script;
  }

  getStrategyHint(strategy, signal) {
    switch(strategy) {
      case "DETAIL": return "The examples define what we need";
      case "CONTRAST": return "The opposite of what came before";
      case "TENSION": return "Different things that create conflict";
      case "PROCESS": return "The logical result or effect";
      default: return "Something that fits the context";
    }
  }

  getKeyPattern(strategy) {
    switch(strategy) {
      case "DETAIL": return "Examples after colon define your answer";
      case "CONTRAST": return "Signal words require opposite meaning";
      case "TENSION": return "Tension requires difference";
      case "PROCESS": return "Cause leads to logical effect";
      default: return "Context determines meaning";
    }
  }

  // Convert to audio using Web Speech API
  async generateAudio(script) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance();
      
      // Clean script for TTS
      const cleanScript = script
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown
        .replace(/---[\s\S]*$/, '') // Remove metadata
        .replace(/\n+/g, ' '); // Single spaces
      
      utterance.text = cleanScript;
      utterance.rate = 1.1; // Slightly faster for engagement
      utterance.pitch = 1.0;
      
      return new Promise((resolve) => {
        utterance.onend = () => resolve();
        speechSynthesis.speak(utterance);
      });
    }
  }
}

// Sample questions for testing
const sampleQuestions = [
  {
    id: "f6e632fb",
    passage: "Researcher Haesung Jung led a 2020 study showing that individual acts of kindness can ______ prosocial behavior across a larger group. Jung and her team found that bystanders who witness a helpful act become more likely to offer help to someone else, and in doing so, can inspire still others to act.",
    choices: ["require", "remember", "foster", "discourage"],
    correctAnswer: "C"
  },
  {
    id: "123cf5db",
    passage: "The work of Kiowa painter T.C. Cannon derives its power in part from the tension among his ______ influences: classic European portraiture, with its realistic treatment of faces; the American pop art movement, with its vivid colors; and flatstyle, the intertribal painting style that rejects the effect of depth typically achieved through shading and perspective.",
    choices: ["complementary", "unknown", "disparate", "interchangeable"],
    correctAnswer: "C"
  }
];

// Main execution function
async function generatePodcastForQuestion(questionData) {
  const generator = new WICPodcastGenerator();
  
  console.log(`\n=== Processing Question ${questionData.id} ===`);
  
  // Step 1: Analyze question
  const analysis = generator.analyzeQuestion(questionData);
  console.log("Analysis:", analysis);
  
  // Step 2: Generate script
  const script = generator.generatePodcastScript(analysis, questionData);
  console.log("\n=== PODCAST SCRIPT ===");
  console.log(script);
  
  // Step 3: Return data for integration
  return {
    questionId: questionData.id,
    strategy: analysis.strategy,
    script: script,
    audioGeneration: generator.generateAudio.bind(generator, script)
  };
}

// Integration with SAT app
class SATAppIntegration {
  constructor() {
    this.generator = new WICPodcastGenerator();
  }
  
  // Add to existing question component
  addPodcastFeature(questionComponent) {
    const podcastButton = document.createElement('button');
    podcastButton.innerHTML = '🎧 Strategy Breakdown';
    podcastButton.className = 'podcast-btn';
    
    podcastButton.addEventListener('click', async () => {
      const questionData = this.extractQuestionData(questionComponent);
      const podcast = await generatePodcastForQuestion(questionData);
      
      // Show script in modal
      this.showPodcastModal(podcast.script);
      
      // Optionally play audio
      if (confirm('Play audio version?')) {
        await podcast.audioGeneration();
      }
    });
    
    questionComponent.appendChild(podcastButton);
  }
  
  extractQuestionData(component) {
    // Extract from your app's DOM structure
    return {
      id: component.dataset.questionId,
      passage: component.querySelector('.passage').textContent,
      choices: Array.from(component.querySelectorAll('.choice')).map(c => c.textContent),
      correctAnswer: component.dataset.correctAnswer
    };
  }
  
  showPodcastModal(script) {
    const modal = document.createElement('div');
    modal.className = 'podcast-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h3>Strategy Breakdown</h3>
        <div class="script">${script.replace(/\n/g, '<br>')}</div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close functionality
    modal.querySelector('.close').onclick = () => modal.remove();
    modal.onclick = (e) => e.target === modal && modal.remove();
  }
}

// Test the system
console.log("Testing SAT Podcast Generator...");

// Test with sample questions
sampleQuestions.forEach(async (question) => {
  await generatePodcastForQuestion(question);
});

console.log("\n=== INTEGRATION READY ===");
console.log("To integrate with your SAT app:");
console.log("1. Include this script in your app");
console.log("2. Initialize: const integration = new SATAppIntegration()");
console.log("3. Add to questions: integration.addPodcastFeature(questionElement)");
