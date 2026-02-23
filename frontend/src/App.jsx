import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { Clock, LogOut } from 'lucide-react';
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
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

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

  // Verificar expiración de sesión cada 5 segundos
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (authService.isExpired()) {
        // Token expirado, redirigir al login
        handleLogout();
        setShowSessionWarning(false);
        return;
      }

      // Mostrar aviso cuando falten 5 minutos (300000 ms)
      const timeUntilExp = authService.getTimeUntilExpiration();
      if (timeUntilExp > 0 && timeUntilExp < 300000) {
        if (!showSessionWarning) {
          setShowSessionWarning(true);
        }
        setTimeLeft(Math.ceil(timeUntilExp / 1000));
      } else {
        // Ocultar aviso si hay más de 5 minutos
        setShowSessionWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, showSessionWarning]);

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

  const handleExtendSession = async () => {
    try {
      const newToken = await authService.refreshTokenRequest();
      if (newToken) {
        setShowSessionWarning(false);
      }
    } catch (error) {
      console.error('Error extendiendo sesión:', error);
      handleLogout();
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando aplicación...</div>;
  }

  return (
    <Router>
      {/* Modal de advertencia de sesión por expirar */}
      {showSessionWarning && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, top: 0, left: 0, right: 0, bottom: 0 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '32px', maxWidth: '450px', boxShadow: '0 20px 25px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
              <Clock size={24} style={{ color: '#ef6820', flexShrink: 0 }} />
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>Sesión por expirar</h3>
            </div>
            <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '15px', lineHeight: '1.5' }}>
              Tu sesión expirará en <strong>{timeLeft} segundos</strong>. 
              <br />Para continuar trabajando, haz click en "Extender sesión" o tu sesión se cerrará automáticamente.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleLogout} 
                style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#666', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                Cerrar sesión
              </button>
              <button 
                onClick={handleExtendSession}
                style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
              >
                Extender sesión
              </button>
            </div>
          </div>
        </div>
      )}
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
