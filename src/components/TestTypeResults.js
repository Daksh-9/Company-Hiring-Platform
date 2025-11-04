import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TestTypeResults = () => {
  const { testType } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await fetch("/api/admin/results", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Filter results by test type
          const filteredResults = data.results.filter(
            (result) => result.testType.toLowerCase() === testType.toLowerCase()
          );

          // Get highest score for each student
          const highestScores = filteredResults.reduce((acc, current) => {
            const studentId = current.studentId?._id;
            if (!studentId) return acc;

            if (!acc[studentId] || current.score > acc[studentId].score) {
              acc[studentId] = current;
            }
            return acc;
          }, {});

          // Convert back to array and sort by score (highest first)
          const finalResults = Object.values(highestScores).sort(
            (a, b) => b.score - a.score
          );
          setResults(finalResults);
        } else {
          setError("Failed to fetch results");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [testType]);

  const renderTestResults = () => {
    if (testType.toLowerCase() === "coding") {
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Questions Attempted
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Test Cases
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Passed Test Cases
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result) => {
              const totalTestCases = result.testCases || 0;
              const passedTestCases = result.passedTestCases || 0;
              const questionsAttempted = result.questionsAttempted || 0;
              // Pass if 2 or more test cases passed per question on average
              const isPass = passedTestCases / questionsAttempted >= 2;

              return (
                <tr key={result._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {result.studentId?.firstName} {result.studentId?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {questionsAttempted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {totalTestCases}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {passedTestCases}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {result.score}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        isPass
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isPass ? "Pass" : "Fail"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }

    if (testType.toLowerCase() === "paragraph") {
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Questions Attempted
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correct Answers
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result) => {
              const score = result.score || 0;
              const isPass = score >= 60;

              return (
                <tr key={result._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {result.studentId?.firstName} {result.studentId?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">1</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span>{isPass ? "1/1" : "0/1"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        isPass
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isPass ? "Pass" : "Fail"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }

    // Return original table structure for MCQ tests
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
              Student Name
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
              Questions Attempted
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
              Correct Answers
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((result) => {
            // Calculate number of correct answers based on score percentage
            const correctAnswers = Math.round(
              (result.score / 100) * result.totalQuestions
            );
            const passPercentage = 70;
            const isPass =
              (correctAnswers / result.totalQuestions) * 100 >= passPercentage;

            return (
              <tr key={result._id}>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {result.studentId?.firstName} {result.studentId?.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {result.totalQuestions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {correctAnswers} / {result.totalQuestions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      isPass
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {isPass ? "Pass" : "Fail"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold capitalize">
          {testType} Test Results
        </h1>
        <button
          onClick={() => navigate("/admin/results")}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {renderTestResults()}
      </div>
    </div>
  );
};

export default TestTypeResults;
