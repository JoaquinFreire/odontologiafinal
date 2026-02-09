/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import '../styles/ViewPatient.css';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import PaymentSection from '../components/PaymentSection';
import { getAllPatients, calculateAge } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import { Eye, ClipboardList, Calendar, DollarSign, User, Search, Plus, CheckCircle } from 'lucide-react';

const ViewPatient = ({ user }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPatients, setTotalPatients] = useState(0);
    const [patientsPerPage] = useState(10);
    const navigate = useNavigate();

    const [showPatientDetails, setShowPatientDetails] = useState(false);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [appointmentFormData, setAppointmentFormData] = useState({
        name: '', date: '', time: '', type: '', dni: '', other_treatment: ''
    });

    useEffect(() => {
        const load = async () => {
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
        load();
    }, [user, currentPage, searchTerm]);

    // Función para formatear fechas y evitar el error de ReferenceError
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return dateString.split('T')[0].split('-').reverse().join('/');
    };

    const handleAppointmentFormChange = (e) => {
        setAppointmentFormData({ ...appointmentFormData, [e.target.name]: e.target.value });
    };

    const openAppointmentModal = (p) => {
        setSelectedPatient(p);
        setAppointmentFormData({
            name: `${p.name} ${p.lastname}`,
            dni: p.dni,
            date: new Date().toISOString().split('T')[0],
            time: '', type: '', other_treatment: ''
        });
        setShowAppointmentModal(true);
    };

    const handleSubmitAppointment = async (e) => {
        e.preventDefault();
        try {
            const result = await appointmentService.createAppointment({ 
                ...appointmentFormData, 
                patient_id: selectedPatient.id 
            });
            if (result.success) {
                setShowAppointmentModal(false);
                setShowSuccessModal(true);
                setTimeout(() => setShowSuccessModal(false), 2500);
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="app">
            <NavBar user={user} activeNav="patients" />
            <main className="main-content">
                <div className="view-patient-container">
                    <div className="header-section">
                        <h1 className="page-title">Gestión de Pacientes</h1>
                        <p className="page-subtitle">Control clínico y de pagos</p>
                    </div>

                    <div className="search-section">
                        <div className="search-container">
                            <div className="search-input-wrapper">
                                <Search size={18} className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar por nombre o DNI..." 
                                    value={searchTerm} 
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                                    className="search-input" 
                                />
                            </div>
                            <button className="new-patient-btn" onClick={() => navigate('/patients/new')}>
                                <Plus size={18} /> <span>Nuevo Paciente</span>
                            </button>
                        </div>
                    </div>

                    <div className="patients-table-container">
                        <table className="patients-table">
                            <thead>
                                <tr>
                                    <th>PACIENTE</th>
                                    <th>DNI</th>
                                    <th>EDAD</th>
                                    <th>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className="patient-info">
                                                <div className="patient-avatar"><User size={20} /></div>
                                                <span className="patient-name">{p.name} {p.lastname}</span>
                                            </div>
                                        </td>
                                        <td className="dni-text">{p.dni}</td>
                                        <td>{calculateAge(p.birthdate)} años</td>
                                        <td className="actions-cell">
                                            <div className="action-buttons">
                                                <button className="action-btn details-btn" title="Detalles" onClick={() => { setSelectedPatient(p); setShowPatientDetails(true); }}><Eye size={18} /></button>
                                                <button className="action-btn history-btn" title="Historia Clínica" onClick={() => navigate(`/patients/${p.id}/history`)}><ClipboardList size={18} /></button>
                                                <button className="action-btn appointment-btn" title="Agendar Turno" onClick={() => openAppointmentModal(p)}><Calendar size={18} /></button>
                                                <button className="action-btn payment-btn" title="Pagos y Cobros" onClick={() => { setSelectedPatient(p); setShowPaymentModal(true); }}><DollarSign size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination-info-container">
                        <p className="pagination-text">
                            Mostrando {(currentPage - 1) * patientsPerPage + 1} a {Math.min(currentPage * patientsPerPage, totalPatients)} de {totalPatients} pacientes
                        </p>
                        <div className="pagination-btns">
                            <button className="page-num" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>‹</button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} className={`page-num ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                            ))}
                            <button className="page-num" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>›</button>
                        </div>
                    </div>

                    {/* MODAL DETALLES COMPLETO (9 CAMPOS) */}
                    {showPatientDetails && selectedPatient && (
                        <div className="modal-overlay" onClick={() => setShowPatientDetails(false)}>
                            <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3 className="modal-title">Datos del Paciente - {selectedPatient.name}</h3>
                                    <button onClick={() => setShowPatientDetails(false)} className="close-btn">✕</button>
                                </div>
                                <div className="modal-content">
                                    <div className="patient-details-grid">
                                        <div className="info-item"><span className="info-label">DNI</span><span className="info-value">{selectedPatient.dni}</span></div>
                                        <div className="info-item"><span className="info-label">Fecha de Nacimiento</span><span className="info-value">{formatDate(selectedPatient.birthdate)}</span></div>
                                        <div className="info-item"><span className="info-label">Edad</span><span className="info-value">{calculateAge(selectedPatient.birthdate)} años</span></div>
                                        <div className="info-item"><span className="info-label">Profesión</span><span className="info-value">{selectedPatient.occupation || 'N/A'}</span></div>
                                        <div className="info-item"><span className="info-label">Teléfono</span><span className="info-value">{selectedPatient.phone || 'N/A'}</span></div>
                                        <div className="info-item"><span className="info-label">Email</span><span className="info-value">{selectedPatient.email || 'N/A'}</span></div>
                                        <div className="info-item"><span className="info-label">Dirección</span><span className="info-value">{selectedPatient.address || 'N/A'}</span></div>
                                        <div className="info-item"><span className="info-label">Titular</span><span className="info-value">{selectedPatient.is_holder ? 'Sí' : 'No'}</span></div>
                                        <div className="info-item full-width"><span className="info-label">Observaciones</span><span className="info-value">{selectedPatient.notes || '—'}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODAL AGENDAR TURNO */}
                    {showAppointmentModal && (
                        <div className="modal-overlay" onClick={() => setShowAppointmentModal(false)}>
                            <div className="modal" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3 className="modal-title">Agendar Turno</h3>
                                    <button onClick={() => setShowAppointmentModal(false)} className="close-btn">✕</button>
                                </div>
                                <form onSubmit={handleSubmitAppointment} className="modal-content">
                                    <div className="form-group">
                                        <label>Paciente</label>
                                        <input type="text" value={appointmentFormData.name} readOnly className="form-input disabled" />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Fecha</label>
                                            <input type="date" name="date" value={appointmentFormData.date} onChange={handleAppointmentFormChange} required className="form-input" />
                                        </div>
                                        <div className="form-group">
                                            <label>Hora</label>
                                            <input type="time" name="time" value={appointmentFormData.time} onChange={handleAppointmentFormChange} required className="form-input" />
                                        </div>
                                    </div>
                                    <button type="submit" className="submit-btn">Confirmar Turno</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MODAL COBROS */}
                    {showPaymentModal && selectedPatient && (
                        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                            <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3 className="modal-title">Cobros - {selectedPatient.name}</h3>
                                    <button onClick={() => setShowPaymentModal(false)} className="close-btn">✕</button>
                                </div>
                                <div className="modal-content">
                                    <PaymentSection patientId={selectedPatient.id} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TOAST DE ÉXITO */}
                    {showSuccessModal && (
                        <div className="success-toast">
                            <CheckCircle size={20} />
                            <span>Turno agendado correctamente</span>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ViewPatient;