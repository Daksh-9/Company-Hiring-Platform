import React, { useState, useEffect } from 'react';
import Toast from './Toast';

const AdminTestQuestions = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false); // New state for delete button loading
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // New states for coding questions upload
  const [codingFile, setCodingFile] = useState(null);
  const [uploadingCoding, setUploadingCoding] = useState(false);
  
  // Toast notification states
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchQuestions();
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

  // New function to handle deleting all questions
  const handleDeleteAllQuestions = async () => {
    if (!window.confirm('Are you sure you want to delete all existing questions? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/questions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setQuestions([]); // Clear the questions in the state
      } else {
        setError(data.message || 'Deletion failed');
      }
    } catch (err) {
      setError('Network error during deletion');
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
            Download CSV Template
          </button>
          <button
            onClick={downloadCodingTemplate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Download Coding Template
          </button>
           {/* New delete button */}
          <button
            onClick={handleDeleteAllQuestions}
            disabled={deleting || questions.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete All Questions'}
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
      </div>

      {/* Questions List */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Existing Questions</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Options
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correct Answer
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.map((question, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                    {question.question}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      question.testType === 'MCQ' ? 'bg-green-100 text-green-800' :
                      question.testType === 'Coding' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {question.testType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {question.testType === 'MCQ' ? (
                      <div className="space-y-1">
                        <div>A: {question.optionA}</div>
                        <div>B: {question.optionB}</div>
                        <div>C: {question.optionC}</div>
                        <div>D: {question.optionD}</div>
                      </div>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {question.correctAnswer || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {questions.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No questions found. Upload a CSV file to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestQuestions;