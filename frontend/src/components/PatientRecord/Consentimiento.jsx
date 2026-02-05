// components/PatientRecord/Consentimiento.jsx
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const Consentimiento = ({ patientData, user, consentData, setConsentData, initialText, isHistoryMode = false }) => {
  // Actualizar datos del doctor cuando el componente monta o user cambia
  console.log(user, " Aca");
  useEffect(() => {
    // En modo historial, no sobrescribir los datos del doctor que vinieron de la BD
    // En modo nuevo paciente, cargar automáticamente los datos del usuario logueado
    if (!isHistoryMode && (user?.name || user?.tuition)) {
      setConsentData(prev => ({
        ...prev,
        doctorName: `${user?.name || ''} ${user?.lastname || ''}`.trim() || '',
        doctorMatricula: user?.tuition || ''
      }));
    }
  }, [user, setConsentData, isHistoryMode]);

  const handleConsentChange = (field, value) => {
    setConsentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const consentText = initialText || `En este acto, yo ${patientData.name || '___________'} ${patientData.lastname || '___________'} DNI ${patientData.dni || '___________'} autorizo a Od ${user?.name || '___________'} M.P. ${user?.tuition || '___________'} y/o asociados o ayudantes a realizar el tratamiento informado, conversado con el profesional sobre la naturaleza y propósito del tratamiento, sobre la posibilidad de complicaciones, los riesgos y administración de anestesia local, práctica, radiografías y otros métodos de diagnóstico.`;

  return (
    <div className="consentimiento-section">
      <div className="section-header">
        <h3>Acta de Consentimiento Informado</h3>
        <p className="section-subtitle">El paciente debe leer, aceptar este documento</p>
      </div>

      <div className="consent-form">
        <div className="consent-text-box">
          <p className="consent-text">
            {consentText}
          </p>
        </div>

        <div className="consent-fields">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="consentDni">DNI del Paciente *</label>
              <input
                type="text"
                id="consentDni"
                value={patientData.dni || ''}
                readOnly
                placeholder="Se completa automáticamente"
              />
            </div>
            <div className="form-group">
              <label htmlFor="consentDate">Fecha y Hora *</label>
              <input
                type="datetime-local"
                id="consentDate"
                value={consentData.datetime || new Date().toISOString().slice(0, 16)}
                onChange={(e) => handleConsentChange('datetime', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="doctorName">Odontólogo *</label>
              <input
                type="text"
                id="doctorName"
                value={consentData.doctorName || ''}
                onChange={(e) => handleConsentChange('doctorName', e.target.value)}
                placeholder="Nombre y apellido del odontólogo"
              />
            </div>
            <div className="form-group">
              <label htmlFor="doctorMatricula">Matrícula *</label>
              <input
                type="text"
                id="doctorMatricula"
                value={consentData.doctorMatricula || ''}
                onChange={(e) => handleConsentChange('doctorMatricula', e.target.value)}
                placeholder="Número de matrícula"
              />
            </div>
          </div>

          <div className="consent-acceptance">
            <label className="checkbox-label large">
              <input
                type="checkbox"
                checked={consentData.accepted || false}
                onChange={(e) => handleConsentChange('accepted', e.target.checked)}
              />
              <span className="checkmark large"></span>
              <div className="acceptance-text">
                <h4>He leído y acepto el consentimiento informado</h4>
                <p>Declaro que he leído y comprendido toda la información anterior y acepto recibir el tratamiento descrito</p>
              </div>
            </label>
          </div>

          {!consentData.accepted && (
            <div className="consent-warning">
              <AlertCircle size={20} color="#ff9800" />
              <p>Advertencia: El consentimiento no ha sido aceptado. Puede continuar, pero se recomienda obtener la aceptación del paciente.</p>
            </div>
          )}

          {consentData.accepted && (
            <div className="consent-ready">
              <CheckCircle size={20} color="#2e7d32" />
              <p>Documento listo para guardar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Consentimiento;