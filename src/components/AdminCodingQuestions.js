import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminCodingQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    timeLimit: 30,
    memoryLimit: 256000,
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    starterCode: {
      python: '',
      c: '',
      cpp: '',
      java: '',
      javascript: ''
    }
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/coding-questions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingQuestion 
        ? `/api/admin/coding-questions/${editingQuestion._id}`
        : '/api/admin/coding-questions';
      
      const method = editingQuestion ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setShowForm(false);
      setEditingQuestion(null);
      setFormData({
        title: '',
        description: '',
        difficulty: 'Easy',
        timeLimit: 30,
        memoryLimit: 256000,
        testCases: [{ input: '', expectedOutput: '', isHidden: false }],
        starterCode: { python: '', c: '', cpp: '', java: '', javascript: '' }
      });
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      title: question.title,
      description: question.description,
      difficulty: question.difficulty,
      timeLimit: question.timeLimit,
      memoryLimit: question.memoryLimit,
      testCases: question.testCases,
      starterCode: question.starterCode
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`/api/admin/coding-questions/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: '', expectedOutput: '', isHidden: false }]
    });
  };

  const removeTestCase = (index) => {
    setFormData({
      ...formData,
      testCases: formData.testCases.filter((_, i) => i !== index)
    });
  };

  const updateTestCase = (index, field, value) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index][field] = value;
    setFormData({ ...formData, testCases: newTestCases });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Coding Questions Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Question
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2 h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Memory Limit (KB)</label>
                  <input
                    type="number"
                    value={formData.memoryLimit}
                    onChange={(e) => setFormData({ ...formData, memoryLimit: parseInt(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Test Cases</label>
                  <button
                    type="button"
                    onClick={addTestCase}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Test Case
                  </button>
                </div>
                {formData.testCases.map((testCase, index) => (
                  <div key={index} className="border rounded p-3 mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Test Case {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">Input</label>
                        <input
                          type="text"
                          value={testCase.input}
                          onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Expected Output</label>
                        <input
                          type="text"
                          value={testCase.expectedOutput}
                          onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                          required
                        />
                      </div>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={testCase.isHidden}
                        onChange={(e) => updateTestCase(index, 'isHidden', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Hidden test case</span>
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Starter Code</label>
                {Object.entries(formData.starterCode).map(([lang, code]) => (
                  <div key={lang} className="mb-3">
                    <label className="block text-sm font-medium mb-1 capitalize">{lang}</label>
                    <textarea
                      value={code}
                      onChange={(e) => setFormData({
                        ...formData,
                        starterCode: { ...formData.starterCode, [lang]: e.target.value }
                      })}
                      className="w-full border rounded px-3 py-2 h-20 font-mono text-sm"
                      placeholder={`${lang} starter code...`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingQuestion(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingQuestion ? 'Update' : 'Create'} Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {questions.map((question) => (
          <div key={question._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold">{question.title}</h3>
                <p className="text-gray-600 text-sm">{question.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(question)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(question._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-gray-500">
              <span className={`px-2 py-1 rounded ${
                question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {question.difficulty}
              </span>
              <span>{question.testCases.length} test cases</span>
              <span>{question.timeLimit}s time limit</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCodingQuestions;

