import { useState, useEffect } from 'react';
import { getAuth, getIdToken } from 'firebase/auth';
import { app } from '../services/firebase';
import { signInWithGoogle, getAuthRedirectResult } from '../services/firebase';

const AlexaConnect = () => {
  const [linkStatus, setLinkStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get current user on component load
    const auth = getAuth(app);
    setUser(auth.currentUser);
    
    // Check if we're returning from a redirect
    const checkRedirectResult = async () => {
      try {
        const redirectUser = await getAuthRedirectResult();
        if (redirectUser) {
          setUser(redirectUser);
        }
      } catch (error) {
        console.error('Redirect login error:', error);
        setError('Failed to sign in with Google. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    checkRedirectResult();
    
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (loading) setLoading(false);
    });
    
    return () => unsubscribe();
  }, [loading]);
  
  const handleSignInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // Authentication result will be handled in useEffect
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };
  
  const connectWithAlexa = async () => {
    if (!user) {
      setError('Please sign in before connecting with Alexa.');
      return;
    }
    
    setLinkStatus('connecting');
    setError(null);
    
    try {
      // Get the user's ID token
      const auth = getAuth(app);
      const idToken = await getIdToken(user, true);
      
      // Redirect to Alexa Login with OAuth parameters
      const clientId = 'elefit-alexa-client';
      const redirectUri = encodeURIComponent(`${window.location.origin}/alexa-auth-callback`);
      const responseType = 'code';
      const scope = 'profile';
      const state = generateRandomState();
      
      // Store state in localStorage to verify in callback
      localStorage.setItem('alexaAuthState', state);
      
      // Generate the Amazon login URL
      const alexaLoginUrl = `https://www.amazon.com/ap/oa?client_id=${clientId}&scope=${scope}&response_type=${responseType}&redirect_uri=${redirectUri}&state=${state}`;
      
      // Redirect to Amazon login
      window.location.href = alexaLoginUrl;
      
    } catch (error) {
      console.error('Error connecting to Alexa:', error);
      setError('Failed to connect with Alexa. Please try again.');
      setLinkStatus('error');
    }
  };
  
  // Generate a random state string for OAuth security
  const generateRandomState = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };
  
  if (loading) {
    return (
      <div className="alexa-connect-container">
        <h2>Connect with Alexa</h2>
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="alexa-connect-container">
      <h2>Connect with Alexa</h2>
      
      {!user ? (
        <div className="auth-section">
          <p>Please sign in to connect your EleFit account with Alexa.</p>
          <button 
            className="google-sign-in-btn"
            onClick={handleSignInWithGoogle}
          >
            Sign in with Google
          </button>
        </div>
      ) : (
        <div className="connect-section">
          <div className="user-profile">
            <img 
              src={user.photoURL || '/default-avatar.png'} 
              alt="Profile" 
              className="profile-image"
            />
            <p>Signed in as {user.displayName || user.email}</p>
          </div>
          
          <p>Link your account to log workouts and meals using voice commands</p>
          
          <button 
            className="alexa-connect-btn"
            onClick={connectWithAlexa}
            disabled={linkStatus === 'connecting'}
          >
            {linkStatus === 'connecting' ? 'Connecting...' : 'Connect with Alexa'}
          </button>
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}
      
      <div className="alexa-info">
        <h3>Voice Commands Examples:</h3>
        <ul>
          <li>"Alexa, tell Fitness Tracker I ran 5 kilometers"</li>
          <li>"Alexa, tell Fitness Tracker I did 3 sets of 10 pushups"</li>
          <li>"Alexa, tell Fitness Tracker log my breakfast: oatmeal with banana"</li>
        </ul>
      </div>
    </div>
  );
};

export default AlexaConnect; 