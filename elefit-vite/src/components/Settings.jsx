import { useState } from 'react';
import { Link } from 'react-router-dom';
import { logOut, getCurrentUser } from '../services/firebase';
import '../styles/Settings.css';

const Settings = () => {
  const [loggingOut, setLoggingOut] = useState(false);
  const user = getCurrentUser();
  
  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await logOut();
      // Redirect will be handled by AuthProvider
    } catch (error) {
      console.error('Error signing out:', error);
      setLoggingOut(false);
    }
  };
  
  return (
    <div className="settings-container">
      <h2>Settings</h2>
      
      <div className="settings-section">
        <h3>Integrations</h3>
        <Link to="/alexa-connect" className="alexa-connect-btn">
          Connect with Alexa
        </Link>
        <p className="integration-description">
          Link your account to use voice commands with your Alexa device to log workouts and meals.
        </p>
      </div>
      
      <div className="user-profile">
        <img 
          src={user?.photoURL || '/default-avatar.png'} 
          alt="Profile" 
          className="profile-image"
        />
        <div className="user-info">
          <h3>{user?.displayName || 'User'}</h3>
          <p>{user?.email || ''}</p>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Account</h3>
        <button 
          className="sign-out-btn"
          onClick={handleSignOut}
          disabled={loggingOut}
        >
          {loggingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
      
      <div className="settings-section">
        <h3>Preferences</h3>
        <div className="preference-item">
          <label htmlFor="theme">Theme</label>
          <select id="theme" defaultValue="light">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </select>
        </div>
        
        <div className="preference-item">
          <label htmlFor="units">Units</label>
          <select id="units" defaultValue="metric">
            <option value="metric">Metric (km, kg)</option>
            <option value="imperial">Imperial (mi, lb)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Settings; 