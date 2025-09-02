// src/components/AdminStudents.js

import React, { useState, useEffect } from 'react';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMail, setSendingMail] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mailModal, setMailModal] = useState(false);
  const [mailForm, setMailForm] = useState({
    subject: '',
    message: '',
    timeRange: 'all',
    startDate: '',
    endDate: '',
    selectedStudents: []
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMailToAll = async () => {
    if (!window.confirm('Are you sure you want to send an email to all registered students?')) {
      return;
    }

    setSendingMail(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/send-mail', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: 'Important Update from Hiring Platform',
          message: 'Dear Student,\n\nWe hope this email finds you well. This is an important update regarding your assessment process.\n\nBest regards,\nAdmin Team'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully sent emails to ${data.sentCount} students`);
      } else {
        setError(data.message || 'Failed to send emails');
      }
    } catch (err) {
      setError('Network error while sending emails');
    } finally {
      setSendingMail(false);
    }
  };

  const openMailModal = () => {
    setMailModal(true);
    setMailForm({
      subject: '',
      message: '',
      timeRange: 'all',
      startDate: '',
      endDate: '',
      selectedStudents: []
    });
  };

  const closeMailModal = () => {
    setMailModal(false);
  };

  const handleMailFormChange = (field, value) => {
    setMailForm(prev => ({ ...prev, [field]: value }));
  };

  const getFilteredStudents = () => {
    let filtered = [...students];
    
    if (mailForm.timeRange === 'custom' && mailForm.startDate && mailForm.endDate) {
      const start = new Date(mailForm.startDate);
      const end = new Date(mailForm.endDate);
      filtered = filtered.filter(student => {
        const created = new Date(student.createdAt);
        return created >= start && created <= end;
      });
    } else if (mailForm.timeRange === 'today') {
      const today = new Date();
      filtered = filtered.filter(student => {
        const created = new Date(student.createdAt);
        return created.toDateString() === today.toDateString();
      });
    } else if (mailForm.timeRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(student => {
        const created = new Date(student.createdAt);
        return created >= weekAgo;
      });
    } else if (mailForm.timeRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(student => {
        const created = new Date(student.createdAt);
        return created >= monthAgo;
      });
    }
    
    return filtered;
  };

  const sendCustomMail = async () => {
    if (!mailForm.subject || !mailForm.message) {
      setError('Subject and message are required');
      return;
    }

    const filteredStudents = getFilteredStudents();
    if (filteredStudents.length === 0) {
      setError('No students match the selected criteria');
      return;
    }

    setSendingMail(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      
      // Send individual emails to each student
      let sentCount = 0;
      for (const student of filteredStudents) {
        try {
          const userID = `${student.firstName.toLowerCase()}${student.lastName.toLowerCase()}${student._id.slice(-6)}`;
          const commonPassword = 'Student@123';
          
          const personalizedMessage = `${mailForm.message}\n\nYour login credentials:\nUser ID: ${userID}\nPassword: ${commonPassword}\n\nPlease change your password after first login.\n\nBest regards,\nAdmin Team`;
          
          const response = await fetch('/api/admin/send-mail', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subject: mailForm.subject,
              message: personalizedMessage,
              to: student.email
            }),
          });

          if (response.ok) {
            sentCount++;
          }
        } catch (err) {
          console.error(`Error sending email to ${student.email}:`, err);
        }
      }

      setSuccess(`Successfully sent emails to ${sentCount} students`);
      closeMailModal();
    } catch (err) {
      setError('Network error while sending emails');
    } finally {
      setSendingMail(false);
    }
  };

  const exportStudents = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'College', 'Branch', 'Year', 'Roll Number', 'Registration Date'],
      ...students.map(student => [
        `${student.firstName} ${student.lastName}`,
        student.email,
        student.phone,
        student.collegeName || 'N/A',
        student.branch || 'N/A',
        student.yearOfStudy || 'N/A',
        student.rollNumber || 'N/A',
        new Date(student.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Registered Students</h2>
          <div className="space-x-2">
            <button
              onClick={exportStudents}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Export to CSV
            </button>
            <button
              onClick={handleSendMailToAll}
              disabled={sendingMail || students.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {sendingMail ? 'Sending...' : 'Send Mail to All'}
            </button>
            <button
              onClick={openMailModal}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Custom Mail
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-3 text-green-600 text-sm">
            {success}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900">Total Students</h3>
            <p className="text-3xl font-bold text-blue-600">{students.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900">This Month</h3>
            <p className="text-3xl font-bold text-green-600">
              {students.filter(s => {
                const created = new Date(s.createdAt);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900">This Week</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {students.filter(s => {
                const created = new Date(s.createdAt);
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return created >= weekAgo;
              }).length}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900">Today</h3>
            <p className="text-3xl font-bold text-purple-600">
              {students.filter(s => {
                const created = new Date(s.createdAt);
                const now = new Date();
                return created.toDateString() === now.toDateString();
              }).length}
            </p>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    College
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.collegeName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.branch || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.yearOfStudy || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.rollNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {student.createdAt && <span role="img" aria-label="registered">✅</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {students.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No students registered yet.
            </div>
          )}
        </div>
      </div>

      {/* Custom Mail Modal */}
      {mailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Send Custom Mail</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                  <select
                    value={mailForm.timeRange}
                    onChange={(e) => handleMailFormChange('timeRange', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Students</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {mailForm.timeRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={mailForm.startDate}
                        onChange={(e) => handleMailFormChange('startDate', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={mailForm.endDate}
                        onChange={(e) => handleMailFormChange('endDate', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={mailForm.subject}
                    onChange={(e) => handleMailFormChange('subject', e.target.value)}
                    placeholder="Email subject..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={mailForm.message}
                    onChange={(e) => handleMailFormChange('message', e.target.value)}
                    placeholder="Your message... (will include login credentials)"
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                  <strong>Note:</strong> Each student will receive their unique User ID and common password (Student@123) along with your message.
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={sendCustomMail}
                    disabled={sendingMail || !mailForm.subject || !mailForm.message}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    {sendingMail ? 'Sending...' : 'Send Mail'}
                  </button>
                  <button
                    onClick={closeMailModal}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;