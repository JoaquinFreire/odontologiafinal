// components/PatientRecord/DatosPersonales.jsx
import React from 'react';
import { Phone, Mail, Home, Briefcase, FileText } from 'lucide-react';

const DatosPersonales = ({ patientData, setPatientData, readOnlyFields = [] }) => {
  const handleInputChange = (field, value) => {
    if (readOnlyFields.includes(field)) return; // No cambiar si es readonly
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInsuranceChange = (field, value) => {
    setPatientData(prev => ({
      ...prev,
      healthInsurance: {
        ...prev.healthInsurance,
        [field]: value
      }
    }));
  };

  const isReadOnly = (field) => readOnlyFields.includes(field);

  return (
    <div className="datos-personales-section">
      <div className="section-header">
        <h3>Datos Personales</h3>
      </div>

      <div className="datos-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Nombre *</label>
            <input
              type="text"
              id="name"
              value={patientData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nombre"
              readOnly={isReadOnly('name')}
              className={isReadOnly('name') ? 'readonly' : ''}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastname">Apellido *</label>
            <input
              type="text"
              id="lastname"
              value={patientData.lastname || ''}
              onChange={(e) => handleInputChange('lastname', e.target.value)}
              placeholder="Apellido"
              readOnly={isReadOnly('lastname')}
              className={isReadOnly('lastname') ? 'readonly' : ''}
            />
          </div>
          <div className="form-group">
            <label htmlFor="dni">DNI *</label>
            <div className="input-with-icon">
              <FileText size={16} />
              <input
                type="text"
                id="dni"
                value={patientData.dni || ''}
                onChange={(e) => handleInputChange('dni', e.target.value)}
                placeholder="DNI sin puntos"
                readOnly={isReadOnly('dni')}
                className={isReadOnly('dni') ? 'readonly' : ''}
                maxLength="12"
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="birthDate">Fecha de Nacimiento *</label>
            <input
              type="date"
              id="birthDate"
              value={patientData.birthDate || ''}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              readOnly={isReadOnly('birthDate')}
              className={isReadOnly('birthDate') ? 'readonly' : ''}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <div className="input-with-icon">
              <Phone size={16} />
              <input
                type="tel"
                id="phone"
                value={patientData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 234 567 890"
                readOnly={isReadOnly('phone')}
                className={isReadOnly('phone') ? 'readonly' : ''}
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <Mail size={16} />
              <input
                type="email"
                id="email"
                value={patientData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@ejemplo.com"
                readOnly={isReadOnly('email')}
                className={isReadOnly('email') ? 'readonly' : ''}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="address">Dirección</label>
            <div className="input-with-icon">
              <Home size={16} />
              <input
                type="text"
                id="address"
                value={patientData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Calle y número"
                readOnly={isReadOnly('address')}
                className={isReadOnly('address') ? 'readonly' : ''}
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="occupation">Ocupación</label>
            <div className="input-with-icon">
              <Briefcase size={16} />
              <input
                type="text"
                id="occupation"
                value={patientData.occupation || ''}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                placeholder="Profesión u oficio"
                readOnly={isReadOnly('occupation')}
                className={isReadOnly('occupation') ? 'readonly' : ''}
              />
            </div>
          </div>
        </div>

        <div className="insurance-section">
          <h4>Datos de Obra Social</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="insuranceNumber">Número de Afiliado</label>
              <input
                type="text"
                id="insuranceNumber"
                value={patientData.healthInsurance?.number || ''}
                onChange={(e) => handleInsuranceChange('number', e.target.value)}
                placeholder="Número de afiliado"
                readOnly={isReadOnly('healthInsurance.number')}
                className={isReadOnly('healthInsurance.number') ? 'readonly' : ''}
                maxLength="12"
              />
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={patientData.healthInsurance?.isHolder || false}
                  onChange={(e) => handleInsuranceChange('isHolder', e.target.checked)}
                  disabled={isReadOnly('healthInsurance.isHolder')}
                />
                <span className="checkmark"></span>
                Titular
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatosPersonales;