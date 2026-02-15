import React from 'react';

// Import all individual game editors
import MatchUpEditor from './games/MatchUpEditor';
import QuizEditor from './games/QuizEditor';
import AnagramEditor from './games/AnagramEditor';
import CompleteSentenceEditor from './games/CompleteSentenceEditor';
import UnjumbleEditor from './games/UnjumbleEditor';
import SpinWheelEditor from './games/SpinWheelEditor';
import WordClassificationEditor from './games/WordClassificationEditor';
import HarakatEditor from './games/HarakatEditor';
import MemoryEditor from './games/MemoryEditor';
import HangmanEditor from './games/HangmanEditor';
import WordDetectiveEditor from './games/WordDetectiveEditor';
import CamelRaceEditor from './games/CamelRaceEditor';
import WordRainEditor from './games/WordRainEditor';
import InteractiveStoryEditor from './games/InteractiveStoryEditor';

/**
 * GameBlockEditor Component
 * Router component that delegates to individual game editors based on block type
 * 
 * @param {Object} block - Block data with type and data properties
 * @param {Function} onUpdate - Callback to update block data
 * @param {Object} toast - Toast notification object (optional)
 */
const GameBlockEditor = ({ block, onUpdate, toast }) => {
  // Route to appropriate editor based on block type
  switch (block.type) {
    case 'matchup':
      return <MatchUpEditor block={block} onUpdate={onUpdate} />;
    
    case 'quiz':
      return <QuizEditor block={block} onUpdate={onUpdate} />;
    
    case 'anagram':
      return <AnagramEditor block={block} onUpdate={onUpdate} />;
    
    case 'completesentence':
      return <CompleteSentenceEditor block={block} onUpdate={onUpdate} />;
    
    case 'unjumble':
      return <UnjumbleEditor block={block} onUpdate={onUpdate} />;
    
    case 'spinwheel':
      return <SpinWheelEditor block={block} onUpdate={onUpdate} />;
    
    case 'wordclassification':
      return <WordClassificationEditor block={block} onUpdate={onUpdate} />;
    
    case 'harakat':
      return <HarakatEditor block={block} onUpdate={onUpdate} />;
    
    case 'memory':
      return <MemoryEditor block={block} onUpdate={onUpdate} />;
    
    case 'hangman':
      return <HangmanEditor block={block} onUpdate={onUpdate} />;
    
    case 'worddetective':
      return <WordDetectiveEditor block={block} onUpdate={onUpdate} />;
    
    case 'camelrace':
      return <CamelRaceEditor block={block} onUpdate={onUpdate} />;
    
    case 'wordrain':
      return <WordRainEditor block={block} onUpdate={onUpdate} />;
    
    case 'interactivestory':
      return <InteractiveStoryEditor block={block} onUpdate={onUpdate} />;
    
    default:
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-500/20">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Unknown game type: <code className="font-mono">{block.type}</code>
          </p>
        </div>
      );
  }
};

export default GameBlockEditor;
