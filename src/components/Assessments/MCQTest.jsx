// src/pages/MCQTest.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { isTokenValid, logoutAndRedirect } from '../../utils/auth';

const MCQTest = () => {
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0); // 1-based (backend)
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);

  // UI state
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answersMap, setAnswersMap] = useState({});        // { [qNum]: 'A'|'B'|'C'|'D' }
  const [skippedSet, setSkippedSet] = useState(new Set()); // Set<qNum>

  const guardAuth = () => {
    if (!isTokenValid()) {
      alert('Your session has expired. Please log in again.');
      logoutAndRedirect();
      return false;
    }
    return true;
  };

  const startTest = async () => {
    if (!guardAuth()) return;
    try {
      setLoading(true);
      const res = await apiFetch('/api/user/start-test/MCQ', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeLimit: 60 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Error starting test');

      setSessionId(data.sessionId);
      setTotalQuestions(data.totalQuestions);
      setTestStarted(true);
      setAnswersMap({});
      setSkippedSet(new Set());
      await loadCurrentQuestion(data.sessionId);
    } catch (e) {
      alert(e.message || 'Could not start test');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentQuestion = async (id) => {
    if (!guardAuth()) return;
    try {
      const res = await apiFetch(`/api/user/test-session/${id}/question`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Error loading question');

      setCurrentQuestion(data.question);
      setQuestionNumber(data.questionNumber);
      setTimeRemaining(data.timeRemaining);

      // restore previously chosen answer for this question number
      const prev = answersMap[data.questionNumber];
      setSelectedAnswer(prev || '');
    } catch (err) {
      if (!/Auth error/.test(String(err))) console.error('Error loading question:', err.message);
    }
  };


  
  const handleSelect = (letter) => {
    setSelectedAnswer(letter);
    setAnswersMap((prev) => ({ ...prev, [questionNumber]: letter }));
    setSkippedSet((prev) => {
      if (!prev.has(questionNumber)) return prev;
      const next = new Set(prev);
      next.delete(questionNumber);
      return next;
    });
  };

  // Next = submit answer and advance
  const handleNext = async () => {
    if (!selectedAnswer) {
      alert('Select an answer or use Skip.');
      return;
    }
    await submitAnswerInternal(selectedAnswer);
  };

  // Skip = advance without an answer (mark red)
  const handleSkip = async () => {
    setSkippedSet((prev) => {
      const next = new Set(prev);
      next.add(questionNumber);
      return next;
    });
    setAnswersMap((prev) => {
      if (!prev[questionNumber]) return prev;
      const { [questionNumber]: _drop, ...rest } = prev;
      return rest;
    });
    setSelectedAnswer('');
    await submitAnswerInternal(null);
  };

  // Previous = go back one question (no submit)
  const handlePrevious = async () => {
    if (!guardAuth()) return;
    if (questionNumber <= 1 || !sessionId) return; // first question, nothing to do
    try {
      setLoading(true);
      const res = await apiFetch(`/api/user/test-session/${sessionId}/previous`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Error going to previous question');
      await loadCurrentQuestion(sessionId);
    } catch (err) {
      if (!/Auth error/.test(String(err))) alert(err.message || 'Error moving to previous question');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswerInternal = async (answerLetter /* string|null */) => {
    if (!guardAuth()) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/api/user/test-session/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedAnswer: answerLetter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Error submitting answer');

      if (data.isLastQuestion) {
        setCurrentQuestion(null);
      } else {
        await loadCurrentQuestion(sessionId);
      }
    } catch (err) {
      if (!/Auth error/.test(String(err))) alert(err.message || 'Error submitting answer');
    } finally {
      setLoading(false);
    }
  };

  const submitTest = async () => {
    if (!window.confirm('Submit test?')) return;
    if (!guardAuth()) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/api/user/test-session/${sessionId}/submit`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Error submitting test');

      setTestResult(data);
      setTestCompleted(true);
    } catch (err) {
      if (!/Auth error/.test(String(err))) alert(err.message || 'Error submitting test');
    } finally {
      setLoading(false);
    }
  };

  // client-side countdown display
  useEffect(() => {
    if (testStarted && !testCompleted && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [testStarted, testCompleted, timeRemaining]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Sidebar badge color
  const getBadgeClasses = (idx) => {
    const base = 'w-10 h-10 rounded border text-sm flex items-center justify-center';
    if (answersMap[idx]) return `${base} bg-green-500 text-white border-green-500`; // answered
    if (skippedSet.has(idx)) return `${base} bg-red-500 text-white border-red-500`;  // skipped
    return `${base} bg-gray-200 text-gray-800 border-gray-300`;                      // untouched
  };

  const progressPct = useMemo(() => {
    const answered = Object.keys(answersMap).length;
    const skipped = skippedSet.size;
    const done = Math.min(totalQuestions, answered + skipped);
    return totalQuestions ? Math.round((done / totalQuestions) * 100) : 0;
  }, [answersMap, skippedSet, totalQuestions]);

  // ----- RENDER -----
  if (!testStarted) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center px-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h1 className="text-3xl md:text-4xl overflow-hidden font-bold text-center text-gray-900 mb-6">
            MCQ Test
          </h1>

          {/* quick facts */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-gray-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v2H3zM3 11h18v2H3zM3 17h18v2H3z"/></svg>
              <span>{totalQuestions || 25} Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a11 11 0 1 0 11 11A11.012 11.012 0 0 0 12 1Zm1 11H7V10h4V5h2Z"/></svg>
              <span>30 Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"/></svg>
              <span>Multiple Choice</span>
            </div>
          </div>

          {/* instructions */}
          <div className="space-y-3 text-gray-700 mb-8">
            <h2 className="text-lg font-semibold">Instructions:</h2>
            <ul className="space-y-2 list-disc pl-6">
              <li>Read each question carefully.</li>
              <li>Select the best answer from the given options.</li>
              <li>You can move to the next question or skip if unsure.</li>
              <li>The timer will automatically submit when time runs out.</li>
              <li>Do not switch tabs or windows during the test.</li>
            </ul>
          </div>

          {/* start */}
          <div className="flex justify-center">
            <button
              onClick={startTest}
              disabled={loading}
              className="w-full md:w-2/3 inline-flex items-center justify-center px-6 py-4 rounded-xl text-white font-medium
                         bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-purple-200
                         hover:from-indigo-600 hover:to-purple-700 transition"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              {loading ? 'Starting…' : 'Start Test'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (testCompleted) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl mb-4">Test Completed</h1>
        {testResult && (
          <>
            <p className="mb-2">
              Score: {testResult.score}/{testResult.totalQuestions}
            </p>
            <p className="mb-4">Percentage: {testResult.percentage}%</p>
          </>
        )}
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 border-r bg-white">
        <div className="p-4 border-b flex items-center justify-between">
          <span className="font-semibold">Questions</span>
          <span className="text-sm text-gray-500">
            {Math.max(1, questionNumber)}/{totalQuestions || 0}
          </span>
        </div>

        <div className="p-4 grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions || 0 }).map((_, i) => {
            const idx = i + 1; // 1-based
            const active = idx === questionNumber ? 'ring-2 ring-indigo-500' : '';
            return (
              <button
                key={idx}
                className={`${getBadgeClasses(idx)} ${active}`}
                title={`Question ${idx}`}
                onClick={() => {}}
                disabled
              >
                {idx}
              </button>
            );
          })}
        </div>

        <div className="px-4 pb-4 text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-sm" /> Answered
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-gray-300 rounded-sm border border-gray-400" /> Unanswered
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-sm" /> Skipped
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <div className="w-full max-w-md">
            <div className="text-sm text-gray-700">
              Question {Math.max(1, questionNumber)} of {totalQuestions || 0}
            </div>
            <div className="h-2 bg-gray-200 rounded mt-2 overflow-hidden">
              <div
                className="h-2 bg-indigo-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className="ml-4 font-mono">
            ⏱ {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            {currentQuestion ? (
              <>
                <h2 className="text-xl font-semibold text-center mb-6">
                  {currentQuestion.question}
                </h2>

                <div className="max-w-2xl mx-auto space-y-3">
                  {['A', 'B', 'C', 'D'].map((letter) => {
                    const text = currentQuestion[`option${letter}`];
                    if (!text) return null;

                    const isSelected =
                      (answersMap[questionNumber] || selectedAnswer) === letter;

                    return (
                      <label
                        key={letter}
                        className={`flex items-start gap-2 p-3 border rounded cursor-pointer transition
                          ${isSelected
                            ? 'bg-green-50 border-green-500 text-green-800'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <input
                          type="radio"
                          name={`q-${questionNumber}`}
                          value={letter}
                          checked={isSelected}
                          onChange={() => handleSelect(letter)}
                          className="mt-1"
                        />
                        <div>
                          <strong className="mr-2">{letter}.</strong>
                          <span>{text}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-700">
                <p className="mb-4">No more questions. You can submit your test now.</p>
                <button
                  onClick={submitTest}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded"
                >
                  {loading ? 'Submitting…' : 'Submit Test'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        {currentQuestion && (
          <div className="px-4 py-3 border-t bg-white flex items-center justify-between">
            {/* Previous on the left */}
            <button
              onClick={handlePrevious}
              disabled={loading || questionNumber <= 1}
              className={`px-4 py-2 rounded border ${
                questionNumber <= 1
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
              }`}
            >
              ← Previous
            </button>

            {/* Right side: Skip & Next */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                disabled={loading}
                className="bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 px-4 py-2 rounded"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MCQTest;
