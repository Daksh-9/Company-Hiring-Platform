import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useExamGuard from '../../utils/useExamGuard';

const ParagraphTest = () => {
  // Add new state declarations at the top with other states
  const [currentParagraph, setCurrentParagraph] = useState('');
  
  // Add missing state declarations
  const [prompts, setPrompts] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [paragraphs, setParagraphs] = useState({});
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [skippedPrompts, setSkippedPrompts] = useState(new Set());
  const [evaluations, setEvaluations] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);

  // Utility: format seconds as M:SS (must be defined before first use)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get current prompt helper
  const currentP = prompts[currentPrompt] || {
    id: 0,
    title: '',
    description: '',
    wordLimit: 0,
    timeLimit: 0
  };

  // Define renderActionButtons function
  const renderActionButtons = () => (
    <div className="flex items-center gap-2">
      <button 
        className="btn btn-secondary" 
        onClick={handleSkipPrompt}
        disabled={isSubmitting}
      >
        Skip
      </button>
      {currentPrompt === prompts.length - 1 ? (
        <button 
          className="btn btn-primary"
          onClick={handleSubmitTest}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Submitting...
            </>
          ) : (
            <>
              <i className="fas fa-check mr-2"></i>
              Submit Test
            </>
          )}
        </button>
      ) : (
        <button 
          className="btn btn-primary"
          onClick={handleNextPrompt}
          disabled={isSubmitting}
        >
          Next
          <i className="fas fa-arrow-right ml-2"></i>
        </button>
      )}
    </div>
  );

  useExamGuard({
    enabled: isTestStarted && !isTestCompleted,
    onFirstViolation: () => {
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    },
    onSecondViolation: () => {
      handleSubmitTest();
    },
    onFocusReturn: () => {
      if (isTestStarted && !isTestCompleted && isPaused && !timerRef.current) {
        setIsPaused(false);
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              handleSubmitTest();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  });

  // Load prompts from backend
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await axios.get('/api/paragraph-questions', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setPrompts(response.data);
      } catch (error) {
        console.error('Error fetching prompts:', error);
        toast.error('Failed to load test questions');
      }
    };
    
    fetchPrompts();
  }, []);

  // Update currentParagraph when currentPrompt changes
  useEffect(() => {
    const promptId = currentP?.id;
    if (promptId) {
      setCurrentParagraph(paragraphs[promptId] || '');
    }
  }, [currentPrompt, paragraphs, currentP]);

  // Calculate word count from current paragraph
  const wordCount = currentParagraph
    ? currentParagraph.trim().split(/\s+/).filter(word => word.length > 0).length
    : 0;

  // Update paragraph change handler
  const handleParagraphChange = (promptId, value) => {
    setCurrentParagraph(value);
    setParagraphs(prev => ({
      ...prev,
      [promptId]: value
    }));
  };

  const handleStartTest = () => {
    setIsTestStarted(true);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmitTest = async () => {
    try {
      setIsSubmitting(true);
      
      // Evaluate all completed paragraphs
      const evaluationResults = {};
      const answers = Object.entries(paragraphs)
        .filter(([, text]) => String(text || '').trim().length > 0)
        .map(([promptId, text]) => ({ promptId, text }));
      const token = localStorage.getItem('userToken');
      const resp = await axios.post(
        '/api/evaluate-paragraph',
        { answers },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const serverDetails = resp?.data?.details || [];
      serverDetails.forEach((d) => {
        evaluationResults[d.promptId] = {
          score: d.score,
          totalErrors: d.errors,
          result: d.passed ? 'Pass' : 'Fail'
        };
      });
      
      setEvaluations(evaluationResults);
      setIsTestCompleted(true);
      setIsTestStarted(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast.success('Test submitted successfully');
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Test results summary view
  if (isTestCompleted) {
    const totalQuestions = prompts.length;
    const questionsAttempted = Object.values(paragraphs).filter((t) => String(t || '').trim().length > 0).length;
    
    return (
      <div className="test-results">
        <div className="results-card">
          <h2 className="text-2xl font-bold mb-6">Test submitted successfully</h2>

          <div className="results-summary">
            <div className="summary-item">
              <span>Total Questions:</span>
              <span>{totalQuestions}</span>
            </div>
            <div className="summary-item">
              <span>Questions Attempted:</span>
              <span>{questionsAttempted}</span>
            </div>
            <div className="summary-item">
              <span>Time Taken:</span>
              <span>{formatTime(1500 - timeLeft)}</span>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/dashboard'}
            >
              <i className="fas fa-home mr-2"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleNextPrompt = () => {
    if (currentPrompt < prompts.length - 1) {
      setCurrentPrompt(currentPrompt + 1);
    }
  };

  const handlePreviousPrompt = () => {
    if (currentPrompt > 0) {
      setCurrentPrompt(currentPrompt - 1);
    }
  };

  const handleSkipPrompt = () => {
    setSkippedPrompts(prev => new Set(prev).add(currentPrompt));
    if (currentPrompt < prompts.length - 1) {
      setCurrentPrompt(currentPrompt + 1);
    }
  };

  

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  if (!isTestStarted && !isTestCompleted) {
    return (
      <div className="test-intro">
        <div className="test-intro-card">
          <h2>Paragraph Writing Test</h2>
          <div className="test-info">
            <div className="info-item">
              <i className="fas fa-clock"></i>
              <span>Time Limit: 25 minutes</span>
            </div>
            <div className="info-item">
              <i className="fas fa-file-alt"></i>
              <span>4 Paragraphs</span>
            </div>
          </div>
          <div className="mt-4">
            <button 
              className="btn btn-primary"
              onClick={handleStartTest}
            >
              <i className="fas fa-play mr-2"></i>
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex">
      {/* Sidebar ~20% */}
      <aside className="w-1/5 bg-gray-100 p-4 border-r">
        <h2 className="text-lg font-semibold mb-4">Test Navigation</h2>
        <div className="flex flex-col space-y-2">
          {prompts.map((prompt, index) => {
            const isActive = currentPrompt === index;
            const isSkipped = skippedPrompts.has(index);
            const isCompleted = evaluations[prompt.id];
            const evaluation = isCompleted ? evaluations[prompt.id] : {};
            
            return (
              <button
                key={prompt.id}
                className={`prompt-nav-btn ${isActive ? 'active' : ''} ${isSkipped ? 'skipped' : ''}`}
                onClick={() => setCurrentPrompt(index)}
                disabled={isSubmitting}
                title={`Prompt ${index + 1}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <div className="px-4 pb-4 text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> Answered</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></span> Unanswered</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-300 rounded-sm"></span> Skipped</div>
        </div>
      </aside>

      {/* Main ~80% */}
      <main className="flex-1 flex flex-col">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <div className="w-full max-w-md">
            <span>Prompt {currentPrompt + 1} of {prompts.length}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentPrompt + 1) / prompts.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="ml-4">
            <i className="fas fa-clock"></i>
            <span className="ml-1">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="prompt-card">
            <h3 className="prompt-title text-center lg:text-left">{currentP.title}</h3>
            <p className="prompt-description text-center lg:text-left">{currentP.description}</p>
            <div className="prompt-requirements">
              <div className="requirement-item">
                <i className="fas fa-file-alt"></i>
                <span>Word Limit: {currentP.wordLimit} words</span>
              </div>
              <div className="requirement-item">
                <i className="fas fa-clock"></i>
                <span>Time Limit: {currentP.timeLimit} minutes</span>
              </div>
            </div>
            <div className="writing-tips">
              <h4>Writing Tips:</h4>
              <ul>
                <li>Start with a clear topic sentence</li>
                <li>Include supporting details and examples</li>
                <li>Use transition words for flow</li>
                <li>End with a concluding sentence</li>
                <li>Check your grammar and spelling</li>
              </ul>
            </div>
          </div>

          <div className="writing-panel">
            <div className="writing-header">
              <div className="word-counter">
                <span>Words: {wordCount}/{currentP.wordLimit}</span>
                <div className="word-progress">
                  <div 
                    className="word-progress-fill" 
                    style={{ 
                      width: `${Math.min((wordCount / currentP.wordLimit) * 100, 100)}%`,
                      backgroundColor: wordCount > currentP.wordLimit ? '#e74c3c' : '#667eea'
                    }}
                  ></div>
                </div>
              </div>
              <div className="writing-tools">
                <button className="tool-btn" title="Bold">
                  <i className="fas fa-bold"></i>
                </button>
                <button className="tool-btn" title="Italic">
                  <i className="fas fa-italic"></i>
                </button>
                <button className="tool-btn" title="Underline">
                  <i className="fas fa-underline"></i>
                </button>
              </div>
            </div>
            <div className="writing-editor">
              <textarea
                value={currentParagraph}
                onChange={(e) => handleParagraphChange(currentP.id, e.target.value)}
                placeholder="Start writing your paragraph here..."
                className="paragraph-textarea"
                rows={12}
              />
            </div>
            <div className="writing-stats">
              <div className="stat-item">
                <i className="fas fa-file-alt"></i>
                <span>Characters: {currentParagraph.length}</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-clock"></i>
                <span>Time Remaining: {formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t flex items-center justify-between bg-white">
          <button 
            className="btn btn-secondary" 
            onClick={handlePreviousPrompt}
            disabled={currentPrompt === 0 || isSubmitting}
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Previous
          </button>
          {renderActionButtons()}
        </div>
      </main>
    </div>
  );
};

export default ParagraphTest;

