const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Obtener headers con token desde localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No auth token found; user may be logged out');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Obtener todos los presupuestos de un paciente
export const getTreatmentBudgets = async (patientId) => {
  try {
    const response = await fetch(`${API_URL}/treatment-budgets/${patientId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      let errMsg = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errBody = await response.json();
        errMsg += ` - ${errBody.error || JSON.stringify(errBody)}`;
      } catch (e) {
        // ignore
      }
      throw new Error(errMsg);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Obtener un presupuesto específico con sus pagos
export const getTreatmentBudget = async (patientId, budgetId) => {
  try {
    const response = await fetch(`${API_URL}/treatment-budgets/${patientId}/${budgetId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Error fetching treatment budget');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Crear un nuevo presupuesto de tratamiento
export const createTreatmentBudget = async (patientId, budgetData) => {
  try {
    const response = await fetch(`${API_URL}/treatment-budgets/${patientId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(budgetData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error creating treatment budget');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Actualizar un presupuesto
export const updateTreatmentBudget = async (patientId, budgetId, budgetData) => {
  try {
    const response = await fetch(`${API_URL}/treatment-budgets/${patientId}/${budgetId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(budgetData)
    });

    if (!response.ok) {
      throw new Error('Error updating treatment budget');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Eliminar un presupuesto
export const deleteTreatmentBudget = async (patientId, budgetId) => {
  try {
    const response = await fetch(`${API_URL}/treatment-budgets/${patientId}/${budgetId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Error deleting treatment budget');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
