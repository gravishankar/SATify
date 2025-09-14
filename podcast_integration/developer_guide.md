# SAT Words in Context Podcast Generator - Developer Guide

## Overview
This system automatically generates 60-second strategy podcasts for SAT Words in Context questions using Socratic dialogue between a tutor and student character. It includes voice cloning integration for personalized audio experiences.

## Core Components

### 1. AdvancedWICGenerator Class
**Location**: `src/components/podcast/WICGenerator.js`

**Purpose**: Analyzes SAT questions and generates strategy dialogues

**Key Methods**:
- `analyzeQuestion(passage, choices, correctIndex)` - Pattern recognition and analysis
- `generateScript(analysis)` - Creates Socratic dialogue script
- `identifyPattern(passage)` - Detects question type (TENSION_DETAIL, CONTRAST, etc.)
- `identifyRedFlags(passage, choices, pattern)` - Finds wrong answer traps

### 2. PodcastStrategy React Component
**Location**: `src/components/podcast/PodcastStrategy.jsx`

**Purpose**: Modal interface for displaying and playing strategy breakdowns

**Features**:
- Text display with character-specific styling
- Voice cloning integration with ElevenLabs API
- Enhanced TTS fallback with character voices
- Audio controls and playback management

### 3. usePodcastStrategy Hook
**Location**: `src/hooks/usePodcastStrategy.js`

**Purpose**: State management for podcast modal integration

**Returns**:
- `openPodcast(questionData)` - Opens modal with generated strategy
- `closePodcast()` - Closes modal and stops audio
- `PodcastModal` - React component to render
- `isOpen` - Modal state

## Question Data Format

```javascript
{
  id: "question_id",
  passage: "The passage text with ______ blank",
  choices: ["choice1", "choice2", "choice3", "choice4"],
  correctAnswer: "C" // Letter index of correct choice
}
```

## Strategy Patterns

### TENSION_DETAIL
- **Signals**: "tension", ":"
- **Logic**: Colon introduces examples that show different types creating tension
- **Red Flags**: "harmonious", "uniform", "integrated", "complementary"

### CONTRAST
- **Signals**: "However", "Despite", "While", "Unlike", "But"
- **Logic**: Signal word requires opposite relationship
- **Red Flags**: Words that maintain same direction

### PROCESS_RESULT
- **Signals**: "found that", "showed that", "study", "research"
- **Logic**: Study conclusions need logical outcomes
- **Red Flags**: Results that contradict study findings

## Voice Integration

### ElevenLabs API Setup
1. Get API key from ElevenLabs
2. Create two voice profiles:
   - Tutor: Warm, encouraging (stability: 0.7, style: 0.3)
   - Student: Curious, upbeat (stability: 0.5, style: 0.6)
3. Set environment variable: `REACT_APP_ELEVENLABS_API_KEY`

### Voice Configuration
```javascript
const voiceConfig = {
  tutor: {
    voiceId: "your-tutor-voice-id",
    rate: 0.9,
    pitch: 1.1,
    stability: 0.7
  },
  student: {
    voiceId: "your-student-voice-id", 
    rate: 1.1,
    pitch: 1.3,
    stability: 0.5
  }
};
```

## Integration Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env` file:
```
REACT_APP_ELEVENLABS_API_KEY=your_api_key_here
```

### 3. Add to Existing Question Component
```javascript
import { usePodcastStrategy } from './hooks/usePodcastStrategy';

const YourQuestionComponent = ({ questionData }) => {
  const { openPodcast, PodcastModal } = usePodcastStrategy();
  
  return (
    <div>
      {/* Your existing question UI */}
      <button onClick={() => openPodcast(questionData)}>
        Strategy Breakdown
      </button>
      <PodcastModal />
    </div>
  );
};
```

### 4. CSS Integration
Add styles from `src/styles/podcast.css` to your main stylesheet

## File Structure
```
src/
├── components/
│   └── podcast/
│       ├── PodcastStrategy.jsx
│       └── WICGenerator.js
├── hooks/
│   └── usePodcastStrategy.js
├── styles/
│   └── podcast.css
└── utils/
    └── voiceCloning.js
```

## API Endpoints

### ElevenLabs Text-to-Speech
- **URL**: `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
- **Method**: POST
- **Headers**: `xi-api-key`, `Content-Type: application/json`
- **Response**: Audio blob

## Testing

### Unit Tests
Test files in `src/__tests__/podcast/`:
- `WICGenerator.test.js` - Pattern recognition and script generation
- `PodcastStrategy.test.js` - Component rendering and audio playback
- `voiceCloning.test.js` - API integration and fallback logic

### Sample Test Data
```javascript
const testQuestions = [
  {
    id: "tension_test",
    passage: "The work derives power from tension among his ______ influences: style A, style B, and style C.",
    choices: ["harmonious", "unknown", "disparate", "uniform"],
    correctAnswer: "C"
  }
];
```

## Performance Considerations

### Audio Caching
- Cache generated audio blobs in browser storage
- Implement LRU cache for voice segments
- Preload common phrases

### Bundle Size
- Lazy load podcast components
- Code split voice cloning functionality
- Optimize audio file sizes

## Error Handling

### Voice Generation Failures
1. Retry with exponential backoff
2. Fallback to enhanced browser TTS
3. Graceful degradation to text-only mode
4. User feedback for network issues

### Browser Compatibility
- Check `speechSynthesis` availability
- Handle voice loading delays
- Mobile audio playback considerations

## Deployment

### Environment Variables
- Production: Use secure API key storage
- Development: Local `.env` file
- Staging: Separate voice profiles for testing

### CDN Integration
- Host audio files on CDN if pre-generating
- Implement proper CORS headers
- Use audio compression for bandwidth

## Monitoring

### Analytics Events
- Track podcast usage rates
- Monitor voice generation success/failure
- Measure user engagement with audio vs text

### Performance Metrics
- Audio generation latency
- API rate limit usage
- Cache hit rates
- User retention with podcast feature