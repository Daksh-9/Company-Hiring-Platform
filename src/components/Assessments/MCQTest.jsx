import React, { useRef, useState, useEffect } from 'react';
import useExamGuard from '../../utils/useExamGuard';

const MCQTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]); // Questions will now be fetched from the backend
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [skippedQuestions, setSkippedQuestions] = useState(new Set());
  const [loading, setLoading] = useState(true); // Add a loading state
  const timerRef = useRef(null);

  // Use useEffect to fetch questions from the backend when the component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) return; // Exit if user is not authenticated

      try {
        const response = await fetch('/api/user/questions/MCQ', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setQuestions(data.questions);
      } catch (err) {
        console.error('Failed to fetch questions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // useExamGuard will now be enabled only when the test is started and not loading
  useExamGuard({
    enabled: isTestStarted && !isTestCompleted && !loading,
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

  const handleSkipQuestion = () => {
    setSkippedQuestions(prev => new Set(prev).add(currentQuestion));
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleStartTest = () => {
    // Prevent starting the test if no questions are loaded
    if (questions.length === 0) {
      alert('No questions available for this test.');
      return;
    }
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

  // Render a loading screen while fetching questions
  if (loading) {
    return (
      <div className="test-intro">
        <div className="test-intro-card">
          <h2>MCQ Test</h2>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  // Handle case where no questions are available after loading
  if (questions.length === 0) {
    return (
      <div className="test-intro">
        <div className="test-intro-card">
          <h2>MCQ Test</h2>
          <p>No questions available for this test type. Please check back later.</p>
        </div>
      </div>
    );
  }
  
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
  // Convert question options from object to array
  const currentQOptions = [currentQ.optionA, currentQ.optionB, currentQ.optionC, currentQ.optionD].filter(Boolean);

  return (
    <div className="w-full h-full flex">
      {/* Sidebar ~20% */}
      <aside className="hidden md:block w-1/5 border-r bg-white">
        <div className="p-4 border-b flex items-center justify-between">
          <span className="font-semibold">Questions</span>
          <span className="text-sm text-gray-500">{currentQuestion + 1}/{questions.length}</span>
        </div>
        <div className="p-4 grid grid-cols-5 gap-2">
          {questions.map((q, index) => {
            const isAnswered = answers[q.id] !== undefined;
            const isSkipped = skippedQuestions.has(index);
            const base = 'w-10 h-10 rounded border text-sm flex items-center justify-center';
            const color = isAnswered
              ? 'bg-green-500 text-white border-green-500'
              : isSkipped
                ? 'bg-gray-300 text-gray-700 border-gray-300'
                : 'bg-white text-gray-900 border-gray-300';
            const active = currentQuestion === index ? 'ring-2 ring-indigo-500' : '';
            return (
              <button
                key={q.id}
                className={`${base} ${color} ${active}`}
                onClick={() => setCurrentQuestion(index)}
                title={`Question ${index + 1}`}
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
        <div className="test-header px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <div className="test-progress w-full max-w-md">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="test-timer ml-4">
            <i className="fas fa-clock"></i>
            <span className="ml-1">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="question-card w-full max-w-3xl">
            <h3 className="question-text text-center mb-6">{currentQ.question}</h3>
            <div className="options-list max-w-2xl mx-auto">
              {currentQOptions.map((option, index) => (
                <label 
                  key={index} 
                  className={`option-item ${answers[currentQ._id] === index ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQ._id}`}
                    value={index}
                    checked={answers[currentQ._id] === index}
                    onChange={() => handleAnswerSelect(currentQ._id, index)}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="test-navigation px-4 py-3 border-t flex items-center justify-between bg-white">
          <button 
            className="btn btn-secondary" 
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
          >
            <i className="fas fa-arrow-left"></i>
            Previous
          </button>

          <div className="flex items-center gap-2">
            <button 
              className="btn btn-secondary"
              onClick={handleSkipQuestion}
            >
              Skip
            </button>
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
      </main>
    </div>
  );
};

export default MCQTest;