/* eslint-disable no-undef */
/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
// History.js - Historial Clínico del Paciente
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { User, Briefcase, FileText, Clipboard, Save, ArrowLeft } from 'lucide-react';

// Importar componentes
import NavBar from '../components/NavBar';
import DatosPersonales from '../components/PatientRecord/DatosPersonales';
import Anamnesis from '../components/PatientRecord/Anamnesis';
import Odontograma from '../components/PatientRecord/Odontograma';
import Consentimiento from '../components/PatientRecord/Consentimiento';

// Importar servicios
import { getCompletePatientHistory, updatePatientData, updatePatientAnamnesis, updateOdontograma, updateConsent, getOdontogramaVersions, getOdontogramaByVersion, updateTreatments } from '../services/patientService';

// Importar estilos
import '../styles/PatientRecord.css';

// Función para formatear fechas (muestra fecha u fecha+hora según el valor guardado)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const hasTime = /T|:/.test(String(dateString));
    if (hasTime) {
      return date.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return dateString;
  }
};

// Convierte una fecha/fecha-hora a formato compatible con `datetime-local` (YYYY-MM-DDTHH:mm)
const toDateTimeLocal = (dateString) => {
  if (!dateString) return new Date().toISOString().slice(0, 16);
  try {
    const d = new Date(dateString);
    if (isNaN(d)) return new Date().toISOString().slice(0, 16);
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  } catch {
    return new Date().toISOString().slice(0, 16);
  }
};

// Función para normalizar booleanos desde BD (que pueden venir como string, número o booleano)
const normalizeBool = (value) => {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 'TRUE';
};

const History = ({ setIsAuthenticated, user, setUser }) => {
  const [activeTab, setActiveTab] = useState('datos');
  const [activeNav, setActiveNav] = useState('patients');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const { id: patientId } = useParams();

  useEffect(() => {
    document.title = 'Historial del Paciente';
  }, []);
  const patient = location.state?.patient;

  // Estado para detectar cambios no guardados
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [anamnesisId, setAnamnesisId] = useState(null);
  const [newTreatment, setNewTreatment] = useState({
    date: '',
    code: '',
    tooth_elements: '',
    faces: '',
    observations: ''
  });

  // Datos del paciente
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

  // Anamnesis data
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

  // Consent data
  const [consentData, setConsentData] = useState({
    accepted: false,
    datetime: new Date().toISOString().slice(0, 16),
    doctorName: '',
    doctorMatricula: '',
    text: ''
  });

  // Odontograma data
  const [odontogramaData, setOdontogramaData] = useState({
    adult: { teethState: {}, connections: [] },
    child: { teethState: {}, connections: [] },
    observaciones: '',
    elementos_dentarios: '',
    version: 1,
    treatments: []
  });

  // Estado para versiones de odontograma
  const [odontogramaVersions, setOdontogramaVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [lastVersionNumber, setLastVersionNumber] = useState(1);

  // Estados para cambios por sección
  const [hasChangesPatient, setHasChangesPatient] = useState(false);
  const [hasChangesAnamnesis, setHasChangesAnamnesis] = useState(false);
  const [hasChangesOdontograma, setHasChangesOdontograma] = useState(false);
  const [hasChangesTreatments, setHasChangesTreatments] = useState(false);
  const [hasChangesConsent, setHasChangesConsent] = useState(false);

  // Rastrear qué sección mostró advertencia
  const [lastSectionWithWarning, setLastSectionWithWarning] = useState(null);

  const tabs = [
    { id: 'datos', label: 'Datos Personales', icon: <User size={20} /> },
    { id: 'anamnesis', label: 'Anamnesis', icon: <Briefcase size={20} /> },
    { id: 'odontograma', label: 'Odontograma', icon: <FileText size={20} /> },
    { id: 'tratamientos', label: 'Tratamientos', icon: <Clipboard size={20} /> },
    { id: 'consentimiento', label: 'Consentimiento', icon: <FileText size={20} /> }
  ];

  // Cargar datos del paciente al montar
  useEffect(() => {
    if (patientId && user) {
      loadPatientHistory();
    } else if (!patientId) {
      // Si no hay patientId, redirigir a la lista de pacientes
      navigate('/patients');
    }
  }, [patientId, user]);

  const loadPatientHistory = async () => {
    try {
      setLoading(true);
      const result = await getCompletePatientHistory(patientId, user.id);

      if (result.success) {
        const data = result.data;

        // Verificar que tenemos datos del paciente
        if (!data.patient) {
          setMessage({ type: 'error', text: 'Paciente no encontrado' });
          return;
        }

        // Si no hay historial, inicializar con datos vacíos pero mostrar mensaje
        const hasHistory = data.anamnesis || data.odontograma || data.consent;
        if (!hasHistory) {
          setMessage({
            type: 'warning',
            text: 'Este paciente no tiene historial clínico registrado. Puede comenzar a editar los datos.'
          });
        }

        // Cargar datos del paciente
        setPatientData({
          name: data.patient.name,
          lastname: data.patient.lastname,
          dni: data.patient.dni,
          birthDate: data.patient.birthdate,
          phone: data.patient.tel,
          email: data.patient.email,
          address: data.patient.address,
          occupation: data.patient.occupation,
          healthInsurance: {
            number: data.patient.affiliate_number,
            isHolder: data.patient.holder
          },
          dentalObservations: '',
          elements: '1'
        });

        // Cargar anamnesis
        if (data.anamnesis) {
          let diseases = {};
          try {
            if (data.anamnesis.antecedentes) {
              if (typeof data.anamnesis.antecedentes === 'object') {
                diseases = data.anamnesis.antecedentes;
              } else {
                diseases = JSON.parse(data.anamnesis.antecedentes);
              }
            }
          } catch (jsonError) {
            console.warn('Error parsing antecedentes JSON:', jsonError);
            console.log('Raw antecedentes data:', data.anamnesis.antecedentes);
            diseases = {};
          }

          // Normalizar booleanos de enfermedades
          const normalizedDiseases = {};
          for (const [key, value] of Object.entries(diseases)) {
            normalizedDiseases[key] = normalizeBool(value);
          }

          setAnamnesisData({
            primaryDoctor: data.anamnesis.medico_cabecera || '',
            primaryDoctorPhone: data.anamnesis.medico_tel || '',
            primaryService: data.anamnesis['servicio cabecera'] || '',
            allergies: {
              hasAllergies: normalizeBool(data.anamnesis.alergico),
              description: data.anamnesis.alergias_descripcion || ''
            },
            currentTreatment: {
              underTreatment: normalizeBool(data.anamnesis.tratamiento_medico),
              description: ''
            },
            hospitalization: {
              wasHospitalized: normalizeBool(data.anamnesis.hospitalizado_ultimo_anio),
              reason: data.anamnesis.hospitalizacion_motivo || ''
            },
            healingProblems: normalizeBool(data.anamnesis.problemas_cicatrizacion),
            bloodType: data.anamnesis.grupo_sanguineo || '',
            bloodRh: data.anamnesis.rh || '',
            takesMedication: normalizeBool(data.anamnesis.medicamento),
            medication: data.anamnesis.medicamento_detalles || '',
            isPregnant: normalizeBool(data.anamnesis.embarazada),
            pregnancyTime: data.anamnesis.tiempo_gestacional || '',
            obstetrician: data.anamnesis.obstetra || '',
            obstetricianPhone: data.anamnesis.obstetra_tel || '',
            diseases: normalizedDiseases,
            observations: data.anamnesis.observaciones || ''
          });
          setAnamnesisId(data.anamnesis.id);
        }

        // Cargar odontograma
        if (data.odontograma) {
          setOdontogramaData(data.odontograma);
        } else {
          // Si no hay odontograma, usar valores por defecto
          setOdontogramaData({
            adult: { teethState: {}, connections: [] },
            child: { teethState: {}, connections: [] },
            observaciones: '',
            elementos_dentarios: '',
            version: 1,
            treatments: []
          });
        }

        // Cargar consentimiento (normalizar para input datetime-local)
        if (data.consent) {
          setConsentData({
            accepted: data.consent.accepted,
            datetime: toDateTimeLocal(data.consent.datetime),
            doctorName: data.consent.doctorName || user?.name || '',
            doctorMatricula: data.consent.doctorMatricula || user?.tuition || '',
            text: data.consent.text
          });
        }

        // Cargar tratamientos
        setOdontogramaData(prev => ({ ...prev, treatments: data.treatments || [] }));

        // Cargar versiones de odontograma
        const versionsResult = await getOdontogramaVersions(patientId, user.id);
        if (versionsResult.success) {
          setOdontogramaVersions(versionsResult.data);
          setCurrentVersion(data.odontograma ? data.odontograma.version : 1);
          // Guardar el número de la última versión
          const maxVersion = Math.max(...versionsResult.data.map(v => v.version || 0), 1);
          setLastVersionNumber(maxVersion);
        }

        // Guardar datos originales para detectar cambios
        setOriginalData({
          patient: {
            tel: data.patient.tel,
            email: data.patient.email,
            address: data.patient.address,
            occupation: data.patient.occupation,
            affiliate_number: data.patient.affiliate_number || '',
            holder: data.patient.holder || false
          },
          anamnesis: data.anamnesis ? (() => {
            let diseases = {};
            try {
              if (typeof data.anamnesis.antecedentes === 'object') {
                diseases = data.anamnesis.antecedentes;
              } else {
                diseases = JSON.parse(data.anamnesis.antecedentes);
              }
            } catch (e) {
              diseases = {};
            }
            
            // Normalizar booleanos en enfermedades
            const normalizedDiseases = {};
            for (const [key, value] of Object.entries(diseases)) {
              normalizedDiseases[key] = normalizeBool(value);
            }
            
            return {
              primaryDoctor: data.anamnesis.medico_cabecera || '',
              primaryDoctorPhone: data.anamnesis.medico_tel || '',
              primaryService: data.anamnesis['servicio cabecera'] || '',
              allergies: {
                hasAllergies: normalizeBool(data.anamnesis.alergico),
                description: data.anamnesis.alergias_descripcion || ''
              },
              currentTreatment: {
                underTreatment: normalizeBool(data.anamnesis.tratamiento_medico),
                description: ''
              },
              hospitalization: {
                wasHospitalized: normalizeBool(data.anamnesis.hospitalizado_ultimo_anio),
                reason: data.anamnesis.hospitalizacion_motivo || ''
              },
              healingProblems: normalizeBool(data.anamnesis.problemas_cicatrizacion),
              bloodType: data.anamnesis.grupo_sanguineo || '',
              bloodRh: data.anamnesis.rh || '',
              takesMedication: normalizeBool(data.anamnesis.medicamento),
              medication: data.anamnesis.medicamento_detalles || '',
              isPregnant: normalizeBool(data.anamnesis.embarazada),
              pregnancyTime: data.anamnesis.tiempo_gestacional || '',
              obstetrician: data.anamnesis.obstetra || '',
              obstetricianPhone: data.anamnesis.obstetra_tel || '',
              diseases: normalizedDiseases,
              observations: data.anamnesis.observaciones || ''
            };
          })() : null,
          odontograma: data.odontograma ? {
            adult: data.odontograma.adult || { teethState: {}, connections: [] },
            child: data.odontograma.child || { teethState: {}, connections: [] },
            observaciones: data.odontograma.observaciones || '',
            elementos_dentarios: data.odontograma.elementos_dentarios || '',
            version: data.odontograma.version || 1,
            treatments: (data.treatments && Array.isArray(data.treatments)) ? data.treatments : []
          } : null,
          consent: data.consent ? {
            accepted: data.consent.accepted,
            datetime: toDateTimeLocal(data.consent.datetime),
            doctorName: user?.name || '',
            doctorMatricula: user?.tuition || '',
            text: data.consent.text
          } : null
        });
        setHasUnsavedChanges(false);
      } else {
        setMessage({ type: 'error', text: 'Error al cargar el historial: ' + result.error });
      }
    } catch (error) {
      console.error('Error loading patient history:', error);
      console.log('Patient ID:', patientId);
      console.log('User ID:', user?.id);

      let errorMessage = 'Error al cargar el historial clínico';
      if (error.message.includes('JSON')) {
        errorMessage = 'Error al procesar los datos del historial. Algunos datos pueden estar corruptos.';
      } else if (error.message.includes('not found') || error.message.includes('No rows')) {
        errorMessage = 'El historial clínico de este paciente no existe aún.';
      }

      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('Tiene cambios sin guardar. ¿Está seguro de que quiere salir?');
      if (!confirm) return;
    }
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Detectar cambios no guardados
  useEffect(() => {
    const checkForChanges = () => {
      if (!originalData.patient) return false;

      // Comparar datos del paciente
      const patientChanged = JSON.stringify({
        tel: patientData.phone,
        email: patientData.email,
        address: patientData.address,
        occupation: patientData.occupation,
        affiliate_number: patientData.healthInsurance?.number || '',
        holder: patientData.healthInsurance?.isHolder || false
      }) !== JSON.stringify(originalData.patient);

      // Comparar anamnesis
      const anamnesisChanged = originalData.anamnesis ?
        JSON.stringify(anamnesisData) !== JSON.stringify(originalData.anamnesis) : false;

      // Comparar odontograma (sin tratamientos)
      const odontogramaChanged = originalData.odontograma ?
        JSON.stringify({ ...odontogramaData, treatments: [] }) !== JSON.stringify({ ...originalData.odontograma, treatments: [] }) : false;

      // Comparar tratamientos
      const originalTreatments = originalData.odontograma?.treatments || [];
      const treatmentsChanged = JSON.stringify(odontogramaData.treatments || []) !== JSON.stringify(originalTreatments);

      // Comparar consentimiento
      const consentChanged = originalData.consent ?
        JSON.stringify(consentData) !== JSON.stringify(originalData.consent) : false;

      // Actualizar estados de cambios
      setHasChangesPatient(patientChanged);
      setHasChangesAnamnesis(anamnesisChanged);
      setHasChangesOdontograma(odontogramaChanged);
      setHasChangesTreatments(treatmentsChanged);
      setHasChangesConsent(consentChanged);

      const hasChanges = patientChanged || anamnesisChanged || odontogramaChanged || treatmentsChanged || consentChanged;
      setHasUnsavedChanges(hasChanges);
    };

    checkForChanges();
  }, [patientData, anamnesisData, odontogramaData, consentData, originalData]);

  // Prevenir navegación si hay cambios no guardados
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleTabChange = (newTab) => {
    // Obtener el estado de cambios de la sección actual
    const getSectionChanges = (tab) => {
      switch (tab) {
        case 'datos': return hasChangesPatient;
        case 'anamnesis': return hasChangesAnamnesis;
        case 'odontograma': return hasChangesOdontograma;
        case 'tratamientos': return hasChangesTreatments;
        case 'consentimiento': return hasChangesConsent;
        default: return false;
      }
    };

    const currentSectionHasChanges = getSectionChanges(activeTab);
    const newSectionHasChanges = getSectionChanges(newTab);

    // Si la sección actual tiene cambios y es diferente a la que mostró advertencia antes, mostrar alerta
    if (currentSectionHasChanges && lastSectionWithWarning !== activeTab) {
      const confirm = window.confirm('Tiene cambios sin guardar en la sección actual. ¿Está seguro de que quiere cambiar de sección? Los cambios se perderán.');
      if (!confirm) return;
      // Marcar esta sección como ya advertida
      setLastSectionWithWarning(activeTab);
    }

    // Si la nueva sección no tiene cambios, limpiar el historial de advertencia
    if (!newSectionHasChanges) {
      setLastSectionWithWarning(null);
    }

    setActiveTab(newTab);
  };

  const handleVersionChange = async (version) => {
    try {
      const result = await getOdontogramaByVersion(patientId, version, user.id);
      if (result.success) {
        // Cargar la versión - result.data es el odontograma, no contiene tratamientos
        // Los tratamientos se cargaron previamente en odontogramaData y no cambian al cambiar versión
        setOdontogramaData(prev => ({
          ...result.data,
          treatments: prev.treatments  // Mantener los tratamientos actuales
        }));
        setCurrentVersion(version);
        // No marcar como cambio sin guardar cuando cambias de versión
        setHasChangesOdontograma(false);
        // Actualizar originalData para evitar cambios no guardados falsos
        setOriginalData(prev => ({
          ...prev,
          odontograma: {
            ...result.data,
            treatments: prev.odontograma?.treatments || []
          }
        }));
      } else {
        setMessage({ type: 'error', text: 'Error al cargar la versión: ' + result.error });
      }
    } catch (error) {
      console.error('Error changing version:', error);
      setMessage({ type: 'error', text: 'Error al cambiar versión' });
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      // Actualizar datos del paciente (solo editables)
      const patientUpdate = await updatePatientData(patientId, patientData);
      if (!patientUpdate.success) {
        throw new Error('Error al actualizar datos del paciente: ' + patientUpdate.error);
      }

      // Actualizar anamnesis
      const anamnesisUpdate = await updatePatientAnamnesis(patientId, anamnesisData, user.id, anamnesisId);
      if (!anamnesisUpdate.success) {
        throw new Error('Error al actualizar anamnesis: ' + anamnesisUpdate.error);
      }

      // Actualizar odontograma
      const odontogramaVersion = (odontogramaData.version || 1) + 1;
      const odontogramaUpdate = await updateOdontograma(patientId, { ...odontogramaData, version: odontogramaVersion }, user.id);
      if (!odontogramaUpdate.success) {
        throw new Error('Error al actualizar odontograma: ' + odontogramaUpdate.error);
      }

      // Actualizar consentimiento
      const consentUpdate = await updateConsent(patientId, consentData);
      if (!consentUpdate.success) {
        throw new Error('Error al actualizar consentimiento: ' + consentUpdate.error);
      }

      // Actualizar datos originales
      setOriginalData({
        patient: { tel: patientData.phone, email: patientData.email, address: patientData.address, occupation: patientData.occupation, affiliate_number: patientData.healthInsurance?.number || '', holder: patientData.healthInsurance?.isHolder || false },
        anamnesis: { ...anamnesisData },
        odontograma: { ...odontogramaData, version: odontogramaVersion },
        consent: { ...consentData }
      });

      setHasUnsavedChanges(false);

      setMessage({ type: 'success', text: 'Historial clínico actualizado exitosamente' });
    } catch (error) {
      console.error('Error saving history:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSection = async (section) => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      switch (section) {
        case 'datos':
          const patientUpdate = await updatePatientData(patientId, patientData);
          if (!patientUpdate.success) {
            throw new Error('Error al actualizar datos del paciente: ' + patientUpdate.error);
          }
          setOriginalData(prev => ({ ...prev, patient: { tel: patientData.phone, email: patientData.email, address: patientData.address, occupation: patientData.occupation, affiliate_number: patientData.healthInsurance?.number || '', holder: patientData.healthInsurance?.isHolder || false } }));
          setHasUnsavedChanges(false);
          break;

        case 'anamnesis':
          const anamnesisUpdate = await updatePatientAnamnesis(patientId, anamnesisData, user.id, anamnesisId);
          if (!anamnesisUpdate.success) {
            throw new Error('Error al actualizar anamnesis: ' + anamnesisUpdate.error);
          }
          setOriginalData(prev => ({ ...prev, anamnesis: { ...anamnesisData } }));
          setHasUnsavedChanges(false);
          break;

        case 'odontograma':
          // Incrementar versión antes de guardar
          const newVersion = (odontogramaData.version || 1) + 1;
          const odontogramaToSave = { ...odontogramaData, version: newVersion };
          const odontogramaUpdate = await updateOdontograma(patientId, odontogramaToSave, user.id, false);
          if (!odontogramaUpdate.success) {
            throw new Error('Error al actualizar odontograma: ' + odontogramaUpdate.error);
          }
          // Actualizar el estado con la nueva versión
          setOdontogramaData(odontogramaToSave);
          setOriginalData(prev => ({ ...prev, odontograma: { ...odontogramaToSave } }));
          setHasUnsavedChanges(false);
          break;

        case 'tratamientos':
          const treatmentsUpdate = await updateTreatments(patientId, odontogramaData.treatments);
          if (!treatmentsUpdate.success) {
            throw new Error('Error al actualizar tratamientos: ' + treatmentsUpdate.error);
          }
          setOriginalData(prev => ({ ...prev, odontograma: { ...prev.odontograma, treatments: [...odontogramaData.treatments] } }));
          setHasUnsavedChanges(false);
          break;

        case 'consentimiento':
          const consentUpdate = await updateConsent(patientId, consentData);
          if (!consentUpdate.success) {
            throw new Error('Error al actualizar consentimiento: ' + consentUpdate.error);
          }
          setOriginalData(prev => ({ ...prev, consent: { ...consentData } }));
          setHasUnsavedChanges(false);
          break;
      }

      setMessage({ type: 'success', text: `Sección ${section} guardada exitosamente` });
    } catch (error) {
      console.error(`Error saving ${section}:`, error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'datos':
        return (
          <div>
            <div className="section-header">
              <button
                className="btn-primary small"
                onClick={() => handleSaveSection('datos')}
                disabled={saving || !hasChangesPatient}
              >
                <Save size={16} />
                Guardar Datos
              </button>
            </div>
            <DatosPersonales
              patientData={patientData}
              setPatientData={setPatientData}
              readOnlyFields={['name', 'lastname', 'dni', 'birthDate']}
            />
          </div>
        );
      case 'anamnesis':
        return (
          <div>
            <div className="section-header">
              <button
                className="btn-primary small"
                onClick={() => handleSaveSection('anamnesis')}
                disabled={saving || !hasChangesAnamnesis}
              >
                <Save size={16} />
                Guardar Anamnesis
              </button>
            </div>
            <Anamnesis
              anamnesisData={anamnesisData}
              setAnamnesisData={setAnamnesisData}
            />
          </div>
        );
      case 'odontograma':
        return (
          <div>
            <div className="section-header">
              <div className="version-selector">
                <label>Versión: </label>
                <select
                  value={currentVersion}
                  onChange={(e) => handleVersionChange(parseInt(e.target.value))}
                >
                  {odontogramaVersions.map(version => (
                    <option key={version} value={version}>Versión {version}</option>
                  ))}
                </select>
              </div>
              <button
                className="btn-primary small"
                onClick={() => handleSaveSection('odontograma')}
                disabled={saving || !hasChangesOdontograma}
              >
                <Save size={16} />
                Guardar Odontograma
              </button>
            </div>
            <div className="odontograma-section">
              <Odontograma
                initialData={odontogramaData}
                onDataChange={setOdontogramaData}
                isReadOnly={currentVersion !== odontogramaVersions[0]}
              />
            </div>
          </div>
        );
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
                      <td>{formatDate(treatment.date)}</td>
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
                        onChange={(e) => setNewTreatment({ ...newTreatment, date: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={newTreatment.code}
                        onChange={(e) => setNewTreatment({ ...newTreatment, code: e.target.value.slice(0, 30) })}
                        maxLength="30"
                        placeholder="Máx 30 caracteres"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={newTreatment.tooth_elements}
                        onChange={(e) => setNewTreatment({ ...newTreatment, tooth_elements: e.target.value.slice(0, 30) })}
                        maxLength="30"
                        placeholder="Máx 30 caracteres"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={newTreatment.faces}
                        onChange={(e) => setNewTreatment({ ...newTreatment, faces: e.target.value.slice(0, 30) })}
                        maxLength="30"
                        placeholder="Máx 30 caracteres"
                      />
                    </td>
                    <td>
                      <textarea
                        value={newTreatment.observations}
                        onChange={(e) => setNewTreatment({ ...newTreatment, observations: e.target.value.slice(0, 500) })}
                        maxLength="500"
                        rows="2"
                        placeholder="Máx 500 caracteres"
                      ></textarea>
                    </td>
                  </tr>
                </tbody>
              </table>
              {(newTreatment.code || newTreatment.tooth_elements || newTreatment.faces || newTreatment.observations) && (
                <button
                  className="btn-primary small"
                  onClick={async () => {
                    try {
                      setSaving(true);
                      const treatmentToAdd = {
                        date: newTreatment.date || new Date().toISOString().split('T')[0],
                        code: newTreatment.code,
                        tooth_elements: newTreatment.tooth_elements,
                        faces: newTreatment.faces,
                        observations: newTreatment.observations
                      };
                      const updatedTreatments = [...odontogramaData.treatments, treatmentToAdd];
                      const result = await updateTreatments(patientId, updatedTreatments);
                      if (result.success) {
                        setOdontogramaData(prev => ({ ...prev, treatments: updatedTreatments }));
                        setOriginalData(prev => ({ ...prev, odontograma: { ...prev.odontograma, treatments: updatedTreatments } }));
                        setNewTreatment({ date: '', code: '', tooth_elements: '', faces: '', observations: '' });
                        setHasChangesTreatments(false);
                        setMessage({ type: 'success', text: 'Tratamiento guardado exitosamente' });
                      } else {
                        setMessage({ type: 'error', text: 'Error al guardar tratamiento: ' + result.error });
                      }
                    } catch (error) {
                      setMessage({ type: 'error', text: 'Error al guardar tratamiento: ' + error.message });
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                >
                  Guardar Tratamiento
                </button>
              )}
            </div>
          </div>
        );
      case 'consentimiento':
        return (
          <div>
            <div className="section-header">
              <button
                className="btn-primary small"
                onClick={() => handleSaveSection('consentimiento')}
                disabled={saving || !hasChangesConsent}
              >
                <Save size={16} />
                Guardar Consentimiento
              </button>
            </div>
            <Consentimiento
              patientData={patientData}
              user={user}
              consentData={consentData}
              setConsentData={setConsentData}
              initialText={consentData.text}
              isHistoryMode={true}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="app">
        <NavBar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          user={user}
          handleLogout={handleLogout}
        />
        <main className="main-content">
          <div className="loading-container-inline">
            <div className="loading-spinner"></div>
            <p>Cargando historial clínico...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <NavBar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        user={user}
        handleLogout={handleLogout}
      />

      <main className="main-content">
        <div className="patient-record">
          {/* Header */}
          <div className="content-header">
            <div className="patient-header">
              <button
                className="btn-back"
                onClick={() => {
                  if (hasUnsavedChanges) {
                    const confirm = window.confirm('Tiene cambios sin guardar. ¿Está seguro de que quiere volver?');
                    if (!confirm) return;
                  }
                  navigate('/patients');
                }}
                title="Volver a pacientes"
              >
                <ArrowLeft size={20} />
              </button>
              <h1>Historial Clínico</h1>
              <div className="patient-subtitle">
                <span className="patient-name">{patientData.name} {patientData.lastname}</span>
                <span className="patient-id">DNI: {patientData.dni}</span>
              </div>
            </div>
            <div className="header-actions">
              <button
                className="btn-primary"
                onClick={handleSaveAll}
                disabled={saving || !hasUnsavedChanges}
              >
                <Save size={16} />
                {saving ? 'Guardando...' : 'Guardar Todo'}
              </button>
            </div>
          </div>

          {/* Indicador de cambios no guardados */}
          {hasUnsavedChanges && (
            <div className="unsaved-changes-indicator">
              Tiene cambios sin guardar
            </div>
          )}

          {/* Mensajes */}
          {message.text && (
            <div className={`message-alert message-${message.type}`}>
              {message.type === 'error' && <span>❌</span>}
              {message.type === 'success' && <span>✅</span>}
              <p>{message.text}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="record-tabs">
            {tabs.map(tab => {
              const getTabChanges = (tabId) => {
                switch (tabId) {
                  case 'datos': return hasChangesPatient;
                  case 'anamnesis': return hasChangesAnamnesis;
                  case 'odontograma': return hasChangesOdontograma;
                  case 'tratamientos': return hasChangesTreatments;
                  case 'consentimiento': return hasChangesConsent;
                  default: return false;
                }
              };

              const tabHasChanges = getTabChanges(tab.id);

              return (
                <button
                  key={tab.id}
                  className={`record-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                  title={tabHasChanges ? 'Cambios sin guardar en esta sección' : ''}
                >
                  {tab.icon}
                  {tab.label}
                  {tabHasChanges && <span className="unsaved-badge">⚠</span>}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="record-content">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default History;