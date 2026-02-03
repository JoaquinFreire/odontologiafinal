const pool = require('../config/database');

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

    res.json(appointments);
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

    res.json(appointments);
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

    const datetime = `${date} ${time}:00`;

    const [result] = await pool.execute(
      'INSERT INTO shift (name, datetime, dni, type, status, user_id) VALUES (?, ?, ?, ?, false, ?)',
      [name, datetime, dni || null, type, userId]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      datetime,
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

    res.json(appointments);
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

    res.json(appointments[0]);
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
      updateValues.push(`${date} ${time}:00`);
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