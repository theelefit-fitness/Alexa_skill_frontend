import { BrowserRouter as Router, Routes, Route, createRoutesFromElements, createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Dashboard from './components/Dashboard'
import ProgressView from './components/ProgressView'
import AlexaConnect from './components/AlexaConnect'
import AlexaAuthCallback from './components/AlexaAuthCallback'
import Login from './components/Login'
import Settings from './components/Settings'
import AuthProvider from './components/AuthProvider'
import PrivateRoute from './components/PrivateRoute'
import PrivacyPolicy from './components/PrivacyPolicy'
import { useEffect } from 'react'
import OAuthCallback from './components/OAuthCallback'

// Create router with future flags enabled
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/progress" element={
        <PrivateRoute>
          <ProgressView />
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <Settings />
        </PrivateRoute>
      } />
      <Route path="/alexa-connect" element={
        <PrivateRoute>
          <AlexaConnect />
        </PrivateRoute>
      } />
      <Route path="/alexa-auth-callback" element={
        <PrivateRoute>
          <AlexaAuthCallback />
        </PrivateRoute>
      } />
      <Route path="/oauth-callback" element={<OAuthCallback />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

function App() {
  // Apply authentication listener
  useEffect(() => {
    // Cleanup is handled in AuthProvider
  }, []);

  return (
    <AuthProvider>
      <div className="app">
        <header className="main-header">
          <h1>EleFit Tracker</h1>
        </header>

        <main className="main-container">
          <div className="content">
            <RouterProvider router={router} />
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}

export default App
