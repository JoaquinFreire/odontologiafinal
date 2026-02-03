import React from 'react';

const LeftArrow = () => <span className="icon">‹</span>;
const RightArrow = () => <span className="icon">›</span>;

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  filteredPatientsCount,
  patientsPerPage,
  onPageChange 
}) => {
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Mostrando {indexOfFirstPatient + 1} a {Math.min(indexOfLastPatient, filteredPatientsCount)} de {filteredPatientsCount} pacientes
      </div>
      <div className="pagination-buttons">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
        >
          <LeftArrow />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`page-number ${currentPage === number ? 'active' : ''}`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
        >
          <RightArrow />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
