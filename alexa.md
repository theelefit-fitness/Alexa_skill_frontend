# Alexa Integration for EleFit Fitness Tracker

This guide documents how to integrate Amazon Alexa with EleFit Fitness Tracker, allowing users to log workouts and meals using voice commands.

## Table of Contents
1. [Alexa Skill Setup](#alexa-skill-setup)
2. [Interaction Model](#interaction-model)
3. [Account Linking](#account-linking)
4. [Backend API Implementation](#backend-api-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Firestore Security Rules](#firestore-security-rules)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Alexa Skill Setup

### Prerequisites
- Amazon Developer account (https://developer.amazon.com)
- Firebase project with Authentication and Firestore
- Backend API accessible via HTTPS

### Create the Alexa Skill

1. Go to the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. Click "Create Skill"
3. Enter a skill name: "EleFit Fitness Tracker"
4. Select "Custom" model
5. Choose "Provision your own" for hosting
6. Click "Create skill"
7. Select "Start from scratch" template

## Interaction Model

### Intents and Utterances

The interaction model defines what users can say and how Alexa interprets those commands. Here's the JSON model:

```json
{
  "interactionModel": {
    "languageModel": {
      "invocationName": "fitness tracker",
      "intents": [
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        },
        {
          "name": "LogWorkoutIntent",
          "slots": [
            {
              "name": "workoutType",
              "type": "WORKOUT_TYPE"
            },
            {
              "name": "activityName",
              "type": "ACTIVITY_NAME"
            },
            {
              "name": "duration",
              "type": "AMAZON.NUMBER"
            },
            {
              "name": "distance",
              "type": "AMAZON.NUMBER"
            },
            {
              "name": "distanceUnit",
              "type": "DISTANCE_UNIT"
            },
            {
              "name": "sets",
              "type": "AMAZON.NUMBER"
            },
            {
              "name": "reps",
              "type": "AMAZON.NUMBER"
            }
          ],
          "samples": [
            "log a {workoutType} workout",
            "record {activityName} for {duration} minutes",
            "log that I ran {distance} {distanceUnit}",
            "log that I did {sets} sets of {reps} {activityName}",
            "track my {activityName} workout",
            "I just finished a {workoutType} workout",
            "I ran {distance} {distanceUnit}",
            "I did {activityName} for {duration} minutes",
            "I completed {sets} sets of {reps} {activityName}",
            "add a workout",
            "record my {workoutType}",
            "save my {activityName} session"
          ]
        },
        {
          "name": "LogMealIntent",
          "slots": [
            {
              "name": "mealType",
              "type": "MEAL_TYPE"
            },
            {
              "name": "foodItems",
              "type": "AMAZON.Food"
            }
          ],
          "samples": [
            "log my {mealType}",
            "record that I ate {foodItems} for {mealType}",
            "add {foodItems} to my meal log",
            "log that I had {foodItems}",
            "track my {mealType}",
            "I just ate {foodItems}",
            "I had {foodItems} for {mealType}",
            "save my {mealType}",
            "add a meal",
            "record my {mealType}"
          ]
        }
      ],
      "types": [
        {
          "name": "WORKOUT_TYPE",
          "values": [
            {
              "name": {
                "value": "cardio"
              }
            },
            {
              "name": {
                "value": "strength"
              }
            },
            {
              "name": {
                "value": "flexibility"
              }
            },
            {
              "name": {
                "value": "balance"
              }
            }
          ]
        },
        {
          "name": "ACTIVITY_NAME",
          "values": [
            {
              "name": {
                "value": "running"
              }
            },
            {
              "name": {
                "value": "walking"
              }
            },
            {
              "name": {
                "value": "cycling"
              }
            },
            {
              "name": {
                "value": "swimming"
              }
            },
            {
              "name": {
                "value": "yoga"
              }
            },
            {
              "name": {
                "value": "pushups"
              }
            },
            {
              "name": {
                "value": "situps"
              }
            },
            {
              "name": {
                "value": "squats"
              }
            },
            {
              "name": {
                "value": "planks"
              }
            },
            {
              "name": {
                "value": "deadlifts"
              }
            },
            {
              "name": {
                "value": "bench press"
              }
            }
          ]
        },
        {
          "name": "DISTANCE_UNIT",
          "values": [
            {
              "name": {
                "value": "kilometers",
                "synonyms": [
                  "km",
                  "kilometer",
                  "kms"
                ]
              }
            },
            {
              "name": {
                "value": "miles",
                "synonyms": [
                  "mile",
                  "mi"
                ]
              }
            },
            {
              "name": {
                "value": "meters",
                "synonyms": [
                  "meter",
                  "m"
                ]
              }
            }
          ]
        },
        {
          "name": "MEAL_TYPE",
          "values": [
            {
              "name": {
                "value": "breakfast"
              }
            },
            {
              "name": {
                "value": "lunch"
              }
            },
            {
              "name": {
                "value": "dinner"
              }
            },
            {
              "name": {
                "value": "snack"
              }
            }
          ]
        }
      ]
    },
    "dialog": {
      "intents": [
        {
          "name": "LogWorkoutIntent",
          "confirmationRequired": false,
          "prompts": {},
          "slots": [
            {
              "name": "workoutType",
              "type": "WORKOUT_TYPE",
              "elicitationRequired": true,
              "confirmationRequired": false,
              "prompts": {
                "elicitation": "Elicit.Slot.WorkoutType"
              }
            },
            {
              "name": "activityName",
              "type": "ACTIVITY_NAME",
              "elicitationRequired": true,
              "confirmationRequired": false,
              "prompts": {
                "elicitation": "Elicit.Slot.ActivityName"
              }
            },
            {
              "name": "duration",
              "type": "AMAZON.NUMBER",
              "elicitationRequired": false,
              "confirmationRequired": false,
              "prompts": {
                "elicitation": "Elicit.Slot.Duration"
              }
            }
          ]
        },
        {
          "name": "LogMealIntent",
          "confirmationRequired": false,
          "prompts": {},
          "slots": [
            {
              "name": "mealType",
              "type": "MEAL_TYPE",
              "elicitationRequired": true,
              "confirmationRequired": false,
              "prompts": {
                "elicitation": "Elicit.Slot.MealType"
              }
            },
            {
              "name": "foodItems",
              "type": "AMAZON.Food",
              "elicitationRequired": true,
              "confirmationRequired": false,
              "prompts": {
                "elicitation": "Elicit.Slot.FoodItems"
              }
            }
          ]
        }
      ],
      "prompts": [
        {
          "id": "Elicit.Slot.WorkoutType",
          "variations": [
            {
              "type": "PlainText",
              "value": "What type of workout did you do?"
            }
          ]
        },
        {
          "id": "Elicit.Slot.ActivityName",
          "variations": [
            {
              "type": "PlainText",
              "value": "What activity did you perform?"
            }
          ]
        },
        {
          "id": "Elicit.Slot.Duration",
          "variations": [
            {
              "type": "PlainText",
              "value": "How long did you workout for, in minutes?"
            }
          ]
        },
        {
          "id": "Elicit.Slot.MealType",
          "variations": [
            {
              "type": "PlainText",
              "value": "Was this breakfast, lunch, dinner, or a snack?"
            }
          ]
        },
        {
          "id": "Elicit.Slot.FoodItems",
          "variations": [
            {
              "type": "PlainText",
              "value": "What did you eat?"
            }
          ]
        }
      ]
    }
  }
}
```

## Account Linking

Account linking allows Alexa to access user-specific data from your Firebase application.

### Setup in Alexa Developer Console

1. Navigate to the "Account Linking" section in your skill
2. Set the following values:
   - Auth Type: OAuth 2.0
   - Authorization URI: `https://www.amazon.com/ap/oa`
   - Client ID: `elefit-alexa-client`
   - Scope: `profile`
   - State: Leave this field empty
   - Authorization Grant Type: Auth Code Grant
   - Access Token URI: `https://api.amazon.com/auth/o2/token`
   - Client Secret: Your client secret (keep this secure)
   - Client Authentication Scheme: HTTP Basic
3. For Redirect URLs, copy all URLs provided - you'll need these in your frontend app

### Backend Endpoint Configuration

1. Create a secure endpoint that can:
   - Verify Firebase ID tokens
   - Exchange authorization codes for access tokens
   - Store tokens securely in Firestore

## Backend API Implementation

### Firebase Cloud Function for Alexa Log Endpoint

This Cloud Function receives data from Alexa and stores it in Firestore:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.alexaLogEndpoint = functions.https.onRequest(async (request, response) => {
  try {
    // CORS headers
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (request.method === 'OPTIONS') {
      response.status(204).send('');
      return;
    }
    
    // Extract access token from request
    const alexaData = request.body;
    const accessToken = alexaData.accessToken;
    
    if (!accessToken) {
      response.status(401).json({
        success: false, 
        message: 'Missing access token. Please link your account in the Alexa app.'
      });
      return;
    }
      
    // Get user ID from the stored token mapping
    const userTokenRef = await admin.firestore()
      .collection('alexa_tokens')
      .where('access_token', '==', accessToken)
      .limit(1)
      .get();
    
    if (userTokenRef.empty) {
      response.status(401).json({
        success: false, 
        message: 'Invalid access token. Please re-link your account in the Alexa app.'
      });
      return;
    }
    
    // Get the user ID linked to this token
    const userId = userTokenRef.docs[0].data().user_id;
    const logType = alexaData.logType;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    if (logType === 'workout') {
      // Match Firebase workoutLogs structure
      const workoutData = {
        workoutType: alexaData.workoutType,
        activityName: alexaData.activityName,
        duration: alexaData.duration || 0,
        distance: alexaData.distance,
        sets: alexaData.sets,
        reps: alexaData.reps,
        timestamp: timestamp,
        source: 'alexa',
        type: 'workout'
      };
      
      // Validate required fields
      const requiredFields = ['workoutType', 'activityName', 'duration'];
      for (const field of requiredFields) {
        if (!workoutData[field]) {
          response.status(400).json({
            success: false, 
            message: `Missing required field from Alexa: ${field}`
          });
          return;
        }
      }
      
      // Store in Firebase under the user's ID
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('workout_logs')
        .add(workoutData);
      
      response.json({
        success: true,
        message: 'Workout logged from Alexa successfully',
        data: workoutData
      });
      
    } else if (logType === 'meal') {
      // Match Firebase mealLogs structure
      const mealData = {
        mealType: alexaData.mealType,
        foodItems: alexaData.foodItems || [],
        timestamp: timestamp,
        source: 'alexa',
        type: 'meal'
      };
      
      // Validate required fields
      const requiredFields = ['mealType', 'foodItems'];
      for (const field of requiredFields) {
        if (!mealData[field] || 
            (Array.isArray(mealData[field]) && mealData[field].length === 0)) {
          response.status(400).json({
            success: false, 
            message: `Missing required field from Alexa: ${field}`
          });
          return;
        }
      }
        
      // Store in Firebase under the user's ID
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('meal_logs')
        .add(mealData);
      
      response.json({
        success: true,
        message: 'Meal logged from Alexa successfully',
        data: mealData
      });
      
    } else {
      response.status(400).json({
        success: false, 
        message: 'Invalid log type. Must be "workout" or "meal"'
      });
    }
  } catch (error) {
    console.error('Error in Alexa log endpoint:', error);
    response.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Function for handling account linking
exports.alexaLinkAccount = functions.https.onRequest(async (request, response) => {
  try {
    // CORS headers
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (request.method === 'OPTIONS') {
      response.status(204).send('');
      return;
    }
    
    // Verify Firebase ID token
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      response.status(401).json({
        success: false, 
        message: 'Missing or invalid authorization header'
      });
      return;
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      response.status(401).json({
        success: false, 
        message: `Invalid Firebase token: ${error.message}`
      });
      return;
    }
    
    const uid = decodedToken.uid;
    
    // Extract code and redirect URI from request
    const data = request.body;
    const code = data.code;
    const redirectUri = data.redirect_uri;
    
    if (!code || !redirectUri) {
      response.status(400).json({
        success: false, 
        message: 'Missing code or redirect_uri'
      });
      return;
    }
    
    // Exchange code for access token (in a production app, this should be done securely)
    const tokenUrl = 'https://api.amazon.com/auth/o2/token';
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', 'elefit-alexa-client');
    params.append('client_secret', 'your-super-secret-value');
    params.append('redirect_uri', redirectUri);
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      response.status(400).json({
        success: false, 
        message: `Failed to get access token: ${tokenData.error_description || 'Unknown error'}`
      });
      return;
    }
    
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in;
    
    // Store tokens in Firestore
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + (expiresIn * 1000))
    );
    
    await admin.firestore().collection('alexa_tokens').add({
      user_id: uid,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    response.json({
      success: true,
      message: 'Account linked successfully',
      uid: uid
    });
    
  } catch (error) {
    console.error('Error in Alexa link account:', error);
    response.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

## Frontend Implementation

### React Component for Google SSO and Alexa Linking

```jsx
// src/components/AlexaConnect.jsx
import { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, getIdToken } from 'firebase/auth';
import { app } from '../services/firebase';

const AlexaConnect = () => {
  const [linkStatus, setLinkStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Get current user on component load
    const auth = getAuth(app);
    setUser(auth.currentUser);
    
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);
  
  const signInWithGoogle = async () => {
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // User state will be updated by the auth state listener
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Failed to sign in with Google. Please try again.');
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
  
  return (
    <div className="alexa-connect-container">
      <h2>Connect with Alexa</h2>
      
      {!user ? (
        <div className="auth-section">
          <p>Please sign in to connect your EleFit account with Alexa.</p>
          <button 
            className="google-sign-in-btn"
            onClick={signInWithGoogle}
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
```

### Callback Handler for OAuth Redirect

```jsx
// src/components/AlexaAuthCallback.jsx
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
        const apiUrl = 'https://us-central1-your-project-id.cloudfunctions.net/alexaLinkAccount';
        const response = await fetch(apiUrl, {
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
          navigate('/settings');
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
            onClick={() => navigate('/alexa-connect')}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default AlexaAuthCallback;
```

## Firestore Security Rules

Secure your Firestore database with these rules to ensure only authenticated users can access their own data:

```
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write only their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Alexa tokens - protected collection
    match /alexa_tokens/{tokenId} {
      // Only allow create when the user is authenticated and token matches their user ID
      allow create: if request.auth != null && 
                    request.resource.data.user_id == request.auth.uid;
      
      // Only allow read for tokens that belong to the requesting user
      allow read: if request.auth != null && 
                  resource.data.user_id == request.auth.uid;
                  
      // Only allow delete for tokens that belong to the requesting user
      allow delete: if request.auth != null && 
                   resource.data.user_id == request.auth.uid;
                   
      // No updates allowed to tokens
      allow update: if false;
    }
    
    // Public collections
    match /public/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Testing

### Testing the Alexa Skill

1. In the Alexa Developer Console, navigate to the "Test" tab
2. Enable testing for your skill
3. Type or say:
   - "tell fitness tracker I ran 5 kilometers"
   - "tell fitness tracker I did 3 sets of 10 pushups"
   - "tell fitness tracker log my breakfast: oatmeal with banana"

### Testing Account Linking

1. In your app, navigate to the Settings page
2. Click "Connect with Alexa"
3. Follow the OAuth flow to link your account
4. After successful linking, test the Alexa commands again
5. Check your Firestore database to verify logs are being saved to your user's collection

## Troubleshooting

### Common Issues

1. **Alexa says "The skill isn't responding right now":**
   - Verify your backend API is accessible
   - Check the logs for any errors
   - Ensure your SSL certificate is valid

2. **Account linking fails:**
   - Check that the redirect URI matches exactly what's configured in the Alexa Developer Console
   - Verify your client ID and client secret are correct
   - Look for any CORS issues in the browser console

3. **Logs aren't appearing in the app:**
   - Check Firestore security rules to ensure they allow access
   - Verify the user ID is being correctly attached to logs
   - Check for errors in your backend console

4. **Voice commands aren't recognized correctly:**
   - Try adding more sample utterances to your skill
   - Use the Alexa Developer Console test simulator to debug utterance recognition
   - Check the skill's intent history to see how utterances are being interpreted

Remember to replace placeholder values like `your-project-id` with your actual Firebase project ID when deploying. 