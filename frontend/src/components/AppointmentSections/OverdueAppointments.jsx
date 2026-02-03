import React from 'react';
import { XCircle, Trash2, CheckCircle, Clock } from 'lucide-react';

const OverdueAppointments = ({
  appointments,
  markingComplete,
  onMarkAsCompleted,
  onOpenRescheduleModal,
  onDeleteAppointment,
  formatAppointmentName
}) => {
  if (appointments.length === 0) {
    return null;
  }

  return (
    <div className="overdue-card">
      <div className="card-header">
        <h3>Turnos atrasados</h3>
        <div className="badge overdue-badge">Requieren atención</div>
      </div>
      
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '16px',
        padding: '12px',
        background: '#fff5f5',
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
      <div className="overdue-list">
        {appointments.map(app => (
          <div key={app.id} className="overdue-item">
            <div className="overdue-info">
              <XCircle size={16} color="#d32f2f" />
              <div>
                <h5>{formatAppointmentName(app)}</h5>
                <p>Fecha original: {new Date(app.datetime).toLocaleDateString('es-ES')} &nbsp;
                  <span>{new Date(app.datetime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                </p>
                <small>Tratamiento: {app.type}</small>
              </div>
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
    </div>
  );
};

export default OverdueAppointments;
