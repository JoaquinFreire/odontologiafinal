// components/PatientRecord/DatosPersonales.jsx
import React, { useState } from 'react';
import { Phone, Mail, Home, Briefcase, FileText } from 'lucide-react';
import { 
  filterOnlyLetters, 
  filterOnlyNumbers, 
  validateDNI, 
  validateEmail, 
  validatePhone 
} from '../../validators/formValidators';

const DatosPersonales = ({ patientData, setPatientData, readOnlyFields = [] }) => {
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    if (readOnlyFields.includes(field)) return; // No cambiar si es readonly
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear field error on change
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const setFieldError = (field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
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
              onChange={(e) => {
                const filtered = filterOnlyLetters(e.target.value);
                handleInputChange('name', filtered);
              }}
              placeholder="Nombre"
              readOnly={isReadOnly('name')}
              className={isReadOnly('name') ? 'readonly' : ''}
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="lastname">Apellido *</label>
            <input
              type="text"
              id="lastname"
              value={patientData.lastname || ''}
              onChange={(e) => {
                const filtered = filterOnlyLetters(e.target.value);
                handleInputChange('lastname', filtered);
              }}
              placeholder="Apellido"
              readOnly={isReadOnly('lastname')}
              className={isReadOnly('lastname') ? 'readonly' : ''}
            />
            {errors.lastname && <div className="field-error">{errors.lastname}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="dni">DNI * (máx 11 dígitos)</label>
            <div className="input-with-icon">
              <FileText size={16} />
              <input
                type="text"
                id="dni"
                value={patientData.dni || ''}
                onChange={(e) => {
                  const filtered = filterOnlyNumbers(e.target.value);
                  if (filtered.length <= 11) {
                    handleInputChange('dni', filtered);
                  }
                  if (filtered.length > 11) {
                    setFieldError('dni', 'DNI no puede exceder 11 dígitos');
                  } else {
                    setErrors(prev => {
                      const copy = { ...prev };
                      delete copy.dni;
                      return copy;
                    });
                  }
                }}
                placeholder="DNI sin puntos"
                readOnly={isReadOnly('dni')}
                className={isReadOnly('dni') ? 'readonly' : ''}
                maxLength="11"
              />
              {errors.dni && <div className="field-error">{errors.dni}</div>}
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
            <label htmlFor="phone">Teléfono (máx 15 dígitos)</label>
            <div className="input-with-icon">
              <Phone size={16} />
              <input
                type="tel"
                id="phone"
                value={patientData.phone || ''}
                onChange={(e) => {
                  const filtered = filterOnlyNumbers(e.target.value);
                  if (filtered.length <= 15) {
                    handleInputChange('phone', filtered);
                  }
                  if (filtered.length > 15) {
                    setFieldError('phone', 'Teléfono no puede exceder 15 dígitos');
                  } else {
                    setErrors(prev => {
                      const copy = { ...prev };
                      delete copy.phone;
                      return copy;
                    });
                  }
                }}
                placeholder="1234567890"
                readOnly={isReadOnly('phone')}
                className={isReadOnly('phone') ? 'readonly' : ''}
                maxLength="15"
              />
              {errors.phone && <div className="field-error">{errors.phone}</div>}
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
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && !validateEmail(val)) {
                    setFieldError('email', 'Email inválido');
                  } else {
                    setErrors(prev => {
                      const copy = { ...prev };
                      delete copy.email;
                      return copy;
                    });
                  }
                }}
                placeholder="email@ejemplo.com"
                readOnly={isReadOnly('email')}
                className={isReadOnly('email') ? 'readonly' : ''}
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
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
                onChange={(e) => handleInputChange('occupation', e.target.value.replace(/[0-9]/g, ''))}
                placeholder="Profesión u oficio"
                readOnly={isReadOnly('occupation')}
                className={isReadOnly('occupation') ? 'readonly' : ''}
              />
              {errors.occupation && <div className="field-error">{errors.occupation}</div>}
            </div>
          </div>
        </div>

        <div className="insurance-section">
          <h4>Datos de Obra Social</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="insuranceNumber">Número de Afiliado (máx 20 dígitos)</label>
              <input
                type="text"
                id="insuranceNumber"
                value={patientData.healthInsurance?.number || ''}
                onChange={(e) => {
                  const filtered = filterOnlyNumbers(e.target.value);
                  if (filtered.length <= 20) {
                    handleInsuranceChange('number', filtered);
                  }
                  if (filtered.length > 20) {
                    setFieldError('insNumber', 'Número de afiliado no puede exceder 20 dígitos');
                  } else {
                    setErrors(prev => {
                      const copy = { ...prev };
                      delete copy.insNumber;
                      return copy;
                    });
                  }
                }}
                placeholder="Número de afiliado"
                readOnly={isReadOnly('healthInsurance.number')}
                className={isReadOnly('healthInsurance.number') ? 'readonly' : ''}
                maxLength="20"
              />
              {errors.insNumber && <div className="field-error">{errors.insNumber}</div>}
              {errors.healthInsurance && <div className="field-error">{errors.healthInsurance}</div>}
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