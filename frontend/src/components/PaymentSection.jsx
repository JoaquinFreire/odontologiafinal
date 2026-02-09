/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  getTreatmentBudgets,
  getTreatmentBudget,
  createTreatmentBudget,
  updateTreatmentBudget,
  deleteTreatmentBudget
} from '../services/treatmentBudgetService';
import {
  getPayments,
  createPayment,
  updatePayment
} from '../services/paymentsService';
import '../styles/PaymentSection.css';

const PaymentSection = ({ patientId }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNewBudgetForm, setShowNewBudgetForm] = useState(false);
  const [showNewPaymentForm, setShowNewPaymentForm] = useState({});
  const [selectedBudget, setSelectedBudget] = useState(null);

  // Datos del formulario de nuevo presupuesto
  const [newBudgetData, setNewBudgetData] = useState({
    treatment: '',
    total: ''
  });

  // Datos del formulario de nuevo pago
  const [newPaymentData, setNewPaymentData] = useState({
    amount_paid: '',
    payment_method: 'Efectivo',
    payment_date: new Date().toISOString().split('T')[0]
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Métodos de pago disponibles
  const paymentMethods = ['Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Transferencia', 'Cheque'];

  // Tipos de tratamientos disponibles
  const treatmentTypes = [
    'Limpieza',
    'Extracción',
    'Empaste',
    'Endodoncia',
    'Corona',
    'Puente',
    'Implante',
    'Ortodoncia',
    'Blanqueamiento',
    'Otro'
  ];

  // Cargar presupuestos al montar el componente
  useEffect(() => {
    loadBudgets();
  }, [patientId]);

  // Cargar presupuestos
  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTreatmentBudgets(patientId);
      
      // Convertir valores a números (NO filtrar por is_active aquí, ya lo hace el servidor)
      const processedData = data.map(budget => ({
        ...budget,
        total: parseFloat(budget.total) || 0,
        pending: parseFloat(budget.pending) || 0,
        total_paid: parseFloat(budget.total_paid) || 0,
        remaining: parseFloat(budget.remaining) || 0,
        payments: budget.payments ? budget.payments.map(payment => ({
          ...payment,
          amount_paid: parseFloat(payment.amount_paid) || 0
        })) : []
      }));
      
      // Para cada presupuesto, traer sus pagos desde el endpoint específico
      const withPayments = await Promise.all(processedData.map(async (b) => {
        try {
          const detailed = await getTreatmentBudget(patientId, b.id);
          return {
            ...b,
            payments: detailed.payments ? detailed.payments.map(p => ({
              ...p,
              amount_paid: parseFloat(p.amount_paid) || 0
            })) : []
          };
        } catch (e) {
          return b;
        }
      }));

      // Filtrar solo presupuestos activos para mostrar en la UI
      const activeOnly = withPayments.filter(budget => budget.is_active === undefined || Number(budget.is_active) === 1);
      
      setBudgets(activeOnly);
      if (activeOnly.length > 0 && !selectedBudget) {
        setSelectedBudget(activeOnly[0].id);
      }
      return withPayments;  // Retornar TODOS para poder buscar el que se acaba de actualizar
    } catch (err) {
      setError(err.message);
      console.error('Error loading budgets:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario de nuevo presupuesto
  const handleNewBudgetChange = (e) => {
    const { name, value } = e.target;
    setNewBudgetData(prev => ({
      ...prev,
      [name]: name === 'total' ? parseFloat(value) || '' : value
    }));
  };

  // Crear nuevo presupuesto
  const handleCreateBudget = async () => {
    try {
      if (!newBudgetData.treatment || !newBudgetData.total) {
        setError('Por favor completa todos los campos');
        return;
      }

      await createTreatmentBudget(patientId, newBudgetData);
      setNewBudgetData({ treatment: '', total: '' });
      setShowNewBudgetForm(false);
      setError(null);
      await loadBudgets();
    } catch (err) {
      setError(err.message);
    }
  };

  // Manejar cambios en el formulario de nuevo pago
  const handleNewPaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPaymentData(prev => ({
      ...prev,
      [name]: name === 'amount_paid' ? parseFloat(value) || '' : value
    }));
  };

  // Crear nuevo pago
  const handleCreatePayment = async (budgetId) => {
    try {
      // Validaciones básicas
      const amount = parseFloat(newPaymentData.amount_paid) || 0;
      if (!amount || !newPaymentData.payment_method || !newPaymentData.payment_date) {
        setError('Por favor completa todos los campos');
        return;
      }

      // Buscar presupuesto actual
      const budget = budgets.find(b => b.id === budgetId);
      if (!budget) {
        setError('Presupuesto no encontrado');
        return;
      }

      // Comparación con precisión a 2 decimales para evitar errores de punto flotante
      const amountCents = Math.round(amount * 100);
      const remainingCents = Math.round((budget.remaining || 0) * 100);
      if (amountCents > remainingCents) {
        setValidationErrors(prev => ({ ...prev, [budgetId]: `El monto supera el saldo restante (${budget.remaining.toFixed(2)})` }));
        return;
      }
      setValidationErrors(prev => ({ ...prev, [budgetId]: null }));

      // Enviar monto redondeado a 2 decimales para evitar problemas de precisión
      const payload = { ...newPaymentData, amount_paid: Number(amount.toFixed(2)) };
      await createPayment(patientId, budgetId, payload);
      setNewPaymentData({
        amount_paid: '',
        payment_method: 'Efectivo',
        payment_date: new Date().toISOString().split('T')[0]
      });
      setShowNewPaymentForm(prev => ({ ...prev, [budgetId]: false }));
      setError(null);
      // Recargar presupuestos y usar los datos devueltos para comprobar si quedó totalmente pagado
      const refreshed = await loadBudgets();
      console.log('Budgets después de pagar:', refreshed);
      const updated = refreshed && refreshed.length > 0 
        ? refreshed.find(b => b.id === budgetId) 
        : null;
      console.log('Budget actualizado:', updated);
      console.log('Remaining:', updated?.remaining, 'Remaining <= 0?', updated && Number((updated.remaining).toFixed(2)) <= 0);
      
      if (updated && Number((updated.remaining).toFixed(2)) <= 0) {
        console.log('Mostrando mensaje de éxito');
        setSuccessMessage('✓ ¡Presupuesto pagado completamente!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        console.log('No se cumplió la condición');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Eliminar presupuesto
  const handleDeleteBudget = async (budgetId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este presupuesto y todos sus pagos?')) {
      try {
        await deleteTreatmentBudget(patientId, budgetId);
        setError(null);
        await loadBudgets();
      } catch (err) {
        setError(err.message);
      }
    }
  };


  if (loading) {
    return <div className="payment-section">Cargando información de pagos...</div>;
  }

  return (
    <div className="payment-section">
      <h2>Gestión de Cobros y Pagos</h2>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Descartar</button>
        </div>
      )}
      {showSuccess && (
        <div className="success-message">
          <p>{successMessage}</p>
          <button onClick={() => setShowSuccess(false)}>OK</button>
        </div>
      )}

      {/* Botón para crear nuevo presupuesto */}
      <div className="new-budget-section">
        {!showNewBudgetForm ? (
          <button 
            className="btn btn-primary"
            onClick={() => setShowNewBudgetForm(true)}
          >
            + Crear Nuevo Cobro
          </button>
        ) : (
          <div className="form-container new-budget-form">
            <h3>Nuevo Cobro</h3>
            <div className="form-group">
              <label htmlFor="treatment">Tratamiento:</label>
              <select
                id="treatment"
                name="treatment"
                value={newBudgetData.treatment}
                onChange={handleNewBudgetChange}
              >
                <option value="">Selecciona un tratamiento</option>
                {treatmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="total">Costo Total:</label>
              <input
                type="number"
                id="total"
                name="total"
                placeholder="0.00"
                value={newBudgetData.total}
                onChange={handleNewBudgetChange}
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-actions">
              <button 
                className="btn btn-success"
                onClick={handleCreateBudget}
              >
                Crear
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowNewBudgetForm(false);
                  setNewBudgetData({ treatment: '', total: '' });
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mostrar presupuestos existentes */}
      {budgets.length > 0 ? (
        <div className="budgets-container">
          {budgets.map(budget => (
            <div key={budget.id} className="budget-card">
              <div className="budget-header">
                <h3>{budget.treatment}</h3>
                <button 
                  className="btn btn-danger btn-small"
                  onClick={() => handleDeleteBudget(budget.id)}
                  title="Eliminar este cobro"
                >
                  ✕
                </button>
              </div>

              <div className="budget-info">
                <div className="info-item">
                  <span className="label">Debe:</span>
                  <span className="value">${budget.total.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Pagó:</span>
                  <span className="value">${budget.total_paid.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Le Queda:</span>
                  <span className={`value ${budget.remaining > 0 ? 'pending' : 'paid'}`}>
                    ${budget.remaining.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Formulario para agregar nuevo pago */}
              <div className="add-payment-section">
                {!showNewPaymentForm[budget.id] ? (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowNewPaymentForm(prev => ({ 
                      ...prev, 
                      [budget.id]: true 
                    }))}
                  >
                    + Agregar Pago
                  </button>
                ) : (
                  <div className="form-container new-payment-form">
                    <h4>Nuevo Pago</h4>
                    <div className="payment-input-row">
                      <div className="form-group">
                        <label htmlFor={`amount-${budget.id}`}>Monto:</label>
                        <input
                          type="number"
                          id={`amount-${budget.id}`}
                          name="amount_paid"
                          placeholder="0.00"
                          value={newPaymentData.amount_paid}
                          onChange={(e) => { handleNewPaymentChange(e); setValidationErrors(prev => ({ ...prev, [budget.id]: null })); }}
                          onFocus={() => setNewPaymentData(prev => ({ ...prev, amount_paid: '' }))}
                          step="0.01"
                          min="0"
                          max={budget.remaining}
                        />
                        {validationErrors[budget.id] && (
                          <div className="error-message" style={{ marginTop: '8px' }}>
                            <p style={{ margin: 0 }}>{validationErrors[budget.id]}</p>
                            <button onClick={() => setValidationErrors(prev => ({ ...prev, [budget.id]: null }))}>OK</button>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor={`method-${budget.id}`}>Método de Pago:</label>
                        <select
                          id={`method-${budget.id}`}
                          value={newPaymentData.payment_method}
                          onChange={(e) => setNewPaymentData(prev => ({ 
                            ...prev, 
                            payment_method: e.target.value 
                          }))}
                        >
                          {paymentMethods.map(method => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor={`date-${budget.id}`}>Fecha:</label>
                        <input
                          type="date"
                          id={`date-${budget.id}`}
                          value={newPaymentData.payment_date}
                          onChange={(e) => setNewPaymentData(prev => ({ 
                            ...prev, 
                            payment_date: e.target.value 
                          }))}
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button 
                        className="btn btn-success"
                        onClick={() => handleCreatePayment(budget.id)}
                      >
                        Agregar Pago
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setShowNewPaymentForm(prev => ({ 
                          ...prev, 
                          [budget.id]: false 
                        }))}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Historial de pagos */}
              {budget.payments && budget.payments.length > 0 && (
                <div className="payments-history">
                  <h4>Historial de Pagos</h4>
                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Método</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budget.payments.map(payment => (
                        <tr key={payment.id}>
                          <td>{new Date(payment.payment_date).toLocaleDateString('es-AR')}</td>
                          <td>${payment.amount_paid.toFixed(2)}</td>
                          <td>{payment.payment_method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-budgets">
          <p>No hay cobros registrados para este paciente.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentSection;
