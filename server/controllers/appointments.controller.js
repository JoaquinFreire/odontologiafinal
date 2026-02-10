const pool = require('../config/database');

// Convertir hora local (Argentina UTC-3) a UTC
// dateStr: "2026-02-10", timeStr: "21:00" → UTC datetime string
const convertArgentinaToUTC = (dateStr, timeStr) => {
  // Crear fecha en zona local (Argentina UTC-3)
  const localDate = new Date(`${dateStr}T${timeStr}:00`);
  // Convertir a UTC: sumar 3 horas (ya que UTC-3 significa estar 3 horas atrás)
  const utcDate = new Date(localDate.getTime() + 3 * 60 * 60 * 1000);
  // Retornar en formato "YYYY-MM-DD HH:MM:SS" para MySQL
  return utcDate.toISOString().slice(0, 19).replace('T', ' ');
};

// Convertir datetime de MySQL (UTC) a ISO format con Z para que JavaScript lo interprete como UTC
const convertMySQLDateToISO = (datetimeStr) => {
  if (!datetimeStr) return null;
  // Si es una cadena tipo "2026-02-11 00:00:00", convertir a ISO "2026-02-11T00:00:00Z"
  if (typeof datetimeStr === 'string') {
    return datetimeStr.replace(' ', 'T') + 'Z';
  }
  // Si ya es un Date object de MySQL, convertir a ISO
  if (datetimeStr instanceof Date) {
    return datetimeStr.toISOString();
  }
  return datetimeStr;
};

// Obtener turnos de hoy
const getTodayAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [appointments] = await pool.execute(
      'SELECT * FROM shift WHERE user_id = ? AND datetime >= ? AND datetime < ? AND status = false ORDER BY datetime ASC',
      [userId, startOfDay.toISOString(), endOfDay.toISOString()]
    );

    const appointmentsWithISODates = appointments.map(app => ({
      ...app,
      datetime: convertMySQLDateToISO(app.datetime)
    }));

    res.json(appointmentsWithISODates);
  } catch (error) {
    console.error('Error obteniendo turnos de hoy:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener turnos atrasados
const getOverdueAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [appointments] = await pool.execute(
      'SELECT * FROM shift WHERE user_id = ? AND datetime < ? AND status = false ORDER BY datetime DESC',
      [userId, startOfDay.toISOString()]
    );

    const appointmentsWithISODates = appointments.map(app => ({
      ...app,
      datetime: convertMySQLDateToISO(app.datetime)
    }));

    res.json(appointmentsWithISODates);
  } catch (error) {
    console.error('Error obteniendo turnos atrasados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener total de turnos pendientes
const getTotalPendingAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await pool.execute(
      'SELECT COUNT(*) as total FROM shift WHERE user_id = ? AND status = false',
      [userId]
    );

    res.json(result[0].total);
  } catch (error) {
    console.error('Error obteniendo total de turnos pendientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Marcar turno como completado
const markAppointmentAsCompleted = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await pool.execute(
      'UPDATE shift SET status = true WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    res.json({ message: 'Turno marcado como completado' });
  } catch (error) {
    console.error('Error marcando turno como completado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear turno
const createAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, date, time, dni, type } = req.body;

    const datetime = convertArgentinaToUTC(date, time);

    const [result] = await pool.execute(
      'INSERT INTO shift (name, datetime, dni, type, status, user_id) VALUES (?, ?, ?, ?, false, ?)',
      [name, datetime, dni || null, type, userId]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      datetime: convertMySQLDateToISO(datetime),
      dni,
      type,
      status: false
    });
  } catch (error) {
    console.error('Error creando turno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener todos los turnos pendientes
const getAllPendingAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    const [appointments] = await pool.execute(
      'SELECT * FROM shift WHERE user_id = ? AND status = false ORDER BY datetime ASC',
      [userId]
    );

    // Convertir datetime a ISO format para que JavaScript lo interprete como UTC
    const appointmentsWithISODates = appointments.map(app => ({
      ...app,
      datetime: convertMySQLDateToISO(app.datetime)
    }));

    res.json(appointmentsWithISODates);
  } catch (error) {
    console.error('Error obteniendo turnos pendientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener turno por ID
const getAppointmentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [appointments] = await pool.execute(
      'SELECT * FROM shift WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    const appointment = appointments[0];
    appointment.datetime = convertMySQLDateToISO(appointment.datetime);

    res.json(appointment);
  } catch (error) {
    console.error('Error obteniendo turno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar turno
const updateAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, date, time, dni, type } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (date && time) {
      updateFields.push('datetime = ?');
      updateValues.push(convertArgentinaToUTC(date, time));
    }
    if (dni !== undefined) {
      updateFields.push('dni = ?');
      updateValues.push(dni);
    }
    if (type !== undefined) {
      updateFields.push('type = ?');
      updateValues.push(type);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    updateValues.push(id, userId);

    const [result] = await pool.execute(
      `UPDATE shift SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    res.json({ message: 'Turno actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando turno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar turno
const deleteAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM shift WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    res.json({ message: 'Turno eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando turno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getTodayAppointments,
  getOverdueAppointments,
  getTotalPendingAppointments,
  markAppointmentAsCompleted,
  createAppointment,
  getAllPendingAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
};