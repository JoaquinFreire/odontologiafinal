import React from 'react';

const SearchIcon = () => <span className="icon">🔍</span>;
const UserIcon = () => <span className="icon">👤</span>;

const SearchPatients = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="search-section">
      <div className="search-container">
        <div className="search-input-wrapper">
          <div className="search-icon-container">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={onSearchChange}
            className="search-input"
          />
        </div>

        <button className="new-patient-btn">
          <UserIcon />
          Nuevo Paciente
        </button>
      </div>
    </div>
  );
};

export default SearchPatients;
