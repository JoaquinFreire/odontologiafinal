/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import '../styles/ViewPatient.css';
import '../styles/calendar.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import SearchPatients from '../components/SearchPatients';
import PaginationControls from '../components/PaginationControls';
import PaymentSection from '../components/PaymentSection';
import { getAllPatients, calculateAge } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import { Eye, ClipboardList, Calendar, DollarSign, User, CheckCircle } from 'lucide-react';

const UserIcon = () => <User size={20} />;

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

    // Seleccionar Paciente
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Datos de Turno
    const [appointmentFormData, setAppointmentFormData] = useState({
        name: '', date: '', time: '', type: '', dni: '', price: '', payment_method: '', other_treatment: ''
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
        setShowPaymentModal(true);
    };

    // Handlers Turnos
    const openAppointmentModal = (patient) => {
        setSelectedPatient(patient);
        const todayStr = new Date().toISOString().split('T')[0];
        setAppointmentFormData({
            name: `${patient.name} ${patient.lastname}`,
            date: todayStr,
            time: '',
            type: '',
            dni: patient.dni,
            price: '',
            payment_method: '',
            other_treatment: ''
        });
        setShowAppointmentModal(true);
    };

    const handleAppointmentFormChange = (e) => {
        const { name, value } = e.target;
        setAppointmentFormData(prev => ({ ...prev, [name]: value }));
    };

    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleSubmitAppointmentFromViewPatient = async (e) => {
        e.preventDefault();
        if (!appointmentFormData.date || !appointmentFormData.time || !appointmentFormData.type) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }
        setLoading(true);
        try {
            await appointmentService.createAppointment(appointmentFormData);
            setSuccessMessage(`Turno agendado para ${appointmentFormData.name}`);
            setShowSuccessModal(true);
            setShowAppointmentModal(false);
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 2000);
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
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
                                                            <button className="action-btn details-btn" title="Ver" onClick={() => { setSelectedPatient(p); setShowPatientDetails(true); }}><Eye size={18} /></button>
                                                            <button
                                                                className="action-btn history-btn"
                                                                title="Historial clínico"
                                                                onClick={() => openMedicalHistory(p)}
                                                            >
                                                                <ClipboardList size={18} />
                                                            </button>
                                                            <button className="action-btn appointment-btn" title="Turno" onClick={() => openAppointmentModal(p)}><Calendar size={18} /></button>
                                                            <button className="action-btn payment-btn" title="Cobros" onClick={() => openPaymentModal(p)}><DollarSign size={18} /></button>
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
                    {/* MODAL DETALLES PACIENTE */}
                    {showPatientDetails && selectedPatient && (() => {
                        const isHolder = (selectedPatient.healthInsurance && selectedPatient.healthInsurance.isHolder) || selectedPatient.holder || false;
                        const affiliateNumber = (selectedPatient.healthInsurance && selectedPatient.healthInsurance.number) || selectedPatient.affiliate_number || selectedPatient.affiliateNumber || selectedPatient.affiliate || 'N/A';
                        return (
                            <div className="modal-overlay" onClick={() => setShowPatientDetails(false)}>
                                <div className="modal details-modal" onClick={e => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h3 className="modal-title">Datos del Paciente - {selectedPatient.name} {selectedPatient.lastname}</h3>
                                        <button onClick={() => setShowPatientDetails(false)} className="close-btn">✕</button>
                                    </div>
                                    <div className="modal-content">
                                        <div className="patient-details-grid">
                                            <div><strong>DNI:</strong> {selectedPatient.dni}</div>
                                            <div><strong>Fecha de Nacimiento:</strong> {selectedPatient.birthdate || 'N/A'}</div>
                                            <div><strong>Edad:</strong> {calculateAge(selectedPatient.birthdate)} años</div>
                                            <div><strong>Profesión:</strong> {selectedPatient.occupation || 'N/A'}</div>
                                            <div><strong>Teléfono:</strong> {selectedPatient.phone || 'N/A'}</div>
                                            <div><strong>Email:</strong> {selectedPatient.email || 'N/A'}</div>
                                            <div><strong>Dirección:</strong> {selectedPatient.address || 'N/A'}</div>
                                            <div><strong>Titular:</strong> {isHolder ? 'Sí' : 'No'}</div>
                                            {isHolder && (
                                                <div><strong>Número de Afiliado:</strong> {affiliateNumber}</div>
                                            )}
                                            <div><strong>Observaciones:</strong> {selectedPatient.dentalObservations || selectedPatient.notes || '—'}</div>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                    {/* MODAL COBROS */}
                    {showPaymentModal && selectedPatient && (
                        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                            <div className="modal payment-modal wide" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3 className="modal-title">Gestión de Cobros - {selectedPatient.name}</h3>
                                    <button onClick={() => setShowPaymentModal(false)} className="close-btn">✕</button>
                                </div>
                                <div className="modal-content" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                                    <PaymentSection patientId={selectedPatient.id} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODAL TURNOS */}
                    {showAppointmentModal && (
                        <div className="modal-overlay" onClick={() => setShowAppointmentModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>Agendar Turno</h2>
                                    <button className="modal-close" onClick={() => setShowAppointmentModal(false)}>&times;</button>
                                </div>
                                <form className="appointment-form" onSubmit={handleSubmitAppointmentFromViewPatient}>
                                    <div className="form-group">
                                        <label>Nombre completo</label>
                                        <input type="text" name="name" value={appointmentFormData.name} onChange={handleAppointmentFormChange} disabled />
                                    </div>

                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div className="form-group">
                                            <label>Fecha *</label>
                                            <input type="date" name="date" value={appointmentFormData.date} onChange={handleAppointmentFormChange} required min={new Date().toISOString().split('T')[0]} disabled={loading} />
                                        </div>
                                        <div className="form-group">
                                            <label>Hora *</label>
                                            <select name="time" value={appointmentFormData.time} onChange={handleAppointmentFormChange} required disabled={loading}>
                                                <option value="">Seleccionar...</option>
                                                {Array.from({ length: (21 - 8 + 1) * 2 }, (_, i) => {
                                                    const hour = 8 + Math.floor(i / 2);
                                                    const minute = i % 2 === 0 ? '00' : '30';
                                                    const val = `${hour.toString().padStart(2, '0')}:${minute}`;
                                                    return <option key={val} value={val}>{val}</option>;
                                                })}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Tipo de Tratamiento *</label>
                                        <select name="type" value={appointmentFormData.type} onChange={handleAppointmentFormChange} required disabled={loading}>
                                            <option value="">Seleccionar...</option>
                                            <option value="Consulta">Consulta</option>
                                            <option value="Limpieza dental">Limpieza dental</option>
                                            <option value="Ortodoncia">Ortodoncia</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                        {appointmentFormData.type === 'Otro' && (
                                            <div className="form-group">
                                                <label>Describir Tratamiento *</label>
                                                <textarea name="other_treatment" value={appointmentFormData.other_treatment} onChange={handleAppointmentFormChange} placeholder="Describa el tratamiento" required disabled={loading} style={{ padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontFamily: "'Inter', sans-serif", fontSize: '14px' }} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>DNI</label>
                                        <input type="number" name="dni" value={appointmentFormData.dni} onChange={handleAppointmentFormChange} disabled />
                                    </div>

                                    <div className="modal-actions" style={{ marginTop: '20px' }}>
                                        <button type="button" className="btn-outline cancel" onClick={() => setShowAppointmentModal(false)} disabled={loading}>Cancelar</button>
                                        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Agendando...' : 'Agendar Turno'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {showSuccessModal && (
                        <div className="success-overlay">
                            <div className="success-card">
                                <CheckCircle size={40} color="#22c55e" />
                                <h3>Operación Exitosa</h3>
                                <p>{successMessage}</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ViewPatient;