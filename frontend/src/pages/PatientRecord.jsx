/* eslint-disable no-undef */
// PatientRecord.js
import React, { useState, useEffect } from 'react';
import '../styles/PatientRecord.css';
import '../styles/NewPatient.css';

import {
  FileText,
  User,
  Clipboard,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Check,
  Save,
  Printer,
  AlertCircle
} from 'lucide-react';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';
import { saveCompletePatient } from '../services/patientService';

// Importar componentes
import Odontograma from '../components/PatientRecord/Odontograma';
import DatosPersonales from '../components/PatientRecord/DatosPersonales';
import Consentimiento from '../components/PatientRecord/Consentimiento';
import Anamnesis from '../components/PatientRecord/Anamnesis';

const PatientRecord = ({ setIsAuthenticated, user, setUser }) => {
  const [activeTab, setActiveTab] = useState('datos');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Nuevo Paciente';
  }, []);

  // Datos compartidos entre componentes
  const [patientData, setPatientData] = useState({
    name: '',
    lastname: '',
    dni: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    occupation: '',
    healthInsurance: {
      number: '',
      isHolder: false
    },
    dentalObservations: '',
    elements: '1'
  });

  const [anamnesisData, setAnamnesisData] = useState({
    primaryDoctor: '',
    primaryDoctorPhone: '',
    primaryService: '',
    allergies: { hasAllergies: false, description: '' },
    currentTreatment: { underTreatment: false, description: '' },
    hospitalization: { wasHospitalized: false, reason: '' },
    healingProblems: false,
    bloodType: '',
    bloodRh: '',
    takesMedication: false,
    medication: '',
    isPregnant: false,
    pregnancyTime: '',
    obstetrician: '',
    obstetricianPhone: '',
    diseases: {
      diabetes: false,
      headaches: false,
      trauma: false,
      neurological: false,
      hypertension: false,
      epilepsy: false,
      psoriasis: false,
      psychiatric: false,
      rheumaticFever: false,
      unconsciousness: false,
      boneDiseases: false,
      heartDiseases: false,
      arthritis: false,
      consumesAlcohol: false,
      muscleDiseases: false,
      bloodDiseases: false,
      asthma: false,
      consumesTobacco: false,
      respiratoryDiseases: false,
      lymphDiseases: false,
      sinusitis: false,
      surgeries: false,
      jointDiseases: false,
      skinDiseases: false,
      hepatitis: false,
      receivedTransfusions: false,
      kidneyDiseases: false,
      std: false,
      liverDiseases: false,
      receivedDialysis: false,
      congenitalDiseases: false,
      chronicInfections: false,
      chagas: false,
      operations: false,
      glandularDiseases: false
    },
    observations: ''
  });

  const [consentData, setConsentData] = useState({
    accepted: false,
    datetime: new Date().toISOString().slice(0, 16),
    doctorName: '',
    doctorMatricula: ''
  });

  const [odontogramaData, setOdontogramaData] = useState({
    adult: { teethState: {}, connections: [] },
    child: { teethState: {}, connections: [] },
    observaciones: '',
    elementos_dentarios: '',
    version: 1,
    treatments: []
  });

  const [newTreatment, setNewTreatment] = useState({ 
    date: '', 
    code: '', 
    tooth_elements: '', 
    faces: '', 
    observations: '' 
  });

  const tabs = [
    { id: 'datos', label: 'Datos Personales', icon: <User size={20} /> },
    { id: 'anamnesis', label: 'Anamnesis', icon: <Briefcase size={20} /> },
    { id: 'odontograma', label: 'Odontograma', icon: <FileText size={20} /> },
    { id: 'tratamientos', label: 'Tratamientos', icon: <Clipboard size={20} /> },
    { id: 'consentimiento', label: 'Consentimiento', icon: <Clipboard size={20} /> }
  ];

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };


  const validateRequiredData = () => {
    const patientErrors = [];

    // Validar datos personales obligatorios
    if (!patientData.name) patientErrors.push('Nombre');
    if (!patientData.lastname) patientErrors.push('Apellido');
    if (!patientData.dni) patientErrors.push('DNI');
    if (!patientData.birthDate) patientErrors.push('Fecha de Nacimiento');

    // El consentimiento NO es validación bloqueante, solo advertencia

    return {
      isValid: patientErrors.length === 0,
      patientErrors,
      hasErrors: patientErrors.length > 0
    };
  };

  const handleSaveAll = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    const validation = validateRequiredData();

    if (!validation.isValid) {
      let missingSection = '';
      let errorMsg = '✗ Campos requeridos incompletos:\n\n';
      
      if (validation.patientErrors.length > 0) {
        errorMsg += `Datos Personales: ${validation.patientErrors.join(', ')}\n`;
        missingSection = 'datos';
      }

      setMessage({ 
        type: 'error', 
        text: errorMsg.replace(/\n/g, ' | ') 
      });
      
      // Auto-dirigirse a la sección que falta
      if (missingSection) {
        setTimeout(() => {
          setActiveTab(missingSection);
        }, 500);
      }
      
      setLoading(false);
      return;
    }

    // Advertencia si no aceptó consentimiento (pero permite continuar)
    if (!consentData.accepted || !consentData.doctorName) {
      const proceed = window.confirm(
        '⚠️ ADVERTENCIA: Consentimiento no completamente aceptado.\n\n' +
        '¿Deseas continuar de todas formas?'
      );
      if (!proceed) {
        setLoading(false);
        setActiveTab('consentimiento');
        return;
      }
    }

    // Advertencia si no se marcó ninguna enfermedad en anamnesis
    const hasAnyDisease = Object.values(anamnesisData.diseases || {}).some(value => value === true);
    if (!hasAnyDisease) {
      const proceed = window.confirm(
        '⚠️ ADVERTENCIA: No has marcado ninguna condición en la Anamnesis.\n\n' +
        '¿Deseas continuar de todas formas?'
      );
      if (!proceed) {
        setLoading(false);
        setActiveTab('anamnesis');
        return;
      }
    }

    // Advertencia si no se hizo nada en el odontograma
    const hasOdontogramaData = 
      Object.keys(odontogramaData.adult?.teethState || {}).length > 0 ||
      Object.keys(odontogramaData.child?.teethState || {}).length > 0 ||
      odontogramaData.adult?.connections?.length > 0 ||
      odontogramaData.child?.connections?.length > 0 ||
      odontogramaData.observaciones?.trim() ||
      odontogramaData.elementos_dentarios?.trim();

    if (!hasOdontogramaData) {
      const proceed = window.confirm(
        '⚠️ ADVERTENCIA: El Odontograma está vacío.\n\n' +
        '¿Deseas continuar de todas formas?'
      );
      if (!proceed) {
        setLoading(false);
        setActiveTab('odontograma');
        return;
      }
    }

    try {
      console.log('=== GUARDANDO PACIENTE COMPLETO ===');
      console.log('Datos del paciente:', patientData);
      console.log('Datos de consentimiento:', consentData);
      console.log('User ID:', user.id);

      const result = await saveCompletePatient(patientData, anamnesisData, consentData, odontogramaData, user.id);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `✓ ${result.message}` 
        });
        setTimeout(() => {
          // Redirigir a ViewPatient con búsqueda automática del paciente
          const searchTerm = patientData.name;
          navigate(`/patients?search=${encodeURIComponent(searchTerm)}`);
        }, 1500);
      } else {
        setMessage({ 
          type: 'error', 
          text: `✗ Error: ${result.error}` 
        });
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      setMessage({ 
        type: 'error', 
        text: `✗ Error: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'odontograma':
        return <Odontograma 
          onDataChange={setOdontogramaData}
          initialData={odontogramaData}
        />;
      case 'datos':
        return <DatosPersonales 
          patientData={patientData} 
          setPatientData={setPatientData} 
        />;
      case 'consentimiento':
        return <Consentimiento 
          patientData={patientData}
          user={user}
          consentData={consentData}
          setConsentData={setConsentData}
        />;
      case 'anamnesis':
        return <Anamnesis 
          anamnesisData={anamnesisData} 
          setAnamnesisData={setAnamnesisData} 
        />;
      case 'tratamientos':
        return (
          <div>
            <div className="treatments-section">
              <h3>Tratamientos Realizados</h3>
              <table className="treatments-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Código</th>
                    <th>Dientes</th>
                    <th>Caras</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {odontogramaData.treatments.map((treatment, index) => (
                    <tr key={index}>
                      <td>{treatment.date || 'N/A'}</td>
                      <td>{treatment.code || 'N/A'}</td>
                      <td>{treatment.tooth_elements || 'N/A'}</td>
                      <td>{treatment.faces || 'N/A'}</td>
                      <td>{treatment.observations || 'N/A'}</td>
                    </tr>
                  ))}
                  <tr className="new-treatment-row">
                    <td>
                      <input
                        type="date"
                        value={newTreatment.date}
                        onChange={(e) => setNewTreatment({...newTreatment, date: e.target.value})}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={newTreatment.code}
                        onChange={(e) => setNewTreatment({...newTreatment, code: e.target.value.slice(0, 30)})}
                        maxLength="30"
                        placeholder="Máx 30 caracteres"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={newTreatment.tooth_elements}
                        onChange={(e) => setNewTreatment({...newTreatment, tooth_elements: e.target.value.slice(0, 30)})}
                        maxLength="30"
                        placeholder="Máx 30 caracteres"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={newTreatment.faces}
                        onChange={(e) => setNewTreatment({...newTreatment, faces: e.target.value.slice(0, 30)})}
                        maxLength="30"
                        placeholder="Máx 30 caracteres"
                      />
                    </td>
                    <td>
                      <textarea
                        value={newTreatment.observations}
                        onChange={(e) => setNewTreatment({...newTreatment, observations: e.target.value.slice(0, 500)})}
                        maxLength="500"
                        rows="2"
                        placeholder="Máx 500 caracteres"
                      ></textarea>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button
                className="btn-primary small"
                onClick={() => {
                  const treatmentToAdd = {
                    date: newTreatment.date || new Date().toISOString().split('T')[0],
                    code: newTreatment.code,
                    tooth_elements: newTreatment.tooth_elements,
                    faces: newTreatment.faces,
                    observations: newTreatment.observations
                  };
                  const updatedTreatments = [...odontogramaData.treatments, treatmentToAdd];
                  setOdontogramaData(prev => ({ ...prev, treatments: updatedTreatments }));
                  setNewTreatment({ date: '', code: '', tooth_elements: '', faces: '', observations: '' });
                }}
                disabled={!newTreatment.code && !newTreatment.tooth_elements && !newTreatment.faces && !newTreatment.observations}
                style={{
                  opacity: (!newTreatment.code && !newTreatment.tooth_elements && !newTreatment.faces && !newTreatment.observations) ? 0.5 : 1,
                  cursor: (!newTreatment.code && !newTreatment.tooth_elements && !newTreatment.faces && !newTreatment.observations) ? 'not-allowed' : 'pointer'
                }}
              >
                Agregar Tratamiento
              </button>
            </div>
          </div>
        );
      default:
        return <DatosPersonales 
          patientData={patientData} 
          setPatientData={setPatientData} 
        />;
    }
  };

  return (
    <div className="app">
      <NavBar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        user={user}
        handleLogout={handleLogout}
      />

      <main className="main-content">
        <div className="patient-record-container">
          <div className="content-header">
            <div className="patient-header">
              <h1>Ficha del Paciente</h1>
              <div className="patient-subtitle">
                <span className="patient-name">{patientData.name || 'Nuevo Paciente'} {patientData.lastname}</span>
                <span className="patient-id">ID: #P-{patientData.healthInsurance.number.slice(0, 6) || 'NUEVO'}</span>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn-outline">
                <Printer size={18} />
                <span>Imprimir Ficha</span>
              </button>
              <button 
                className="btn-primary"
                onClick={handleSaveAll}
                disabled={loading}
                title="Guardar paciente completo"
              >
                <Save size={18} />
                <span>{loading ? 'Guardando...' : 'Guardar Todo'}</span>
              </button>
            </div>
          </div>

          {/* Mensaje de estado */}
          {message.text && (
            <div className={`message-alert message-${message.type}`}>
              <AlertCircle size={18} />
              <span>{message.text}</span>
            </div>
          )}

          {/* Pestañas de navegación */}
          <div className="record-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`record-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="tab-icon">
                  {tab.icon}
                </div>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Contenido principal */}
          <div className="record-content">
            {renderContent()}
          </div>

          {/* Navegación y Progreso */}
          <div className="progress-footer">
            <div className="progress-info">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${((tabs.findIndex(tab => tab.id === activeTab) + 1) / tabs.length) * 100}%` }}
                ></div>
              </div>
              <span className="progress-text">
                Paso {tabs.findIndex(tab => tab.id === activeTab) + 1} de {tabs.length}
              </span>
            </div>
            <div className="progress-actions">
              {tabs.findIndex(tab => tab.id === activeTab) > 0 && (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1].id);
                    }
                  }}
                >
                  <ChevronLeft size={18} />
                  <span>Anterior</span>
                </button>
              )}
              {tabs.findIndex(tab => tab.id === activeTab) < tabs.length - 1 && (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1].id);
                    }
                  }}
                >
                  <span>Siguiente</span>
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientRecord;