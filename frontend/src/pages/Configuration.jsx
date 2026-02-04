/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Settings, Save, User as UserIcon, Mail, CreditCard } from 'lucide-react';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';
import '../styles/Configuration.css'; // Asegúrate de importar el CSS

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Configuration = ({ setIsAuthenticated, user, setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    lastname: '',
    tuition: ''
  });
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [activeNav, setActiveNav] = useState('configuration');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Configuración';
  }, []);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setMessage('No autenticado');
        setMessageType('error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error obteniendo perfil');
      }

      const data = await response.json();

      const userData = {
        email: data.user.email || '',
        name: data.user.name || '',
        lastname: data.user.lastname || '',
        tuition: data.user.tuition || ''
      };
      setFormData(userData);
      setOriginalData(userData);
    } catch (error) {
      setMessage('Error al cargar los datos');
      setMessageType('error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          tuition: formData.tuition
        }),
      });

      if (!response.ok) {
        throw new Error('Error actualizando perfil');
      }

      setOriginalData(formData);
      setUser(prev => ({ ...prev, email: formData.email, tuition: formData.tuition }));
      setMessage('✓ Datos actualizados exitosamente');
      setMessageType('success');
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <NavBar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        user={user}
        handleLogout={handleLogout}
      />

      <main className="main-content">
        <div className="config-container">
          <header className="config-card-header">
            <Settings size={28} />
            <h3>Configuración de Perfil</h3>
          </header>

          <div className="config-form-body">
            {message && (
              <div className={`status-message ${messageType}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-grid">
              {/* Nombre - Solo lectura */}
              <div className="form-group">
                <label><UserIcon size={14} /> Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  readOnly
                  className="readonly"
                />
                <small>Campo no modificable</small>
              </div>

              {/* Apellido - Solo lectura */}
              <div className="form-group">
                <label><UserIcon size={14} /> Apellido</label>
                <input
                  type="text"
                  value={formData.lastname}
                  readOnly
                  className="readonly"
                />
                <small>Campo no modificable</small>
              </div>

              {/* Email - Editable */}
              <div className="form-group full-width">
                <label><Mail size={14} /> Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                />
              </div>

              {/* Matrícula - Editable */}
              <div className="form-group full-width">
                <label><CreditCard size={14} /> Matrícula Profesional</label>
                <input
                  type="text"
                  name="tuition"
                  value={formData.tuition}
                  onChange={handleChange}
                  placeholder="Ingrese su número de matrícula"
                />
              </div>

              <div className="full-width">
                <button
                  type="submit"
                  className="btn-save-config"
                  disabled={loading || !hasChanges()}
                >
                  {loading ? (
                    'Guardando...'
                  ) : (
                    <>
                      <Save size={20} />
                      Guardar Cambios
                    </>
                  )}
                </button>
                
                {!hasChanges() && !loading && (
                  <p style={{ textAlign: 'center', color: '#adb5bd', fontSize: '0.85rem', marginTop: '12px' }}>
                    No se han detectado cambios en el perfil
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Configuration;