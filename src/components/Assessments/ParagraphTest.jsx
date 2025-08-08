import React, { useState } from 'react';

const ParagraphTest = () => {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [paragraphs, setParagraphs] = useState({});
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes in seconds
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);

  const prompts = [
    {
      id: 1,
      title: "Technology and Society",
      description: "Write a paragraph about how technology has changed society in the last decade. Discuss both positive and negative impacts.",
      wordLimit: 150,
      timeLimit: 8 // minutes
    },
    {
      id: 2,
      title: "Environmental Conservation",
      description: "Write a paragraph explaining the importance of environmental conservation and what individuals can do to contribute to sustainability efforts.",
      wordLimit: 120,
      timeLimit: 6
    },
    {
      id: 3,
      title: "Remote Work",
      description: "Write a paragraph about the benefits and challenges of remote work, especially in the context of the modern workplace.",
      wordLimit: 130,
      timeLimit: 7
    },
    {
      id: 4,
      title: "Digital Learning",
      description: "Write a paragraph about the effectiveness of online learning platforms and how they compare to traditional classroom education.",
      wordLimit: 140,
      timeLimit: 7
    }
  ];

  const handleParagraphChange = (promptId, value) => {
    setParagraphs(prev => ({
      ...prev,
      [promptId]: value
    }));
  };

  const handleStartTest = () => {
    setIsTestStarted(true);
    
    // Start timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmitTest = () => {
    setIsTestCompleted(true);
    setIsTestStarted(false);
  };

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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCurrentPrompt = () => prompts[currentPrompt];
  const currentParagraph = paragraphs[getCurrentPrompt().id] || '';
  const wordCount = countWords(currentParagraph);

  if (!isTestStarted && !isTestCompleted) {
    return (
      <div className="test-intro">
        <div className="test-intro-card">
          <h2>Paragraph Writing Test</h2>
          <div className="test-info">
            <div className="info-item">
              <i className="fas fa-pen-fancy"></i>
              <span>{prompts.length} Prompts</span>
            </div>
            <div className="info-item">
              <i className="fas fa-clock"></i>
              <span>25 Minutes</span>
            </div>
            <div className="info-item">
              <i className="fas fa-file-alt"></i>
              <span>Writing Assessment</span>
            </div>
          </div>
          <div className="test-instructions">
            <h3>Instructions:</h3>
            <ul>
              <li>Write well-structured paragraphs for each prompt</li>
              <li>Pay attention to word limits for each prompt</li>
              <li>Focus on clarity, coherence, and grammar</li>
              <li>Use proper paragraph structure with topic sentences</li>
              <li>Timer will automatically submit when time runs out</li>
            </ul>
          </div>
          <button className="btn btn-primary" onClick={handleStartTest}>
            <i className="fas fa-play"></i>
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (isTestCompleted) {
    const completedPrompts = Object.keys(paragraphs).length;
    return (
      <div className="test-results">
        <div className="results-card">
          <h2>Writing Test Completed!</h2>
          <div className="results-summary">
            <div className="summary-item">
              <span>Prompts Completed:</span>
              <span>{completedPrompts}/{prompts.length}</span>
            </div>
            <div className="summary-item">
              <span>Time Used:</span>
              <span>{formatTime(1500 - timeLeft)}</span>
            </div>
            <div className="summary-item">
              <span>Total Words Written:</span>
              <span>{Object.values(paragraphs).reduce((total, para) => total + countWords(para), 0)}</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard'}>
            <i className="fas fa-home"></i>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentP = getCurrentPrompt();

  return (
    <div className="paragraph-test-container">
      <div className="test-header">
        <div className="test-progress">
          <span>Prompt {currentPrompt + 1} of {prompts.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentPrompt + 1) / prompts.length) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="test-timer">
          <i className="fas fa-clock"></i>
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="writing-layout">
        <div className="prompt-panel">
          <div className="prompt-card">
            <h3 className="prompt-title">{currentP.title}</h3>
            <p className="prompt-description">{currentP.description}</p>
            
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

      <div className="test-navigation">
        <button 
          className="btn btn-secondary" 
          onClick={handlePreviousPrompt}
          disabled={currentPrompt === 0}
        >
          <i className="fas fa-arrow-left"></i>
          Previous
        </button>
        
        <div className="prompt-indicators">
          {prompts.map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentPrompt === index ? 'active' : ''} ${paragraphs[prompts[index].id] ? 'completed' : ''}`}
              onClick={() => setCurrentPrompt(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentPrompt === prompts.length - 1 ? (
          <button className="btn btn-primary" onClick={handleSubmitTest}>
            <i className="fas fa-check"></i>
            Submit Test
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleNextPrompt}>
            Next
            <i className="fas fa-arrow-right"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default ParagraphTest;

