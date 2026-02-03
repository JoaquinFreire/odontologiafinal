import { supabase } from '../config/supabaseClient';

export const authService = {
  // Login seguro con Supabase Auth
  login: async (email, password) => {
    try {
      console.log('=== INICIANDO LOGIN SEGURO ===');

      // 1️⃣ Autenticarse con Supabase Auth (maneja contraseñas seguras)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      console.log('✔ Autenticación exitosa con Supabase');
      console.log('Auth User ID:', authData.user.id);

      // 2️⃣ Obtener datos del usuario desde tabla "user"
      // RLS garantiza que SOLO ves TU fila
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('id, email, name, lastname, tuition, auth_user_id')
        .eq('auth_user_id', authData.user.id) // ← Filtra por tu UUID de Auth
        .single(); // ← Espera UNA fila (si hay más, error)
console.log('User data fetch result:', userData, userError);
      if (userError) throw userError;

      console.log('✔ Datos del usuario obtenidos');
      console.log('User data:', userData);

      // 3️⃣ Guardar en localStorage
      const user = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        lastname: userData.lastname,
        tuition: userData.tuition,
        auth_user_id: userData.auth_user_id
      };

      localStorage.setItem('auth_session', JSON.stringify(user));
      console.log('✔ Sesión guardada en localStorage');

      return user;
    } catch (error) {
      console.error('=== ERROR EN LOGIN ===');
      console.error('Error:', error.message);
      throw error;
    }
  },

  // Logout seguro
  logout: async () => {
    try {
      console.log('=== INICIANDO LOGOUT ===');
      
      // Cerrar sesión en Supabase Auth
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      // Limpiar localStorage
      localStorage.removeItem('auth_session');
      
      console.log('✔ Sesión cerrada completamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      localStorage.removeItem('auth_session');
      throw error;
    }
  },

  // Verificar si está autenticado
  checkAuth: async () => {
    try {
      console.log('=== VERIFICANDO AUTENTICACIÓN ===');
      
      // Verificar con Supabase Auth
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      const isAuth = !!session;
      console.log('¿Autenticado?:', isAuth);
      
      return isAuth;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  },

  // Obtener usuario actual (con RLS activo)
  getUser: async () => {
    try {
      console.log('=== OBTENIENDO USUARIO ACTUAL ===');
      
      // 1️⃣ Obtener sesión de Auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      
      if (!authUser) {
        console.warn('No hay sesión activa');
        return null;
      }

      console.log('Auth User ID:', authUser.id);

      // 2️⃣ Obtener datos de tabla "user" (RLS filtra automáticamente)
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('id, email, name, lastname, tuition, auth_user_id')
        .eq('auth_user_id', authUser.id)
        .single();

      if (userError) {
        console.warn('No se encontraron datos del usuario en tabla "user"');
        return null;
      }

      console.log('✔ Datos del usuario obtenidos:', userData);
      return userData;
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      return null;
    }
  },

  // Limpiar sesión local
  clearSession: () => {
    try {
      localStorage.removeItem('auth_session');
      console.log('✔ Sesión local limpiada');
    } catch (error) {
      console.error('Error limpiando sesión:', error);
    }
  }
};
