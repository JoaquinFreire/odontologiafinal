import defaultTreatments from '../config/treatments.json';

const STORAGE_KEY = 'odontologia_treatments';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const getTreatments = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading treatments from localStorage', e);
  }
  return Array.isArray(defaultTreatments) ? defaultTreatments : [];
};

export const saveTreatments = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving treatments to localStorage', e);
  }
};

// Server-backed operations (fallbacks to local)
export const fetchTreatments = async () => {
  try {
    const res = await fetch(`${API_BASE}/config/treatments`);
    if (!res.ok) throw new Error('Fetch failed');
    const json = await res.json();
    if (Array.isArray(json.treatments)) {
      saveTreatments(json.treatments);
      return json.treatments;
    }
  } catch (e) {
    console.warn('fetchTreatments failed, falling back', e);
  }
  return getTreatments();
};

export const addTreatment = async (treatment) => {
  if (!treatment || typeof treatment !== 'string') return getTreatments();
  try {
    const res = await fetch(`${API_BASE}/config/treatments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: treatment })
    });
    if (!res.ok) throw new Error('Server add failed');
    const json = await res.json();
    if (Array.isArray(json.treatments)) {
      saveTreatments(json.treatments);
      return json.treatments;
    }
  } catch (e) {
    console.warn('addTreatment server failed, writing to localStorage', e);
    const list = getTreatments();
    if (!list.includes(treatment)) {
      list.push(treatment);
      saveTreatments(list);
    }
    return list;
  }
  return getTreatments();
};

export const removeTreatment = async (treatment) => {
  try {
    const res = await fetch(`${API_BASE}/config/treatments`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: treatment })
    });
    if (!res.ok) throw new Error('Server delete failed');
    const json = await res.json();
    if (Array.isArray(json.treatments)) {
      saveTreatments(json.treatments);
      return json.treatments;
    }
  } catch (e) {
    console.warn('removeTreatment server failed, updating localStorage', e);
    const list = getTreatments().filter(t => t !== treatment);
    saveTreatments(list);
    return list;
  }
  return getTreatments();
};

export const updateTreatment = async (currentName, newName) => {
  if (!currentName || typeof currentName !== 'string') return getTreatments();
  if (!newName || typeof newName !== 'string') return getTreatments();
  const trimmedNew = newName.trim();
  if (!trimmedNew) return getTreatments();
  try {
    const res = await fetch(`${API_BASE}/config/treatments`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: currentName, newName: trimmedNew })
    });
    if (!res.ok) throw new Error('Server update failed');
    const json = await res.json();
    if (Array.isArray(json.treatments)) {
      saveTreatments(json.treatments);
      return json.treatments;
    }
  } catch (e) {
    console.warn('updateTreatment server failed, updating localStorage', e);
    const list = getTreatments();
    if (currentName === trimmedNew) return list;
    if (list.includes(trimmedNew)) return list;
    const updated = list.map(t => (t === currentName ? trimmedNew : t));
    saveTreatments(updated);
    return updated;
  }
  return getTreatments();
};
