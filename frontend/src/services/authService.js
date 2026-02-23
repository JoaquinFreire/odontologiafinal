const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const authService = {
  // Login con API propia
  login: async (email, password) => {
    try {
      console.log('=== INICIANDO LOGIN ===');

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en el login');
      }

      const data = await response.json();
      console.log('Login exitoso:', data);

      // Guardar token y datos del usuario
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        lastname: data.user.lastname,
        tuition: data.user.tuition,
      };

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      console.log('Sesión guardada en localStorage');
      return user;
    } catch (error) {
      console.error('=== ERROR EN LOGIN ===');
      console.error('Error:', error.message);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      console.log('=== INICIANDO LOGOUT ===');

      // Limpiar localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      console.log('Sesión cerrada completamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      throw error;
    }
  },

  // Verificar si está autenticado
  checkAuth: async () => {
    try {
      console.log('=== VERIFICANDO AUTENTICACIÓN ===');

      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No hay token');
        return false;
      }

      // Verificar token con el backend
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const isAuth = response.ok;
      console.log('¿Autenticado?:', isAuth);

      if (!isAuth) {
        // Limpiar si token inválido
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }

      return isAuth;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      return false;
    }
  },

  // Obtener usuario actual
  getUser: async () => {
    try {
      console.log('=== OBTENIENDO USUARIO ACTUAL ===');

      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('auth_user');

      if (!token || !userData) {
        console.log('No hay token o datos de usuario');
        return null;
      }

      const user = JSON.parse(userData);
      console.log('Usuario obtenido:', user);
      return user;
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      return null;
    }
  },

  // Decodificar JWT sin verificar firma
  decodeToken: (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decodificando token', e);
      return null;
    }
  },

  // Obtener tiempo hasta expiración en milisegundos
  getTimeUntilExpiration: () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return 0;
      const decoded = authService.decodeToken(token);
      if (!decoded || !decoded.exp) return 0;
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = decoded.exp - now;
      return Math.max(0, secondsLeft * 1000);
    } catch (e) {
      console.error('Error calculando expiración', e);
      return 0;
    }
  },

  // Verificar si el token está expirado
  isExpired: () => {
    return authService.getTimeUntilExpiration() <= 0;
  },

  // Verificar si falta menos de 1 minuto (60000 ms)
  needsRefresh: () => {
    const timeLeft = authService.getTimeUntilExpiration();
    return timeLeft > 0 && timeLeft < 60000;
  },

  // Refrescar el token llamando al backend
  refreshTokenRequest: async () => {
    try {
      console.log('=== REFRESCANDO TOKEN ===');
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        console.log('Token refrescado exitosamente');
        return data.token;
      }
    } catch (error) {
      console.error('Error refrescando token:', error);
      // Si falla, limpiar sesión
      authService.logout();
      return null;
    }
  },

  // Limpiar sesión local
  clearSession: () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      console.log('Sesión local limpiada');
    } catch (error) {
      console.error('Error limpiando sesión:', error);
    }
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('auth_token');
  }
};
