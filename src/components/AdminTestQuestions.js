import React, { useState, useEffect } from 'react';

const AdminTestQuestions = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);

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
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.type === 'application/pdf')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid CSV or PDF file');
      setFile(null);
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
    let endpoint = '';
    let fileNameField = '';
    const testType = file.type === 'application/pdf' ? 'MCQ' : 'MCQ'; // Assuming both are for MCQ

    if (file.type === 'application/pdf') {
      endpoint = `/api/admin/upload-pdf-questions?testType=${testType}`;
      fileNameField = 'pdfFile';
    } else {
      endpoint = `/api/admin/upload-questions?testType=${testType}`;
      fileNameField = 'csvFile';
    }

    if (replaceExisting) {
      const confirmation = window.confirm('Are you sure you want to delete all existing questions of this type and replace them with the new file? This action is irreversible.');
      if (confirmation) {
        // Delete existing questions before uploading the new ones
        await fetch(`/api/admin/questions/delete-by-type/${testType}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
      } else {
        setUploading(false);
        return;
      }
    }

    formData.append(fileNameField, file);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully uploaded ${data.count} questions`);
        setFile(null);
        fetchQuestions(); // Refresh the questions list
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('Network error during upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('Question deleted successfully');
        fetchQuestions();
      } else {
        setError('Failed to delete question');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleDeleteAllQuestions = async () => {
    if (!window.confirm('Are you sure you want to delete all existing questions of this type? This action is irreversible.')) {
        return;
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/questions/delete-by-type/MCQ', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (response.ok) {
            setSuccess('All MCQ questions deleted successfully');
            fetchQuestions();
        } else {
            setError('Failed to delete all questions');
        }
    } catch (err) {
        setError('Network error');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Upload Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Test Questions</h2>
        
        <div className="mb-6">
          <button
            onClick={downloadTemplate}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Download CSV Template
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV or PDF File
            </label>
            <input
              type="file"
              accept=".csv, .pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex items-center">
            <input
              id="replace-existing"
              name="replace-existing"
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="replace-existing" className="ml-2 block text-sm text-gray-900">
              Replace all existing questions of this type
            </label>
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
      </div>

      {/* Questions List */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Existing Questions</h2>
            <button
                onClick={handleDeleteAllQuestions}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
                Delete All
            </button>
        </div>
        
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.map((question, index) => (
                <tr key={question._id}>
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteQuestion(question._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {questions.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No questions found. Upload a file to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestQuestions;