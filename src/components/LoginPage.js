// src/components/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'admin'

  const [studentForm, setStudentForm] = useState({ userId: '', password: '' });
  const [adminForm, setAdminForm] = useState({ userId: '', password: '' });

  const [studentErrors, setStudentErrors] = useState({});
  const [adminErrors, setAdminErrors] = useState({});

  const [studentLoading, setStudentLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const validate = (values) => {
    const errs = {};
    if (!values.userId.trim()) errs.userId = 'User ID is required';
    if (!values.password) errs.password = 'Password is required';
    return errs;
  };

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({ ...prev, [name]: value }));
    if (studentErrors[name]) setStudentErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
    if (adminErrors[name]) setAdminErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(studentForm);
    setStudentErrors(errs);
    if (Object.keys(errs).length) return;
    setStudentLoading(true);
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: studentForm.userId,
          password: studentForm.password
        })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('userId', data.user.id); // Store student's ID
        localStorage.setItem('role', 'student'); // Store user role
        navigate('/dashboard');
        return;
      } else {
        setStudentErrors({ password: data.message || 'Invalid credentials' });
      }
    } catch (error) {
      setStudentErrors({ password: 'Network error. Please try again.' });
    } finally {
      setStudentLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(adminForm);
    setAdminErrors(errs);
    if (Object.keys(errs).length) return;
    setAdminLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminID: adminForm.userId, password: adminForm.password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('adminID', data.adminID);
        localStorage.setItem('role', 'admin');
        navigate('/admin/dashboard');
        return;
      } else {
        setAdminErrors({ password: data.message || 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Admin login network error:', error);
      setAdminErrors({ password: 'Network error. Please try again.' });
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-4xl px-10">
        <div className="rounded-2xl shadow-xl border border-gray-200 overflow-hidden bg-white">
          <div className="grid grid-cols-1 md:grid-cols-5 items-stretch">
            {/* Login (left) - slimmer */}
            <div className="md:col-span-2 md:order-2 p-6 sm:p-8 overflow-hidden flex items-center">
              <div className="w-full max-w-xs sm:max-w-sm mx-auto">
                <div className="text-center mb-6 overflow-hidden">
                  <h1 className="font-semibold text-gray-900 text-2xl">Welcome</h1>
                  <p className="text-gray-500 mt-1">Select a role and sign in</p>
                </div>

                <div className="mb-6 flex rounded-lg bg-gray-100 p-1 border border-gray-200">
                  <button
                    className={`flex-1 py-2 text-sm rounded-md transition ${
                      activeTab === 'student' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-700'
                    }`}
                    onClick={() => setActiveTab('student')}
                    aria-pressed={activeTab === 'student'}
                  >
                    Student
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm rounded-md transition ${
                      activeTab === 'admin' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-700'
                    }`}
                    onClick={() => setActiveTab('admin')}
                    aria-pressed={activeTab === 'admin'}
                  >
                    Admin
                  </button>
                </div>

                {activeTab === 'student' ? (
                  <div className="fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">S</div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Student Login</h2>
                      </div>
                    </div>
                    <form className="mt-6 space-y-4" onSubmit={handleStudentSubmit}>
                      <div>
                        <label className="block text-sm font-medium text-gray-1000 text-left">Email</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.94 6.34A2 2 0 0 1 4.59 5h10.82a2 2 0 0 1 1.65.84L10 10.88 2.94 6.34z"/><path d="M18 8.12v5.38A2.5 2.5 0 0 1 15.5 16h-11A2.5 2.5 0 0 1 2 13.5V8.12l7.52 4.67a1 1 0 0 0 .96 0L18 8.12z"/></svg>
                          </span>
                          <input
                            type="text"
                            name="userId"
                            value={studentForm.userId}
                            onChange={handleStudentChange}
                            className={`mt-1 block w-full rounded-lg border ${
                              studentErrors.userId ? 'border-red-500' : 'border-gray-300'
                            } pl-10 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10`}
                            placeholder="you@example.com"
                            aria-invalid={!!studentErrors.userId}
                          />
                        </div>
                        {studentErrors.userId && (
                          <p className="mt-1 text-sm text-red-600">{studentErrors.userId}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-1000 text-left">Password</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 8a5 5 0 1 1 10 0v1h.5A1.5 1.5 0 0 1 17 10.5v6A1.5 1.5 0 0 1 15.5 18h-11A1.5 1.5 0 0 1 3 16.5v-6A1.5 1.5 0 0 1 4.5 9H5V8zm2 1V8a3 3 0 1 1 6 0v1H7z" clipRule="evenodd"/></svg>
                          </span>
                          <input
                            type="password"
                            name="password"
                            value={studentForm.password}
                            onChange={handleStudentChange}
                            className={`mt-1 block w-full rounded-lg border ${
                              studentErrors.password ? 'border-red-500' : 'border-gray-300'
                            } pl-10 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10`}
                            placeholder="Enter your password"
                            aria-invalid={!!studentErrors.password}
                          />
                        </div>
                        {studentErrors.password && (
                          <p className="mt-1 text-sm text-red-600">{studentErrors.password}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Forgot Password?</a>
                      </div>
                      <button
                        type="submit"
                        disabled={studentLoading}
                        className="w-full inline-flex justify-center items-center rounded-lg bg-gray-900 text-white py-2.5 text-sm font-medium hover:bg-black disabled:opacity-50 transition"
                      >
                        {studentLoading ? 'Logging in...' : 'Login'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">A</div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Admin Login</h2>
                      </div>
                    </div>
                    <form className="mt-6 space-y-4" onSubmit={handleAdminSubmit}>
                      <div>
                        <label className="block text-sm font-medium text-gray-1000 text-left">Email</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.94 6.34A2 2 0 0 1 4.59 5h10.82a2 2 0 0 1 1.65.84L10 10.88 2.94 6.34z"/><path d="M18 8.12v5.38A2.5 2.5 0 0 1 15.5 16h-11A2.5 2.5 0 0 1 2 13.5V8.12l7.52 4.67a1 1 0 0 0 .96 0L18 8.12z"/></svg>
                          </span>
                          <input
                            type="text"
                            name="userId"
                            value={adminForm.userId}
                            onChange={handleAdminChange}
                            className={`mt-1 block w-full rounded-lg border ${
                              adminErrors.userId ? 'border-red-500' : 'border-gray-300'
                            } pl-10 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30`}
                            placeholder="admin@example.com"
                            aria-invalid={!!adminErrors.userId}
                          />
                        </div>
                        {adminErrors.userId && (
                          <p className="mt-1 text-sm text-red-600">{adminErrors.userId}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 text-left">Password</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 8a5 5 0 1 1 10 0v1h.5A1.5 1.5 0 0 1 17 10.5v6A1.5 1.5 0 0 1 15.5 18h-11A1.5 1.5 0 0 1 3 16.5v-6A1.5 1.5 0 0 1 4.5 9H5V8zm2 1V8a3 3 0 1 1 6 0v1H7z" clipRule="evenodd"/></svg>
                          </span>
                          <input
                            type="password"
                            name="password"
                            value={adminForm.password}
                            onChange={handleAdminChange}
                            className={`mt-1 block w-full rounded-lg border ${
                              adminErrors.password ? 'border-red-500' : 'border-gray-300'
                            } pl-10 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30`}
                            placeholder="Enter your password"
                            aria-invalid={!!adminErrors.password}
                          />
                        </div>
                        {adminErrors.password && (
                          <p className="mt-1 text-sm text-red-600">{adminErrors.password}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Forgot Password?</a>
                      </div>
                      <button
                        type="submit"
                        disabled={adminLoading}
                        className="w-full inline-flex justify-center items-center rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                      >
                        {adminLoading ? 'Signing in...' : 'Login'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Welcome (right) - thinner and centered */}
            <div className="hidden md:flex md:col-span-3 md:order-2 flex-col justify-center items-center bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white p-8 relative overflow-hidden">
              <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative z-10 w-full max-w-sm mx-auto text-center">

                <h2 className="text-3xl font-semibold tracking-tight overflow-hidden">Welcome to Embinsys</h2>
                <p className="mt-4 text-white/90 text-sm leading-6">
                  Your gateway to professional growth and career opportunities. Log in to access your
                  personalized dashboard and take your assessments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;