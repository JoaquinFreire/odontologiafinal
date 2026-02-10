/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import NewAppointmentModal from '../components/NewAppointmentModal';
import EditAppointmentModal from '../components/EditAppointmentModal';
import TodayAppointments from '../components/AppointmentSections/TodayAppointments';
import PendingAppointments from '../components/AppointmentSections/PendingAppointments';
import { appointmentService } from '../services/appointmentService';
import { getAppointmentDateLocal } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight, CheckCircle2, PlusCircle } from 'lucide-react';
import '../styles/calendar.css';

const Diary = ({ user, handleLogout }) => {
  const [activeNav, setActiveNav] = useState('diary');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointmentMap, setAppointmentMap] = useState(new Map());
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState({ date: '', time: '' });
  const [formData, setFormData] = useState({ name: '', dni: '', type: '', other_treatment: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    document.title = 'Agenda Profesional';
    loadAppointments();
  }, [user, currentDate]);

  const { startOfWeek, weekDays, timeSlots } = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
    const slots = [];
    for (let h = 8; h <= 21; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      if (h !== 21) slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return { startOfWeek: monday, weekDays: days, timeSlots: slots };
  }, [currentDate]);

  const loadAppointments = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await appointmentService.getAllPendingAppointments(user.id);
      const map = new Map();
        data.forEach(app => {
          // Usar la fecha/hora tal cual viene en la BD (sin conversión)
          const raw = app.datetime || app.date || '';
          let datePart = '';
          let timePart = '';
          if (typeof raw === 'string') {
            if (raw.includes('T')) {
              const parts = raw.split('T');
              datePart = parts[0];
              timePart = (parts[1] || '').replace('Z', '').slice(0, 5);
            } else if (raw.includes(' ')) {
              const parts = raw.split(' ');
              datePart = parts[0];
              timePart = (parts[1] || '').slice(0, 5);
            } else {
              datePart = raw;
            }
          }
          const dateKey = datePart;
          const timeKey = timePart;
          const key = `${dateKey}-${timeKey}`;
          if (!map.has(key)) map.set(key, []);
          map.get(key).push(app);
      });
      setAppointmentMap(map);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCellClick = (day, time, apps) => {
    if (apps && apps.length > 0) {
      setSelectedAppointment(apps[0]);
      setShowEditModal(true);
      return;
    }
    const dateStr = day.toISOString().split('T')[0];
    if (dateStr < new Date().toISOString().split('T')[0]) return;
    setSelectedSlot({ date: dateStr, time: time });
    setFormData({ name: '', dni: '', type: '', other_treatment: '' });
    setShowModal(true);
  };

  // --- LÓGICA DE PERSISTENCIA RESTAURADA ---

  const handleCreateAppointment = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const date = formData.date || selectedSlot.date;
      const time = formData.time || selectedSlot.time;
      const capitalizedName = formData.name.charAt(0).toUpperCase() + formData.name.slice(1).toLowerCase();
      await appointmentService.createAppointment({
        ...formData,
        name: capitalizedName,
        date,
        time
      }, user.id);

      setShowModal(false);
      triggerSuccess("Turno agendado exitosamente");
    } catch (error) {
      alert("Error al agendar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointment = async (id, data) => {
    try {
      setLoading(true);
      const capitalizedName = data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase();
      await appointmentService.updateAppointment(id, {...data, name: capitalizedName}, user.id);
      setShowEditModal(false);
      triggerSuccess("Turno actualizado correctamente");
    } catch (error) {
      alert("Error al actualizar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      setLoading(true);
      await appointmentService.deleteAppointment(id, user.id);
      setShowEditModal(false);
      triggerSuccess("Turno eliminado");
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerSuccess = (msg) => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      loadAppointments();
    }, 2000);
  };

  return (
    <div className="diary-app">
      <NavBar activeNav={activeNav} user={user} handleLogout={handleLogout} />
      <main className="diary-main">
        <header className="diary-toolbar">
          <div className="date-info">
              <h2 className="month-label">{startOfWeek.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h2>
              <p className="week-label">Semana del {startOfWeek.getDate()}</p>
            </div>
            <div className="nav-group">
              <button className="nav-btn" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}><ChevronLeft size={18} /></button>
              <button className="nav-btn-today" onClick={() => setCurrentDate(new Date())}>Hoy</button>
              <button className="nav-btn" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}><ChevronRight size={18} /></button>
            </div>
            
          <div className="diary-legend">
            <span className="legend-tag">
              <i className="dot dot-today"></i> Hoy
            </span>
            <span className="legend-tag">
              <i className="dot dot-future"></i> Futuro
            </span>
            <span className="legend-tag">
              <i className="dot dot-overdue"></i> Atrasado
            </span>
          </div>
        </header>

        <div className="calendar-container">
          <div className="calendar-grid">
            <div className="grid-corner"></div>
            {weekDays.map((day, i) => (
              <div key={i} className={`grid-day-header ${day.toDateString() === new Date().toDateString() ? 'is-current' : ''}`}>
                <span className="txt-day">{day.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                <span className="txt-num">{day.getDate()}</span>
              </div>
            ))}
            {timeSlots.map(time => (
              <React.Fragment key={time}>
                <div className="grid-time-label">{time}</div>
                {weekDays.map(day => {
                  const year = day.getFullYear();
                  const month = String(day.getMonth() + 1).padStart(2, '0');
                  const dayNum = String(day.getDate()).padStart(2, '0');
                  const dateStr = `${year}-${month}-${dayNum}`;
                  const key = `${dateStr}-${time}`;
                  const apps = appointmentMap.get(key) || [];
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <div key={`${day}-${time}`} className="grid-cell" onClick={() => handleCellClick(day, time, apps)}>
                      {apps.length > 0 && (
                        <div className="app-stack">
                          {apps.map((app, idx) => {
                            let statusClass = 'status-next';
                            if (isToday) statusClass = 'status-today';
                            else if (new Date(app.datetime) < new Date()) statusClass = 'status-late';
                            return (
                              <div key={app.id || idx} className={`app-chip ${statusClass}`}>
                                <p className="app-name">{app.name}</p>
                                <p className="app-type">{app.type}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>

      <NewAppointmentModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedSlot={selectedSlot}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleCreateAppointment}
        loading={loading}
      />

      <EditAppointmentModal
        showModal={showEditModal}
        setShowModal={setShowEditModal}
        appointment={selectedAppointment}
        onSave={handleUpdateAppointment}
        onDelete={handleDeleteAppointment}
        loading={loading}
      />

      {showSuccessModal && (
        <div className="success-overlay">
          <div className="success-card">
            <CheckCircle2 size={40} color="#22c55e" />
            <h3>Operación Exitosa</h3>
            <p>{successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diary;