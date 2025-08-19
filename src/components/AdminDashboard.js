import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminResults from './AdminResults';
import AdminTestQuestions from './AdminTestQuestions';
import AdminStudents from './AdminStudents';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminID');
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-lg w-full">
        <div className="px-4">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex space-x-6">
              <Link
                to="/admin/dashboard"
                className={`inline-flex items-center border-b-2 text-sm font-medium ${
                  isActive('dashboard') && !isActive('test-questions') && !isActive('students')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Results
              </Link>
              <Link
                to="/admin/dashboard/test-questions"
                className={`inline-flex items-center border-b-2 text-sm font-medium ${
                  isActive('test-questions')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Test Questions
              </Link>
              <Link
                to="/admin/dashboard/students"
                className={`inline-flex items-center border-b-2 text-sm font-medium ${
                  isActive('students')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Students
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Full space */}
      <main className="flex-1 w-full min-h-[calc(100vh-4rem)] p-0">
        <Routes>
          <Route path="/" element={<AdminResults />} />
          <Route path="/test-questions" element={<AdminTestQuestions />} />
          <Route path="/students" element={<AdminStudents />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
