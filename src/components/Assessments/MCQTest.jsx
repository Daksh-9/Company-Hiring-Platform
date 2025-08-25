import React, { useRef, useState } from 'react';
import useExamGuard from '../../utils/useExamGuard';

const MCQTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

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
      // Resume only if test is started, not completed, and paused
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

  const questions = [
    {
      id: 1,
      question: "What is the primary purpose of React?",
      options: [
        "To create server-side applications",
        "To build user interfaces",
        "To manage databases",
        "To handle API requests"
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "Which hook is used to manage state in functional components?",
      options: [
        "useEffect",
        "useState",
        "useContext",
        "useReducer"
      ],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "What is the virtual DOM in React?",
      options: [
        "A real DOM element",
        "A lightweight copy of the real DOM",
        "A database",
        "A server component"
      ],
      correctAnswer: 1
    },
    {
      id: 4,
      question: "Which method is called when a component is first rendered?",
      options: [
        "componentDidMount",
        "componentWillMount",
        "render",
        "constructor"
      ],
      correctAnswer: 0
    },
    {
      id: 5,
      question: "What is JSX?",
      options: [
        "A JavaScript library",
        "A syntax extension for JavaScript",
        "A CSS framework",
        "A database query language"
      ],
      correctAnswer: 1
    }
  ];

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
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

  const handleSubmitTest = () => {
    setIsTestCompleted(true);
    setIsTestStarted(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    let correct = 0;
    Object.keys(answers).forEach(questionId => {
      const question = questions.find(q => q.id === parseInt(questionId));
      if (question && answers[questionId] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  if (!isTestStarted && !isTestCompleted) {
    return (
      <div className="test-intro">
        <div className="test-intro-card">
          <h2>MCQ Test</h2>
          <div className="test-info">
            <div className="info-item">
              <i className="fas fa-question-circle"></i>
              <span>{questions.length} Questions</span>
            </div>
            <div className="info-item">
              <i className="fas fa-clock"></i>
              <span>30 Minutes</span>
            </div>
            <div className="info-item">
              <i className="fas fa-brain"></i>
              <span>Multiple Choice</span>
            </div>
          </div>
          <div className="test-instructions">
            <h3>Instructions:</h3>
            <ul>
              <li>Read each question carefully</li>
              <li>Select the best answer from the options provided</li>
              <li>You can navigate between questions</li>
              <li>Timer will automatically submit the test when time runs out</li>
              <li>You cannot go back once the test is submitted</li>
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
    const score = calculateScore();
    return (
      <div className="test-results">
        <div className="results-card">
          <h2>Test Completed!</h2>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}%</span>
            </div>
            <p>Your Score</p>
          </div>
          <div className="results-summary">
            <div className="summary-item">
              <span>Questions Answered:</span>
              <span>{Object.keys(answers).length}/{questions.length}</span>
            </div>
            <div className="summary-item">
              <span>Correct Answers:</span>
              <span>{Object.keys(answers).filter(qId => {
                const question = questions.find(q => q.id === parseInt(qId));
                return question && answers[qId] === question.correctAnswer;
              }).length}</span>
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

  const currentQ = questions[currentQuestion];

  return (
    <div className="test-container">
      <div className="test-header">
        <div className="test-progress">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="test-timer">
          <i className="fas fa-clock"></i>
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="question-container">
        <div className="question-card">
          <h3 className="question-text">{currentQ.question}</h3>
          
          <div className="options-list">
            {currentQ.options.map((option, index) => (
              <label 
                key={index} 
                className={`option-item ${answers[currentQ.id] === index ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value={index}
                  checked={answers[currentQ.id] === index}
                  onChange={() => handleAnswerSelect(currentQ.id, index)}
                />
                <span className="option-text">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="test-navigation">
        <button 
          className="btn btn-secondary" 
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0}
        >
          <i className="fas fa-arrow-left"></i>
          Previous
        </button>
        
        <div className="question-indicators">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentQuestion === index ? 'active' : ''} ${answers[questions[index].id] !== undefined ? 'answered' : ''}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === questions.length - 1 ? (
          <button className="btn btn-primary" onClick={handleSubmitTest}>
            <i className="fas fa-check"></i>
            Submit Test
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleNextQuestion}>
            Next
            <i className="fas fa-arrow-right"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default MCQTest;

