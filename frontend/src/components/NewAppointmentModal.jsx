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
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div className="form-group">
            <label><strong>Fecha *</strong></label>
            <input 
              type="date" 
              min={new Date().toISOString().split('T')[0]} 
              value={formData.date || selectedSlot.date || new Date().toISOString().split('T')[0]} 
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} 
              required
            />
          </div>
          <div className="form-group">
            <label><strong>Hora *</strong></label>
            <select 
              value={formData.time || selectedSlot.time || ''} 
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              required
            >
              <option value="">Seleccionar...</option>
              {Array.from({ length: (21 - 8 + 1) * 2 }, (_, i) => {
                const hour = 8 + Math.floor(i / 2);
                const minute = i % 2 === 0 ? '00' : '30';
                const val = `${hour.toString().padStart(2, '0')}:${minute}`;
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
          </div>
        </div>

        <form className="appointment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Paciente</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
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

          {formData.type === 'Otro' && (
            <div className="form-group">
              <label>Describir Tratamiento *</label>
              <textarea
                value={formData.other_treatment || ''}
                onChange={(e) => setFormData({...formData, other_treatment: e.target.value})}
                placeholder="Describa el tratamiento a realizar"
                required
              />
            </div>
          )}

          <div className="modal-actions" style={{marginTop: '20px'}}>
            <button type="button" className="btn-outline cancel" onClick={() => setShowModal(false)}>Cancelar</button>
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