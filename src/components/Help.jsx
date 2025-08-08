import React, { useState } from 'react';

const Help = () => {
  const [activeSection, setActiveSection] = useState('general');

  const helpSections = [
    {
      id: 'general',
      title: 'General Information',
      icon: 'fas fa-info-circle',
      content: [
        {
          question: 'What is this platform?',
          answer: 'This is a comprehensive hiring platform designed to assess candidates through various types of tests including MCQ, coding, and paragraph writing assessments.'
        },
        {
          question: 'How do I start an assessment?',
          answer: 'Navigate to the Assessments section from the dashboard and select the type of test you want to take. Click "Start Assessment" to begin.'
        },
        {
          question: 'Can I retake tests?',
          answer: 'Currently, each test can only be taken once. Make sure you are prepared before starting any assessment.'
        }
      ]
    },
    {
      id: 'assessments',
      title: 'Assessment Types',
      icon: 'fas fa-tasks',
      content: [
        {
          question: 'What is the MCQ Test?',
          answer: 'The MCQ (Multiple Choice Questions) test consists of 25 questions that must be completed within 30 minutes. It assesses your general knowledge and problem-solving skills.'
        },
        {
          question: 'What is the Coding Test?',
          answer: 'The coding test includes 15 programming problems that must be solved within 45 minutes. It evaluates your programming skills, algorithm knowledge, and problem-solving abilities.'
        },
        {
          question: 'What is the Paragraph Test?',
          answer: 'The paragraph test consists of 20 writing prompts that must be completed within 25 minutes. It assesses your communication skills, writing ability, and clarity of expression.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: 'fas fa-tools',
      content: [
        {
          question: 'What if my test gets interrupted?',
          answer: 'If your test is interrupted due to technical issues, contact support immediately. Do not refresh the page or close the browser during an active test.'
        },
        {
          question: 'What browsers are supported?',
          answer: 'We recommend using the latest versions of Chrome, Firefox, Safari, or Edge for the best experience.'
        },
        {
          question: 'How do I report a bug?',
          answer: 'If you encounter any technical issues, please contact our support team with details about the problem and your system information.'
        }
      ]
    },
    {
      id: 'profile',
      title: 'Profile Management',
      icon: 'fas fa-user',
      content: [
        {
          question: 'How do I update my profile?',
          answer: 'Go to "My Profile" in the dashboard to view and edit your personal information, including contact details and preferences.'
        },
        {
          question: 'Can I change my password?',
          answer: 'Yes, you can change your password from the profile settings page. Make sure to use a strong password for security.'
        },
        {
          question: 'How do I view my test results?',
          answer: 'Test results are typically available immediately after completion. You can view them in your profile or dashboard.'
        }
      ]
    }
  ];

  const getCurrentSection = () => {
    return helpSections.find(section => section.id === activeSection);
  };

  return (
    <div className="help-container">
      <div className="help-header">
        <h2><i className="fas fa-question-circle"></i> Help & Support</h2>
        <p>Find answers to common questions and get assistance with using the platform</p>
      </div>

      <div className="help-content">
        <div className="help-sidebar">
          {helpSections.map((section) => (
            <button
              key={section.id}
              className={`help-nav-btn ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <i className={section.icon}></i>
              {section.title}
            </button>
          ))}
        </div>

        <div className="help-main">
          <div className="help-section">
            <h3>
              <i className={getCurrentSection()?.icon}></i>
              {getCurrentSection()?.title}
            </h3>
            
            <div className="faq-list">
              {getCurrentSection()?.content.map((item, index) => (
                <div key={index} className="faq-item">
                  <div className="faq-question">
                    <i className="fas fa-question"></i>
                    <h4>{item.question}</h4>
                  </div>
                  <div className="faq-answer">
                    <i className="fas fa-answer"></i>
                    <p>{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="help-contact">
            <h4><i className="fas fa-envelope"></i> Still Need Help?</h4>
            <p>If you couldn't find the answer you're looking for, please contact our support team:</p>
            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>support@embinsys.com</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-clock"></i>
                <span>Monday - Friday, 9 AM - 6 PM EST</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
