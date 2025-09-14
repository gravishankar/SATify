// Complete SAT App Integration Package
// Drop this into your existing React SAT app

import React, { useState } from 'react';

// Enhanced Podcast Generator with all question patterns
class AdvancedWICGenerator {
  constructor() {
    this.patterns = {
      TENSION_DETAIL: {
        signals: ["tension", ":"],
        keyWords: ["different", "various", "diverse"],
        redFlagWords: ["harmonious", "uniform", "integrated", "complementary"],
        reasoning: "Different types create tension"
      },
      CONTRAST: {
        signals: ["However", "Despite", "While", "Unlike", "But"],
        keyWords: ["opposite", "different", "contrasting"],
        redFlagWords: ["similar", "same", "consistent"],
        reasoning: "Signal word requires opposite meaning"
      },
      PROCESS_RESULT: {
        signals: ["found that", "showed that", "study", "research"],
        keyWords: ["promote", "increase", "support", "enable"],
        redFlagWords: ["prevent", "decrease", "hinder"],
        reasoning: "Study result needs logical outcome"
      },
      EVALUATION: {
        signals: ["praised", "criticized", "successful", "failed"],
        keyWords: ["positive", "negative", "judgment"],
        reasoning: "Match the evaluative tone"
      },
      DESCRIPTION: {
        signals: [":", "such as", "including", "for example"],
        keyWords: ["define", "specify", "characterize"],
        reasoning: "Examples define the blank"
      }
    };
  }

  analyzeQuestion(passage, choices, correctIndex) {
    // Identify primary pattern
    const pattern = this.identifyPattern(passage);
    
    // Extract key elements
    const keySignal = this.extractKeySignal(passage, pattern);
    const prediction = this.makePrediction(passage, pattern);
    const redFlags = this.identifyRedFlags(passage, choices, pattern);
    const correctWord = choices[correctIndex.charCodeAt(0) - 65];
    
    return {
      pattern: pattern,
      keySignal: keySignal,
      prediction: prediction,
      redFlags: redFlags,
      correctWord: correctWord,
      reasoning: this.patterns[pattern]?.reasoning || "Context-based logic"
    };
  }

  identifyPattern(passage) {
    if (passage.includes("tension") && passage.includes(":")) return "TENSION_DETAIL";
    if (["However", "Despite", "While", "Unlike", "But"].some(s => passage.includes(s))) return "CONTRAST";
    if (["found that", "showed that", "study"].some(s => passage.includes(s))) return "PROCESS_RESULT";
    if (["praised", "criticized", "successful"].some(s => passage.includes(s))) return "EVALUATION";
    if (passage.includes(":") || passage.includes("such as")) return "DESCRIPTION";
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
      case "TENSION_DETAIL": return "different";
      case "CONTRAST": return "opposite";
      case "PROCESS_RESULT": return "positive effect";
      default: return "context fit";
    }
  }

  identifyRedFlags(passage, choices, pattern) {
    const flags = [];
    const patternData = this.patterns[pattern];
    
    if (patternData?.redFlagWords) {
      choices.forEach((choice, i) => {
        patternData.redFlagWords.forEach(flagWord => {
          if (choice.toLowerCase().includes(flagWord.toLowerCase())) {
            flags.push({
              choice: String.fromCharCode(65 + i),
              word: choice,
              reason: `${flagWord} contradicts ${pattern.toLowerCase()}`
            });
          }
        });
      });
    }
    
    return flags;
  }

  generateScript(analysis) {
    const { pattern, keySignal, prediction, redFlags, correctWord, reasoning } = analysis;
    
    let script = `**TUTOR:** What signal tells us what we need?\n\n`;
    script += `**STUDENT:** "${keySignal}"?\n\n`;
    script += `**TUTOR:** Right. What does that require?\n\n`;
    script += `**STUDENT:** ${this.getHint(pattern)}.\n\n`;
    script += `**TUTOR:** Predict a simple word.\n\n`;
    script += `**STUDENT:** "${prediction}"?\n\n`;
    
    // Add red flag analysis
    if (redFlags.length > 0) {
      script += `**TUTOR:** Check choice ${redFlags[0].choice} - "${redFlags[0].word}"?\n\n`;
      script += `**STUDENT:** ${redFlags[0].reason}.\n\n`;
    }
    
    if (redFlags.length > 1) {
      script += `**TUTOR:** Choice ${redFlags[1].choice} - "${redFlags[1].word}"?\n\n`;
      script += `**STUDENT:** ${redFlags[1].reason}.\n\n`;
    }
    
    script += `**TUTOR:** The answer is "${correctWord}". Why?\n\n`;
    script += `**STUDENT:** ${reasoning}!\n\n`;
    script += `**TUTOR:** Key pattern: ${this.getPattern(pattern)}.\n\n`;
    script += `---\n*Strategy: ${pattern} | ~60 seconds*`;
    
    return script;
  }

  getHint(pattern) {
    switch(pattern) {
      case "TENSION_DETAIL": return "Different things that conflict";
      case "CONTRAST": return "The opposite relationship";  
      case "PROCESS_RESULT": return "A logical positive outcome";
      case "EVALUATION": return "Match the judgment tone";
      default: return "Something that fits logically";
    }
  }

  getPattern(pattern) {
    switch(pattern) {
      case "TENSION_DETAIL": return "Tension needs difference";
      case "CONTRAST": return "Signal words flip meaning";
      case "PROCESS_RESULT": return "Studies show logical results";
      default: return "Context determines answer";
    }
  }
}

// React Component for SAT App Integration
const PodcastStrategy = ({ questionData, onClose }) => {
  const [currentScript, setCurrentScript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  React.useEffect(() => {
    generateStrategy();
  }, [questionData]);
  
  const generateStrategy = () => {
    const generator = new AdvancedWICGenerator();
    const { passage, choices, correctAnswer } = questionData;
    
    const analysis = generator.analyzeQuestion(passage, choices, correctAnswer);
    const script = generator.generateScript(analysis);
    setCurrentScript(script);
  };
  
  const playAudio = async () => {
    setIsPlaying(true);
    
    try {
      // Parse script into alternating tutor/student segments
      const segments = parseScriptForVoices(currentScript);
      
      // Play each segment with appropriate voice
      for (let i = 0; i < segments.length; i++) {
        await playVoiceSegment(segments[i]);
        if (!isPlaying) break; // Stop if user clicked stop
      }
    } catch (error) {
      console.error('Voice playback error:', error);
    } finally {
      setIsPlaying(false);
    }
  };
  
  const parseScriptForVoices = (script) => {
    const lines = script.split('\n').filter(line => line.trim());
    const segments = [];
    
    lines.forEach(line => {
      if (line.includes('**TUTOR:**')) {
        segments.push({
          text: line.replace('**TUTOR:**', '').trim(),
          voice: 'tutor'
        });
      } else if (line.includes('**STUDENT:**')) {
        segments.push({
          text: line.replace('**STUDENT:**', '').trim(),
          voice: 'student'
        });
      }
    });
    
    return segments;
  };
  
  const playVoiceSegment = async (segment) => {
    return new Promise(async (resolve) => {
      // Try voice cloning API first, fallback to enhanced TTS
      try {
        const audioUrl = await generateVoiceClone(segment.text, segment.voice);
        const audio = new Audio(audioUrl);
        audio.onended = resolve;
        audio.play();
      } catch (error) {
        // Fallback to enhanced browser TTS with character voices
        const utterance = new SpeechSynthesisUtterance(segment.text);
        
        if (segment.voice === 'tutor') {
          // Warm, encouraging tutor voice
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          utterance.volume = 0.8;
          // Try to select a pleasant female voice if available
          const voices = speechSynthesis.getVoices();
          const tutorVoice = voices.find(v => 
            v.name.includes('Female') || 
            v.name.includes('Samantha') || 
            v.name.includes('Karen') ||
            v.lang.includes('en-US')
          );
          if (tutorVoice) utterance.voice = tutorVoice;
        } else {
          // Curious, upbeat student voice
          utterance.rate = 1.1;
          utterance.pitch = 1.3;
          utterance.volume = 0.9;
          // Try to select a younger-sounding voice
          const voices = speechSynthesis.getVoices();
          const studentVoice = voices.find(v => 
            v.name.includes('Male') || 
            v.name.includes('Daniel') ||
            v.name.includes('Alex') ||
            (v.lang.includes('en-US') && v !== utterance.voice)
          );
          if (studentVoice) utterance.voice = studentVoice;
        }
        
        utterance.onend = resolve;
        speechSynthesis.speak(utterance);
      }
    });
  };
  
  const generateVoiceClone = async (text, voiceType) => {
    // Integration with voice cloning service
    const voiceId = voiceType === 'tutor' ? 'tutor-voice-id' : 'student-voice-id';
    
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.REACT_APP_ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: voiceType === 'tutor' ? 0.7 : 0.5,
          similarity_boost: 0.8,
          style: voiceType === 'tutor' ? 0.3 : 0.6,
          use_speaker_boost: true
        }
      })
    });
    
    if (!response.ok) throw new Error('Voice generation failed');
    
    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  };
  
  const stopAudio = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };
  
  return (
    <div className="podcast-strategy-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Strategy Breakdown</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-body">
          <div className="script-display">
            {currentScript.split('\n').map((line, i) => (
              <div key={i} className={
                line.includes('**TUTOR:**') ? 'tutor-line' :
                line.includes('**STUDENT:**') ? 'student-line' :
                line.includes('---') ? 'metadata' : 'regular-line'
              }>
                {line.replace(/\*\*(.*?)\*\*/g, '$1')}
              </div>
            ))}
          </div>
          
          <div className="audio-controls">
            {!isPlaying ? (
              <button onClick={playAudio} className="play-btn">
                🎧 Play Strategy Audio
              </button>
            ) : (
              <button onClick={stopAudio} className="stop-btn">
                ⏹ Stop Audio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Integration Hook for your existing SAT app
export const usePodcastStrategy = () => {
  const [showPodcast, setShowPodcast] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  const openPodcast = (questionData) => {
    setCurrentQuestion(questionData);
    setShowPodcast(true);
  };
  
  const closePodcast = () => {
    setShowPodcast(false);
    setCurrentQuestion(null);
  };
  
  const PodcastModal = () => {
    if (!showPodcast || !currentQuestion) return null;
    
    return (
      <PodcastStrategy 
        questionData={currentQuestion} 
        onClose={closePodcast}
      />
    );
  };
  
  return {
    openPodcast,
    closePodcast,
    PodcastModal,
    isOpen: showPodcast
  };
};

// Batch Processing Function for all questions
export const generateAllPodcasts = (questionsArray) => {
  const generator = new AdvancedWICGenerator();
  const results = [];
  
  questionsArray.forEach(question => {
    try {
      const analysis = generator.analyzeQuestion(
        question.passage, 
        question.choices, 
        question.correctAnswer
      );
      const script = generator.generateScript(analysis);
      
      results.push({
        questionId: question.id,
        strategy: analysis.pattern,
        script: script,
        analysis: analysis
      });
    } catch (error) {
      console.error(`Error processing question ${question.id}:`, error);
    }
  });
  
  return results;
};

// CSS Styles (add to your stylesheet)
const styles = `
.podcast-strategy-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.script-display {
  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
  line-height: 1.6;
}

.tutor-line {
  font-weight: bold;
  color: #2563eb;
  margin: 10px 0;
}

.student-line {
  color: #059669;
  margin: 10px 0;
  padding-left: 20px;
}

.metadata {
  color: #666;
  font-size: 14px;
  font-style: italic;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.audio-controls {
  padding: 20px;
  text-align: center;
  border-top: 1px solid #eee;
}

.play-btn, .stop-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.stop-btn {
  background: #dc2626;
}

.podcast-btn {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
`;

// Example usage in your existing React component
const ExampleQuestionComponent = () => {
  const { openPodcast, PodcastModal } = usePodcastStrategy();
  
  const questionData = {
    id: "123cf5db",
    passage: "The work of Kiowa painter T.C. Cannon derives its power in part from the tension among his ______ influences: classic European portraiture, with its realistic treatment of faces; the American pop art movement, with its vivid colors; and flatstyle, the intertribal painting style that rejects the effect of depth typically achieved through shading and perspective.",
    choices: ["complementary", "unknown", "disparate", "interchangeable"],
    correctAnswer: "C"
  };
  
  return (
    <div className="question-container">
      {/* Your existing question UI */}
      <div className="question-text">{questionData.passage}</div>
      
      {/* Add the podcast button */}
      <button 
        className="podcast-btn"
        onClick={() => openPodcast(questionData)}
      >
        🎧 Strategy Breakdown
      </button>
      
      {/* The modal will render when opened */}
      <PodcastModal />
    </div>
  );
};

// Command line tool for batch processing
export const batchProcessQuestions = (questionsFilePath) => {
  // For Node.js environment
  const fs = require('fs');
  const generator = new AdvancedWICGenerator();
  
  // Read questions from JSON file
  const questions = JSON.parse(fs.readFileSync(questionsFilePath, 'utf8'));
  
  const results = questions.map(question => {
    const analysis = generator.analyzeQuestion(
      question.passage,
      question.choices,
      question.correctAnswer
    );
    
    return {
      questionId: question.id,
      strategy: analysis.pattern,
      script: generator.generateScript(analysis),
      audioScript: generator.generateScript(analysis)
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/---[\s\S]*$/, '')
        .replace(/\n+/g, ' ')
    };
  });
  
  // Save results
  fs.writeFileSync('podcast_scripts.json', JSON.stringify(results, null, 2));
  console.log(`Generated ${results.length} podcast scripts`);
  
  return results;
};

// Integration instructions for your SAT app
console.log(`
=== INTEGRATION STEPS ===

1. Install in your React app:
   - Copy the code above into your project
   - Add the CSS styles to your stylesheet

2. Add to existing question components:
   import { usePodcastStrategy } from './podcast-generator';
   
   const YourQuestionComponent = ({ questionData }) => {
     const { openPodcast, PodcastModal } = usePodcastStrategy();
     
     return (
       <div>
         {/* Your existing UI */}
         <button onClick={() => openPodcast(questionData)}>
           🎧 Strategy
         </button>
         <PodcastModal />
       </div>
     );
   };

3. Question data format:
   {
     id: "question_id",
     passage: "The passage text with ______ blank",
     choices: ["choice1", "choice2", "choice3", "choice4"],
     correctAnswer: "C"
   }

4. Batch processing (for generating all at once):
   const results = generateAllPodcasts(yourQuestionsArray);

=== FEATURES ===
- Automatic strategy detection (TENSION, CONTRAST, PROCESS, etc.)
- 60-second focused explanations
- Audio playback using browser TTS
- Red flag identification
- Mobile-friendly modal interface
- Batch processing for all questions

The system will automatically:
- Identify the question pattern
- Generate appropriate Socratic dialogue
- Create both text and audio versions
- Integrate seamlessly with your existing UI
`);