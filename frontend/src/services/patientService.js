/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const API_BASE_URL = 'http://localhost:3000/api';

// Función helper para obtener headers con token
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Guardar o actualizar un paciente
export const savePatient = async (patientData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error guardando paciente');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al guardar paciente:', error);
    return { success: false, error: error.message };
  }
};

// Obtener un paciente por ID
export const getPatient = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error obteniendo paciente');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    return { success: false, error: error.message };
  }
};

// Guardar paciente completo (paciente + anamnesis + consentimiento + odontograma)
export const saveCompletePatient = async (patientData, anamnesisData, consentData, odontogramaData) => {
  try {
    console.log('=== INICIANDO GUARDADO ===');

    // Validar datos del paciente
    if (!patientData.name || !patientData.lastname || !patientData.dni) {
      return {
        success: false,
        error: 'Nombre, Apellido y DNI son requeridos'
      };
    }

    // Validar que al menos una enfermedad esté marcada
    const hasAnyDisease = Object.values(anamnesisData.diseases).some(value => value === true);
    if (!hasAnyDisease) {
      return {
        success: false,
        error: 'Debe marcar al menos una condición en la anamnesis'
      };
    }

    // Validar consentimiento
    if (!consentData?.accepted) {
      return {
        success: false,
        error: 'Debe aceptar el consentimiento informado'
      };
    }

    const response = await fetch(`${API_BASE_URL}/patients/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        patientData,
        anamnesisData,
        consentData,
        odontogramaData
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error guardando paciente completo');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving complete patient:', error);
    return { success: false, error: error.message };
  }
};

// Obtener paciente con su anamnesis
export const getPatientWithAnamnesis = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/anamnesis`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error obteniendo paciente con anamnesis');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching patient with anamnesis:', error);
    return { success: false, error: error.message };
  }
};

// Actualizar anamnesis existente
export const updatePatientAnamnesis = async (patientId, anamnesisData, userId, anamnesisId = null) => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/anamnesis`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(anamnesisData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error actualizando anamnesis');
    }

    const data = await response.json();
    return { success: true, data: data };
  } catch (error) {
    console.error('Error updating anamnesis:', error);
    return { success: false, error: error.message };
  }
};

// Obtener todos los pacientes del usuario actual CON PAGINACIÓN
export const getAllPatients = async (page = 1, pageSize = 10) => {
  try {
    const url = new URL(`${API_BASE_URL}/patients`);
    url.searchParams.append('page', page);
    url.searchParams.append('pageSize', pageSize);

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error obteniendo pacientes');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    return { success: false, error: error.message };
  }
};

// Función auxiliar para calcular edad
export const calculateAge = (birthdate) => {
  if (!birthdate) return null;
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Obtener odontograma de un paciente (última versión)
export const getPatientOdontograma = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/odontograma`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error obteniendo odontograma');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener odontograma:', error);
    return { success: false, error: error.message };
  }
};

// Obtener consentimiento de un paciente
export const getPatientConsent = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/consent`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error obteniendo consentimiento');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener consentimiento:', error);
    return { success: false, error: error.message };
  }
};

// Obtener tratamientos de un paciente
export const getPatientTreatments = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/treatments`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error obteniendo tratamientos');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener tratamientos:', error);
    return { success: false, error: error.message };
  }
};

// Obtener historial clínico completo de un paciente
export const getCompletePatientHistory = async (patientId, userId) => {
  try {
    const patientResult = await getPatient(patientId, userId);
    if (!patientResult.success) return patientResult;

    const anamnesisResult = await getPatientWithAnamnesis(patientId, userId);
    const odontogramaResult = await getPatientOdontograma(patientId, userId);
    const consentResult = await getPatientConsent(patientId);
    const treatmentsResult = await getPatientTreatments(patientId);

    return {
      success: true,
      data: {
        patient: patientResult.data,
        anamnesis: anamnesisResult.anamnesis,
        odontograma: odontogramaResult.data,
        consent: consentResult.data,
        treatments: treatmentsResult.data
      }
    };
  } catch (error) {
    console.error('Error al obtener historial completo:', error);
    return { success: false, error: error.message };
  }
};

// Obtener odontograma por versión
export const getOdontogramaByVersion = async (patientId, version, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/odontograma/${version}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error obteniendo odontograma por versión');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener odontograma por versión:', error);
    return { success: false, error: error.message };
  }
};

// Actualizar datos del paciente (solo campos editables)
export const updatePatientData = async (patientId, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        tel: data.phone,
        email: data.email,
        address: data.address,
        occupation: data.occupation,
        affiliate_number: data.healthInsurance?.number,
        holder: data.healthInsurance?.isHolder
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error actualizando paciente');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    return { success: false, error: error.message };
  }
};

// Actualizar odontograma
export const updateOdontograma = async (patientId, odontogramaData, userId, saveTreatments = true) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/odontograma`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        adult: odontogramaData.adult,
        child: odontogramaData.child,
        observaciones: odontogramaData.observaciones,
        elementos_dentarios: odontogramaData.elementos_dentarios
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error actualizando odontograma');
    }

    const result = await response.json();

    // Si saveTreatments es true, actualizar tratamientos también
    if (saveTreatments && odontogramaData.treatments) {
      await updateTreatments(patientId, odontogramaData.treatments);
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Error al actualizar odontograma:', error);
    return { success: false, error: error.message };
  }
};

// Actualizar tratamientos
export const updateTreatments = async (patientId, treatments) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/treatments`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ treatments }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error actualizando tratamientos');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al actualizar tratamientos:', error);
    return { success: false, error: error.message };
  }
};

// Actualizar consentimiento
export const updateConsent = async (patientId, consentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/consent`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(consentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error actualizando consentimiento');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al actualizar consentimiento:', error);
    return { success: false, error: error.message };
  }
};

// Obtener versiones de odontograma de un paciente
// eslint-disable-next-line no-unused-vars
export const getOdontogramaVersions = async (patientId, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/odontograma/versions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error obteniendo versiones de odontograma');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener versiones de odontograma:', error);
    return { success: false, error: error.message };
  }
};
