import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { app } from '../services/firebase';

const AlexaAuthCallback = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing your Alexa account link...');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Parse the URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        const state = queryParams.get('state');
        const error = queryParams.get('error');
        
        // Check if there was an error from Amazon's OAuth
        if (error) {
          setStatus('error');
          setMessage(`Error linking your account: ${error}`);
          return;
        }
        
        // Verify the state parameter to prevent CSRF attacks
        const storedState = localStorage.getItem('alexaAuthState');
        if (!state || state !== storedState) {
          setStatus('error');
          setMessage('Invalid authentication state. Please try again.');
          return;
        }
        
        // Clean up the state from localStorage
        localStorage.removeItem('alexaAuthState');
        
        if (!code) {
          setStatus('error');
          setMessage('No authorization code received. Please try again.');
          return;
        }
        
        // Get the user's Firebase auth token
        const auth = getAuth(app);
        const user = auth.currentUser;
        
        if (!user) {
          setStatus('error');
          setMessage('You must be signed in to link your Alexa account.');
          return;
        }
        
        const idToken = await user.getIdToken();
        
        // Send the code and token to your backend to complete the linking process
        const response = await fetch('/api/alexa/link-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            code,
            redirect_uri: `${window.location.origin}/alexa-auth-callback`
          })
        });
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to link account');
        }
        
        // Account linking successful
        setStatus('success');
        setMessage('Your account has been successfully linked with Alexa!');
        
        // Redirect back to dashboard after a delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
        
      } catch (error) {
        console.error('Error in Alexa auth callback:', error);
        setStatus('error');
        setMessage(`Failed to link your account: ${error.message}`);
      }
    };
    
    processCallback();
  }, [location, navigate]);
  
  return (
    <div className="alexa-callback-container">
      <h2>Alexa Account Linking</h2>
      
      <div className={`status-message ${status}`}>
        <p>{message}</p>
        
        {status === 'error' && (
          <button 
            className="retry-btn"
            onClick={() => navigate('/')}
          >
            Return to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default AlexaAuthCallback; 