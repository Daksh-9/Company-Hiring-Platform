import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import useExamGuard from '../../utils/useExamGuard';

const CodingTest = () => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(2700); // 45 minutes in seconds
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [skippedProblems, setSkippedProblems] = useState(new Set());
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
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [running, setRunning] = useState(false);
  const [outputResult, setOutputResult] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Language mapping with Judge0 IDs
  const languageMap = {
    python: { id: 71, name: 'Python' },
    c: { id: 50, name: 'C' },
    cpp: { id: 54, name: 'C++' },
    java: { id: 62, name: 'Java' },
    javascript: { id: 63, name: 'JavaScript' }
  };

  // Fetch coding questions from API
  useEffect(() => {
    const fetchCodingQuestions = async () => {
      try {
        const userToken = localStorage.getItem('userToken');
        const response = await axios.get('/api/coding-questions', {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        });
        setProblems(response.data.questions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching coding questions:', error);
        setLoading(false);
      }
    };

    fetchCodingQuestions();
  }, []);

  const handleStartTest = () => {
    if (problems.length === 0) return;
    setIsTestStarted(true);
    setCode(problems[0].starterCode?.[selectedLanguage] || '');
    
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

  const handleNextProblem = () => {
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(currentProblem + 1);
      setCode(problems[currentProblem + 1].starterCode?.[selectedLanguage] || '');
      setSubmissionResult(null);
      setOutputResult(null);
    }
  };

  const handlePreviousProblem = () => {
    if (currentProblem > 0) {
      setCurrentProblem(currentProblem - 1);
      setCode(problems[currentProblem - 1].starterCode?.[selectedLanguage] || '');
      setSubmissionResult(null);
      setOutputResult(null);
    }
  };

  const handleSkipProblem = () => {
    setSkippedProblems(prev => new Set(prev).add(currentProblem));
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(currentProblem + 1);
      setCode(problems[currentProblem + 1].starterCode?.[selectedLanguage] || '');
      setSubmissionResult(null);
      setOutputResult(null);
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    if (problems[currentProblem]?.starterCode?.[language]) {
    setCode(problems[currentProblem].starterCode[language]);
    }
  };

  const handleSubmitSolution = async () => {
    if (!code.trim()) {
      setSubmissionResult({
        success: false,
        error: 'No code to submit'
      });
      return;
    }

    setRunning(true);
    setSubmissionResult(null);

    try {
      const userToken = localStorage.getItem('userToken');
      const languageId = languageMap[selectedLanguage]?.id;
      const currentQuestion = problems[currentProblem];

      if (!languageId || !currentQuestion) {
        throw new Error('Invalid language or question selected');
      }

      const response = await axios.post('/api/submit-code', {
        questionId: currentQuestion._id,
        sourceCode: code,
        language: selectedLanguage,
        languageId: languageId
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      setSubmissionResult(response.data);
    } catch (error) {
      console.error('Code submission error:', error);
      setSubmissionResult({
        success: false,
        error: error.response?.data?.message || error.message || 'Code submission failed'
      });
    } finally {
      setRunning(false);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutputResult({
        success: false,
        error: 'No code to execute'
      });
      return;
    }

    setRunning(true);
    setOutputResult(null);

    try {
      const userToken = localStorage.getItem('userToken');
      const languageId = languageMap[selectedLanguage]?.id;

      if (!languageId) {
        throw new Error('Invalid language selected');
      }

      const response = await axios.post('/api/run', {
        source_code: code,
        language_id: languageId,
        stdin: ''
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      setOutputResult(response.data);
    } catch (error) {
      console.error('Code execution error:', error);
      setOutputResult({
        success: false,
        error: error.response?.data?.message || error.message || 'Code execution failed'
      });
    } finally {
      setRunning(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-lg">Loading coding questions...</p>
        </div>
      </div>
    );
  }

  if (!isTestStarted && !isTestCompleted) {
    return (
      <div className="test-intro">
        <div className="test-intro-card">
          <h2>Coding Test</h2>
          <div className="test-info">
            <div className="info-item">
              <i className="fas fa-code"></i>
              <span>{problems.length} Problems</span>
            </div>
            <div className="info-item">
              <i className="fas fa-clock"></i>
              <span>45 Minutes</span>
            </div>
            <div className="info-item">
              <i className="fas fa-laptop-code"></i>
              <span>Coding Challenges</span>
            </div>
          </div>
          <div className="test-instructions">
            <h3>Instructions:</h3>
            <ul>
              <li>Solve each coding problem within the time limit</li>
              <li>You can choose your preferred programming language</li>
              <li>Test your code with the provided test cases</li>
              <li>Submit your solution to get real-time feedback</li>
              <li>Make sure your solution handles edge cases</li>
              <li>Timer will automatically submit when time runs out</li>
            </ul>
          </div>
          <button className="btn btn-primary" onClick={handleStartTest} disabled={problems.length === 0}>
            <i className="fas fa-play"></i>
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (isTestCompleted) {
    return (
      <div className="test-results">
        <div className="results-card">
          <h2>Coding Test Completed!</h2>
          <div className="results-summary">
            <div className="summary-item">
              <span>Problems Attempted:</span>
              <span>{problems.length}</span>
            </div>
            <div className="summary-item">
              <span>Time Used:</span>
              <span>{formatTime(2700 - timeLeft)}</span>
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

  const currentP = problems[currentProblem];

  return (
    <div className="w-full h-full flex">
      {/* Sidebar ~20% */}
      <aside className="hidden md:block w-1/5 border-r bg-white">
        <div className="p-4 border-b flex items-center justify-between">
          <span className="font-semibold">Problems</span>
          <span className="text-sm text-gray-500">{currentProblem + 1}/{problems.length}</span>
        </div>
        <div className="p-4 grid grid-cols-5 gap-2">
          {problems.map((p, index) => {
            const isSkipped = skippedProblems.has(index);
            const base = 'w-10 h-10 rounded border text-sm flex items-center justify-center';
            const color = isSkipped
              ? 'bg-gray-300 text-gray-700 border-gray-300'
              : 'bg-white text-gray-900 border-gray-300';
            const active = currentProblem === index ? 'ring-2 ring-indigo-500' : '';
            return (
              <button
                key={p.id}
                className={`${base} ${color} ${active}`}
                onClick={() => {
                  setCurrentProblem(index);
                  setCode(problems[index].starterCode[selectedLanguage]);
                }}
                title={`Problem ${index + 1}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <div className="px-4 pb-4 text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></span> Unattempted</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-300 rounded-sm"></span> Skipped</div>
        </div>
      </aside>

      {/* Main ~80% */}
      <main className="flex-1 flex flex-col">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <div className="w-full max-w-md">
            <span>Problem {currentProblem + 1} of {problems.length}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentProblem + 1) / problems.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="ml-4">
            <i className="fas fa-clock"></i>
            <span className="ml-1">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="problem-card">
            <h3 className="problem-title text-center lg:text-left">{currentP.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Difficulty:</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                currentP.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                currentP.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentP.difficulty}
              </span>
            </div>
            <p className="problem-description text-center lg:text-left">{currentP.description}</p>
            <div className="test-cases">
              <h4>Test Cases:</h4>
              {currentP.testCases?.map((testCase, index) => (
                <div key={index} className="test-case">
                  <span className="test-input">Input: {testCase.input}</span>
                  <span className="test-output">Expected Output: {testCase.expectedOutput}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="code-panel">
            <div className="code-header">
              <div className="language-selector">
                <label>Language:</label>
                <select 
                  value={selectedLanguage} 
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  {Object.entries(languageMap).map(([key, lang]) => (
                    <option key={key} value={key}>{lang.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button 
                  className="btn btn-secondary" 
                  onClick={handleRunCode}
                  disabled={running}
                >
                  <i className={`fas ${running ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
                  {running ? 'Running...' : 'Run Code'}
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSubmitSolution}
                  disabled={running}
                >
                  <i className={`fas ${running ? 'fa-spinner fa-spin' : 'fa-check'}`}></i>
                  {running ? 'Submitting...' : 'Submit Solution'}
              </button>
              </div>
            </div>
            <div className="code-editor">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your code here..."
                className="code-textarea"
              />
            </div>
            <div className="output-panel">
              <h4>Results:</h4>
              <div className="output-content">
                {running ? (
                  <div className="flex items-center justify-center p-4">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    <span>Processing...</span>
                  </div>
                ) : submissionResult ? (
                  <div className="space-y-3">
                    {submissionResult.success ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-semibold">Submission Status:</span>
                          <span className="text-green-600">{submissionResult.realTimeFeedback.status}</span>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">Test Results:</span>
                            <span className="text-lg font-bold">
                              {submissionResult.realTimeFeedback.passed}/{submissionResult.realTimeFeedback.total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${submissionResult.realTimeFeedback.score}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Score: {submissionResult.realTimeFeedback.score}%</p>
                        </div>
                        
                        {submissionResult.testResults?.map((test, index) => (
                          <div key={index} className={`p-2 rounded text-sm ${
                            test.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <i className={`fas ${test.passed ? 'fa-check text-green-600' : 'fa-times text-red-600'}`}></i>
                              <span className="font-semibold">Test Case {index + 1}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                test.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {test.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>
                            {!test.passed && (
                              <div className="text-xs text-gray-600">
                                <p>Expected: {test.expectedOutput}</p>
                                <p>Got: {test.actualOutput || 'No output'}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-red-600">
                        <span className="font-semibold">Error:</span>
                        <p className="mt-1">{submissionResult.error}</p>
                      </div>
                    )}
                  </div>
                ) : outputResult ? (
                  <div className="space-y-3">
                    {outputResult.success ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-semibold">Status:</span>
                          <span className="text-green-600">{outputResult.status?.description || 'Completed'}</span>
                        </div>
                        
                        {outputResult.stdout && (
                          <div>
                            <span className="font-semibold text-gray-700">Output:</span>
                            <pre className="bg-gray-100 p-2 rounded text-sm mt-1 whitespace-pre-wrap">
                              {outputResult.stdout}
                            </pre>
                          </div>
                        )}
                        
                        {outputResult.stderr && (
                          <div>
                            <span className="font-semibold text-red-600">Error:</span>
                            <pre className="bg-red-50 p-2 rounded text-sm mt-1 whitespace-pre-wrap text-red-600">
                              {outputResult.stderr}
                            </pre>
                          </div>
                        )}
                        
                        {outputResult.compile_output && (
                          <div>
                            <span className="font-semibold text-yellow-600">Compile Output:</span>
                            <pre className="bg-yellow-50 p-2 rounded text-sm mt-1 whitespace-pre-wrap text-yellow-700">
                              {outputResult.compile_output}
                            </pre>
                          </div>
                        )}
                        
                        <div className="flex gap-4 text-sm text-gray-600">
                          {outputResult.time && (
                            <span>Time: {outputResult.time}s</span>
                          )}
                          {outputResult.memory && (
                            <span>Memory: {outputResult.memory}KB</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-red-600">
                        <span className="font-semibold">Error:</span>
                        <p className="mt-1">{outputResult.error}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>Click "Run Code" to test your solution or "Submit Solution" for full evaluation</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t flex items-center justify-between bg-white">
          <button 
            className="btn btn-secondary" 
            onClick={handlePreviousProblem}
            disabled={currentProblem === 0}
          >
            <i className="fas fa-arrow-left"></i>
            Previous
          </button>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary" onClick={handleSkipProblem}>Skip</button>
            {currentProblem === problems.length - 1 ? (
              <button className="btn btn-primary" onClick={handleSubmitTest}>
                <i className="fas fa-check"></i>
                Submit Test
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleNextProblem}>
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

export default CodingTest;
