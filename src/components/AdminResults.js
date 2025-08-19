import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    college: '',
    year: '',
    branch: '',
    student: ''
  });
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [results, filters]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/results', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      } else {
        setError('Failed to fetch results');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...results];
    
    if (filters.college) {
      filtered = filtered.filter(result => 
        result.studentId?.collegeName === filters.college
      );
    }
    
    if (filters.year) {
      filtered = filtered.filter(result => 
        result.studentId?.yearOfStudy === filters.year
      );
    }
    
    if (filters.branch) {
      filtered = filtered.filter(result => 
        result.studentId?.branch === filters.branch
      );
    }
    
    if (filters.student) {
      filtered = filtered.filter(result => 
        result.studentId?.firstName?.toLowerCase().includes(filters.student.toLowerCase()) ||
        result.studentId?.lastName?.toLowerCase().includes(filters.student.toLowerCase()) ||
        result.studentId?.email?.toLowerCase().includes(filters.student.toLowerCase())
      );
    }
    
    setFilteredResults(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ college: '', year: '', branch: '', student: '' });
  };

  // Get unique values for filter options
  const getUniqueValues = (key) => {
    const values = results.map(result => result.studentId?.[key]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  // Sample data for charts (replace with actual data from backend)
  const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Average Score',
        data: [75, 82, 78, 85, 90, 88],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const testTypeData = {
    labels: ['MCQ', 'Coding', 'Paragraph'],
    datasets: [
      {
        label: 'Test Completion Rate',
        data: [85, 72, 68],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
        ],
      },
    ],
  };

  const scoreDistributionData = {
    labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
    datasets: [
      {
        label: 'Students',
        data: [5, 12, 25, 30, 18],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Filters Section */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
            <select
              value={filters.college}
              onChange={(e) => handleFilterChange('college', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Colleges</option>
              {getUniqueValues('collegeName').map(college => (
                <option key={college} value={college}>{college}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Years</option>
              {getUniqueValues('yearOfStudy').map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              value={filters.branch}
              onChange={(e) => handleFilterChange('branch', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Branches</option>
              {getUniqueValues('branch').map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
            <input
              type="text"
              placeholder="Name or email..."
              value={filters.student}
              onChange={(e) => handleFilterChange('student', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-48"
            />
          </div>
          
          <button
            onClick={clearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
          >
            Clear Filters
          </button>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredResults.length} of {results.length} results
        </div>
      </div>

      {/* Charts Section */}
      <div className="p-6">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Assessment Results Overview</h2>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900">Total Students</h3>
              <p className="text-3xl font-bold text-blue-600">{filteredResults.length || results.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900">Average Score</h3>
              <p className="text-3xl font-bold text-green-600">
                {filteredResults.length > 0 
                  ? Math.round(filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length)
                  : Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
                }%
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900">Tests Completed</h3>
              <p className="text-3xl font-bold text-yellow-600">{filteredResults.length || results.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900">Pass Rate</h3>
              <p className="text-3xl font-bold text-purple-600">
                {filteredResults.length > 0 
                  ? Math.round((filteredResults.filter(r => r.score >= 60).length / filteredResults.length) * 100)
                  : Math.round((results.filter(r => r.score >= 60).length / results.length) * 100)
                }%
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
              <Line 
                data={performanceData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
              />
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Test Type Performance</h3>
              <Bar 
                data={testTypeData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
              />
            </div>

            <div className="bg-white p-4 rounded-lg border lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
              <div className="flex justify-center">
                <div className="w-96">
                  <Doughnut 
                    data={scoreDistributionData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(filteredResults.length > 0 ? filteredResults : results).map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.studentId?.firstName} {result.studentId?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{result.studentId?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        result.testType === 'MCQ' ? 'bg-green-100 text-green-800' :
                        result.testType === 'Coding' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {result.testType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{result.score}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.totalQuestions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.completedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResults;
