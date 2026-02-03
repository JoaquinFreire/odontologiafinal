/* eslint-disable no-unused-vars */

import { supabase } from '../config/supabaseClient';
import { getStartOfTodayUTC, getEndOfTodayUTC } from '../utils/dateUtils';

export const appointmentService = {
  // Obtener turnos de hoy del usuario actual
  getTodayAppointments: async (userId) => {
    try {
      console.log('=== OBTENIENDO TURNOS DE HOY ===');
      console.log('User ID:', userId);
      
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      endOfDay.setMilliseconds(-1);

      console.log('Fecha inicio:', startOfDay.toISOString());
      console.log('Fecha fin:', endOfDay.toISOString());

      const { data, error } = await supabase
        .from('shift')
        .select('*')
        .eq('user_id', userId)
        .gte('datetime', startOfDay.toISOString())
        .lt('datetime', endOfDay.toISOString())
        .eq('status', false)
        .order('datetime', { ascending: true });

      console.log('Query error:', error);
      console.log('Today appointments:', data);

      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      console.error('Error obteniendo turnos de hoy:', error);
      return [];
    }
  },

  // Obtener turnos atrasados del usuario actual
  getOverdueAppointments: async (userId) => {
    try {
      console.log('=== OBTENIENDO TURNOS ATRASADOS ===');
      console.log('User ID:', userId);
      
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      console.log('Fecha límite:', startOfDay.toISOString());

      const { data, error } = await supabase
        .from('shift')
        .select('*')
        .eq('user_id', userId)
        .lt('datetime', startOfDay.toISOString())
        .eq('status', false)
        .order('datetime', { ascending: false });

      console.log('Query error:', error);
      console.log('Overdue appointments:', data);

      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      console.error('Error obteniendo turnos atrasados:', error);
      return [];
    }
  },

  // Obtener total de turnos pendientes del usuario actual
  getTotalPendingAppointments: async (userId) => {
    try {
      console.log('=== OBTENIENDO TOTAL DE TURNOS PENDIENTES ===');
      console.log('User ID:', userId);

      const { count, error } = await supabase
        .from('shift')
        .select('*', { count: 'exact' })
        .eq('user_id', userId) // ← Filtrar por usuario
        .eq('status', false);

      console.log('Query error:', error);
      console.log('Total pending:', count);

      if (error) throw new Error(error.message);
      return count || 0;
    } catch (error) {
      console.error('Error obteniendo total de turnos pendientes:', error);
      return 0;
    }
  },

  // Marcar turno como atendido
  markAppointmentAsCompleted: async (id, userId) => {
    try {
      console.log('=== MARCANDO TURNO COMO ATENDIDO ===');
      console.log('ID:', id);
      console.log('User ID:', userId);

      const { data, error } = await supabase
        .from('shift')
        .update({ status: true })
        .eq('id', id)
        .eq('user_id', userId) // ← Verificar que pertenece al usuario
        .select();

      console.log('Update error:', error);
      console.log('Updated appointment:', data);

      if (error) throw new Error(error.message);
      console.log('=== TURNO MARCADO COMO ATENDIDO ===');
      return data[0];
    } catch (error) {
      console.error('Error marcando turno como atendido:', error);
      throw error;
    }
  },

  // Crear turno con user_id del usuario logueado
  createAppointment: async (appointmentData, userId) => {
    try {
      console.log('=== CREANDO TURNO ===');
      console.log('Datos del turno:', appointmentData);
      console.log('User ID:', userId);

      const datetime = `${appointmentData.date} ${appointmentData.time}:00`;

      console.log('DateTime formateado:', datetime);

      const dataToInsert = {
        name: appointmentData.name,
        datetime: datetime,
        dni: appointmentData.dni || null,
        type: appointmentData.type,
        status: false,
        user_id: userId // ← Agregar user_id
      };

      console.log('Datos a insertar:', dataToInsert);

      const { data, error } = await supabase
        .from('shift')
        .insert([dataToInsert])
        .select();

      console.log('Insert error:', error);
      console.log('Insert data:', data);

      if (error) throw new Error(error.message || 'Error al crear turno');

      console.log('=== TURNO CREADO EXITOSAMENTE ===');
      console.log('Turno data:', data);
      return data[0];
    } catch (error) {
      console.error('=== ERROR EN createAppointment ===');
      console.error('Error completo:', error);
      throw error;
    }
  },

  // Obtener todos los turnos pendientes del usuario (para filtrar en frontend)
  getAllPendingAppointments: async (userId) => {
    try {
      console.log('=== OBTENIENDO TODOS LOS TURNOS PENDIENTES ===');
      console.log('User ID:', userId);

      const { data, error } = await supabase
        .from('shift')
        .select('*')
        .eq('user_id', userId)
        .eq('status', false)
        .order('datetime', { ascending: true });

      console.log('Query error:', error);
      console.log('All pending appointments:', data);

      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      console.error('Error obteniendo turnos pendientes:', error);
      return [];
    }
  },

  // Obtener turnos del usuario actual (solo pendientes, desde hoy en adelante)
  getAppointments: async (userId) => {
    try {
      console.log('=== OBTENIENDO TURNOS ===');
      console.log('User ID:', userId);

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // ✅ Solo traer turnos pendientes (status: false) a partir de hoy
      const { data, error } = await supabase
        .from('shift')
        .select('*')
        .eq('user_id', userId)
        .eq('status', false) // ← Solo pendientes
        .gte('datetime', startOfDay.toISOString()) // ← Desde hoy en adelante
        .order('datetime', { ascending: true });

      console.log('Query error:', error);
      console.log('Turnos data:', data);

      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      console.error('Error obteniendo turnos:', error);
      return [];
    }
  },

  // Obtener turno por ID
  getAppointmentById: async (id, userId) => {
    try {
      console.log('=== OBTENIENDO TURNO POR ID ===');
      console.log('ID:', id);
      console.log('User ID:', userId);

      const { data, error } = await supabase
        .from('shift')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId) // ← Verificar que pertenece al usuario
        .single();

      console.log('Query error:', error);
      console.log('Turno data:', data);

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Error obteniendo turno:', error);
      return null;
    }
  },

  // Actualizar turno
  updateAppointment: async (id, appointmentData, userId) => {
    try {
      console.log('=== ACTUALIZANDO TURNO ===');
      console.log('ID:', id);
      console.log('User ID:', userId);
      console.log('Datos:', appointmentData);

      const dataToUpdate = {};

      if (appointmentData.name) dataToUpdate.name = appointmentData.name;
      if (appointmentData.date && appointmentData.time) {
        dataToUpdate.datetime = `${appointmentData.date} ${appointmentData.time}:00`;
      }
      if (appointmentData.dni !== undefined) dataToUpdate.dni = appointmentData.dni;
      if (appointmentData.type) dataToUpdate.type = appointmentData.type;

      const { data, error } = await supabase
        .from('shift')
        .update(dataToUpdate)
        .eq('id', id)
        .eq('user_id', userId) // ← Verificar que pertenece al usuario
        .select();

      console.log('Update error:', error);
      console.log('Update data:', data);

      if (error) throw new Error(error.message);

      console.log('=== TURNO ACTUALIZADO EXITOSAMENTE ===');
      return data[0];
    } catch (error) {
      console.error('Error actualizando turno:', error);
      throw error;
    }
  },

  // Eliminar turno
  deleteAppointment: async (id, userId) => {
    try {
      console.log('=== ELIMINANDO TURNO ===');
      console.log('ID:', id);
      console.log('User ID:', userId);

      const { error } = await supabase
        .from('shift')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // ← Verificar que pertenece al usuario

      console.log('Delete error:', error);

      if (error) throw new Error(error.message);

      console.log('=== TURNO ELIMINADO EXITOSAMENTE ===');
      return true;
    } catch (error) {
      console.error('Error eliminando turno:', error);
      throw error;
    }
  },
};
