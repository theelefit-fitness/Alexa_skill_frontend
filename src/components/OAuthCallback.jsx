import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function OAuthCallback() {
  const [status, setStatus] = useState('Processing...');
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse URL parameters
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        
        if (!code) {
          setStatus('Error: No authorization code received');
          return;
        }
        
        // Get Firebase ID token from your auth system
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
          setStatus('Error: You must be signed in');
          return;
        }
        
        const idToken = await currentUser.getIdToken();
        
        // Send code to your backend
        const response = await fetch('https://c896-49-204-195-153.ngrok-free.app/api/alexa/link-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            code: code,
            redirect_uri: window.location.origin + '/oauth-callback',
            state: state
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setStatus('Account successfully linked with Alexa!');
          // Redirect to dashboard after 2 seconds
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          setStatus(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Error in OAuth callback:', error);
        setStatus(`Error: ${error.message}`);
      }
    };
    
    handleCallback();
  }, [location, navigate]);
  
  return (
    <div className="oauth-callback-container">
      <h2>Alexa Account Linking</h2>
      <div className="status-message">
        <p>{status}</p>
      </div>
    </div>
  );
}

export default OAuthCallback;