/**
 * Obtiene el inicio del día actual (00:00:00) en ISO string
 * Compensando correctamente por la zona horaria local
 * Ejemplo: si es 25/04/2024 21:00 en Argentina (UTC-3)
 * retorna 2024-04-25T03:00:00.000Z (que es 00:00 local)
 */
export const getStartOfTodayUTC = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  
  // Crear fecha local: 25/04/2024 00:00:00
  const startOfDayLocal = new Date(year, month, date, 0, 0, 0, 0);
  
  // Compensar el offset de zona horaria
  const offset = startOfDayLocal.getTimezoneOffset() * 60000;
  const startOfDayUTC = new Date(startOfDayLocal.getTime() - offset);
  
  return startOfDayUTC.toISOString();
};

/**
 * Obtiene el final del día actual (23:59:59) en ISO string
 * Compensando correctamente por la zona horaria local
 * Ejemplo: si es 25/04/2024 21:00 en Argentina (UTC-3)
 * retorna 2024-04-26T02:59:59.000Z (que es 23:59:59 local)
 */
export const getEndOfTodayUTC = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  
  // Crear fecha local: 26/04/2024 00:00:00 (principio del día siguiente)
  const endOfDayLocal = new Date(year, month, date + 1, 0, 0, 0, 0);
  
  // Compensar el offset de zona horaria
  const offset = endOfDayLocal.getTimezoneOffset() * 60000;
  const endOfDayUTC = new Date(endOfDayLocal.getTime() - offset);
  
  return endOfDayUTC.toISOString();
};

/**
 * Obtiene el inicio del día actual en zona horaria local
 * Retorna un objeto Date local, NO UTC
 */
export const getStartOfTodayLocal = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
};

/**
 * Convierte un string ISO a fecha local
 */
export const parseISOToLocal = (isoString) => {
  return new Date(isoString);
};

/**
 * Obtiene la fecha LOCAL de un turno en formato YYYY-MM-DD
 * Ejemplo: un turno con datetime "2024-04-26T03:00:00.000Z" (que es 26/04 00:00 local en UTC-3)
 * retorna "2024-04-26"
 */
export const getAppointmentDateLocal = (isoDateTimeString) => {
  const appointmentDate = new Date(isoDateTimeString);
  // getFullYear(), getMonth(), getDate() devuelven la fecha/hora en zona horaria LOCAL del navegador
  const year = appointmentDate.getFullYear();
  const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
  const day = String(appointmentDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Obtiene la hora LOCAL de un turno en formato HH:MM
 * Ejemplo: un turno con datetime "2024-04-26T03:00:00.000Z" (que es 26/04 00:00 local en UTC-3)
 * retorna "00:00"
 */
export const getAppointmentTimeLocal = (isoDateTimeString) => {
  const appointmentDate = new Date(isoDateTimeString);
  // getHours() y getMinutes() devuelven la hora/minutos en zona horaria LOCAL del navegador
  const hours = String(appointmentDate.getHours()).padStart(2, '0');
  const minutes = String(appointmentDate.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
