import React, { useState, useEffect } from 'react';

const SearchIcon = () => <span className="icon">🔍</span>;
const UserIcon = () => <span className="icon">👤</span>;

const SearchPatients = ({ searchTerm, onSearchChange }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearchChange(localSearchTerm);
    }
  };

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
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
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
