/**
 * Validadores y formateadores para formularios
 * Reutilizable en cualquier componente
 */

// Validar que solo contenga letras y espacios
export const validateOnlyLetters = (value) => {
  return /^[a-záéíóúñ\s]*$/i.test(value);
};

// Validar que solo contenga números
export const validateOnlyNumbers = (value) => {
  return /^\d*$/.test(value);
};

// Validar DNI: solo números, máximo 11
export const validateDNI = (value) => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length <= 11 && validateOnlyNumbers(cleaned);
};

// Validar teléfono: solo números, máximo 15
export const validatePhone = (value) => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length <= 15 && validateOnlyNumbers(cleaned);
};

// Validar email
export const validateEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

// Filtrar solo letras y espacios
export const filterOnlyLetters = (value) => {
  return value.replace(/[^a-záéíóúñ\s]/gi, '');
};

// Filtrar solo números
export const filterOnlyNumbers = (value) => {
  return value.replace(/\D/g, '');
};

// Capitalizar: primera letra mayúscula, resto minúsculas
export const capitalize = (value) => {
  if (!value) return '';
  return value
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Formatear datos antes de enviar a BD
export const formatPatientDataForDB = (patientData) => {
  return {
    ...patientData,
    name: capitalize(patientData.name),
    lastname: capitalize(patientData.lastname),
    phone: filterOnlyNumbers(patientData.phone || ''),
    email: (patientData.email || '').toLowerCase().trim()
  };
};
