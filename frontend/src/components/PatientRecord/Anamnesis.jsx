// components/PatientRecord/Anamnesis.jsx
import React from 'react';
import { Save, CheckCircle, X } from 'lucide-react';

const Anamnesis = ({ anamnesisData, setAnamnesisData }) => {
  // Arrays fijos de enfermedades para evitar duplicados
  const diseasesColumn1 = [
    'diabetes', 'hypertension', 'rheumaticFever', 'boneDiseases', 'arthritis',
    'muscleDiseases', 'asthma', 'respiratoryDiseases', 'sinusitis', 'jointDiseases',
    'hepatitis', 'kidneyDiseases', 'liverDiseases', 'congenitalDiseases', 'chagas'
  ];

  const diseasesColumn2 = [
    'headaches', 'epilepsy', 'psychiatric', 'unconsciousness', 'heartDiseases',
    'consumesAlcohol', 'bloodDiseases', 'consumesTobacco', 'lymphDiseases',
    'surgeries', 'skinDiseases', 'receivedTransfusions', 'std', 'receivedDialysis',
    'chronicInfections', 'operations', 'glandularDiseases'
  ];

  const diseaseLabels = {
    diabetes: 'Diabetes',
    hypertension: 'Hipertensión arterial',
    rheumaticFever: 'Fiebre Reumática',
    boneDiseases: 'Enfermedades de los huesos',
    arthritis: 'Artritis - Artrosis',
    muscleDiseases: 'Enfermedades musculares',
    asthma: 'Asma',
    respiratoryDiseases: 'Enfermedades respiratorias',
    sinusitis: 'Sinusitis - Otitis - Anginas',
    jointDiseases: 'Enfermedades articulares',
    hepatitis: 'Hepatitis',
    kidneyDiseases: 'Enfermedades renales',
    liverDiseases: 'Enf. del hígado',
    congenitalDiseases: 'Enfermedades congénitas',
    chagas: 'Chagas',
    headaches: 'Dolores de cabeza - Mareos',
    epilepsy: 'Convulsiones - Epilepsia',
    psychiatric: 'Enfermedades psiquiátricas',
    unconsciousness: 'Pérdida de conocimiento',
    heartDiseases: 'Enfermedades cardíacas',
    consumesAlcohol: 'Consume alcohol',
    bloodDiseases: 'Enfermedades de la sangre',
    consumesTobacco: 'Consume Tabaco',
    lymphDiseases: 'Enfermedades de ganglios',
    surgeries: 'Intervenciones quirúrgicas',
    skinDiseases: 'Enfermedades de la piel',
    receivedTransfusions: 'Recibió transfusiones',
    std: 'Enf. de transmisión sexual',
    receivedDialysis: 'Recibió hemodiálisis',
    chronicInfections: 'Infecciones crónicas',
    operations: 'Operaciones',
    glandularDiseases: 'Enfermedades glandulares'
  };

  const handleDiseaseChange = (disease, value) => {
    setAnamnesisData(prev => ({
      ...prev,
      diseases: {
        ...prev.diseases,
        [disease]: value
      }
    }));
  };

  const getNestedValue = (path) => {
    const keys = path.split('.');
    let value = anamnesisData;
    for (let key of keys) {
      value = value?.[key];
    }
    return value;
  };

  const setNestedValue = (path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    setAnamnesisData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      let target = newData;
      
      for (let key of keys) {
        if (!target[key]) target[key] = {};
        target = target[key];
      }
      
      target[lastKey] = value;
      return newData;
    });
  };

  const renderYesNoGroup = (title, stateKey, description = null) => {
    const currentValue = getNestedValue(stateKey);
    
    return (
      <div className="yes-no-group">
        <h5>{title}</h5>
        {description && <p className="group-description">{description}</p>}
        <div className="yes-no-buttons">
          <button
            className={`yes-no-btn ${currentValue === true ? 'active' : ''}`}
            onClick={() => setNestedValue(stateKey, true)}
          >
            SI
          </button>
          <button
            className={`yes-no-btn ${currentValue === false ? 'active' : ''}`}
            onClick={() => setNestedValue(stateKey, false)}
          >
            NO
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="anamnesis-section">
      <div className="section-header">
        <h3>Historia Clínica - Anamnesis</h3>
        <p className="section-subtitle">Completa la información médica del paciente</p>
      </div>

      <div className="anamnesis-form">
        {/* Sección 1 - Datos Médicos Generales */}
        <div className="anamnesis-part">
          <h4>(1) Datos Médicos Generales</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="primaryDoctor">Médico de Cabecera</label>
              <input
                type="text"
                id="primaryDoctor"
                value={anamnesisData.primaryDoctor}
                onChange={(e) => setAnamnesisData({...anamnesisData, primaryDoctor: e.target.value})}
                placeholder="Nombre del médico"
              />
            </div>
            <div className="form-group">
              <label htmlFor="primaryDoctorPhone">Teléfono</label>
              <input
                type="tel"
                id="primaryDoctorPhone"
                value={anamnesisData.primaryDoctorPhone}
                onChange={(e) => setAnamnesisData({...anamnesisData, primaryDoctorPhone: e.target.value})}
                placeholder="Teléfono del médico"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="primaryService">Servicio de Cabecera</label>
            <input
              type="text"
              id="primaryService"
              value={anamnesisData.primaryService}
              onChange={(e) => setAnamnesisData({...anamnesisData, primaryService: e.target.value})}
              placeholder="Hospital o clínica"
            />
          </div>

          {renderYesNoGroup('¿Es alérgico a algún medicamento, antibiótico, polen, picadura de insecto, etc.?', 'allergies.hasAllergies')}
          
          {anamnesisData.allergies.hasAllergies && (
            <div className="form-group conditional-field">
              <label htmlFor="allergiesDescription">¿A qué?</label>
              <input
                type="text"
                id="allergiesDescription"
                value={anamnesisData.allergies.description}
                onChange={(e) => setAnamnesisData({
                  ...anamnesisData,
                  allergies: {...anamnesisData.allergies, description: e.target.value}
                })}
                placeholder="Describa las alergias"
              />
            </div>
          )}

          {renderYesNoGroup('¿Está bajo tratamiento médico?', 'currentTreatment.underTreatment')}
          
          {anamnesisData.currentTreatment.underTreatment && (
            <div className="form-group conditional-field">
              <label htmlFor="treatmentDescription">¿Cuál/Cuáles?</label>
              <input
                type="text"
                id="treatmentDescription"
                value={anamnesisData.currentTreatment.description}
                onChange={(e) => setAnamnesisData({
                  ...anamnesisData,
                  currentTreatment: {...anamnesisData.currentTreatment, description: e.target.value}
                })}
                placeholder="Describa el tratamiento"
              />
            </div>
          )}

          {renderYesNoGroup('¿Fue hospitalizado el último año?', 'hospitalization.wasHospitalized')}
          
          {anamnesisData.hospitalization.wasHospitalized && (
            <div className="form-group conditional-field">
              <label htmlFor="hospitalizationReason">¿Por qué razón?</label>
              <input
                type="text"
                id="hospitalizationReason"
                value={anamnesisData.hospitalization.reason}
                onChange={(e) => setAnamnesisData({
                  ...anamnesisData,
                  hospitalization: {...anamnesisData.hospitalization, reason: e.target.value}
                })}
                placeholder="Razón de la hospitalización"
              />
            </div>
          )}
        </div>

        {/* Sección 2 - Historial Médico */}
        <div className="anamnesis-part">
          <h4>(2) Historial Médico</h4>
          
          {renderYesNoGroup('¿Tiene o tuvo alguna vez problemas para cicatrizar?', 'healingProblems')}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bloodType">Grupo Sanguíneo</label>
              <select
                id="bloodType"
                value={anamnesisData.bloodType}
                onChange={(e) => setAnamnesisData({...anamnesisData, bloodType: e.target.value})}
              >
                <option value="">Seleccionar</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="bloodRh">RH</label>
              <select
                id="bloodRh"
                value={anamnesisData.bloodRh}
                onChange={(e) => setAnamnesisData({...anamnesisData, bloodRh: e.target.value})}
              >
                <option value="">Seleccionar</option>
                <option value="+">+ (Positivo)</option>
                <option value="-">- (Negativo)</option>
              </select>
            </div>
          </div>

          {renderYesNoGroup('¿Toma algún medicamento?', 'takesMedication')}
          
          {anamnesisData.takesMedication && (
            <div className="form-group conditional-field">
              <label htmlFor="medication">¿Cuál/Cuáles?</label>
              <input
                type="text"
                id="medication"
                value={anamnesisData.medication}
                onChange={(e) => setAnamnesisData({...anamnesisData, medication: e.target.value})}
                placeholder="Nombre del medicamento"
              />
            </div>
          )}

          {renderYesNoGroup('¿Está Ud. embarazada?', 'isPregnant')}
          
          {anamnesisData.isPregnant && (
            <div className="form-row">
              <div className="form-group conditional-field">
                <label htmlFor="pregnancyTime">Tiempo gestacional</label>
                <input
                  type="text"
                  id="pregnancyTime"
                  value={anamnesisData.pregnancyTime}
                  onChange={(e) => setAnamnesisData({...anamnesisData, pregnancyTime: e.target.value})}
                  placeholder="Ej: 12 semanas"
                />
              </div>
              <div className="form-group conditional-field">
                <label htmlFor="obstetrician">Obstetra</label>
                <input
                  type="text"
                  id="obstetrician"
                  value={anamnesisData.obstetrician}
                  onChange={(e) => setAnamnesisData({...anamnesisData, obstetrician: e.target.value})}
                  placeholder="Nombre del obstetra"
                />
              </div>
              <div className="form-group conditional-field">
                <label htmlFor="obstetricianPhone">Teléfono</label>
                <input
                  type="tel"
                  id="obstetricianPhone"
                  value={anamnesisData.obstetricianPhone}
                  onChange={(e) => setAnamnesisData({...anamnesisData, obstetricianPhone: e.target.value})}
                  placeholder="Teléfono del obstetra"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sección 3 - Enfermedades (SIN OBLIGATORIEDAD) */}
        <div className="anamnesis-part">
          <h4>(3) Antecedentes Patológicos</h4>
          <p className="section-subtitle">Marcar con una X aquellas opciones que resulten positivas</p>
          
          <div className="diseases-grid">
            {/* Columna 1 */}
            <div className="disease-column">
              {diseasesColumn1.map(disease => (
                <label key={disease} className="checkbox-label disease">
                  <input
                    type="checkbox"
                    checked={anamnesisData.diseases[disease] || false}
                    onChange={(e) => handleDiseaseChange(disease, e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  {diseaseLabels[disease]}
                </label>
              ))}
            </div>

            {/* Columna 2 */}
            <div className="disease-column">
              {diseasesColumn2.map(disease => (
                <label key={disease} className="checkbox-label disease">
                  <input
                    type="checkbox"
                    checked={anamnesisData.diseases[disease] || false}
                    onChange={(e) => handleDiseaseChange(disease, e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  {diseaseLabels[disease]}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="observationsGeneral">Observaciones</label>
            <textarea
              id="observationsGeneral"
              value={anamnesisData.observations}
              onChange={(e) => setAnamnesisData({...anamnesisData, observations: e.target.value})}
              placeholder="Observaciones adicionales sobre el historial médico..."
              rows="3"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Anamnesis;