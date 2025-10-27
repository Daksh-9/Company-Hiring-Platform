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

    // --- State for Registration Invite ---
    const [inviteEmail, setInviteEmail] = useState('');
    const [sendingInvite, setSendingInvite] = useState(false);
    // ------------------------------------

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
            // Ensure end date includes the whole day
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(student => {
                const created = new Date(student.createdAt);
                return created >= start && created <= end;
            });
        } else if (mailForm.timeRange === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            filtered = filtered.filter(student => {
                const created = new Date(student.createdAt);
                return created >= today && created < tomorrow;
            });
        } else if (mailForm.timeRange === 'week') {
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            weekAgo.setHours(0, 0, 0, 0);
            filtered = filtered.filter(student => {
                const created = new Date(student.createdAt);
                return created >= weekAgo;
            });
        } else if (mailForm.timeRange === 'month') {
            const now = new Date();
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            monthAgo.setHours(0, 0, 0, 0);
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

        const confirmMessage = `This will send a custom email to ${filteredStudents.length} student(s) based on the selected criteria. Each email will include login credentials (User ID: email, Password: [Generated Password]). Do you want to proceed?`;
        if (!window.confirm(confirmMessage)) {
             return;
        }


        setSendingMail(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('adminToken');

            // Send individual emails to each student
            let sentCount = 0;
            let failedEmails = [];
            for (const student of filteredStudents) {
                try {
                     // Password generation logic - should match backend /api/signup
                    const namePart = student.firstName.substring(0, 4).toLowerCase();
                    const paddedNamePart = namePart.padEnd(4, 'x');
                    // We can't generate the *exact* random part here as it was generated on signup.
                    // IMPORTANT: The password included here might NOT be the current one if the user changed it.
                    // It's better to guide them to a 'forgot password' flow if needed.
                    // For demonstration, let's include the common initial password structure if that's still relevant,
                    // otherwise, remove the password part from the email.
                    // const initialPasswordStructure = `${paddedNamePart}******`; // Example placeholder

                    // Construct message - AVOID sending actual or assumed passwords if possible.
                    // Recommend a password reset link instead. Modify message accordingly.
                    const personalizedMessage = `Dear ${student.firstName},\n\n${mailForm.message}\n\nYour User ID is: ${student.email}\nIf you need to reset your password, please use the 'Forgot Password' link on the login page.\n\nBest regards,\nAdmin Team`;
                    const personalizedHtmlMessage = `<p>Dear ${student.firstName},</p><p>${mailForm.message.replace(/\n/g, '<br>')}</p><p>Your User ID is: <strong>${student.email}</strong></p><p>If you need to reset your password, please use the 'Forgot Password' link on the login page.</p><p>Best regards,<br>Admin Team</p>`;


                    const response = await fetch('/api/admin/send-mail', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            subject: mailForm.subject,
                            message: personalizedMessage, // Text version
                            html: personalizedHtmlMessage, // HTML version
                            to: student.email
                        }),
                    });

                    if (response.ok) {
                        sentCount++;
                    } else {
                        failedEmails.push(student.email);
                    }
                } catch (err) {
                    console.error(`Error sending email to ${student.email}:`, err);
                    failedEmails.push(student.email);
                }
            }

             if (failedEmails.length > 0) {
                setError(`Failed to send emails to: ${failedEmails.join(', ')}`);
            }
            setSuccess(`Successfully sent emails to ${sentCount} out of ${filteredStudents.length} selected students.`);
            closeMailModal();
        } catch (err) {
            setError('Network error during bulk email sending.');
        } finally {
            setSendingMail(false);
        }
    };


    const exportStudents = () => {
        const csvContent = [
            ['Name', 'Email', 'Phone', 'College', 'Branch', 'Year', 'Roll Number', 'Registration Date'],
            ...students.map(student => [
                `"${student.firstName} ${student.lastName}"`, // Enclose name in quotes in case of commas
                student.email,
                student.phone,
                student.collegeName || 'N/A',
                student.branch || 'N/A',
                student.yearOfStudy || 'N/A',
                student.rollNumber || 'N/A',
                new Date(student.createdAt).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); // Added charset
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students_list.csv';
        document.body.appendChild(a); // Append link to body for Firefox compatibility
        a.click();
        document.body.removeChild(a); // Clean up
        window.URL.revokeObjectURL(url);
    };

    // --- Handler for Sending Registration Invite ---
    const handleSendInvite = async () => {
        if (!inviteEmail || !/\S+@\S+\.\S+/.test(inviteEmail)) {
            setError('Please enter a valid email address.');
            // Clear success message when showing error
            setSuccess('');
            return;
        }
        setSendingInvite(true);
        setError('');
        setSuccess('');
        try {
            const adminToken = localStorage.getItem('adminToken');
            const response = await fetch('/api/admin/send-invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ email: inviteEmail })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setSuccess(data.message || `Invitation sent to ${inviteEmail}.`);
                setInviteEmail(''); // Clear input on success
            } else {
                setError(data.message || 'Failed to send invite.');
            }
        } catch (err) {
            console.error("Invite send error:", err);
            setError('Network error sending invite. Please try again.');
        } finally {
            setSendingInvite(false);
        }
    };
    // ---------------------------------------------


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
                <div className="flex justify-between items-center mb-4"> {/* Added mb-4 */}
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
                            {sendingMail ? 'Sending...' : 'Send Generic Mail to All'}
                        </button>
                        <button
                            onClick={openMailModal}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                            Custom Mail (Filtered)
                        </button>
                    </div>
                </div>

                {/* --- Add Invite Section --- */}
                 <div className="mt-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Send Registration Invite</h3>
                    <div className="flex flex-col sm:flex-row gap-2 items-end">
                        <div className="flex-grow w-full sm:w-auto">
                            <label htmlFor="inviteEmailInput" className="block text-sm font-medium text-gray-700 mb-1">
                                Student Email
                            </label>
                            <input
                                id="inviteEmailInput"
                                type="email"
                                placeholder="student@example.com"
                                value={inviteEmail}
                                onChange={(e) => {
                                    setInviteEmail(e.target.value);
                                    // Clear error/success when user types
                                    if (error) setError('');
                                    if (success) setSuccess('');
                                }}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <button
                            onClick={handleSendInvite}
                            disabled={sendingInvite || !inviteEmail}
                            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sendingInvite ? (
                                <>
                                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                                 Sending...
                                </>
                            ) : (
                                'Send Invite'
                            )}
                        </button>
                    </div>
                 </div>
                 {/* ------------------------ */}


                {/* Display Error/Success Messages */}
                 <div className="mt-3 text-sm">
                    {error && <p className="text-red-600">{error}</p>}
                    {success && <p className="text-green-600">{success}</p>}
                 </div>

            </div>

            {/* Summary Cards */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"> {/* Adjusted grid for responsiveness */}
                    <div className="bg-blue-50 p-4 rounded-lg shadow"> {/* Added shadow */}
                        <h3 className="text-lg font-semibold text-blue-900">Total Students</h3>
                        <p className="text-3xl font-bold text-blue-600">{students.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg shadow"> {/* Added shadow */}
                        <h3 className="text-lg font-semibold text-green-900">This Month</h3>
                        <p className="text-3xl font-bold text-green-600">
                            {students.filter(s => {
                                const created = new Date(s.createdAt);
                                const now = new Date();
                                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                            }).length}
                        </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg shadow"> {/* Added shadow */}
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
                    <div className="bg-purple-50 p-4 rounded-lg shadow"> {/* Added shadow */}
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"> {/* Hide on small screens */}
                                        Phone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"> {/* Hide on medium screens */}
                                        College
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"> {/* Hide on medium screens */}
                                        Branch
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"> {/* Hide on medium screens */}
                                        Year
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell"> {/* Hide on large screens */}
                                        Roll Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Registered On
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
                                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell"> {/* Hide on small screens */}
                                            <div className="text-sm text-gray-900">{student.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell"> {/* Hide on medium screens */}
                                            <div className="text-sm text-gray-900">{student.collegeName || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell"> {/* Hide on medium screens */}
                                            <div className="text-sm text-gray-900">{student.branch || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell"> {/* Hide on medium screens */}
                                            <div className="text-sm text-gray-900">{student.yearOfStudy || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell"> {/* Hide on large screens */}
                                            <div className="text-sm text-gray-900">{student.rollNumber || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"> {/* Changed alignment and color */}
                                           {new Date(student.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {students.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            No students registered yet. Use the 'Send Invite' feature to invite students.
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Mail Modal (Keep existing structure) */}
            {mailModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center"> {/* Added flex centering */}
                    <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white"> {/* Adjusted width */}
                         <button
                            onClick={closeMailModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                            aria-label="Close modal"
                         >
                             &times; {/* Better close icon */}
                         </button>
                        <div className="mt-3">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 text-center">Send Custom Mail</h3>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="timeRangeSelect" className="block text-sm font-medium text-gray-700 mb-1">Send To Students Registered:</label>
                                    <select
                                        id="timeRangeSelect"
                                        value={mailForm.timeRange}
                                        onChange={(e) => handleMailFormChange('timeRange', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>

                                {mailForm.timeRange === 'custom' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                            <label htmlFor="startDateInput" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                            <input
                                                id="startDateInput"
                                                type="date"
                                                value={mailForm.startDate}
                                                onChange={(e) => handleMailFormChange('startDate', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="endDateInput" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                            <input
                                                id="endDateInput"
                                                type="date"
                                                value={mailForm.endDate}
                                                onChange={(e) => handleMailFormChange('endDate', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="subjectInput" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <input
                                        id="subjectInput"
                                        type="text"
                                        value={mailForm.subject}
                                        onChange={(e) => handleMailFormChange('subject', e.target.value)}
                                        placeholder="Email subject..."
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="messageInput" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea
                                        id="messageInput"
                                        value={mailForm.message}
                                        onChange={(e) => handleMailFormChange('message', e.target.value)}
                                        placeholder="Your message body..."
                                        rows={5} // Increased rows
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200"> {/* Improved note style */}
                                    <strong>Note:</strong> Each selected student will receive their User ID (email). Consider adding instructions for password resets if needed.
                                </div>

                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4"> {/* Adjusted button layout */}
                                    <button
                                        onClick={sendCustomMail}
                                        disabled={sendingMail || !mailForm.subject || !mailForm.message}
                                        className="flex-1 inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sendingMail ? (
                                            <>
                                             <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                             </svg>
                                             Sending...
                                            </>
                                        ) : `Send Mail to ${getFilteredStudents().length} Student(s)`}
                                    </button>
                                    <button
                                        type="button" // Important for forms
                                        onClick={closeMailModal}
                                        className="flex-1 inline-flex justify-center bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
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