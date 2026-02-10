/* eslint-disable no-unused-vars */
import React, { useState, useEffect, lazy, Suspense, useTransition } from 'react';
import '../App.css';
import {
  Calendar, Clock, PlusCircle, AlertCircle, CheckCircle,
  CalendarDays, UserPlus, List, DollarSign, CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import TodayAppointments from '../components/AppointmentSections/TodayAppointments';
import PendingAppointments from '../components/AppointmentSections/PendingAppointments';
import { appointmentService } from '../services/appointmentService';
import { getAppointmentDateLocal } from '../utils/dateUtils';

// Lazy load modals para reducir bundle inicial
const NewAppointmentModal = lazy(() => import('../components/NewAppointmentModal'));
const EditAppointmentModal = lazy(() => import('../components/EditAppointmentModal'));

const LoadingSpinner = () => (
  <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
    Cargando...
  </div>
);

const Home = ({ user, handleLogout }) => {
  const [isPending, startTransition] = useTransition(); // Para operaciones no-urgentes
  const [showModal, setShowModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    document.title = 'Home';
  }, []);
  const [appointmentsToAttend, setAppointmentsToAttend] = useState([]); // Hoy + Atrasados
  const [futureAppointments, setFutureAppointments] = useState([]); // Posteriores
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(null);
  const [selectedAppointmentToReschedule, setSelectedAppointmentToReschedule] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });
  const [activeNav, setActiveNav] = useState('dashboard');

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    date: todayStr,
    time: '',
    type: '',
    dni: '',
    price: '',
    payment_method: '',
    other_treatment: ''
  });

  const navigate = useNavigate();

  // --- FUNCIONES DE FORMATEO (Faltaban en el anterior) ---
  const formatAppointmentName = (appointment) => {
    const dniText = appointment.dni ? appointment.dni : '(sin DNI)';
    return `${appointment.name}  ${dniText}`;
  };

  const obtenerFechaActual = () => {
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('es-ES', opciones);
  };


  const loadAllAppointmentData = async () => {
    try {
      if (!user?.id) return;
      const allPending = await appointmentService.getAllPendingAppointments(user.id);

      // Obtener la fecha local de hoy en formato YYYY-MM-DD
      const today = new Date();
      const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      // Sección 1: Turnos para Atender (hoy + atrasados)
      const toAttend = allPending.filter(app => getAppointmentDateLocal(app.datetime) <= todayDateStr);
      
      // Sección 2: Turnos Posteriores (futuros)
      const future = allPending.filter(app => getAppointmentDateLocal(app.datetime) > todayDateStr);

      // Ordenar ambas listas por fecha y hora ascendente (primero los urgentes)
      const sortByDatetimeAsc = (a, b) => {
        const ta = new Date(a.datetime).getTime();
        const tb = new Date(b.datetime).getTime();
        return ta - tb;
      };

      toAttend.sort(sortByDatetimeAsc);
      future.sort(sortByDatetimeAsc);

      setAppointmentsToAttend(toAttend);
      setFutureAppointments(future);
      setTotalPending(allPending.length);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  useEffect(() => { loadAllAppointmentData(); }, [user]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: '', date: todayStr, time: '', type: '', dni: '', price: '', payment_method: '' });
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.type) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    setLoading(true);
    try {
      const capitalizedName = formData.name.charAt(0).toUpperCase() + formData.name.slice(1).toLowerCase();
      // Por ahora solo visual, podrías comentar la línea de abajo si no quieres que guarde en DB aún
      await appointmentService.createAppointment({...formData, name: capitalizedName}, user.id);
      setSuccessMessage(capitalizedName ? `Turno agendado para ${capitalizedName}` : 'Turno agendado correctamente');
      setShowSuccessModal(true);
      handleCloseModal();
      setTimeout(() => {
        setShowSuccessModal(false);
        loadAllAppointmentData();
      }, 2000);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Stubs para funciones que TodayAppointments requiere
  const handleMarkAsCompleted = async (id) => {
    try {
      setMarkingComplete(id);
      await appointmentService.markAppointmentAsCompleted(id);
      setSuccessMessage('Turno marcado como atendido');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        loadAllAppointmentData();
      }, 2000);
    } catch (error) {
      alert('Error al marcar como completado');
    } finally {
      setMarkingComplete(null);
    }
  };
  const handleDeleteAppointment = async (id) => {
    setConfirmDeleteId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      setDeleteLoading(true);
      await appointmentService.deleteAppointment(confirmDeleteId);
      setShowConfirmDelete(false);
      setConfirmDeleteId(null);
      setSuccessMessage('Turno eliminado');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        loadAllAppointmentData();
      }, 2000);
    } catch (error) {
      alert('Error al eliminar turno');
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleOpenRescheduleModal = (app) => {
    if (!app) return;
    const raw = app.datetime || app.date || '';
    let date = '';
    let time = '';
    if (typeof raw === 'string') {
      if (raw.includes('T')) {
        const parts = raw.split('T');
        date = parts[0];
        time = (parts[1] || '').replace('Z', '').slice(0, 5);
      } else if (raw.includes(' ')) {
        const parts = raw.split(' ');
        date = parts[0];
        time = (parts[1] || '').slice(0, 5);
      }
    }
    setSelectedAppointmentToReschedule(app);
    setRescheduleForm({ date, time });
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      setRescheduleLoading(true);
      const capitalizedName = selectedAppointmentToReschedule.name.charAt(0).toUpperCase() + selectedAppointmentToReschedule.name.slice(1).toLowerCase();
      await appointmentService.updateAppointment(selectedAppointmentToReschedule.id, {
        date: rescheduleForm.date,
        time: rescheduleForm.time,
        name: capitalizedName,
        type: selectedAppointmentToReschedule.type,
        dni: selectedAppointmentToReschedule.dni
      });
      setShowRescheduleModal(false);
      setSuccessMessage('Turno reprogramado correctamente');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        loadAllAppointmentData();
      }, 2000);
    } catch (error) {
      alert('Error al reprogramar');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const quickActions = [
    { id: 1, icon: <PlusCircle size={24} />, label: 'Agendar Turno', color: '#0066cc', onClick: () => setShowModal(true) },
    { id: 2, icon: <UserPlus size={24} />, label: 'Nuevo Paciente', color: '#0066cc', onClick: () => navigate('/newpatient') },
    { id: 3, icon: <CalendarDays size={24} />, label: 'Ver Agenda', color: '#0066cc', onClick: () => navigate('/diary') },
    { id: 4, icon: <List size={24} />, label: 'Ver Pacientes', color: '#0066cc', onClick: () => navigate('/patients') },
  ];

  return (
    <div className="app">
      <NavBar activeNav={activeNav} setActiveNav={setActiveNav} user={user} handleLogout={handleLogout} />
      <main className="main-content">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <div>
              <h1>¡Hola, {user?.name || 'Dr./Dra.'}!</h1>
              <p style={{ color: '#666', marginTop: '8px' }}>Hoy es {obtenerFechaActual()}</p>
            </div>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <PlusCircle size={18}  /> <span>&nbsp;Agendar turno</span>
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card kpi-card">
              <div className="stat-info"><h3>{appointmentsToAttend.length}</h3><p>Turnos para atender</p></div>
            </div>
            <div className="stat-card kpi-card">
              <div className="stat-info"><h3>{futureAppointments.length}</h3><p>Turnos posteriores</p></div>
            </div>
          </div>

          <div className="quick-actions-section">
            <h3 className="section-title">Acciones rápidas</h3>
            <div className="quick-actions-grid">
              {quickActions.map(action => (
                <button key={action.id} className="quick-action-card" onClick={action.onClick}>
                  <div className="quick-action-icon" style={{ backgroundColor: action.color + '15', color: action.color }}>{action.icon}</div>
                  <span className="quick-action-label">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="content-grid">
            <div className="left-column">
              <TodayAppointments
                appointments={appointmentsToAttend}
                markingComplete={markingComplete}
                onMarkAsCompleted={handleMarkAsCompleted}
                onOpenRescheduleModal={handleOpenRescheduleModal}
                onDeleteAppointment={handleDeleteAppointment}
                onOpenModal={() => setShowModal(true)}
                formatAppointmentName={formatAppointmentName}
              />
            </div>
            <div className="right-column">
              <PendingAppointments
                appointments={futureAppointments}
                markingComplete={markingComplete}
                onMarkAsCompleted={handleMarkAsCompleted}
                onOpenRescheduleModal={handleOpenRescheduleModal}
                onDeleteAppointment={handleDeleteAppointment}
                formatAppointmentName={formatAppointmentName}
              />
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE REGISTRO */}
      {showModal && (
        <div className="modal-overlay" onClick={() => !loading && handleCloseModal()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agendar Nuevo Turno</h2>
              <button className="modal-close" onClick={() => !loading && handleCloseModal()} disabled={loading}>&times;</button>
            </div>
            <form className="appointment-form" onSubmit={handleSubmitAppointment}>
              <div className="form-group">
                <label>Nombre completo</label>
                <input type="text" name="name" value={formData.name} onChange={(e) => {if (e.target.value.length <= 100) handleFormChange(e)}} disabled={loading} />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Fecha *</label>
                  <input type="date" name="date" value={formData.date} onChange={handleFormChange} required min={todayStr} disabled={loading} />
                </div>
                <div className="form-group">
                  <label>Hora *</label>
                  <select name="time" value={formData.time} onChange={handleFormChange} required disabled={loading}>
                    <option value="">Seleccionar...</option>
                    {Array.from({ length: 27 }, (_, i) => {
                      const hour = 8 + Math.floor(i / 2);
                      const minute = i % 2 === 0 ? '00' : '30';
                      const val = `${hour.toString().padStart(2, '0')}:${minute}`;
                      return <option key={val} value={val}>{val}</option>;
                    })}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Tipo de Tratamiento *</label>
                <select name="type" value={formData.type} onChange={handleFormChange} required disabled={loading}>
                  <option value="">Seleccionar...</option>
                  <option value="Consulta">Consulta</option>
                  <option value="Limpieza dental">Limpieza dental</option>
                  <option value="Ortodoncia">Ortodoncia</option>
                  <option value="Otro">Otro</option>
                </select>
                {formData.type === 'Otro' && (
                  <div className="form-group">
                    <label>Describir Tratamiento *</label>
                    <textarea name="other_treatment" value={formData.other_treatment} onChange={handleFormChange} placeholder="Describa el tratamiento" required disabled={loading} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>DNI</label>
                <input type="text" name="dni" value={formData.dni} onChange={(e) => {const onlyNumbers = e.target.value.replace(/[^0-9]/g, '').slice(0, 11); handleFormChange({...e, target: {...e.target, name: 'dni', value: onlyNumbers}})}} disabled={loading} placeholder="Sin letras" />
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-outline cancel" onClick={handleCloseModal} disabled={loading}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Agendando...' : 'Agendar Turno'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRescheduleModal && selectedAppointmentToReschedule && (
        <div className="modal-overlay" onClick={() => !rescheduleLoading && setShowRescheduleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reprogramar Turno</h3>
              <button onClick={() => !rescheduleLoading && setShowRescheduleModal(false)} className="close-btn" disabled={rescheduleLoading}>×</button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleRescheduleSubmit}>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Fecha</label>
                    <input type="date" value={rescheduleForm.date} onChange={e => setRescheduleForm({...rescheduleForm, date: e.target.value})} required disabled={rescheduleLoading} />
                  </div>
                  <div className="form-group">
                    <label>Hora</label>
                    <select value={rescheduleForm.time} onChange={e => setRescheduleForm({...rescheduleForm, time: e.target.value})} required disabled={rescheduleLoading}>
                      <option value="">Seleccionar...</option>
                      {Array.from({ length: 27 }, (_, i) => {
                        const hour = 8 + Math.floor(i / 2);
                        const minute = i % 2 === 0 ? '00' : '30';
                        const val = `${hour.toString().padStart(2, '0')}:${minute}`;
                        return <option key={val} value={val}>{val}</option>;
                      })}
                    </select>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-outline cancel" onClick={() => setShowRescheduleModal(false)} disabled={rescheduleLoading}>Cancelar</button>
                  <button type="submit" className="btn-primary" disabled={rescheduleLoading}>{rescheduleLoading ? 'Reprogramando...' : 'Reprogramar'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="success-overlay">
          <div className="success-card">
            <CheckCircle size={40} color="#22c55e" />
            <h3>Operación Exitosa</h3>
            <p>{successMessage}</p>
          </div>
        </div>
      )}
      {showConfirmDelete && (
        <div className="modal-overlay" onClick={() => !deleteLoading && setShowConfirmDelete(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>¿Estás seguro?</h3>
              <button className="modal-close" onClick={() => !deleteLoading && setShowConfirmDelete(false)} disabled={deleteLoading}>&times;</button>
            </div>
            <div style={{ padding: '16px' }}>
              <p>Esta acción eliminará el turno permanentemente. ¿Deseas continuar?</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="btn-outline cancel" onClick={() => setShowConfirmDelete(false)} disabled={deleteLoading}>Cancelar</button>
                <button className="btn-primary" onClick={confirmDelete} disabled={deleteLoading}>{deleteLoading ? 'Eliminando...' : 'Eliminar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;