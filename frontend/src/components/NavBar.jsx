import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Users, FileText, Settings, UserPlus, Home, Menu, X } from 'lucide-react';
import { User } from 'lucide-react';
import logo from '../img/logodiente.webp'; 
const NavBar = ({ activeNav, setActiveNav = () => {}, user, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Sincronizar activeNav con la ruta actual
  useEffect(() => {
    const pathToNav = {
      '/': 'dashboard',
      '/patients': 'patients',
      '/diary': 'appointments',
      '/treatments': 'treatments',
      '/newpatient': 'newpatient',
      '/configuration': 'configuration'
    };
    
    const currentNav = pathToNav[location.pathname];
    if (currentNav && currentNav !== activeNav) {
      setActiveNav(currentNav);
    }
  }, [location.pathname, activeNav, setActiveNav]);

  const handleNavClick = (nav, path) => {
    setActiveNav(nav);
    navigate(path);
    setIsMenuOpen(false); // Cerrar menú al navegar
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
          className={`nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavClick('dashboard', '/')}
        >
          <div className="nav-icon">
            <Home size={20} />
          </div>
          <span>Inicio</span>
        </button>

        <button 
          className={`nav-item ${activeNav === 'patients' ? 'active' : ''}`}
          onClick={() => handleNavClick('patients', '/patients')}
        >
          <div className="nav-icon">
            <Users size={20} />
          </div>
          <span>Mis Pacientes</span>
        </button>

        <button 
          className={`nav-item ${activeNav === 'appointments' ? 'active' : ''}`}
          onClick={() => handleNavClick('appointments', '/diary')}
        >
          <div className="nav-icon">
            <Calendar size={20} />
          </div>
          <span>Ver Agenda</span>
        </button>

        <button 
          className={`nav-item ${activeNav === 'newpatient' ? 'active' : ''}`}
          onClick={() => handleNavClick('newpatient', '/newpatient')}
        >
          <div className="nav-icon">
            <UserPlus size={20} />
          </div>
          <span>Nuevo Paciente</span>
        </button>

        <button 
          className={`nav-item ${activeNav === 'configuration' ? 'active' : ''}`}
          onClick={() => handleNavClick('configuration', '/configuration')}
        >
          <div className="nav-icon">
            <Settings size={20} />
          </div>
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
        <p className="footer-text">© 2024 Odontología</p>
      </div>
    </aside>
    </>
  );
};

export default NavBar;
