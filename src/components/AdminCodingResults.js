import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminCodingResults = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/coding-submissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Failed': return 'text-red-600 bg-red-100';
      case 'Running': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Coding Submissions & Results</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {submission.studentId?.firstName} {submission.studentId?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{submission.studentId?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {submission.questionId?.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded text-xs ${
                        submission.questionId?.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        submission.questionId?.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {submission.questionId?.difficulty}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.language}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-lg font-bold ${getScoreColor(submission.overallResult?.score || 0)}`}>
                      {submission.overallResult?.score || 0}%
                    </span>
                    <div className="text-xs text-gray-500">
                      {submission.overallResult?.passedTestCases || 0}/{submission.overallResult?.totalTestCases || 0} tests
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Submission Details</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Student Information</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>Name:</strong> {selectedSubmission.studentId?.firstName} {selectedSubmission.studentId?.lastName}</p>
                  <p><strong>Email:</strong> {selectedSubmission.studentId?.email}</p>
                  <p><strong>Language:</strong> {selectedSubmission.language}</p>
                  <p><strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Overall Results</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span>Score:</span>
                    <span className={`text-xl font-bold ${getScoreColor(selectedSubmission.overallResult?.score || 0)}`}>
                      {selectedSubmission.overallResult?.score || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Tests Passed:</span>
                    <span>{selectedSubmission.overallResult?.passedTestCases || 0}/{selectedSubmission.overallResult?.totalTestCases || 0}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Execution Time:</span>
                    <span>{selectedSubmission.overallResult?.executionTime || 0}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Memory Used:</span>
                    <span>{selectedSubmission.overallResult?.memoryUsed || 0}KB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">Test Case Results</h4>
              <div className="space-y-2">
                {selectedSubmission.testResults?.map((test, index) => (
                  <div key={index} className={`p-3 rounded border ${
                    test.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Test Case {index + 1}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        test.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {test.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Input:</strong> {test.input}</p>
                      <p><strong>Expected:</strong> {test.expectedOutput}</p>
                      <p><strong>Actual:</strong> {test.actualOutput || 'No output'}</p>
                      {test.error && <p className="text-red-600"><strong>Error:</strong> {test.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">Source Code</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {selectedSubmission.sourceCode}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCodingResults;

