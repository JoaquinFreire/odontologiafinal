import React from 'react';

const UserIcon = () => <span className="icon">👤</span>;
const CalendarIcon = () => <span className="icon">📅</span>;
const FileIcon = () => <span className="icon">📄</span>;
const EditIcon = () => <span className="icon">✏️</span>;
const TrashIcon = () => <span className="icon">🗑️</span>;

const PatientsTable = ({ patients, onViewDetails, onViewMedicalHistory, onScheduleAppointment }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR');
  };

  return (
    <div className="patients-table-container">
      <div className="table-wrapper">
        <table className="patients-table">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Paciente</th>
              <th>Contacto</th>
              <th>Última Visita</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td>
                  <span className="dni-text">{patient.dni}</span>
                </td>
                <td>
                  <div className="patient-info">
                    <div className="patient-avatar">
                      <UserIcon />
                    </div>
                    <div className="patient-details">
                      <div className="patient-name">{patient.name}</div>
                      <div className="patient-meta">{patient.age} años • {patient.gender}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div>{patient.phone}</div>
                    <div className="email-text">{patient.email}</div>
                  </div>
                </td>
                <td>
                  {patient.nextAppointment ? (
                    <span className="appointment-badge">
                      {formatDate(patient.nextAppointment)}
                    </span>
                  ) : (
                    <span className="no-appointment">Sin turno</span>
                  )}
                </td>
                
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => onViewDetails(patient)}
                      className="action-btn details-btn"
                      title="Ver detalles"
                    >
                      <UserIcon />
                    </button>
                    <button
                      onClick={() => onViewMedicalHistory(patient)}
                      className="action-btn history-btn"
                      title="Historial clínico"
                    >
                      <FileIcon />
                    </button>
                    <button
                      onClick={() => onScheduleAppointment(patient)}
                      className="action-btn appointment-btn"
                      title="Agendar turno"
                    >
                      <CalendarIcon />
                    </button>
                    <button className="action-btn edit-btn" title="Editar">
                      <EditIcon />
                    </button>
                    <button className="action-btn delete-btn" title="Eliminar">
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {patients.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">
            <UserIcon />
          </div>
          <h3>No se encontraron pacientes</h3>
          <p>Intenta con otros términos de búsqueda</p>
        </div>
      )}
    </div>
  );
};

export default PatientsTable;
