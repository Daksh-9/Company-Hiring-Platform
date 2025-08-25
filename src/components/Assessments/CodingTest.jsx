import React, { useRef, useState } from 'react';
import useExamGuard from '../../utils/useExamGuard';

const CodingTest = () => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(2700); // 45 minutes in seconds
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

  const problems = [
    {
      id: 1,
      title: "Reverse a String",
      description: "Write a function that takes a string as input and returns the string reversed.",
      example: "Input: 'hello'\nOutput: 'olleh'",
      testCases: [
        { input: "'hello'", output: "'olleh'" },
        { input: "'world'", output: "'dlrow'" },
        { input: "'12345'", output: "'54321'" }
      ],
      starterCode: {
        javascript: `function reverseString(str) {
  // Your code here
  
}`,
        python: `def reverse_string(s):
    # Your code here
    pass`,
        java: `public class Solution {
    public String reverseString(String str) {
        // Your code here
        return "";
    }
}`
      }
    },
    {
      id: 2,
      title: "Find Maximum Number",
      description: "Write a function that finds the maximum number in an array.",
      example: "Input: [3, 7, 2, 9, 1]\nOutput: 9",
      testCases: [
        { input: "[3, 7, 2, 9, 1]", output: "9" },
        { input: "[-1, -5, -3]", output: "-1" },
        { input: "[0, 0, 0]", output: "0" }
      ],
      starterCode: {
        javascript: `function findMax(arr) {
  // Your code here
  
}`,
        python: `def find_max(arr):
    # Your code here
    pass`,
        java: `public class Solution {
    public int findMax(int[] arr) {
        // Your code here
        return 0;
    }
}`
      }
    },
    {
      id: 3,
      title: "Check Palindrome",
      description: "Write a function that checks if a string is a palindrome (reads the same forwards and backwards).",
      example: "Input: 'racecar'\nOutput: true",
      testCases: [
        { input: "'racecar'", output: "true" },
        { input: "'hello'", output: "false" },
        { input: "'anna'", output: "true" }
      ],
      starterCode: {
        javascript: `function isPalindrome(str) {
  // Your code here
  
}`,
        python: `def is_palindrome(s):
    # Your code here
    pass`,
        java: `public class Solution {
    public boolean isPalindrome(String str) {
        // Your code here
        return false;
    }
}`
      }
    }
  ];

  const handleStartTest = () => {
    setIsTestStarted(true);
    setCode(problems[0].starterCode[selectedLanguage]);
    
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
      setCode(problems[currentProblem + 1].starterCode[selectedLanguage]);
    }
  };

  const handlePreviousProblem = () => {
    if (currentProblem > 0) {
      setCurrentProblem(currentProblem - 1);
      setCode(problems[currentProblem - 1].starterCode[selectedLanguage]);
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setCode(problems[currentProblem].starterCode[language]);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
              <li>Make sure your solution handles edge cases</li>
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
    <div className="coding-test-container">
      <div className="test-header">
        <div className="test-progress">
          <span>Problem {currentProblem + 1} of {problems.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentProblem + 1) / problems.length) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="test-timer">
          <i className="fas fa-clock"></i>
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="coding-layout">
        <div className="problem-panel">
          <div className="problem-card">
            <h3 className="problem-title">{currentP.title}</h3>
            <p className="problem-description">{currentP.description}</p>
            
            <div className="problem-example">
              <h4>Example:</h4>
              <pre>{currentP.example}</pre>
            </div>
            
            <div className="test-cases">
              <h4>Test Cases:</h4>
              {currentP.testCases.map((testCase, index) => (
                <div key={index} className="test-case">
                  <span className="test-input">Input: {testCase.input}</span>
                  <span className="test-output">Output: {testCase.output}</span>
                </div>
              ))}
            </div>
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
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
            </div>
            <button className="btn btn-secondary">
              <i className="fas fa-play"></i>
              Run Code
            </button>
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
            <h4>Output:</h4>
            <div className="output-content">
              <p>Click "Run Code" to test your solution</p>
            </div>
          </div>
        </div>
      </div>

      <div className="test-navigation">
        <button 
          className="btn btn-secondary" 
          onClick={handlePreviousProblem}
          disabled={currentProblem === 0}
        >
          <i className="fas fa-arrow-left"></i>
          Previous
        </button>
        
        <div className="problem-indicators">
          {problems.map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentProblem === index ? 'active' : ''}`}
              onClick={() => {
                setCurrentProblem(index);
                setCode(problems[index].starterCode[selectedLanguage]);
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>

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
  );
};

export default CodingTest;
