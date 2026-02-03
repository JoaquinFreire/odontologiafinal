import React from 'react';
import { Clock, User, CheckCircle, Trash2 } from 'lucide-react';

const PendingAppointments = ({
  appointments,
  markingComplete,
  onMarkAsCompleted,
  onOpenRescheduleModal,
  onDeleteAppointment,
  formatAppointmentName
}) => {
  return (
    <div className="appointments-card">
      <div className="card-header">
        <h3>Turnos siguientes</h3>
        <div className="card-header-actions">
          <span className="badge">{appointments.length} citas próximas</span>
        </div>
      </div>

      {appointments.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '16px',
          padding: '12px',
          background: '#f5f5f5',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={16} color="#388e3c" />
            <span>Atender</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} color="#0066cc" />
            <span>Reprogramar</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trash2 size={16} color="#d32f2f" />
            <span>Eliminar</span>
          </div>
        </div>
      )}

      {appointments.length > 0 ? (
        <div className="today-appointments-list">
          {appointments.map(app => (
            <div key={app.id} className="home-appointment-item">
              <div className="appointment-time">
                <Clock size={16} />
                <span>{new Date(app.datetime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="appointment-details">
                <div className="appointment-patient">
                  <User size={14} />
                  <h5>{formatAppointmentName(app)}</h5>
                </div>
                <p>{new Date(app.datetime).toLocaleDateString('es-ES')}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="icon-button"
                  onClick={() => onMarkAsCompleted(app.id)}
                  disabled={markingComplete === app.id}
                  title="Marcar como atendido"
                >
                  <CheckCircle size={22} color={markingComplete === app.id ? '#ccc' : '#388e3c'} />
                </button>
                <button
                  className="icon-button"
                  onClick={() => onOpenRescheduleModal(app)}
                  title="Reprogramar turno"
                >
                  <Clock size={22} color="#0066cc" />
                </button>
                <button
                  className="icon-button"
                  onClick={() => onDeleteAppointment(app.id)}
                  title="Eliminar turno"
                >
                  <Trash2 size={22} color="#d32f2f" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <CheckCircle size={48} color="#388e3c" />
          <h4>Sin turnos próximos</h4>
          <p>No hay citas agendadas para después de hoy</p>
        </div>
      )}
    </div>
  );
};

export default PendingAppointments;
