/* eslint-disable no-unused-vars */
import { supabase } from '../config/supabaseClient';

// Guardar o actualizar un paciente
export const savePatient = async (patientData) => {
  try {
    const dataToSave = {
      name: patientData.name,
      lastname: patientData.lastname,
      dni: patientData.dni || '',
      birthdate: patientData.birthDate || '',
      tel: patientData.phone || '',
      email: patientData.email || '',
      address: patientData.address || '',
      occupation: patientData.occupation || '',
      affiliate_number: patientData.healthInsurance?.number || '',
      holder: patientData.healthInsurance?.isHolder || false
    };

    if (patientData.patientId) {
      const { data, error } = await supabase
        .from('patient')
        .update(dataToSave)
        .eq('id', patientData.patientId)
        .select();

      if (error) throw error;
      return { success: true, data: data[0], isNew: false };
    } else {
      const { data, error } = await supabase
        .from('patient')
        .insert([dataToSave])
        .select();

      if (error) throw error;
      return { success: true, data: data[0], isNew: true };
    }
  } catch (error) {
    console.error('Error al guardar paciente:', error);
    return { success: false, error: error.message };
  }
};

// Obtener un paciente por ID (filtrar por user_id)
export const getPatient = async (patientId, userId) => {
  try {
    const { data, error } = await supabase
      .from('patient')
      .select('*')
      .eq('id', patientId)
      .eq('user_id', userId) // ← Filtrar por usuario
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    return { success: false, error: error.message };
  }
};

// Guardar paciente completo (paciente + anamnesis + consentimiento + odontograma)
export const saveCompletePatient = async (patientData, anamnesisData, consentData, odontogramaData, userId) => {
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

    // 1. Guardar paciente con user_id
    console.log('Guardando paciente...');
    const { data: patientDataSaved, error: patientError } = await supabase
      .from('patient')
      .insert([
        {
          name: patientData.name,
          lastname: patientData.lastname,
          dni: patientData.dni,
          birthdate: patientData.birthDate || null,
          tel: patientData.phone || '',
          email: patientData.email || '',
          address: patientData.address || '',
          occupation: patientData.occupation || '',
          affiliate_number: patientData.healthInsurance?.number || '',
          holder: patientData.healthInsurance?.isHolder || false,
          user_id: userId
        }
      ])
      .select();

    if (patientError) throw patientError;

    const newPatientId = patientDataSaved[0].id;
    console.log('Paciente guardado con ID:', newPatientId);

    // 2. Guardar anamnesis CON observaciones
    console.log('Guardando anamnesis...');
    const anamnesisPayload = {
      patient_id: newPatientId,
      alergico: anamnesisData.allergies.hasAllergies || false,
      medico_cabecera: anamnesisData.primaryDoctor || null,
      medico_tel: anamnesisData.primaryDoctorPhone || null,
      'servicio cabecera': anamnesisData.primaryService || null,
      alergias_descripcion: anamnesisData.allergies.description || null,
      tratamiento_medico: anamnesisData.currentTreatment.underTreatment || false,
      hospitalizado_ultimo_anio: anamnesisData.hospitalization.wasHospitalized || false,
      hospitalizacion_motivo: anamnesisData.hospitalization.reason || null,
      problemas_cicatrizacion: anamnesisData.healingProblems || false,
      grupo_sanguineo: anamnesisData.bloodType || null,
      rh: anamnesisData.bloodRh || null,
      embarazada: anamnesisData.isPregnant || false,
      tiempo_gestacional: anamnesisData.pregnancyTime || null,
      obstetra: anamnesisData.obstetrician || null,
      obstetra_tel: anamnesisData.obstetricianPhone || null,
      medicamento: anamnesisData.takesMedication || false,
      medicamento_detalles: anamnesisData.medication || null,
      antecedentes: JSON.stringify(anamnesisData.diseases),
      observaciones: anamnesisData.observations || null
    };

    const { data: anamnesisDataSaved, error: anamnesisError } = await supabase
      .from('anamnesis_answers')
      .insert([anamnesisPayload])
      .select();

    if (anamnesisError) {
      // Eliminar paciente si falla anamnesis
      await supabase.from('patient').delete().eq('id', newPatientId);
      throw anamnesisError;
    }
    console.log('Anamnesis guardada');

    // 3. Guardar consentimiento CON datos completos
    console.log('Guardando consentimiento...');
    const consentPayload = {
      patient_id: newPatientId,
      text: `En este acto, yo ${patientData.name} ${patientData.lastname} DNI ${patientData.dni} autorizo a Od ${consentData.doctorName || 'No especificado'} M.P. ${consentData.doctorMatricula || 'No especificada'} y/o asociados o ayudantes a realizar el tratamiento informado, conversado con el profesional sobre la naturaleza y propósito del tratamiento, sobre la posibilidad de complicaciones, los riesgos y administración de anestesia local, práctica, radiografías y otros métodos de diagnóstico.`,
      datetime: consentData.datetime || new Date().toISOString(),
      accepted: consentData.accepted || false
    };

    console.log('Payload del consentimiento:', consentPayload);

    const { data: consentDataSaved, error: consentError } = await supabase
      .from('consent')
      .insert([consentPayload])
      .select();

    if (consentError) {
      // Eliminar paciente y anamnesis si falla consentimiento
      await supabase.from('patient').delete().eq('id', newPatientId);
      await supabase.from('anamnesis_answers').delete().eq('patient_id', newPatientId);
      throw consentError;
    }
    console.log('Consentimiento guardado');

    // 4. Guardar odontograma
    console.log('Guardando odontograma...');
    const odontogramaPayload = {
      patient_id: newPatientId,
      formato: JSON.stringify(odontogramaData.adult),
      formato_nino: odontogramaData.child.teethState && Object.keys(odontogramaData.child.teethState).length > 0 || odontogramaData.child.connections.length > 0 ? JSON.stringify(odontogramaData.child) : null,
      observaciones: odontogramaData.observaciones || null,
      elementos_dentarios: odontogramaData.elementos_dentarios || null,
      version: odontogramaData.version || 1
    };

    const { data: odontogramaDataSaved, error: odontogramaError } = await supabase
      .from('odontograma')
      .insert([odontogramaPayload])
      .select();

    if (odontogramaError) {
      // Eliminar paciente y anamnesis si falla odontograma
      await supabase.from('patient').delete().eq('id', newPatientId);
      await supabase.from('anamnesis_answers').delete().eq('patient_id', newPatientId);
      await supabase.from('consent').delete().eq('patient_id', newPatientId);
      throw odontogramaError;
    }
    console.log('Odontograma guardado');

    // 5. Guardar tratamientos
    let treatmentsDataSaved = [];
    if (odontogramaData.treatments && odontogramaData.treatments.length > 0) {
      console.log('Guardando tratamientos...');
      for (const treatment of odontogramaData.treatments) {
        const treatmentPayload = {
          patient_id: newPatientId,
          date: treatment.date || null,
          code: treatment.code || null,
          tooth_elements: treatment.tooth_elements || null,
          faces: treatment.faces || null,
          observations: treatment.observations || null
        };

        const { data, error } = await supabase
          .from('treatments')
          .insert([treatmentPayload])
          .select();

        if (error) {
          // Si hay error, eliminar todo lo guardado
          await supabase.from('patient').delete().eq('id', newPatientId);
          await supabase.from('anamnesis_answers').delete().eq('patient_id', newPatientId);
          await supabase.from('consent').delete().eq('patient_id', newPatientId);
          await supabase.from('odontograma').delete().eq('patient_id', newPatientId);
          throw error;
        }
        treatmentsDataSaved.push(data[0]);
      }
      console.log('Tratamientos guardados');
    }

    return { 
      success: true, 
      patient: patientDataSaved[0],
      anamnesis: anamnesisDataSaved[0],
      consent: consentDataSaved[0],
      odontograma: odontogramaDataSaved[0],
      treatments: treatmentsDataSaved || [],
      message: `Paciente ${patientDataSaved[0].name} ${patientDataSaved[0].lastname} guardado exitosamente con su historia clínica`
    };
  } catch (error) {
    console.error('Error saving complete patient:', error);
    return { success: false, error: error.message };
  }
};

// Obtener paciente con su anamnesis (filtrar por user_id)
export const getPatientWithAnamnesis = async (patientId, userId) => {
  try {
    const { data: patient, error: patientError } = await supabase
      .from('patient')
      .select('*')
      .eq('id', patientId)
      .eq('user_id', userId) // ← Filtrar por usuario
      .single();

    if (patientError) throw patientError;

    const { data: anamnesis, error: anamnesisError } = await supabase
      .from('anamnesis_answers')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (anamnesisError && anamnesisError.code !== 'PGRST116') throw anamnesisError;

    return { 
      success: true, 
      patient,
      anamnesis: anamnesis || null
    };
  } catch (error) {
    console.error('Error fetching patient with anamnesis:', error);
    return { success: false, error: error.message };
  }
};

// Actualizar anamnesis existente
export const updatePatientAnamnesis = async (patientId, anamnesisData, userId, anamnesisId = null) => {
  try {
    const anamnesisPayload = {
      patient_id: patientId,
      alergico: anamnesisData.allergies.hasAllergies || false,
      medico_cabecera: anamnesisData.primaryDoctor || null,
      medico_tel: anamnesisData.primaryDoctorPhone || null,
      'servicio cabecera': anamnesisData.primaryService || null,
      alergias_descripcion: anamnesisData.allergies.description || null,
      tratamiento_medico: anamnesisData.currentTreatment.underTreatment || false,
      hospitalizado_ultimo_anio: anamnesisData.hospitalization.wasHospitalized || false,
      hospitalizacion_motivo: anamnesisData.hospitalization.reason || null,
      problemas_cicatrizacion: anamnesisData.healingProblems || false,
      grupo_sanguineo: anamnesisData.bloodType || null,
      rh: anamnesisData.bloodRh || null,
      embarazada: anamnesisData.isPregnant || false,
      tiempo_gestacional: anamnesisData.pregnancyTime || null,
      obstetra: anamnesisData.obstetrician || null,
      obstetra_tel: anamnesisData.obstetricianPhone || null,
      medicamento: anamnesisData.takesMedication || false,
      medicamento_detalles: anamnesisData.medication || null,
      antecedentes: JSON.stringify(anamnesisData.diseases),
      observaciones: anamnesisData.observations || null
    };

    let data, error;
    if (anamnesisId) {
      // Update existing
      ({ data, error } = await supabase
        .from('anamnesis_answers')
        .update(anamnesisPayload)
        .eq('id', anamnesisId)
        .select());
    } else {
      // Insert new
      ({ data, error } = await supabase
        .from('anamnesis_answers')
        .insert([anamnesisPayload])
        .select());
    }

    if (error) throw error;

    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error updating anamnesis:', error);
    return { success: false, error: error.message };
  }
};

// Obtener todos los pacientes del usuario actual CON PAGINACIÓN
export const getAllPatients = async (userId, page = 1, pageSize = 10) => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Obtener el total de pacientes
    const { count, error: countError } = await supabase
      .from('patient')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) throw countError;

    // Obtener los pacientes de la página actual
    const { data, error } = await supabase
      .from('patient')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const totalPages = Math.ceil(count / pageSize);

    return { 
      success: true, 
      data,
      pagination: {
        currentPage: page,
        pageSize,
        totalPatients: count,
        totalPages
      }
    };
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
export const getPatientOdontograma = async (patientId, userId) => {
  try {
    const { data, error } = await supabase
      .from('odontograma')
      .select('*')
      .eq('patient_id', patientId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      // Parsear el formato JSON con manejo de errores
      let adultData = { teethState: {}, connections: [] };
      let childData = { teethState: {}, connections: [] };

      try {
        if (data.formato) {
          adultData = JSON.parse(data.formato);
        }
      } catch (jsonError) {
        console.warn('Error parsing odontograma formato:', jsonError);
        adultData = { teethState: {}, connections: [] };
      }

      try {
        if (data.formato_nino) {
          childData = JSON.parse(data.formato_nino);
        }
      } catch (jsonError) {
        console.warn('Error parsing odontograma formato_nino:', jsonError);
        childData = { teethState: {}, connections: [] };
      }

      return {
        success: true,
        data: {
          adult: adultData,
          child: childData,
          observaciones: data.observaciones || '',
          elementos_dentarios: data.elementos_dentarios || '',
          version: data.version || 1,
          treatments: [] // Se obtendrán por separado
        }
      };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error('Error al obtener odontograma:', error);
    return { success: false, error: error.message };
  }
};

// Obtener consentimiento de un paciente
export const getPatientConsent = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from('consent')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { success: true, data: data || null };
  } catch (error) {
    console.error('Error al obtener consentimiento:', error);
    return { success: false, error: error.message };
  }
};

// Obtener tratamientos de un paciente
export const getPatientTreatments = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
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
    const { data, error } = await supabase
      .from('odontograma')
      .select('*')
      .eq('patient_id', patientId)
      .eq('version', version)
      .single();

    if (error) throw error;

    // Parsear como en getPatientOdontograma
    let adultData = { teethState: {}, connections: [] };
    let childData = { teethState: {}, connections: [] };

    try {
      if (data.formato) {
        adultData = JSON.parse(data.formato);
      }
    } catch (jsonError) {
      console.warn('Error parsing odontograma formato:', jsonError);
      adultData = { teethState: {}, connections: [] };
    }

    try {
      if (data.formato_nino) {
        childData = JSON.parse(data.formato_nino);
      }
    } catch (jsonError) {
      console.warn('Error parsing odontograma formato_nino:', jsonError);
      childData = { teethState: {}, connections: [] };
    }

    return { 
      success: true, 
      data: {
        adult: adultData,
        child: childData,
        observaciones: data.observaciones || '',
        elementos_dentarios: data.elementos_dentarios || '',
        version: data.version,
        treatments: [] // No incluir tratamientos aquí
      }
    };
  } catch (error) {
    console.error('Error al obtener odontograma por versión:', error);
    return { success: false, error: error.message };
  }
};

// Actualizar datos del paciente (solo campos editables)
export const updatePatientData = async (patientId, data) => {
  try {
    const { data: updated, error } = await supabase
      .from('patient')
      .update({
        tel: data.phone,
        email: data.email,
        address: data.address,
        occupation: data.occupation,
        affiliate_number: data.healthInsurance?.number,
        holder: data.healthInsurance?.isHolder
      })
      .eq('id', patientId)
      .select();

    if (error) throw error;
    return { success: true, data: updated[0] };
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    return { success: false, error: error.message };
  }
};

// Actualizar odontograma
export const updateOdontograma = async (patientId, odontogramaData, userId, saveTreatments = true) => {
  try {
    const formato = JSON.stringify({
      teethState: odontogramaData.adult.teethState,
      connections: odontogramaData.adult.connections
    });
    const formato_nino = JSON.stringify({
      teethState: odontogramaData.child.teethState,
      connections: odontogramaData.child.connections
    });

    const { data, error } = await supabase
      .from('odontograma')
      .insert({
        patient_id: patientId,
        formato,
        formato_nino,
        observaciones: odontogramaData.observaciones,
        elementos_dentarios: odontogramaData.elementos_dentarios,
        version: odontogramaData.version
      })
      .select();

    if (error) throw error;

    // Guardar tratamientos si existen y saveTreatments
    if (saveTreatments && odontogramaData.treatments && odontogramaData.treatments.length > 0) {
      for (const treatment of odontogramaData.treatments) {
        const treatmentPayload = {
          patient_id: patientId,
          date: treatment.date || null,
          code: treatment.code || null,
          tooth_elements: treatment.tooth_elements || null,
          faces: treatment.faces || null,
          observations: treatment.observations || null
        };

        const { error: treatmentError } = await supabase
          .from('treatments')
          .insert([treatmentPayload]);

        if (treatmentError) {
          console.error('Error saving treatment:', treatmentError);
          // No throw, continue
        }
      }
    }

    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al actualizar odontograma:', error);
    return { success: false, error: error.message };
  }
};

// Actualizar tratamientos
export const updateTreatments = async (patientId, treatments) => {
  try {
    // Primero, eliminar tratamientos existentes
    const { error: deleteError } = await supabase
      .from('treatments')
      .delete()
      .eq('patient_id', patientId);

    if (deleteError) throw deleteError;

    // Luego, insertar nuevos
    if (treatments && treatments.length > 0) {
      const treatmentsPayload = treatments.map(t => ({
        patient_id: patientId,
        date: t.date || null,
        code: t.code || null,
        tooth_elements: t.tooth_elements || null,
        faces: t.faces || null,
        observations: t.observations || null
      }));

      const { error: insertError } = await supabase
        .from('treatments')
        .insert(treatmentsPayload);

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error al actualizar tratamientos:', error);
    return { success: false, error: error.message };
  }
};

// Actualizar consentimiento
export const updateConsent = async (patientId, consentData) => {
  try {
    const { data, error } = await supabase
      .from('consent')
      .upsert({
        patient_id: patientId,
        text: consentData.text,
        datetime: consentData.datetime,
        accepted: consentData.accepted
      })
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al actualizar consentimiento:', error);
    return { success: false, error: error.message };
  }
};

// Obtener versiones de odontograma de un paciente
// eslint-disable-next-line no-unused-vars
export const getOdontogramaVersions = async (patientId, userId) => {
  try {
    const { data, error } = await supabase
      .from('odontograma')
      .select('version')
      .eq('patient_id', patientId)
      .order('version', { ascending: false });

    if (error) throw error;
    return { success: true, data: data.map(item => item.version) };
  } catch (error) {
    console.error('Error al obtener versiones de odontograma:', error);
    return { success: false, error: error.message };
  }
};
