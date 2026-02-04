/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
import { authService } from '../services/authService';
import { Mail, Lock, AlertCircle, Info } from 'lucide-react'; 
import logo from '../img/logo.webp'; 

const LoginForm = ({ setIsAuthenticated, setUser }) => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(''); // Error de credenciales (Servidor)
  const [emailError, setEmailError] = useState(''); // Error formato email
  const [passError, setPassError] = useState(''); // Error formato contraseña
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Login';
  }, []);

  // Validación de Email
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === "") setEmailError("");
    else if (!regex.test(email)) setEmailError("Formato de correo incorrecto");
    else setEmailError("");
  };

  // Validación de Contraseña (mínimo 6 caracteres)
  const validarPass = (pass) => {
    if (pass === "") setPassError("");
    else if (pass.length < 6) setPassError("La contraseña debe tener al menos 6 caracteres");
    else setPassError("");
  };

  const handleEmailChange = (e) => {
    setUsuario(e.target.value);
    validarEmail(e.target.value);
  };

  const handlePassChange = (e) => {
    setContrasena(e.target.value);
    validarPass(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError || passError) return;
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(usuario, contrasena);
      if (result) {
        setUser({
          id: result.id,
          email: result.email,
          name: result.name || '',
          lastname: result.lastname || ''
        });
        setIsAuthenticated(true);
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError('Email o contraseña incorrectos. Verifique sus datos.');
      setLoading(false);
    }
  };

  return (
    <div className='centrar'>
      <div className="login-container">
        <div className="login-card">
          <div className="logo-section">
            <img className="logo-icon" src={logo} alt="Logo Odontología" />
            <h1 className="clinic-name">Odontología</h1>
            <p className="clinic-subname">Clínica Odontológica Monica</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            {/* EMAIL */}
            <div className="input-group">
              <label htmlFor="usuario">EMAIL</label>
              <div className="input-with-icon">
                <Mail className="inner-icon" size={20} />
                <input
                  type="email"
                  id="usuario"
                  value={usuario}
                  onChange={handleEmailChange}
                  placeholder="Ingrese su email"
                  required
                  className={emailError ? 'input-error' : ''}
                />
              </div>
              {emailError && (
                <div className="error-message-format">
                  <Info size={14} />
                  <span>{emailError}</span>
                </div>
              )}
            </div>
            
            {/* CONTRASEÑA */}
            <div className="input-group">
              <label htmlFor="contrasena">Contraseña</label>
              <div className="input-with-icon">
                <Lock className="inner-icon" size={20} />
                <input
                  type="password"
                  id="contrasena"
                  value={contrasena}
                  onChange={handlePassChange}
                  placeholder="Ingrese su contraseña"
                  required
                  className={passError || (error && !emailError) ? 'input-error' : ''}
                />
              </div>
              
              {/* Cartel de formato (largo insuficiente) */}
              {passError && (
                <div className="error-message-format">
                  <Info size={14} />
                  <span>{passError}</span>
                </div>
              )}

              {/* Cartel de Credenciales Incorrectas (Login fallido) */}
              {error && !emailError && !passError && (
                <div className="error-message-inline">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="login-button" 
              disabled={loading || !!emailError || !!passError}
            >
              {loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
            </button>
          </form>
        </div>
        
        <div className="footer-note">
          <p>© 2026 Odontología Monica. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;