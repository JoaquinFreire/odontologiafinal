/* eslint-disable no-unused-vars */
// Diary.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import NewAppointmentModal from '../components/NewAppointmentModal';
import EditAppointmentModal from '../components/EditAppointmentModal';
import { appointmentService } from '../services/appointmentService';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import '../styles/calendar.css'; // Importamos el CSS creado

const Diary = ({ user, handleLogout }) => {
  const [activeNav, setActiveNav] = useState('diary');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [appointmentMap, setAppointmentMap] = useState(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Agenda';
  }, []);
  
  // Estados para el Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState({ date: '', time: '' });
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    type: ''
  });

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Estados para el modal de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  // --- LÓGICA DE FECHAS ---
  
  // Obtener el lunes de la semana actual basada en currentDate
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para que Lunes sea el primer día
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);

  // Generar array de los 7 días de la semana
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  // Generar intervalos de tiempo (08:00 a 21:00 cada 30 min)
  const timeSlots = [];
  for (let hour = 8; hour <= 21; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour !== 21) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // --- CARGA DE DATOS ---

  const loadAppointments = async () => {
    if (!user || !user.id) return;
    setLoading(true);
    try {
      // Reutilizamos el servicio que trae TODOS los pendientes. 
      // Si la base crece mucho, sería ideal crear un método que filtre por rango de fechas en el backend.
      const data = await appointmentService.getAllPendingAppointments(user.id);
      setAppointments(data);
      // Build map for fast lookup
      const map = new Map();
      data.forEach(app => {
        const dt = new Date(app.datetime);
        const date = dt.toISOString().split('T')[0];
        const time = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        map.set(`${date}-${time}`, app);
      });
      setAppointmentMap(map);
    } catch (error) {
      console.error("Error cargando agenda:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  // --- NAVEGACIÓN SEMANAL ---
  
  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // --- LOGICA DE RENDERIZADO DE TURNOS ---

  const getAppointmentForSlot = (dateObj, timeStr) => {
    const dateStr = dateObj.toISOString().split('T')[0];
    return appointmentMap.get(`${dateStr}-${timeStr}`);
  };

  const getAppointmentColorClass = (appointment) => {
    if (appointment.status) return 'chip-completed'; // Si estuviera completado

    const appDateTime = new Date(appointment.datetime);
    const now = new Date();
    
    // Normalizar fechas (ignorar horas para comparar días)
    const appDateStr = appDateTime.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    if (appDateStr === todayStr) return 'chip-today'; // Verde
    if (appDateTime < now) return 'chip-overdue';     // Rojo
    return 'chip-future';                             // Azul
  };

  // --- MANEJO DE MODAL ---

  const handleCellClick = (dateObj, timeStr, existingApp) => {
    if (existingApp) {
      // Abrir modal de edición
      setSelectedAppointment(existingApp);
      setShowEditModal(true);
      return;
    }

    const dateStr = dateObj.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    // Opcional: Bloquear fechas pasadas
    if (dateStr < todayStr) {
       alert("No puedes agendar en el pasado.");
       return;
    }

    setSelectedSlot({ date: dateStr, time: timeStr });
    setFormData({ name: '', dni: '', type: '' }); // Limpiar form
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.type) return;

    try {
      setLoading(true);
      await appointmentService.createAppointment({
        ...formData,
        date: selectedSlot.date,
        time: selectedSlot.time
      }, user.id);
      
      setShowModal(false);
      setSuccessMessage("Turno agendado exitosamente");
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        loadAppointments();
      }, 3000);
    } catch (error) {
      alert("Error al agendar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id, data) => {
    try {
      setLoading(true);
      await appointmentService.updateAppointment(id, data, user.id);
      setShowEditModal(false);
      setSuccessMessage("Turno actualizado exitosamente");
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        loadAppointments();
      }, 3000);
    } catch (error) {
      alert("Error al actualizar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await appointmentService.deleteAppointment(id, user.id);
      setShowEditModal(false);
      setSuccessMessage("Turno eliminado exitosamente");
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        loadAppointments();
      }, 3000);
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <NavBar activeNav={activeNav} setActiveNav={setActiveNav} user={user} handleLogout={handleLogout} />
      
      <main className="main-content diary-container">
        
        {/* Cabecera de la Agenda */}
        <div className="diary-header">
          <div className="diary-nav">
            <button onClick={handlePrevWeek}><ChevronLeft size={20}/></button>
            <button onClick={handleToday} style={{fontSize: '0.9rem', fontWeight: 'bold'}}>Hoy</button>
            <button onClick={handleNextWeek}><ChevronRight size={20}/></button>
            
            <div className="current-week-label">
               {startOfWeek.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })} 
               {` - Semana del ${startOfWeek.getDate()}`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
            <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
              <div style={{width:10, height:10, background:'#66bb6a', borderRadius:'50%'}}></div> Hoy
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
              <div style={{width:10, height:10, background:'#42a5f5', borderRadius:'50%'}}></div> Futuro
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
              <div style={{width:10, height:10, background:'#ef5350', borderRadius:'50%'}}></div> Atrasado
            </div>
          </div>
        </div>

        {/* GRILLA CALENDARIO */}
        <div className="diary-grid">
          
          {/* Esquina superior vacía */}
          <div className="time-col-header"></div>

          {/* Cabeceras de Días */}
          {weekDays.map((day, i) => {
             const isToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
             return (
              <div key={i} className={`grid-header-cell ${isToday ? 'today' : ''}`}>
                <span className="day-name">{day.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                <span className="day-number">{day.getDate()}</span>
              </div>
             );
          })}

          {/* Filas de Tiempo */}
          {timeSlots.map((time, index) => (
            <React.Fragment key={time}>
              {/* Celda de la hora (Izquierda) */}
              <div className="time-label">{time}</div>

              {/* Celdas de los días para esta hora */}
              {weekDays.map((day, dayIndex) => {
                const appointment = getAppointmentForSlot(day, time);
                return (
                  <div 
                    key={`${day}-${time}`} 
                    className="grid-cell"
                    onClick={() => handleCellClick(day, time, appointment)}
                  >
                    {appointment && (
                      <div className={`appointment-chip ${getAppointmentColorClass(appointment)}`}>
                        <span className="chip-name">{appointment.name}</span>
                        <span className="chip-type">{appointment.type}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </main>

      <NewAppointmentModal 
        showModal={showModal}
        setShowModal={setShowModal}
        selectedSlot={selectedSlot}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        loading={loading}
      />

      <EditAppointmentModal 
        showModal={showEditModal}
        setShowModal={setShowEditModal}
        appointment={selectedAppointment}
        onSave={handleSave}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Modal Éxito */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal-content">
            <div className="success-checkmark">✓</div>
            <h2>¡Éxito!</h2>
            <p>{successMessage || 'Operación realizada con éxito'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diary;