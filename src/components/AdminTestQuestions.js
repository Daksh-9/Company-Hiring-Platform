import React, { useState, useEffect } from 'react';
import Toast from './Toast';

const AdminTestQuestions = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // New states for coding questions upload
  const [codingFile, setCodingFile] = useState(null);
  const [uploadingCoding, setUploadingCoding] = useState(false);
  // New states for paragraph questions upload
  const [paragraphFile, setParagraphFile] = useState(null);
  const [uploadingParagraph, setUploadingParagraph] = useState(false);
  const [paragraphQuestions, setParagraphQuestions] = useState([]);
  
  // Toast notification states
  const [toast, setToast] = useState(null);
  const [codingQuestions, setCodingQuestions] = useState([]);

  useEffect(() => {
    fetchQuestions();
    fetchParagraphQuestions();
    fetchCodingQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/questions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      } else {
        setError('Failed to fetch questions');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCodingQuestions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/coding-questions', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCodingQuestions(data.questions || []);
      }
    } catch (err) {
      // silent
    }
  };

  const fetchParagraphQuestions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/paragraph-questions', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setParagraphQuestions(data.questions || []);
      }
    } catch (err) {
      // silent fail to keep UI simple
    }
  };

  const deleteParagraphQuestion = async (id) => {
    if (!window.confirm('Delete this paragraph question?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/paragraph-questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: data.message || 'Deleted', type: 'success' });
        fetchParagraphQuestions();
      } else {
        setToast({ message: data.message || 'Delete failed', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error while deleting', type: 'error' });
    }
  };

  const deleteAllParagraphQuestions = async () => {
    if (!window.confirm('Delete ALL paragraph questions? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/paragraph-questions', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: data.message || 'All deleted', type: 'success' });
        setParagraphQuestions([]);
      } else {
        setToast({ message: data.message || 'Delete failed', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error while deleting all', type: 'error' });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleCodingFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setCodingFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid CSV file');
      setCodingFile(null);
    }
  };

  const handleParagraphFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setParagraphFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid CSV file');
      setParagraphFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/upload-questions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully uploaded ${data.count} questions`);
        setToast({ message: `Questions uploaded successfully! ${data.count} questions added.`, type: 'success' });
        setFile(null);
        fetchQuestions(); // Refresh the questions list
      } else {
        setError(data.message || 'Upload failed');
        setToast({ message: data.message || 'Upload failed', type: 'error' });
      }
    } catch (err) {
      setError('Network error during upload');
      setToast({ message: 'Network error during upload', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleCodingUpload = async (e) => {
    e.preventDefault();
    if (!codingFile) {
      setError('Please select a coding questions file');
      return;
    }

    setUploadingCoding(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('csvFile', codingFile);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/upload-coding-questions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Coding questions uploaded successfully! ${data.count} questions added.`);
        setToast({ message: `Coding questions uploaded successfully! ${data.count} questions added.`, type: 'success' });
        setCodingFile(null);
        fetchQuestions(); // Refresh the questions list
      } else {
        setError(data.message || 'Coding questions upload failed');
        setToast({ message: data.message || 'Coding questions upload failed', type: 'error' });
      }
    } catch (err) {
      setError('Network error during coding questions upload');
      setToast({ message: 'Network error during coding questions upload', type: 'error' });
    } finally {
      setUploadingCoding(false);
    }
  };

  const handleParagraphUpload = async (e) => {
    e.preventDefault();
    if (!paragraphFile) {
      setError('Please select a paragraph questions file');
      return;
    }

    setUploadingParagraph(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('csvFile', paragraphFile);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/upload-paragraph-questions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(`Paragraph questions uploaded! ${data.count} questions added.`);
        setToast({ message: `Paragraph questions uploaded! ${data.count} questions added.`, type: 'success' });
        setParagraphFile(null);
        fetchParagraphQuestions();
      } else {
        setError(data.message || 'Paragraph questions upload failed');
        setToast({ message: data.message || 'Paragraph questions upload failed', type: 'error' });
      }
    } catch (err) {
      setError('Network error during paragraph questions upload');
      setToast({ message: 'Network error during paragraph questions upload', type: 'error' });
    } finally {
      setUploadingParagraph(false);
    }
  };

  const handleDeleteAllMcq = async () => {
    if (!window.confirm('Delete ALL MCQ questions? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/mcq-questions', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: data.message || 'Deleted all MCQ questions', type: 'success' });
        fetchQuestions();
      } else {
        setToast({ message: data.message || 'Delete failed', type: 'error' });
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAllCoding = async () => {
    if (!window.confirm('Delete ALL Coding questions? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/coding-questions', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: data.message || 'Deleted all Coding questions', type: 'success' });
        fetchCodingQuestions();
      } else {
        setToast({ message: data.message || 'Delete failed', type: 'error' });
      }
    } finally {
      setDeleting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `question,optionA,optionB,optionC,optionD,correctAnswer,testType
"What is the capital of France?","Paris","London","Berlin","Madrid","A","MCQ"
"Write a function to reverse a string","","","","","","Coding"
"Explain the concept of recursion","","","","","","Paragraph"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadCodingTemplate = () => {
    const csvContent = `title,description,language_id,difficulty,input1,expected_output1,input2,expected_output2,input3,expected_output3
"Reverse String","Write a function that reverses a string",71,"Easy","hello","olleh","world","dlrow","test","tset"
"Find Maximum","Find the maximum number in an array",50,"Easy","3 7 2 9 1","9","-1 -5 -3","-1","0 0 0","0"
"Palindrome Check","Check if a string is a palindrome",63,"Medium","racecar","true","hello","false","anna","true"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coding_questions_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadParagraphTemplate = () => {
    const csvContent = `topic,desc,maxScore
"Climate Change","Discuss causes and impacts of climate change",100
"Remote Work","Advantages and challenges of remote work",100`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paragraph_questions_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Upload Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Test Questions</h2>
        
        <div className="mb-6 flex gap-4">
          <button
            onClick={downloadTemplate}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Download MCQ Template
          </button>
          <button
            onClick={downloadCodingTemplate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Download Coding Template
          </button>
          <button
            onClick={downloadParagraphTemplate}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Download Paragraph Template
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Questions'}
          </button>
        </form>

        {/* Coding Questions Upload Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Coding Questions</h3>
          
          <form onSubmit={handleCodingUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Coding Questions CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleCodingFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                CSV format: title, description, language_id, difficulty, input1, expected_output1, input2, expected_output2, ...
              </p>
            </div>

            <button
              type="submit"
              disabled={!codingFile || uploadingCoding}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {uploadingCoding ? 'Uploading...' : 'Upload Code'}
            </button>
          </form>
        </div>

        {/* Paragraph Questions Upload Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Paragraph Questions</h3>

          <form onSubmit={handleParagraphUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Paragraph Questions CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleParagraphFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                CSV format: topic, desc, maxScore
              </p>
            </div>

            <button
              type="submit"
              disabled={!paragraphFile || uploadingParagraph}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {uploadingParagraph ? 'Uploading...' : 'Upload Paragraphs'}
            </button>
          </form>
        </div>
      </div>

      {/* MCQ Questions Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">MCQ Questions</h2>
          <button
            onClick={handleDeleteAllMcq}
            disabled={deleting || (questions.filter(q => q.testType === 'MCQ').length === 0)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete All'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answer</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.filter(q => q.testType === 'MCQ').map((question, index) => (
                <tr key={index}>
                  <td className="px-6 py-3 whitespace-normal text-sm text-gray-500">{question.question}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    <div className="space-y-1">
                      <div>A: {question.optionA}</div>
                      <div>B: {question.optionB}</div>
                      <div>C: {question.optionC}</div>
                      <div>D: {question.optionD}</div>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{question.correctAnswer || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {questions.filter(q => q.testType === 'MCQ').length === 0 && (
          <div className="text-center text-gray-500 py-8">No MCQ questions found.</div>
        )}
      </div>

      {/* Coding Questions Card */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Coding Questions</h2>
          <button
            onClick={handleDeleteAllCoding}
            disabled={deleting || codingQuestions.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete All'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {codingQuestions.map((q) => (
                <tr key={q._id}>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{q.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{q.difficulty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {codingQuestions.length === 0 && (
          <div className="text-center text-gray-500 py-8">No coding questions found.</div>
        )}
      </div>

      {/* Paragraph Questions List */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Paragraph Questions</h2>
          <button
            onClick={deleteAllParagraphQuestions}
            disabled={paragraphQuestions.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            Delete All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paragraphQuestions.map((q) => (
                <tr key={q._id}>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{q.topic}</td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{q.desc}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{q.maxScore ?? 100}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => deleteParagraphQuestion(q._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paragraphQuestions.length === 0 && (
          <div className="text-center text-gray-500 py-8">No paragraph questions uploaded yet.</div>
        )}
      </div>
    </div>
  );
};

export default AdminTestQuestions;