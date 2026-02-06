/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditAppointmentModal = ({ showModal, setShowModal, appointment, onSave, onDelete, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    type: '',
    date: '',
    time: ''
  });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (appointment) {
      const dt = new Date(appointment.datetime);
      setFormData({
        name: appointment.name || '',
        dni: appointment.dni || '',
        type: appointment.type || '',
        date: dt.toISOString().split('T')[0],
        time: dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      });
    }
  }, [appointment]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(appointment.id, formData);
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  if (!showModal || !appointment) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Editar Turno</h3>
          <button className="modal-close" onClick={() => setShowModal(false)}><X size={20}/></button>
        </div>

        <form className="appointment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Paciente *</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label>DNI</label>
            <input 
              type="number" 
              name="dni"
              value={formData.dni}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Tratamiento *</label>
            <select 
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="Consulta">Consulta</option>
              <option value="Limpieza dental">Limpieza dental</option>
              <option value="Extracción">Extracción</option>
              <option value="Blanqueamiento">Blanqueamiento</option>
              <option value="Ortodoncia">Ortodoncia</option>
              <option value="Implante dental">Implante dental</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fecha *</label>
            <input 
              type="date" 
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Hora *</label>
            <input 
              type="time" 
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions" style={{marginTop: '20px'}}>
            <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" style={{background: '#ef5350', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer'}} onClick={handleDelete} disabled={loading}>
              Eliminar
            </button>
          </div>
        </form>
      </div>
      {showConfirmDelete && (
        <div className="modal-overlay" onClick={() => setShowConfirmDelete(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>¿Estás seguro?</h3>
              <button className="modal-close" onClick={() => setShowConfirmDelete(false)}><X size={20}/></button>
            </div>
            <div style={{ padding: '16px' }}>
              <p>Esta acción eliminará el turno permanentemente. ¿Deseas continuar?</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="btn-outline" onClick={() => setShowConfirmDelete(false)}>Cancelar</button>
                <button className="btn-primary" onClick={() => { setShowConfirmDelete(false); onDelete(appointment.id); }}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAppointmentModal;