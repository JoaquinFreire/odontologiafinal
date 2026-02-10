/* eslint-disable no-unused-vars */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Función helper para obtener headers con token
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const appointmentService = {
  // Obtener turnos de hoy del usuario actual
  getTodayAppointments: async () => {
    try {
      
      const response = await fetch(`${API_BASE_URL}/appointments/today`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error obteniendo turnos de hoy');
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error obteniendo turnos de hoy:', error);
      return [];
    }
  },

  // Obtener turnos atrasados del usuario actual
  getOverdueAppointments: async () => {
    try {
      
      const response = await fetch(`${API_BASE_URL}/appointments/overdue`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error obteniendo turnos atrasados');
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error obteniendo turnos atrasados:', error);
      return [];
    }
  },

  // Obtener total de turnos pendientes del usuario actual
  getTotalPendingAppointments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/pending/total`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error obteniendo total de turnos pendientes');
      }

      const data = await response.json();
      console.log('Total pending:', data);

      return data;
    } catch (error) {
      console.error('Error obteniendo total de turnos pendientes:', error);
      return 0;
    }
  },

  // Marcar turno como atendido
  markAppointmentAsCompleted: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}/complete`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error marcando turno como completado');
      }

      const data = await response.json();
      console.log('Updated appointment:', data);

      return data;
    } catch (error) {
      console.error('Error marcando turno como atendido:', error);
      throw error;
    }
  },

  // Crear turno con user_id del usuario logueado
  createAppointment: async (appointmentData) => {
    try {
      console.log('=== CREANDO TURNO ===');
      console.log('Datos del turno:', appointmentData);

      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear turno');
      }

      const data = await response.json();
      console.log('Turno creado:', data);
      return { success: true, ...data };
    } catch (error) {
      console.error('=== ERROR EN createAppointment ===');
      console.error('Error completo:', error);
      throw error;
    }
  },

  // Obtener todos los turnos pendientes del usuario (para filtrar en frontend)
  getAllPendingAppointments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/pending`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error obteniendo turnos pendientes');
      }

      const data = await response.json();
      // Filtrar solo los turnos que NO están completados (status !== 1)
      const pendingOnly = data.filter(app => app.status !== 1);
      console.log('All pending appointments:', pendingOnly);

      return pendingOnly;
    } catch (error) {
      console.error('Error obteniendo turnos pendientes:', error);
      return [];
    }
  },

  // Obtener turnos del usuario actual (solo pendientes, desde hoy en adelante)
  getAppointments: async () => {
    try {
      console.log('=== OBTENIENDO TURNOS ===');

      // Usar la misma función que getAllPendingAppointments por ahora
      return await this.getAllPendingAppointments();
    } catch (error) {
      console.error('Error obteniendo turnos:', error);
      return [];
    }
  },

  // Obtener turno por ID
  getAppointmentById: async (id) => {
    try {
      console.log('=== OBTENIENDO TURNO POR ID ===');
      console.log('ID:', id);

      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error obteniendo turno');
      }

      const data = await response.json();
      console.log('Turno data:', data);

      return data;
    } catch (error) {
      console.error('Error obteniendo turno:', error);
      return null;
    }
  },

  // Actualizar turno
  updateAppointment: async (id, appointmentData) => {
    try {
      console.log('=== ACTUALIZANDO TURNO ===');
      console.log('ID:', id);
      console.log('Datos:', appointmentData);

      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error actualizando turno');
      }

      const data = await response.json();
      console.log('Turno actualizado:', data);

      return data;
    } catch (error) {
      console.error('Error actualizando turno:', error);
      throw error;
    }
  },

  // Eliminar turno
  deleteAppointment: async (id) => {
    try {
      console.log('=== ELIMINANDO TURNO ===');
      console.log('ID:', id);

      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error eliminando turno');
      }

      console.log('=== TURNO ELIMINADO EXITOSAMENTE ===');
      return true;
    } catch (error) {
      console.error('Error eliminando turno:', error);
      throw error;
    }
  },
};
