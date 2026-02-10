import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Users, FileText, Settings, UserPlus, Home, Menu, X, User } from 'lucide-react';
import logo from '../img/logodiente.webp'; 

const NavBar = ({ user, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Función para determinar si una ruta está activa
  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false); // Cerrar menú mobile al navegar
  };

  const onLogout = async () => {
    try {
      await handleLogout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('NavBar: Error en logout:', error);
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      {/* Botón hamburguesa visible en mobile */}
      <button 
        className="hamburger-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para cerrar menú al hacer click */}
      {isMenuOpen && (
        <div 
          className="menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <img className="logo-icon2" src={logo} alt="Logo Odontología" />
            <h2>Odontología</h2>
          </div>
          <p className="clinic-subtitle">Clínica Odontológica</p>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${isActive('/') ? 'active' : ''}`}
            onClick={() => handleNavClick('/')}
          >
            <div className="nav-icon"><Home size={20} /></div>
            <span>Inicio</span>
          </button>

          <button 
            className={`nav-item ${isActive('/patients') ? 'active' : ''}`}
            onClick={() => handleNavClick('/patients')}
          >
            <div className="nav-icon"><Users size={20} /></div>
            <span>Mis Pacientes</span>
          </button>

          <button 
            className={`nav-item ${isActive('/diary') ? 'active' : ''}`}
            onClick={() => handleNavClick('/diary')}
          >
            <div className="nav-icon"><Calendar size={20} /></div>
            <span>Ver Agenda</span>
          </button>

          <button 
            className={`nav-item ${isActive('/newpatient') ? 'active' : ''}`}
            onClick={() => handleNavClick('/newpatient')}
          >
            <div className="nav-icon"><UserPlus size={20} /></div>
            <span>Nuevo Paciente</span>
          </button>

          <button 
            className={`nav-item ${isActive('/configuration') ? 'active' : ''}`}
            onClick={() => handleNavClick('/configuration')}
          >
            <div className="nav-icon"><Settings size={20} /></div>
            <span>Configuración</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'Usuario'}</span>
              <span className="user-role">Odontólogo/a</span>
            </div>
          </div>
          <button onClick={onLogout} className="btn-text logout-btn">
            Cerrar sesión
          </button>
          <p className="footer-text">© 2026 Odontología</p>
        </div>
      </aside>
    </>
  );
};

export default NavBar;