import React from 'react';

const LeftArrow = () => <span className="icon">‹</span>;
const RightArrow = () => <span className="icon">›</span>;

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  totalPatients,
  patientsPerPage,
  onPageChange 
}) => {
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 3) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Mostrando {indexOfFirstPatient + 1} a {Math.min(indexOfLastPatient, totalPatients)} de {totalPatients} pacientes
      </div>
      <div className="pagination-buttons">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
        >
          <LeftArrow />
        </button>

        {getPageNumbers().map((number, index) => (
          number === '...' ? (
            <span key={index} className="pagination-ellipsis">...</span>
          ) : (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              className={`page-number ${currentPage === number ? 'active' : ''}`}
            >
              {number}
            </button>
          )
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
