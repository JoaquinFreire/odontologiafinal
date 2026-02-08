const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Obtener headers con token desde localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No auth token found; user may be logged out');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Obtener todos los pagos de un presupuesto
export const getPayments = async (patientId, budgetId) => {
  try {
    const response = await fetch(`${API_URL}/treatment-budgets/${patientId}/${budgetId}/payments`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Error fetching payments');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Obtener un pago específico
export const getPayment = async (patientId, budgetId, paymentId) => {
  try {
    const response = await fetch(`${API_URL}/treatment-budgets/${patientId}/${budgetId}/payments/${paymentId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Error fetching payment');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Crear un nuevo pago
export const createPayment = async (patientId, budgetId, paymentData) => {
  try {
    const response = await fetch(`${API_URL}/treatment-budgets/${patientId}/${budgetId}/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error creating payment');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Actualizar un pago
export const updatePayment = async (patientId, budgetId, paymentId, paymentData) => {
  try {
    const response = await fetch(`${API_URL}/treatment-budgets/${patientId}/${budgetId}/payments/${paymentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error updating payment');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Eliminar un pago
export const deletePayment = async (patientId, budgetId, paymentId) => {
  try {
    const response = await fetch(`${API_URL}/treatment-budgets/${patientId}/${budgetId}/payments/${paymentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Error deleting payment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
