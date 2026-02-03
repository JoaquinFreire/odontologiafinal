import React from 'react';
import { X } from 'lucide-react';

const NewAppointmentModal = ({ showModal, setShowModal, selectedSlot, formData, setFormData, handleSubmit, loading }) => {
  if (!showModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nuevo Turno</h3>
          <button className="modal-close" onClick={() => setShowModal(false)}><X size={20}/></button>
        </div>
        
        <div style={{ marginBottom: '15px', padding: '10px', background: '#f0f9ff', borderRadius: '8px', fontSize: '0.9rem' }}>
          <strong>Fecha:</strong> {new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('es-ES')} <br/>
          <strong>Hora:</strong> {selectedSlot.time} hs
        </div>

        <form className="appointment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Paciente *</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label>DNI</label>
            <input 
              type="number" 
              value={formData.dni}
              onChange={(e) => setFormData({...formData, dni: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Tratamiento *</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
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

          <div className="modal-actions" style={{marginTop: '20px'}}>
            <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Confirmar Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAppointmentModal;