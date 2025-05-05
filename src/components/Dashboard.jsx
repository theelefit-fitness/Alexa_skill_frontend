import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import WorkoutForm from './workout/WorkoutForm'
import MealForm from './meal/MealForm'
import ProgressView from './ProgressView'
import EnhancedOverview from './EnhancedOverview'
import { useAuth } from './AuthProvider'
import { getWorkoutLogs, getMealLogs, logOut } from '../services/firebase'
import '../styles/Dashboard.css'

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('stats')
  const [workoutLogs, setWorkoutLogs] = useState([])
  const [mealLogs, setMealLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const { user } = useAuth()
  
  // Set up global refresh functions for child components
  useEffect(() => {
    window.refreshWorkoutLogs = () => {
      console.log('Refreshing workout logs from global handler');
      getWorkoutLogs().then(logs => setWorkoutLogs(logs));
    };
    
    window.refreshMealLogs = () => {
      console.log('Refreshing meal logs from global handler');
      getMealLogs().then(logs => setMealLogs(logs));
    };
    
    return () => {
      // Clean up global functions when component unmounts
      delete window.refreshWorkoutLogs;
      delete window.refreshMealLogs;
    };
  }, []);
  
  // Fetch logs when user changes or after 1 second (to ensure auth is complete)
  useEffect(() => {
    const fetchLogs = async () => {
      if (user) {
        try {
          console.log('Fetching logs for user:', user.email);
          setLogsLoading(true)
          const [workouts, meals] = await Promise.all([
            getWorkoutLogs(),
            getMealLogs()
          ])
          
          console.log(`Retrieved ${workouts.length} workout logs and ${meals.length} meal logs`);
          setWorkoutLogs(workouts)
          setMealLogs(meals)
        } catch (error) {
          console.error('Error fetching logs:', error)
        } finally {
          setLogsLoading(false)
        }
      }
    }
    
    fetchLogs()
    
    // Add a secondary fetch after a delay to ensure data is loaded
    const timer = setTimeout(() => {
      fetchLogs();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user])
  
  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logOut()
      // Reset logs on logout
      setWorkoutLogs([])
      setMealLogs([])
      // Redirect will be handled by AuthProvider
    } catch (error) {
      console.error('Error logging out:', error)
      setLoggingOut(false)
    }
  }

  const refreshAllLogs = () => {
    setLogsLoading(true);
    Promise.all([
      getWorkoutLogs(),
      getMealLogs()
    ]).then(([workouts, meals]) => {
      setWorkoutLogs(workouts);
      setMealLogs(meals);
      setLogsLoading(false);
    }).catch(error => {
      console.error('Error refreshing logs:', error);
      setLogsLoading(false);
    });
  };
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        
        
        <div className="dashboard-actions">
          <button 
            className="refresh-button"
            onClick={refreshAllLogs}
            disabled={logsLoading}
          >
            {logsLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <Link to="/settings" className="settings-link">
            Settings
          </Link>
          <button 
            className="logout-button" 
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
      
      <div className="dashboard-nav">
        <button 
          className={activeSection === 'stats' ? 'active' : ''} 
          onClick={() => setActiveSection('stats')}
        >
          Overview
        </button>
        <button 
          className={activeSection === 'workout' ? 'active' : ''} 
          onClick={() => setActiveSection('workout')}
        >
          Log Workout
        </button>
        <button 
          className={activeSection === 'meal' ? 'active' : ''} 
          onClick={() => setActiveSection('meal')}
        >
          Log Meal
        </button>
        
      </div>
      
      <div className="dashboard-content">
        {activeSection === 'stats' && (
          <EnhancedOverview 
            workoutLogs={workoutLogs} 
            mealLogs={mealLogs} 
            isLoading={logsLoading} 
          />
        )}
        {activeSection === 'workout' && (
          <WorkoutForm onWorkoutLogged={() => {
            // Refresh workout logs after new entry
            getWorkoutLogs().then(logs => setWorkoutLogs(logs));
          }} />
        )}
        {activeSection === 'meal' && (
          <MealForm onMealLogged={() => {
            // Refresh meal logs after new entry
            getMealLogs().then(logs => setMealLogs(logs));
          }} />
        )}
        {activeSection === 'progress' && (
          <ProgressView 
            workoutLogs={workoutLogs} 
            mealLogs={mealLogs} 
            isLoading={logsLoading} 
          />
        )}
      </div>
      
      <footer className="dashboard-footer">
        <p>EleFit - Your fitness companion</p>
        <p><small>Use Alexa to log activities hands-free!</small></p>
      </footer>
    </div>
  )
}

export default Dashboard 