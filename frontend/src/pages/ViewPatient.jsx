/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import '../styles/ViewPatient.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import SearchPatients from '../components/SearchPatients';
import PaginationControls from '../components/PaginationControls';
import { getAllPatients, calculateAge } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';

const UserIcon = () => <span className="icon">👤</span>;

const ViewPatient = ({ setIsAuthenticated, user, setUser }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPatients, setTotalPatients] = useState(0);
    const [patientsPerPage] = useState(10);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        document.title = 'Ver Pacientes';
        // Obtener el término de búsqueda de la URL si existe
        const searchFromUrl = searchParams.get('search');
        if (searchFromUrl) {
            setSearchTerm(searchFromUrl);
        }
    }, [searchParams]);

    // Modales
    const [showPatientDetails, setShowPatientDetails] = useState(false);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    
    // Datos de Cobro
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [totalBudget, setTotalBudget] = useState(0);
    const [newPayment, setNewPayment] = useState({
        amount: '', method: 'Efectivo', date: new Date().toISOString().split('T')[0]
    });

    // Datos de Turno
    const [appointmentFormData, setAppointmentFormData] = useState({
        name: '', date: '', time: '', type: '', dni: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const loadPatients = async () => {
            if (!user?.id) return;
            try {
                setLoading(true);
                const result = await getAllPatients(currentPage, patientsPerPage, searchTerm);
                if (result.success) {
                    setPatients(result.data);
                    setTotalPages(result.pagination.totalPages);
                    setTotalPatients(result.pagination.totalPatients);
                }
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        loadPatients();
    }, [user, currentPage, searchTerm, patientsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Handlers Cobros
    const openPaymentModal = (patient) => {
        setSelectedPatient(patient);
        setPaymentHistory([{ id: 1, date: '2026-01-01', amount: 500, method: 'Efectivo' }]); // Ejemplo
        setTotalBudget(1000);
        setShowPaymentModal(true);
    };

    const handleAddPayment = (e) => {
        e.preventDefault();
        if (!newPayment.amount || newPayment.amount <= 0) return;
        const transaction = { id: Date.now(), ...newPayment, amount: parseFloat(newPayment.amount) };
        setPaymentHistory([...paymentHistory, transaction]);
        setNewPayment({ ...newPayment, amount: '' });
    };

    const totalPaid = paymentHistory.reduce((acc, curr) => acc + curr.amount, 0);
    const pendingAmount = totalBudget - totalPaid;

    // Handlers Turnos
    const openAppointmentModal = (patient) => {
        setSelectedPatient(patient);
        setAppointmentFormData({
            name: `${patient.name} ${patient.lastname}`,
            date: '', time: '', type: '', dni: patient.dni
        });
        setShowAppointmentModal(true);
    };

     // Ir a historial clínico
    const openMedicalHistory = (patient) => {
        navigate(`/patients/${patient.id}/history`);
    };

    return (
        <div className="app">
            <NavBar user={user} handleLogout={() => navigate('/login')} activeNav="patients" />
            <main className="main-content">
                <div className="view-patient-container">
                    <div className="header-section">
                        <h1 className="page-title">Gestión de Pacientes</h1>
                        <p className="page-subtitle">Control clínico y de pagos</p>
                    </div>

                    <SearchPatients searchTerm={searchTerm} onSearchChange={(term) => setSearchTerm(term)} />

                    {loading ? (
                        <div className="loading">Cargando pacientes...</div>
                    ) : patients.length === 0 ? (
                        <div className="no-results">
                            <p>No hay pacientes registrados</p>
                        </div>
                    ) : (
                        <>
                            <div className="patients-table-container">
                                <div className="table-wrapper">
                                    <table className="patients-table">
                                        <thead>
                                            <tr>
                                                <th>Paciente</th>
                                                <th>DNI</th>
                                                <th>Edad</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {patients.map(p => (
                                                <tr key={p.id}>
                                                    <td>
                                                        <div className="patient-info">
                                                            <div className="patient-avatar"><UserIcon /></div>
                                                            <span className="patient-name">{p.name} {p.lastname}</span>
                                                        </div>
                                                    </td>
                                                    <td className="dni-text">{p.dni}</td>
                                                    <td>{calculateAge(p.birthdate)} años</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button className="action-btn details-btn" title="Ver" onClick={() => { setSelectedPatient(p); setShowPatientDetails(true); }}>👁️</button>
                                                            <button
                                                                    className="action-btn history-btn"
                                                                    title="Historial clínico"
                                                                    onClick={() => openMedicalHistory(p)}
                                                                >
                                                                    📋
                                                                </button>
                                                            <button className="action-btn appointment-btn" title="Turno" onClick={() => openAppointmentModal(p)}>📅</button>
                                                            <button className="action-btn payment-btn" title="Cobros" onClick={() => openPaymentModal(p)}>$</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Paginación */}
                            {totalPages > 1 && (
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalPatients={totalPatients}
                                    patientsPerPage={patientsPerPage}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </>
                    )}
                    {/* MODAL COBROS */}
                    {showPaymentModal && selectedPatient && (
                        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                            <div className="modal payment-modal wide" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3 className="modal-title">Control de Cobros - {selectedPatient.name}</h3>
                                    <button onClick={() => setShowPaymentModal(false)} className="close-btn">✕</button>
                                </div>
                                <div className="modal-content">
                                    <div className="payment-summary-grid">
                                        <div className="payment-card">
                                            <span className="payment-label">Presupuesto</span>
                                            <input type="number" className="inline-edit-input" value={totalBudget} onChange={e => setTotalBudget(Number(e.target.value))} />
                                        </div>
                                        <div className="payment-card paid">
                                            <span className="payment-label">Abonado</span>
                                            <span className="payment-value">${totalPaid.toLocaleString()}</span>
                                        </div>
                                        <div className={`payment-card pending ${pendingAmount > 0 ? 'debt' : 'settled'}`}>
                                            <span className="payment-label">Pendiente</span>
                                            <span className="payment-value">{pendingAmount <= 0 ? '✓ Pagado' : `$${pendingAmount.toLocaleString()}`}</span>
                                        </div>
                                    </div>
                                    <hr className="divider" />
                                    <form className="add-payment-form" onSubmit={handleAddPayment}>
                                        <h4 className="section-subtitle">Nuevo Abono</h4>
                                        <div className="payment-inputs-row">
                                            <div className="input-group"><input type="date" value={newPayment.date} onChange={e => setNewPayment({...newPayment, date: e.target.value})} className="form-input" /></div>
                                            <div className="input-group">
                                                <select value={newPayment.method} onChange={e => setNewPayment({...newPayment, method: e.target.value})} className="form-input">
                                                    <option value="Efectivo">Efectivo</option>
                                                    <option value="Transferencia">Transferencia</option>
                                                    <option value="Tarjeta">Tarjeta</option>
                                                </select>
                                            </div>
                                            <div className="input-group"><input type="number" placeholder="Monto $" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} className="form-input" /></div>
                                            <button type="submit" className="btn-add-payment">Registrar</button>
                                        </div>
                                    </form>
                                    <div className="mini-table-container">
                                        <table className="mini-table">
                                            <thead><tr><th>Fecha</th><th>Método</th><th>Monto</th></tr></thead>
                                            <tbody>
                                                {paymentHistory.map(h => (
                                                    <tr key={h.id}><td>{h.date}</td><td><span className={`method-badge ${h.method.toLowerCase()}`}>{h.method}</span></td><td>${h.amount}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODAL TURNOS (Simplificado) */}
                    {showAppointmentModal && (
                        <div className="modal-overlay" onClick={() => setShowAppointmentModal(false)}>
                            <div className="modal appointment-modal" onClick={e => e.stopPropagation()}>
                                <div className="modal-header"><h3>Agendar Turno</h3><button onClick={() => setShowAppointmentModal(false)} className="close-btn">✕</button></div>
                                <div className="modal-content">
                                    <p>Paciente: <strong>{appointmentFormData.name}</strong></p>
                                    <div className="form-group"><label>Fecha</label><input type="date" className="form-input" /></div>
                                    <div className="modal-footer"><button className="btn-primary" onClick={() => setShowAppointmentModal(false)}>Guardar Turno</button></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ViewPatient;