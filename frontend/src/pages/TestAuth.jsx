import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';

const TestAuth = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testGetUser = async () => {
    setLoading(true);
    try {
      const user = await authService.getUser();
      setResult({
        status: 'success',
        message: 'Usuario obtenido correctamente',
        data: user
      });
    } catch (error) {
      setResult({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    testGetUser();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test de Autenticación</h2>
      {loading && <p>Cargando...</p>}
      {result && (
        <div style={{
          backgroundColor: result.status === 'success' ? '#d4edda' : '#f8d7da',
          padding: '15px',
          borderRadius: '5px',
          marginTop: '10px'
        }}>
          <h3>{result.message}</h3>
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestAuth;
