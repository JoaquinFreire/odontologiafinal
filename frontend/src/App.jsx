import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import LoginForm from './pages/LoginForm';
import Home from './pages/Home';
import Diary from './pages/Diary';
import ViewPatient from './pages/ViewPatient';
import PatientRecord from './pages/PatientRecord';
import History from './pages/History';
import Configuration from './pages/Configuration';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/authService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Cookies:', document.cookie);
        
        const authenticated = await authService.checkAuth();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const userData = await authService.getUser();
          setUser(userData || null);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error inicial de autenticación:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error en logout:', error);
      // Forzar cierre aunque haya error
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando aplicación...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginForm setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Home setIsAuthenticated={setIsAuthenticated} user={user} setUser={setUser} handleLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/diary" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Diary setIsAuthenticated={setIsAuthenticated} user={user} setUser={setUser} handleLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/patients" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ViewPatient setIsAuthenticated={setIsAuthenticated} user={user} setUser={setUser} handleLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/newpatient" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <PatientRecord setIsAuthenticated={setIsAuthenticated} user={user} setUser={setUser} handleLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/patients/:id/history" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <History setIsAuthenticated={setIsAuthenticated} user={user} setUser={setUser} handleLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/configuration" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Configuration setIsAuthenticated={setIsAuthenticated} user={user} setUser={setUser} handleLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App
