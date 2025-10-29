import React, { useState, useEffect, useCallback } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
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
} from "chart.js";

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

// Helper function to process raw results into chart data
const processResultsForCharts = (results) => {
  if (!results || results.length === 0) {
    // FIX: Return safe default values immediately if no results exist
    const emptyStats = {
      totalStudents: 0,
      averageOverallScore: 0,
      testsCompleted: 0,
      passRate: 0,
    };

    const emptyChartData = {
      labels: ["N/A"],
      datasets: [{ data: [0], backgroundColor: ["#ccc"] }],
    };

    return {
      dashboardStats: emptyStats,
      testTypeChartData: {
        labels: ["MCQ", "Coding", "Paragraph"],
        datasets: [
          {
            label: "Average Score (%)",
            data: [0, 0, 0],
            backgroundColor: [
              "rgba(75, 192, 192, 0.8)",
              "rgba(54, 162, 235, 0.8)",
              "rgba(255, 159, 64, 0.8)",
            ],
            borderWidth: 1,
          },
        ],
      },
      scoreDistributionChartData: {
        labels: ["0-20", "21-40", "41-60", "61-80", "81-100"],
        datasets: [
          {
            label: "Number of Results",
            data: [0, 0, 0, 0, 0],
            backgroundColor: [
              "rgba(231, 76, 60, 0.8)",
              "rgba(241, 196, 15, 0.8)",
              "rgba(52, 152, 219, 0.8)",
              "rgba(46, 204, 113, 0.8)",
              "rgba(155, 89, 182, 0.8)",
            ],
            hoverOffset: 4,
          },
        ],
      },
      performanceTrendData: {
        labels: ["No Data"],
        datasets: [
          {
            label: "Average Score",
            data: [0],
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.1,
          },
        ],
      },
    };
  }

  // Continue with calculations if results array is not empty
  const testScores = { MCQ: [], Coding: [], Paragraph: [] };
  const scoreDistributionCounts = {
    "0-20": 0,
    "21-40": 0,
    "41-60": 0,
    "61-80": 0,
    "81-100": 0,
  };
  const testCompletions = { MCQ: 0, Coding: 0, Paragraph: 0 };

  const getScoreRange = (score) => {
    if (score <= 20) return "0-20";
    if (score <= 40) return "21-40";
    if (score <= 60) return "41-60";
    if (score <= 80) return "61-80";
    return "81-100";
  };

  results.forEach((result) => {
    // Normalize test type to match exact casing
    const testType =
      result.testType === "MCQ"
        ? "MCQ"
        : result.testType === "Coding"
        ? "Coding"
        : result.testType === "Paragraph"
        ? "Paragraph"
        : null;

    if (testType && testScores[testType]) {
      testScores[testType].push(result.score);
      testCompletions[testType]++;
    }
    const range = getScoreRange(result.score);
    scoreDistributionCounts[range]++;
  });

  // Calculate Average Scores by Test Type
  const testTypeLabels = ["MCQ", "Coding", "Paragraph"];
  const avgScores = testTypeLabels.map((type) => {
    const scores = testScores[type];
    if (scores.length === 0) return 0;
    return Math.round(
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    );
  });

  // Calculate Average Overall Score
  const allScores = results.map((r) => r.score);
  const averageOverallScore =
    results.length > 0
      ? Math.round(
          allScores.reduce((sum, score) => sum + score, 0) / results.length
        )
      : 0;

  // Calculate Pass Rate (assuming 60% is a pass)
  const passRate =
    results.length > 0
      ? Math.round(
          (results.filter((r) => r.score >= 60).length / results.length) * 100
        )
      : 0;

  // Total Unique Students
  const uniqueStudentIds = [...new Set(results.map((r) => r.studentId?._id))]
    .length;

  // Combine into dashboard stats
  const dashboardStats = {
    totalStudents: uniqueStudentIds,
    averageOverallScore: averageOverallScore,
    testsCompleted: results.length,
    passRate: passRate,
  };

  // --- Chart Data Structures ---

  const testTypeChartData = {
    labels: testTypeLabels,
    datasets: [
      {
        label: "Average Score (%)",
        data: avgScores,
        backgroundColor: [
          "rgba(75, 192, 192, 0.8)", // MCQ
          "rgba(54, 162, 235, 0.8)", // Coding
          "rgba(255, 159, 64, 0.8)", // Paragraph
        ],
        borderColor: [
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(255, 159, 64)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const scoreDistributionChartData = {
    labels: Object.keys(scoreDistributionCounts),
    datasets: [
      {
        label: "Number of Results",
        data: Object.values(scoreDistributionCounts),
        backgroundColor: [
          "rgba(231, 76, 60, 0.8)", // Red (0-20)
          "rgba(241, 196, 15, 0.8)", // Yellow (21-40)
          "rgba(52, 152, 219, 0.8)", // Blue (41-60)
          "rgba(46, 204, 113, 0.8)", // Green (61-80)
          "rgba(155, 89, 182, 0.8)", // Purple (81-100)
        ],
        hoverOffset: 4,
      },
    ],
  };

  // Simple chronological trend data (requires date analysis, keeping placeholder logic simple for now)
  const performanceTrendData = {
    labels: ["Last 50 Tests"], // Simplified label for non-time-series data
    datasets: [
      {
        label: "Average Score",
        data: [averageOverallScore],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
    ],
  };

  return {
    dashboardStats,
    testTypeChartData,
    scoreDistributionChartData,
    performanceTrendData,
  };
};

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    college: "",
    year: "",
    branch: "",
    testType: "", // Add new filter for test type
  });
  const [filteredResults, setFilteredResults] = useState([]);
  const [chartData, setChartData] = useState(null); // State for processed chart data

  const fetchResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken"); // Get the token from storage
      const response = await fetch("/api/admin/results", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add the Authorization header
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch results. Status: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.results)) {
        throw new Error("Invalid data format received from server");
      }

      setResults(data.results);
    } catch (err) {
      console.error("Error fetching results:", err);
      setError(err.message || "Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...results];

    if (filters.college) {
      filtered = filtered.filter(
        (result) => result.studentId?.collegeName === filters.college
      );
    }

    if (filters.year) {
      filtered = filtered.filter(
        (result) => result.studentId?.yearOfStudy === filters.year
      );
    }

    if (filters.branch) {
      filtered = filtered.filter(
        (result) => result.studentId?.branch === filters.branch
      );
    }

    setFilteredResults(filtered);
    // PROCESS DATA FOR CHARTS/STATS
    setChartData(processResultsForCharts(filtered));
  }, [results, filters]);

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ college: "", year: "", branch: "", testType: "" });
  };

  const handleRefresh = () => {
    fetchResults();
  };

  const getUniqueValues = (key) => {
    const values = results
      .map((result) => result.studentId?.[key])
      .filter(Boolean);
    return [...new Set(values)].sort();
  };

  // Chart options (kept simple for consistency)
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Score (%)",
        },
      },
    },
  };

  // Doughnut chart options, without y-axis scale
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  // Fallback if no data is present after loading
  if (!chartData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">
          No data available to display charts.
        </div>
      </div>
    );
  }

  // Add this new function to process consolidated results
  const getConsolidatedResults = (results) => {
    try {
      const studentResults = results.reduce((acc, result) => {
        const studentId = result.studentId?._id;
        if (!studentId) return acc;

        if (!acc[studentId]) {
          acc[studentId] = {
            studentId: result.studentId,
            mcqScore: null,
            codingScore: null,
            paragraphScore: null,
            lastTestDate: result.completedAt,
          };
        }

        // Normalize test type and update scores
        const testType = result.testType;
        const score = result.score;

        if (
          testType === "MCQ" &&
          (!acc[studentId].mcqScore || score > acc[studentId].mcqScore)
        ) {
          acc[studentId].mcqScore = score;
        } else if (
          testType === "Coding" &&
          (!acc[studentId].codingScore || score > acc[studentId].codingScore)
        ) {
          acc[studentId].codingScore = score;
        } else if (
          testType === "Paragraph" &&
          (!acc[studentId].paragraphScore ||
            score > acc[studentId].paragraphScore)
        ) {
          acc[studentId].paragraphScore = score;
        }

        // Update last test date if more recent
        const currentDate = new Date(result.completedAt);
        const existingDate = new Date(acc[studentId].lastTestDate);
        if (currentDate > existingDate) {
          acc[studentId].lastTestDate = result.completedAt;
        }

        return acc;
      }, {});

      return Object.values(studentResults);
    } catch (error) {
      console.error("Error processing results:", error);
      return [];
    }
  };

  // Replace the existing detailed results table with this
  const renderDetailedResults = () => {
    try {
      const consolidatedResults = getConsolidatedResults(filteredResults);
      if (!consolidatedResults.length) {
        return (
          <div className="text-center p-8 text-gray-500">
            No results found for the selected filters
          </div>
        );
      }

      return (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Student Performance Summary
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MCQ Score
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coding Score
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paragraph Score
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Test Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {consolidatedResults.map((student) => (
                  <tr key={student.studentId._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {student.studentId?.firstName}{" "}
                        {student.studentId?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          student.mcqScore >= 70
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.mcqScore ? `${student.mcqScore}%` : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          student.codingScore >= 33
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.codingScore
                          ? `${student.codingScore}%`
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          student.paragraphScore >= 60
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.paragraphScore
                          ? `${student.paragraphScore}%`
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {new Date(student.lastTestDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error rendering results:", error);
      return (
        <div className="text-center p-8 text-red-500">
          Error displaying results. Please try refreshing the page.
        </div>
      );
    }
  };

  return (
    <div className="w-full h-full">
      {/* Filters Section (Keep as is) */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Type
            </label>
            <select
              value={filters.testType}
              onChange={(e) => {
                if (e.target.value) {
                  // Navigate to the test specific page
                  window.location.href = `/admin/results/${e.target.value.toLowerCase()}`;
                }
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Test Types</option>
              <option value="MCQ">MCQ</option>
              <option value="Coding">Coding</option>
              <option value="Paragraph">Paragraph</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              College
            </label>
            <select
              value={filters.college}
              onChange={(e) => handleFilterChange("college", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Colleges</option>
              {getUniqueValues("collegeName").map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange("year", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Years</option>
              {getUniqueValues("yearOfStudy").map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <select
              value={filters.branch}
              onChange={(e) => handleFilterChange("branch", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Branches</option>
              {getUniqueValues("branch").map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
          >
            Clear Filters
          </button>

          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Refresh
          </button>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredResults.length} of {results.length} total results
        </div>
      </div>

      {/* Charts Section */}
      <div className="p-6">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Assessment Results Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900">
                Total Students
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {chartData.dashboardStats.totalStudents}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900">
                Average Score
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {chartData.dashboardStats.averageOverallScore}%
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900">
                Tests Completed
              </h3>
              <p className="text-3xl font-bold text-yellow-600">
                {chartData.dashboardStats.testsCompleted}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900">
                Pass Rate ({">"}=60%)
              </h3>
              <h3 className="text-lg font-semibold text-purple-900">Pass Rate (=60%)</h3>
              <p className="text-3xl font-bold text-purple-600">
                {chartData.dashboardStats.passRate}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border h-80">
              <h3 className="text-lg font-semibold mb-4">
                Average Score by Test Type
              </h3>
              <Bar data={chartData.testTypeChartData} options={chartOptions} />
            </div>
            <div className="bg-white p-4 rounded-lg border h-80">
              <h3 className="text-lg font-semibold mb-4">
                Overall Score Trend
              </h3>
              {/* Note: This is currently based on the overall average, as full time-series data requires more backend logic. */}
              <Line
                data={chartData.performanceTrendData}
                options={chartOptions}
              />
            </div>
            <div className="bg-white p-4 rounded-lg border lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
              <div className="flex justify-center h-80">
                <div className="w-full max-w-lg">
                  <Doughnut
                    data={chartData.scoreDistributionChartData}
                    options={doughnutOptions}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table (No change, uses filteredResults) */}
        {renderDetailedResults()}
      </div>
    </div>
  );
};

export default AdminResults;
