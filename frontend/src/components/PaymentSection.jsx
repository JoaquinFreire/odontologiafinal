/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  getTreatmentBudgets,
  getTreatmentBudget,
  createTreatmentBudget,
  deleteTreatmentBudget
} from '../services/treatmentBudgetService';
import { createPayment } from '../services/paymentsService';
import '../styles/PaymentSection.css';

const PaymentSection = ({ patientId }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNewBudgetForm, setShowNewBudgetForm] = useState(false);
  const [showNewPaymentForm, setShowNewPaymentForm] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [newBudgetData, setNewBudgetData] = useState({ treatment: '', total: '' });
  const [newPaymentData, setNewPaymentData] = useState({
    amount_paid: '',
    payment_method: 'Efectivo',
    payment_date: new Date().toISOString().split('T')[0]
  });

  const paymentMethods = ['Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Transferencia', 'Cheque'];
  const treatmentTypes = ['Limpieza', 'Extracción', 'Empaste', 'Endodoncia', 'Corona', 'Implante', 'Ortodoncia', 'Otro'];

  useEffect(() => { loadBudgets(); }, [patientId]);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const data = await getTreatmentBudgets(patientId);
      const processedData = await Promise.all(data.map(async (b) => {
        try {
          const detailed = await getTreatmentBudget(patientId, b.id);
          return { ...b, payments: detailed.payments || [] };
        } catch (e) { return b; }
      }));
      setBudgets(processedData.filter(b => b.is_active === undefined || Number(b.is_active) === 1));
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCreateBudget = async () => {
    if (!newBudgetData.treatment || !newBudgetData.total) return;
    await createTreatmentBudget(patientId, newBudgetData);
    setNewBudgetData({ treatment: '', total: '' });
    setShowNewBudgetForm(false);
    loadBudgets();
  };

  const handleCreatePayment = async (budgetId) => {
    const amount = parseFloat(newPaymentData.amount_paid);
    if (!amount || amount <= 0) return;
    await createPayment(patientId, budgetId, { ...newPaymentData, amount_paid: amount });
    setNewPaymentData({ amount_paid: '', payment_method: 'Efectivo', payment_date: new Date().toISOString().split('T')[0] });
    setShowNewPaymentForm(prev => ({ ...prev, [budgetId]: false }));
    loadBudgets();
  };

  const handleDelete = async (id) => {
    await deleteTreatmentBudget(patientId, id);
    setConfirmDelete(null);
    loadBudgets();
  };

  if (loading) return <div className="payment-loading">Cargando cuentas...</div>;

  return (
    <div className="payment-manager-wrapper">
      <div className="payment-view-header">
        <h2 className="payment-view-title">Gestión de Cobros</h2>
        {!showNewBudgetForm && (
          <button className="btn-create-budget" onClick={() => setShowNewBudgetForm(true)}>
            + Nuevo Cobro
          </button>
        )}
      </div>

      {showNewBudgetForm && (
        <div className="budget-form-inline">
          <h3 className="form-inner-title">Nuevo Tratamiento</h3>
          <div className="form-grid-inputs">
            <div className="input-field">
              <label>Tratamiento</label>
              <select 
                value={newBudgetData.treatment} 
                onChange={e => setNewBudgetData({...newBudgetData, treatment: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {treatmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="input-field">
              <label>Costo Total ($)</label>
              <input 
                type="number" 
                placeholder="0.00" 
                value={newBudgetData.total}
                onChange={e => setNewBudgetData({...newBudgetData, total: e.target.value})}
              />
            </div>
          </div>
          <div className="form-card-actions">
            <button className="btn-confirm-save" onClick={handleCreateBudget}>Crear Cobro</button>
            <button className="btn-cancel-text" onClick={() => setShowNewBudgetForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="budgets-stack">
        {budgets.map(budget => (
          <div key={budget.id} className="payment-card-modern">
            <div className="payment-card-header">
              <span className="treatment-tag">{budget.treatment}</span>
              {confirmDelete === budget.id ? (
                <div className="inline-confirm">
                  <span>¿Eliminar?</span>
                  <button className="btn-yes" onClick={() => handleDelete(budget.id)}>Sí</button>
                  <button className="btn-no" onClick={() => setConfirmDelete(null)}>No</button>
                </div>
              ) : (
                <button className="btn-delete-minimal" onClick={() => setConfirmDelete(budget.id)}>✕</button>
              )}
            </div>

            <div className="payment-metrics-grid">
              <div className="metric-item">
                <label>Total</label>
                <span>${parseFloat(budget.total).toLocaleString()}</span>
              </div>
              <div className="metric-item">
                <label>Pagado</label>
                <span className="txt-success">${parseFloat(budget.total_paid || 0).toLocaleString()}</span>
              </div>
              <div className="metric-item highlight">
                <label>Saldo</label>
                <span className={budget.remaining > 0 ? "txt-danger" : "txt-success"}>
                  ${parseFloat(budget.remaining || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {showNewPaymentForm[budget.id] ? (
              <div className="quick-payment-box">
                <div className="quick-inputs">
                  <div className="input-field">
                    <label>Monto a pagar</label>
                    <input 
                      type="number" 
                      value={newPaymentData.amount_paid}
                      onChange={e => setNewPaymentData({...newPaymentData, amount_paid: e.target.value})}
                    />
                  </div>
                  <div className="input-field">
                    <label>Método</label>
                    <select value={newPaymentData.payment_method} onChange={e => setNewPaymentData({...newPaymentData, payment_method: e.target.value})}>
                      {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className="quick-actions">
                  <button className="btn-action-ok" onClick={() => handleCreatePayment(budget.id)}>Confirmar Pago</button>
                  <button className="btn-action-cancel" onClick={() => setShowNewPaymentForm({...showNewPaymentForm, [budget.id]: false})}>Cerrar</button>
                </div>
              </div>
            ) : (
              budget.remaining > 0 && (
                <button className="btn-open-payment-form" onClick={() => setShowNewPaymentForm({...showNewPaymentForm, [budget.id]: true})}>
                  + Registrar un Pago
                </button>
              )
            )}

            {budget.payments?.length > 0 && (
              <div className="history-drawer">
                <p className="history-label">Historial reciente</p>
                {budget.payments.slice(-3).reverse().map(p => (
                  <div key={p.id} className="history-item-row">
                    <span>{new Date(p.payment_date).toLocaleDateString()}</span>
                    <span>{p.payment_method}</span>
                    <span className="h-amount">${parseFloat(p.amount_paid).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentSection;