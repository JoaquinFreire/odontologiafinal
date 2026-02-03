/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import '../App.css';
import {
  Calendar, Clock, PlusCircle, AlertCircle, CheckCircle,
  CalendarDays, UserPlus, List, DollarSign, CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import TodayAppointments from '../components/AppointmentSections/TodayAppointments';
import OverdueAppointments from '../components/AppointmentSections/OverdueAppointments';
import PendingAppointments from '../components/AppointmentSections/PendingAppointments';
import { appointmentService } from '../services/appointmentService';
import { getStartOfTodayUTC, getEndOfTodayUTC } from '../utils/dateUtils';

const Home = ({ user, handleLogout }) => {
  const [showModal, setShowModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    document.title = 'Home';
  }, []);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [overdueAppointments, setOverdueAppointments] = useState([]);
  const [nextAppointments, setNextAppointments] = useState([]);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(null);
  const [selectedAppointmentToReschedule, setSelectedAppointmentToReschedule] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    type: '',
    dni: '',
    price: '',
    payment_method: ''
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

      const startOfDay = new Date(getStartOfTodayUTC());
      const endOfDay = new Date(getEndOfTodayUTC());

      setTodayAppointments(allPending.filter(app => {
        const d = new Date(app.datetime);
        return d >= startOfDay && d < endOfDay;
      }));
      setOverdueAppointments(allPending.filter(app => new Date(app.datetime) < startOfDay));
      setNextAppointments(allPending.filter(app => new Date(app.datetime) >= endOfDay));
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
    setFormData({ name: '', date: '', time: '', type: '', dni: '', price: '', payment_method: '' });
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.time || !formData.type) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    setLoading(true);
    try {
      // Por ahora solo visual, podrías comentar la línea de abajo si no quieres que guarde en DB aún
      await appointmentService.createAppointment(formData, user.id);
      setSuccessMessage(`Turno agendado para ${formData.name}`);
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
  const handleMarkAsCompleted = (id) => console.log("Completar:", id);
  const handleDeleteAppointment = (id) => console.log("Eliminar:", id);
  const handleOpenRescheduleModal = (app) => {
    setSelectedAppointmentToReschedule(app);
    setShowRescheduleModal(true);
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
              <PlusCircle size={18} /> <span>Agendar turno</span>
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card kpi-card">
              <div className="stat-info"><h3>{todayAppointments.length}</h3><p>Turnos hoy</p></div>
            </div>
            <div className="stat-card kpi-card">
              <div className="stat-info"><h3>{overdueAppointments.length}</h3><p>Turnos atrasados</p></div>
            </div>
            <div className="stat-card kpi-card">
              <div className="stat-info"><h3>{totalPending}</h3><p>Turnos pendientes</p></div>
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
                appointments={todayAppointments}
                markingComplete={markingComplete}
                onMarkAsCompleted={handleMarkAsCompleted}
                onOpenRescheduleModal={handleOpenRescheduleModal}
                onDeleteAppointment={handleDeleteAppointment}
                onOpenModal={() => setShowModal(true)}
                formatAppointmentName={formatAppointmentName}
              />
              <OverdueAppointments
                appointments={overdueAppointments}
                markingComplete={markingComplete}
                onMarkAsCompleted={handleMarkAsCompleted}
                onOpenRescheduleModal={handleOpenRescheduleModal}
                onDeleteAppointment={handleDeleteAppointment}
                formatAppointmentName={formatAppointmentName}
              />
            </div>
            <div className="right-column">
              <PendingAppointments
                appointments={nextAppointments}
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
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agendar Nuevo Turno</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <form className="appointment-form" onSubmit={handleSubmitAppointment}>
              <div className="form-group">
                <label>Nombre completo *</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required disabled={loading} />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Fecha *</label>
                  <input type="date" name="date" value={formData.date} onChange={handleFormChange} required min={todayStr} disabled={loading} />
                </div>
                <div className="form-group">
                  <label>Hora *</label>
                  <input type="time" name="time" value={formData.time} onChange={handleFormChange} required disabled={loading} />
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
              </div>

              {/* SECCIÓN DE PAGO (VISUAL) */}
              <div className="payment-section">
                <p className="payment-title">Información de Cobro (Opcional)</p>
                <div className="payment-grid">
                  <div className="form-group">
                    <label><DollarSign size={14} /> Valor</label>
                    <input
                      type="number"
                      name="price"
                      className="payment-input"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleFormChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label><CreditCard size={14} /> Forma de pago</label>
                    <select
                      name="payment_method"
                      className="payment-input"
                      value={formData.payment_method}
                      onChange={handleFormChange}
                      disabled={loading}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Transferencia">Transferencia</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-outline" onClick={handleCloseModal} disabled={loading}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Agendando...' : 'Agendar Turno'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;