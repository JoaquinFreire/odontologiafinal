/* eslint-disable no-unused-vars */
import { Settings, Save, User as UserIcon, Mail, CreditCard, X, AlertTriangle } from 'lucide-react';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';
import '../styles/Configuration.css'; // Asegúrate de importar el CSS
import { useState, useEffect } from 'react';
import * as treatmentsService from '../utils/treatmentsService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Configuration = ({ setIsAuthenticated, user, setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    lastname: '',
    tuition: ''
  })
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [activeNav, setActiveNav] = useState('configuration');
  const [treatments, setTreatments] = useState([]);
  const [newTreatmentName, setNewTreatmentName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Configuración';
  }, []);

  useEffect(() => {
    loadUserData();
    (async () => {
      try {
        const list = await treatmentsService.fetchTreatments();
        setTreatments(list);
      } catch (e) { console.error(e); setTreatments(treatmentsService.getTreatments()); }
    })();
  }, []);

  const handleAddTreatment = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!newTreatmentName || !newTreatmentName.trim()) return;
    try {
      const updated = await treatmentsService.addTreatment(newTreatmentName.trim());
      setTreatments(updated);
      setNewTreatmentName('');
      setMessage('Tratamiento agregado');
      setMessageType('success');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) { console.error(err); setMessage('Error agregando tratamiento'); setMessageType('error'); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTreatment();
    }
  };

  const handleRemoveTreatment = async (t) => {
    if (t === 'Otro') {
      setMessage('No se puede eliminar el tratamiento "Otro"');
      setMessageType('error');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    if (!confirm(`Eliminar tratamiento "${t}"?`)) return;
    try {
      const updated = await treatmentsService.removeTreatment(t);
      setTreatments(updated);
      setMessage('Tratamiento eliminado');
      setMessageType('success');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) { console.error(err); setMessage('Error eliminando tratamiento'); setMessageType('error'); }
  };

  const openDeleteConfirm = (t) => {
    if (t === 'Otro') {
      setMessage('No se puede eliminar el tratamiento "Otro"');
      setMessageType('error');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    setConfirmDelete(t);
  };

  const confirmDelete_execute = async () => {
    if (!confirmDelete) return;
    try {
      const updated = await treatmentsService.removeTreatment(confirmDelete);
      setTreatments(updated);
      setMessage('Tratamiento eliminado');
      setMessageType('success');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) { console.error(err); setMessage('Error eliminando tratamiento'); setMessageType('error'); }
    finally { setConfirmDelete(null); }
  };

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
          name: formData.name,
          lastname: formData.lastname,
          tuition: formData.tuition
        }),
      });

      if (!response.ok) {
        throw new Error('Error actualizando perfil');
      }

      setOriginalData(formData);
      setUser(prev => ({ ...prev, email: formData.email, name: formData.name, lastname: formData.lastname, tuition: formData.tuition }));
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

            <form onSubmit={handleSubmit} className="form-grid" style={{ opacity: confirmDelete ? 0.5 : 1, pointerEvents: confirmDelete ? 'none' : 'auto' }}>
              {/* Nombre - Editable */}
              <div className="form-group">
                <label><UserIcon size={14} /> Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ingrese su nombre"
                  disabled={!!confirmDelete}
                />
              </div>

              {/* Apellido - Editable */}
              <div className="form-group">
                <label><UserIcon size={14} /> Apellido</label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Ingrese su apellido"
                  disabled={!!confirmDelete}
                />
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
                  disabled={!!confirmDelete}
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
                  disabled={!!confirmDelete}
                />
              </div>

              <div className="form-group full-width treatments-config">
                <label>Tratamientos</label>
                <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        placeholder="Nuevo tratamiento" 
                        value={newTreatmentName} 
                        onChange={e => setNewTreatmentName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={!!confirmDelete}
                      />
                      <button type="button" onClick={handleAddTreatment} className="btn-save-config btn-save-config2" disabled={!!confirmDelete}>Agregar</button>
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {treatments.map(t => (
                    <div key={t} style={{ background: t === 'Otro' ? '#f0fdf4' : '#f3f4f6', padding: '6px 10px', borderRadius: '6px', display: 'flex', gap: '8px', alignItems: 'center', border: t === 'Otro' ? '1px solid #86efac' : 'none' }}>
                      <span>{t}</span>
                      {t !== 'Otro' && (
                        <button 
                          type="button"
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDeleteConfirm(t); }}
                        >✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="full-width">
                <button
                  type="submit"
                  className="btn-save-config"
                  disabled={loading || !hasChanges() || !!confirmDelete}
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

      {confirmDelete && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.6)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 9999,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          onClick={() => setConfirmDelete(null)}
        >
          <div 
            style={{ background: 'white', borderRadius: '12px', padding: '24px', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Confirmar eliminación</h3>
            </div>
            <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '14px' }}>
              ¿Está seguro que desea eliminar el tratamiento "<strong>{confirmDelete}</strong>"?
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                Cancelar
              </button>
              <button onClick={confirmDelete_execute} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuration;