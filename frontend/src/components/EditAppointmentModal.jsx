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
      const hour = String(dt.getHours()).padStart(2, '0');
      const minute = String(dt.getMinutes()).padStart(2, '0');
      const timeStr = `${hour}:${minute}`;
      setFormData({
        name: appointment.name || '',
        dni: appointment.dni || '',
        type: appointment.type || '',
        date: dt.toISOString().split('T')[0],
        time: timeStr
      });
    }
  }, [appointment]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const capitalizedName = formData.name.charAt(0).toUpperCase() + formData.name.slice(1).toLowerCase();
    onSave(appointment.id, {...formData, name: capitalizedName});
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  if (!showModal || !appointment) return null;

  return (
    <div className="modal-overlay" onClick={() => !loading && setShowModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Editar Turno</h3>
          <button className="modal-close" onClick={() => !loading && setShowModal(false)} disabled={loading}><X size={20}/></button>
        </div>

        <form className="appointment-form" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>Nombre Paciente *</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={(e) => {if (e.target.value.length <= 100) handleChange(e)}}
              required 
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>DNI</label>
            <input 
              type="text" 
              name="dni"
              value={formData.dni}
              onChange={(e) => {const onlyNumbers = e.target.value.replace(/[^0-9]/g, '').slice(0, 11); handleChange({...e, target: {...e.target, name: 'dni', value: onlyNumbers}})}}
              disabled={loading}
              placeholder="Sin letras"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
          <div className="form-group">
            <label><strong>Fecha *</strong></label>
            <input 
              type="date" 
              name="date"
              value={formData.date || ''} 
              onChange={handleChange} 
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label><strong>Hora *</strong></label>
            <select 
              name="time"
              value={formData.time || ''} 
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Seleccionar...</option>
              {Array.from({ length: 27 }, (_, i) => {
                const hour = 8 + Math.floor(i / 2);
                const minute = i % 2 === 0 ? '00' : '30';
                const val = `${hour.toString().padStart(2, '0')}:${minute}`;
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
          </div>
        </div>

          <div className="modal-actions" style={{marginTop: '20px'}}>
            <button type="button" className="btn-outline" onClick={() => setShowModal(false)} disabled={loading}>Cancelar</button>
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
        <div className="modal-overlay" onClick={() => !loading && setShowConfirmDelete(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>¿Estás seguro?</h3>
              <button className="modal-close" onClick={() => !loading && setShowConfirmDelete(false)} disabled={loading}><X size={20}/></button>
            </div>
            <div style={{ padding: '16px' }}>
              <p>Esta acción eliminará el turno permanentemente. ¿Deseas continuar?</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="btn-outline" onClick={() => setShowConfirmDelete(false)} disabled={loading}>Cancelar</button>
                <button className="btn-primary" onClick={() => { setShowConfirmDelete(false); onDelete(appointment.id); }} disabled={loading}>
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAppointmentModal;