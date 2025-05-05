import { useState, useEffect, useRef } from 'react';
import { getLogCounts, deleteWorkoutLog, deleteMealLog } from '../services/logService';
import '../styles/EnhancedOverview.css';
import { useAuth } from './AuthProvider';
const EnhancedOverview = ({ workoutLogs, mealLogs, isLoading }) => {
  const [stats, setStats] = useState({ totalLogs: 0, workoutCount: 0, mealCount: 0 });
  const [loading, setLoading] = useState(isLoading);
  const [error, setError] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeHistoryTab, setActiveHistoryTab] = useState('workouts');
  const { user } = useAuth();
  const [weekdayStats, setWeekdayStats] = useState({
    workout: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
    meal: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
  });

  // Add refs for scroll animation
  const scrollRefs = useRef([]);
  
 
  // Add a function to handle scroll animations
  const handleScrollAnimation = () => {
    const triggerBottom = window.innerHeight * 0.8;
    
    scrollRefs.current.forEach((ref) => {
      if (!ref) return;
      
      const elementTop = ref.getBoundingClientRect().top;
      
      if (elementTop < triggerBottom) {
        ref.classList.add('visible');
      }
    });
  };
  
  // Add effect for scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScrollAnimation);
    
    // Trigger once on load
    setTimeout(() => {
      handleScrollAnimation();
    }, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScrollAnimation);
    };
  }, []);

  // Update stats and calculations when logs change
  useEffect(() => {
    setLoading(isLoading);
    
    if (!isLoading && workoutLogs && mealLogs) {
      // Calculate basic stats
      const counts = {
        totalLogs: workoutLogs.length + mealLogs.length,
        workoutCount: workoutLogs.length,
        mealCount: mealLogs.length
      };
      setStats(counts);
      
      // Calculate weekday stats
      calculateWeekdayStats(workoutLogs, mealLogs);
    }
  }, [workoutLogs, mealLogs, isLoading]);

  const calculateWeekdayStats = (workouts, meals) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const workoutCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const mealCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    
    workouts.forEach(log => {
      if (log.timestamp) {
        const date = log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
        const day = days[date.getDay()];
        workoutCounts[day]++;
      }
    });
    
    meals.forEach(log => {
      if (log.timestamp) {
        const date = log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
        const day = days[date.getDay()];
        mealCounts[day]++;
      }
    });
    
    setWeekdayStats({
      workout: workoutCounts,
      meal: mealCounts
    });
  };

  // Count workout types for diagram
  const getWorkoutTypeDistribution = () => {
    const distribution = { cardio: 0, strength: 0, other: 0 };
    
    workoutLogs.forEach(log => {
      if (log.workoutType === 'cardio') {
        distribution.cardio++;
      } else if (log.workoutType === 'strength') {
        distribution.strength++;
      } else {
        distribution.other++;
      }
    });
    
    return distribution;
  };
  
  // Count meal types for diagram
  const getMealTypeDistribution = () => {
    const distribution = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
    
    mealLogs.forEach(log => {
      const mealType = log.mealType || 'other';
      if (distribution[mealType] !== undefined) {
        distribution[mealType]++;
      }
    });
    
    return distribution;
  };

  // Filter logs for today only
  const getTodayLogs = (logs) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return logs.filter(log => {
      if (!log.timestamp) return false;
      
      const logDate = log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      
      return logDate.getTime() === today.getTime();
    });
  };

  // Filter logs older than today
  const getOlderLogs = (logs) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return logs.filter(log => {
      if (!log.timestamp) return false;
      
      const logDate = log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      
      return logDate.getTime() < today.getTime();
    });
  };

  const handleDeleteWorkout = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout log?')) {
      try {
        setDeleteInProgress(true);
        await deleteWorkoutLog(id);

        // Display success message
        setSuccessMessage('Workout log deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Notify parent component to refresh workout logs
        if (window.refreshWorkoutLogs) {
          window.refreshWorkoutLogs();
        }
      } catch (err) {
        setError('Failed to delete workout log');
        console.error(err);
      } finally {
        setDeleteInProgress(false);
      }
    }
  };

  const handleDeleteMeal = async (id) => {
    if (window.confirm('Are you sure you want to delete this meal log?')) {
      try {
        setDeleteInProgress(true);
        await deleteMealLog(id);

        // Display success message
        setSuccessMessage('Meal log deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Notify parent component to refresh meal logs
        if (window.refreshMealLogs) {
          window.refreshMealLogs();
        }
      } catch (err) {
        setError('Failed to delete meal log');
        console.error(err);
      } finally {
        setDeleteInProgress(false);
      }
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading-container">Loading data...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  // Get today's logs
  const todayWorkoutLogs = getTodayLogs(workoutLogs);
  const todayMealLogs = getTodayLogs(mealLogs);
  
  // Get older logs
  const olderWorkoutLogs = getOlderLogs(workoutLogs);
  const olderMealLogs = getOlderLogs(mealLogs);

  const workoutDistribution = getWorkoutTypeDistribution();
  const mealDistribution = getMealTypeDistribution();

  return (
    <div className="enhanced-overview">
      <section className="hero-section">
        <div className="welcome-card">
          <div className="welcome-message animate-motion">
            <h1 className="rotate-animate">Welcome, {user?.displayName || 'User'}</h1>
            <p className="float-animate delay-1">Welcome to your personalized fitness dashboard.</p>
          </div>
          <div className="date-display">
            <div className="current-date float-animate delay-2">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </section>

      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <section className="stats-section">
        <h2 className="slide-in-left">Activity Overview</h2>
        
        <div className="stats-cards">
          <div className="stat-card total fade-in-delay-1 hover-lift">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalLogs}</div>
              <div className="stat-label">Total Logs</div>
            </div>
          </div>
          
          <div className="stat-card workout fade-in-delay-2 hover-lift">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M6 8h-1a4 4 0 0 0 0 8h1"></path>
                <line x1="6" y1="12" x2="18" y2="12"></line>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.workoutCount}</div>
              <div className="stat-label">Workouts</div>
            </div>
          </div>
          
          <div className="stat-card meal fade-in-delay-3 hover-lift">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M6 8h-1a4 4 0 0 0 0 8h1"></path>
                <line x1="6" y1="12" x2="18" y2="12"></line>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.mealCount}</div>
              <div className="stat-label">Meals</div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="visualizations-section">
        <h2 className="animate-title breathe">Your Fitness Overview</h2>
        
        <div className="visualizations-grid">
          <div className="visualization-card scroll-animate hover-lift float-card"
               ref={(el) => scrollRefs.current.push(el)}>
            <h3>Workout Type Distribution</h3>
            {stats.workoutCount > 0 ? (
              <div className="distribution-diagram">
                <div 
                  className="diagram-segment cardio" 
                  style={{ 
                    display: workoutDistribution.cardio ? 'flex' : 'none'  
                  }}
                >
                  <div className="segment-label">
                    <div className="segment-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                        <path d="M6 8h-1a4 4 0 0 0 0 8h1"></path>
                        <line x1="6" y1="12" x2="18" y2="12"></line>
                      </svg>
                    </div>
                    Cardio
                  </div>
                  <div className="segment-value">{workoutDistribution.cardio}</div>
                </div>
                <div 
                  className="diagram-segment strength" 
                  style={{ 
                    display: workoutDistribution.strength ? 'flex' : 'none'  
                  }}
                >
                  <div className="segment-label">
                    <div className="segment-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 6h12v12H6z"></path>
                        <path d="M3 6v12"></path>
                        <path d="M21 6v12"></path>
                      </svg>
                    </div>
                    Strength
                  </div>
                  <div className="segment-value">{workoutDistribution.strength}</div>
                </div>
                <div 
                  className="diagram-segment other" 
                  style={{ 
                    display: workoutDistribution.other ? 'flex' : 'none'  
                  }}
                >
                  <div className="segment-label">
                    <div className="segment-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    Other
                  </div>
                  <div className="segment-value">{workoutDistribution.other}</div>
                </div>
              </div>
            ) : (
              <div className="no-data">No workout logs yet</div>
            )}
          </div>
          
          <div className="visualization-card scroll-animate hover-lift float-card"
               ref={(el) => scrollRefs.current.push(el)}>
            <h3>Meal Type Distribution</h3>
            {stats.mealCount > 0 ? (
              <div className="distribution-diagram">
                <div 
                  className="diagram-segment breakfast" 
                  style={{ 
                    display: mealDistribution.breakfast ? 'flex' : 'none'  
                  }}
                >
                  <div className="segment-label">
                    <div className="segment-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                        <path d="M6 8h-1a4 4 0 0 0 0 8h1"></path>
                        <line x1="6" y1="12" x2="18" y2="12"></line>
                      </svg>
                    </div>
                    Breakfast
                  </div>
                  <div className="segment-value">{mealDistribution.breakfast}</div>
                </div>
                <div 
                  className="diagram-segment lunch" 
                  style={{ 
                    display: mealDistribution.lunch ? 'flex' : 'none'  
                  }}
                >
                  <div className="segment-label">
                    <div className="segment-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="17" y1="10" x2="3" y2="10"></line>
                        <line x1="21" y1="6" x2="3" y2="6"></line>
                        <line x1="21" y1="14" x2="3" y2="14"></line>
                        <line x1="17" y1="18" x2="3" y2="18"></line>
                      </svg>
                    </div>
                    Lunch
                  </div>
                  <div className="segment-value">{mealDistribution.lunch}</div>
                </div>
                <div 
                  className="diagram-segment dinner" 
                  style={{ 
                    display: mealDistribution.dinner ? 'flex' : 'none'  
                  }}
                >
                  <div className="segment-label">
                    <div className="segment-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                        <path d="M7 2v20"></path>
                        <path d="M21 15V2"></path>
                        <path d="M18 15a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"></path>
                      </svg>
                    </div>
                    Dinner
                  </div>
                  <div className="segment-value">{mealDistribution.dinner}</div>
                </div>
                <div 
                  className="diagram-segment snack" 
                  style={{ 
                    display: mealDistribution.snack ? 'flex' : 'none'  
                  }}
                >
                  <div className="segment-label">
                    <div className="segment-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3a9 9 0 0 0 9 9 9 9 0 0 0-9 9 9 9 0 0 0-9-9 9 9 0 0 0 9-9z"></path>
                      </svg>
                    </div>
                    Snack
                  </div>
                  <div className="segment-value">{mealDistribution.snack}</div>
                </div>
              </div>
            ) : (
              <div className="no-data">No meal logs yet</div>
            )}
          </div>
        </div>

        <div className="visualization-row">
          <div className="visualization-card scroll-animate hover-lift"
               ref={(el) => scrollRefs.current.push(el)}>
            <h3>Weekly Activity Patterns</h3>
            {stats.totalLogs > 0 ? (
              <div className="week-chart">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                  const workoutCount = weekdayStats.workout[day] || 0;
                  const mealCount = weekdayStats.meal[day] || 0;
                  const totalCount = workoutCount + mealCount;
                  const maxValue = Math.max(
                    ...Object.values(weekdayStats.workout), 
                    ...Object.values(weekdayStats.meal), 
                    1
                  );
                  
                  return (
                    <div key={day} className="day-column">
                      <div className="day-bars">
                        <div 
                          className="day-bar workout"
                          style={{ 
                            height: `${(workoutCount / maxValue) * 100}%`,
                            opacity: workoutCount ? 1 : 0.2
                          }}
                        >
                          <span className="count-label">{workoutCount}</span>
                        </div>
                        <div 
                          className="day-bar meal"
                          style={{ 
                            height: `${(mealCount / maxValue) * 100}%`,
                            opacity: mealCount ? 1 : 0.2
                          }}
                        >
                          <span className="count-label">{mealCount}</span>
                        </div>
                      </div>
                      <div className="day-label">{day}</div>
                      <div className="day-total">{totalCount}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data">No logs yet</div>
            )}
            <div className="chart-legend">
              <div className="legend-item">
                <span className="color-dot workout"></span>
                <span>Workouts</span>
              </div>
              <div className="legend-item">
                <span className="color-dot meal"></span>
                <span>Meals</span>
              </div>
            </div>
          </div>
          
          <div className="visualization-card scroll-animate hover-lift"
               ref={(el) => scrollRefs.current.push(el)}>
            <h3 className="slide-in-up">Target Goal</h3>
            <div className="target-goal">
              <div className="goal-header">
                <h4>Weekly Fitness Target</h4>
                <button className="edit-goal-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  Edit Goal
                </button>
              </div>
              
              <div className="goal-center-container">
                <div className="calorie-goal-circle breathe">
                  <div className="multi-activity-ring">
                    <svg width="320" height="320" viewBox="0 0 320 320">
                      {/* Background track */}
                      <circle 
                        cx="160" 
                        cy="160" 
                        r="140" 
                        fill="none" 
                        stroke="#f0f0f0" 
                        strokeWidth="30"
                        opacity="0.2"
                      />
                      
                      {/* Walking segment - 25% */}
                      <circle 
                        cx="160" 
                        cy="160" 
                        r="140" 
                        fill="none" 
                        stroke="#0e3c61" 
                        strokeWidth="30"
                        strokeDasharray="879.6"
                        strokeDashoffset={879.6 * 0.75}
                        strokeLinecap="round"
                        transform="rotate(-90 160 160)"
                      />
                      
                      {/* Running segment - 15% */}
                      <circle 
                        cx="160" 
                        cy="160" 
                        r="140" 
                        fill="none" 
                        stroke="#3176af" 
                        strokeWidth="30"
                        strokeDasharray="879.6"
                        strokeDashoffset={879.6 * 0.60}
                        strokeLinecap="round"
                        transform="rotate(-90 160 160)"
                      />
                      
                      {/* Cycling segment - 18% */}
                      <circle 
                        cx="160" 
                        cy="160" 
                        r="140" 
                        fill="none" 
                        stroke="#64a0dd" 
                        strokeWidth="30"
                        strokeDasharray="879.6"
                        strokeDashoffset={879.6 * 0.42}
                        strokeLinecap="round"
                        transform="rotate(-90 160 160)"
                      />
                      
                      {/* Gym segment - 10% */}
                      <circle 
                        cx="160" 
                        cy="160" 
                        r="140" 
                        fill="none" 
                        stroke="#3ec0c3" 
                        strokeWidth="30"
                        strokeDasharray="879.6"
                        strokeDashoffset={879.6 * 0.32}
                        strokeLinecap="round"
                        transform="rotate(-90 160 160)"
                      />
                    </svg>
                    
                    <div className="activity-label">
                      <div className="activity-name">Walking</div>
                      <div className="activity-stats">404 cal • 25%</div>
                    </div>
                    
                    <div className="calorie-goal-content">
                   
                      <div className="percentage-display">68%</div>
                      <div className="calories-display">1,088 cal burnt today</div>
                      <div className="goal-display">Daily goal is 1,500 cal</div>
                    </div>
                  </div>
                  
                  <div className="orbit-particles">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i} 
                        className="orbit-particle" 
                        style={{ 
                          animationDelay: `${i * 0.3}s`,
                          animationDuration: `${10 + i * 1.5}s`,
                          background: i % 4 === 0 ? '#3ec0c3' : 
                                      i % 4 === 1 ? '#64a0dd' : 
                                      i % 4 === 2 ? '#3176af' : '#0e3c61'
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="today-logs-section scroll-animate"
               ref={(el) => scrollRefs.current.push(el)}>
        <h2 className="animate-title slide-in-right breathe">Today's Activity</h2>

        <div className="logs-container">
          <h3 className="slide-in-right">Workout Logs</h3>
          {todayWorkoutLogs.length === 0 ? (
            <div className="no-logs">No workout logs for today</div>
          ) : (
            <div className="logs-table-container fade-in">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>ACTIVITY</th>
                    <th>TYPE</th>
                    <th>DURATION</th>
                    <th>DETAILS</th>
                    <th>DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {todayWorkoutLogs.map(log => (
                    <tr key={log.id} className="animate-row">
                      <td>{log.activityName}</td>
                      <td>{log.workoutType}</td>
                      <td>{log.duration} min</td>
                      <td>
                        {log.workoutType === 'cardio' && log.distance && (
                          <span>{log.distance} km</span>
                        )}
                        {log.workoutType === 'strength' && log.sets && log.reps && (
                          <span>{log.sets} sets × {log.reps} reps</span>
                        )}
                      </td>
                      <td>{formatDate(log.timestamp)}</td>
                      <td>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDeleteWorkout(log.id)}
                          disabled={deleteInProgress}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <h3 className="slide-in-right">Meal Logs</h3>
          {todayMealLogs.length === 0 ? (
            <div className="no-logs">No meal logs for today</div>
          ) : (
            <div className="logs-table-container fade-in">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>MEAL TYPE</th>
                    <th>FOOD ITEMS</th>
                    <th>DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {todayMealLogs.map(log => (
                    <tr key={log.id} className="animate-row">
                      <td>{log.mealType}</td>
                      <td>
                        {Array.isArray(log.foodItems) 
                          ? log.foodItems.join(', ') 
                          : typeof log.foodItems === 'string' 
                            ? log.foodItems 
                            : 'No items listed'}
                      </td>
                      <td>{formatDate(log.timestamp)}</td>
                      <td>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDeleteMeal(log.id)}
                          disabled={deleteInProgress}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="plans-section scroll-animate"
               ref={(el) => scrollRefs.current.push(el)}>
        <h2 className="animate-title slide-in-left breathe">My Fitness Plans</h2>
        
        <div className="plans-tabs">
          <div className="tabs-header">
            <button 
              className={activeHistoryTab === 'workouts' ? 'active' : ''} 
              onClick={() => setActiveHistoryTab('workouts')}
            >
              Workout Plan
            </button>
            <button 
              className={activeHistoryTab === 'meals' ? 'active' : ''} 
              onClick={() => setActiveHistoryTab('meals')}
            >
              Meal Plan
            </button>
          </div>
          
          <div className="tabs-content fade-in">
            {activeHistoryTab === 'workouts' && (
              <div className="plan-content-container">
                <div className="plan-header">
                  <h3>Workout Plan</h3>
                  <p className="plan-description">Create and follow personalized workout routines to achieve your fitness goals.</p>
                </div>
                
                {workoutLogs.length > 0 ? (
                  <div className="plan-cards-grid">
                    {workoutLogs.map((log, index) => (
                      <div key={log.id || index} className="plan-card-item animate-card" style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="plan-card-date">
                          <span className="day">{log.timestamp ? new Date(log.timestamp.toDate ? log.timestamp.toDate() : log.timestamp).getDate() : "--"}</span>
                          <span className="month">{log.timestamp ? new Date(log.timestamp.toDate ? log.timestamp.toDate() : log.timestamp).toLocaleString('default', { month: 'short' }).toUpperCase() : "--"}</span>
                        </div>
                        <div className="plan-card-content">
                          <h4 className="activity-name">{log.activityName}</h4>
                          <div className="plan-card-details">
                            <span className="workout-type">{log.workoutType}</span>
                            <span className="duration">{log.duration} min</span>
                            {log.workoutType === 'cardio' && log.distance && 
                              <span className="distance">{log.distance} km</span>
                            }
                            {log.workoutType === 'strength' && log.sets && log.reps && 
                              <span className="sets-reps">{log.sets} sets × {log.reps} reps</span>
                            }
                          </div>
                        </div>
                              <button 
                          className="plan-delete-btn" 
                                onClick={() => handleDeleteWorkout(log.id)}
                                disabled={deleteInProgress}
                          title="Delete workout"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                              </button>
                      </div>
                        ))}
                  </div>
                ) : (
                  <div className="no-logs">No workout logs found. Create your first workout plan.</div>
                )}
                
                
              </div>
            )}
            
            {activeHistoryTab === 'meals' && (
              <div className="plan-content-container">
                <div className="plan-header">
                  <h3>Meal Plan</h3>
                  <p className="plan-description">Plan your meals for better nutrition and track your dietary progress.</p>
                </div>
                
                {mealLogs.length > 0 ? (
                  <div className="plan-cards-grid">
                    {mealLogs.map((log, index) => (
                      <div key={log.id || index} className="plan-card-item meal-card animate-card" style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="plan-card-date">
                          <span className="day">{log.timestamp ? new Date(log.timestamp.toDate ? log.timestamp.toDate() : log.timestamp).getDate() : "--"}</span>
                          <span className="month">{log.timestamp ? new Date(log.timestamp.toDate ? log.timestamp.toDate() : log.timestamp).toLocaleString('default', { month: 'short' }).toUpperCase() : "--"}</span>
                        </div>
                        <div className="plan-card-content">
                          <h4 className="meal-type">{log.mealType}</h4>
                          <div className="plan-card-details">
                            <p className="food-items">
                              {Array.isArray(log.foodItems) 
                                ? log.foodItems.join(', ') 
                                : typeof log.foodItems === 'string' 
                                  ? log.foodItems 
                                  : 'No items listed'}
                            </p>
                          </div>
                        </div>
                              <button 
                          className="plan-delete-btn" 
                                onClick={() => handleDeleteMeal(log.id)}
                                disabled={deleteInProgress}
                          title="Delete meal"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                              </button>
                      </div>
                        ))}
                  </div>
                ) : (
                  <div className="no-logs">No meal logs found. Create your first meal plan.</div>
                )}
                
                <div className="plan-actions">
                  <button className="plan-btn">Create Plan</button>
                  <button className="plan-btn view">View All</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedOverview; 