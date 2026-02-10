import React from 'react';
import { Clock, User, AlertCircle, PlusCircle, Trash2, CheckCircle } from 'lucide-react';

const TodayAppointments = ({
  appointments,
  markingComplete,
  onMarkAsCompleted,
  onOpenRescheduleModal,
  onDeleteAppointment,
  onOpenModal,
  formatAppointmentName
}) => {
  return (
    <div className="appointments-card">
      <div className="card-header">
        <h3>Turnos para atender</h3>
        <div className="card-header-actions">
          <span className="badge badge-today">{appointments.length} citas programadas</span>
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
          {appointments.map(app => {
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
            return (
              <div key={app.id} className="home-appointment-item today-item">
                <div className="appointment-time">
                  <Clock size={16} />
                  <span>{timePart}</span>
                </div>
                <div className="appointment-details">
                  <div className="appointment-patient">
                    <User size={14} />
                    <h5>{formatAppointmentName(app)}</h5>
                  </div>
                  <p>{datePart}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
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
            );
          })}
        </div>
      ) : (
            <div className="empty-state">
          <AlertCircle size={48} color="#9e9e9e" />
          <h4>Sin turnos para atender</h4>
          <p>No hay citas urgentes o para hoy</p>
          <button className="btn-outline" onClick={onOpenModal}>
            <PlusCircle size={22} />
            <span>Agendar turno</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(TodayAppointments);
