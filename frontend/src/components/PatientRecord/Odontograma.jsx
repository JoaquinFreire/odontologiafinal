import React, { useState, useEffect, useRef } from 'react';
import '../../styles/Odontograma.css';

const CONSTANTS = {
  TOOTH_RADIUS: 22, 
  INNER_RADIUS: 11, 
  GAP: 15, 
  ROW_GAP: 110, 
  COLORS: {
    RED: '#d32f2f',
    BLUE: '#1976d2',
    BLACK: '#333333',
    WHITE: '#ffffff',
    HOVER: 'rgba(0,0,0,0.05)'
  }
};

const ADULTO_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const ADULTO_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const NINO_UPPER = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
const NINO_LOWER = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

const ToolGroup = ({ title, tools, selectedTool, onSelect, disabled = false }) => (
  <div className="tool-group">
    <h4>{title}</h4>
    <div className="button-row">
      {tools.map(t => (
        <button 
          key={t.id} 
          className={`tool-btn-large ${selectedTool === t.id ? 'active' : ''} ${t.className || ''}`}
          onClick={() => onSelect(t.id)}
          disabled={disabled}
        >
          {t.label}
        </button>
      ))}
    </div>
  </div>
);

const SingleTooth = ({ id, x, y, data, onInteraction, isSelected }) => {
  const { faces = {}, attributes = {} } = data;
  const getColor = (state) => state === 'red' ? CONSTANTS.COLORS.RED : CONSTANTS.COLORS.BLUE;
  const r1 = CONSTANTS.INNER_RADIUS;
  const r2 = CONSTANTS.TOOTH_RADIUS;
  
  const facePaths = {
    top: `M ${-r1/Math.sqrt(2)} ${-r1/Math.sqrt(2)} L ${-r2/Math.sqrt(2)} ${-r2/Math.sqrt(2)} A ${r2} ${r2} 0 0 1 ${r2/Math.sqrt(2)} ${-r2/Math.sqrt(2)} L ${r1/Math.sqrt(2)} ${-r1/Math.sqrt(2)} A ${r1} ${r1} 0 0 0 ${-r1/Math.sqrt(2)} ${-r1/Math.sqrt(2)}`,
    bottom: `M ${-r1/Math.sqrt(2)} ${r1/Math.sqrt(2)} L ${-r2/Math.sqrt(2)} ${r2/Math.sqrt(2)} A ${r2} ${r2} 0 0 0 ${r2/Math.sqrt(2)} ${r2/Math.sqrt(2)} L ${r1/Math.sqrt(2)} ${r1/Math.sqrt(2)} A ${r1} ${r1} 0 0 1 ${-r1/Math.sqrt(2)} ${r1/Math.sqrt(2)}`,
    left: `M ${-r1/Math.sqrt(2)} ${-r1/Math.sqrt(2)} L ${-r2/Math.sqrt(2)} ${-r2/Math.sqrt(2)} A ${r2} ${r2} 0 0 0 ${-r2/Math.sqrt(2)} ${r2/Math.sqrt(2)} L ${-r1/Math.sqrt(2)} ${r1/Math.sqrt(2)} A ${r1} ${r1} 0 0 1 ${-r1/Math.sqrt(2)} ${-r1/Math.sqrt(2)}`,
    right: `M ${r1/Math.sqrt(2)} ${-r1/Math.sqrt(2)} L ${r2/Math.sqrt(2)} ${-r2/Math.sqrt(2)} A ${r2} ${r2} 0 0 1 ${r2/Math.sqrt(2)} ${r2/Math.sqrt(2)} L ${r1/Math.sqrt(2)} ${r1/Math.sqrt(2)} A ${r1} ${r1} 0 0 0 ${r1/Math.sqrt(2)} ${-r1/Math.sqrt(2)}`
  };

  return (
    <g transform={`translate(${x}, ${y})`} onClick={(e) => onInteraction(e, id)} style={{ cursor: 'pointer' }}>
      <circle r={r2 + 4} fill={isSelected ? 'rgba(255, 235, 59, 0.4)' : 'transparent'} />
      {Object.entries(facePaths).map(([face, path]) => (
        <path key={face} id={`face-${id}-${face}`} d={path} stroke={CONSTANTS.COLORS.BLACK} strokeWidth="1" fill={faces[face] ? getColor(faces[face]) : CONSTANTS.COLORS.WHITE} />
      ))}
      <circle id={`face-${id}-center`} r={r1} stroke={CONSTANTS.COLORS.BLACK} strokeWidth="1" fill={faces.center ? getColor(faces.center) : CONSTANTS.COLORS.WHITE} />
      <g pointerEvents="none">
        {attributes.crown && <circle r={r2 + 4} fill="none" stroke={getColor(attributes.crown)} strokeWidth="2.5" />}
        {attributes.missing && (
          <g stroke={getColor(attributes.missing)} strokeWidth="3">
            <line x1={-r2} y1={-r2} x2={r2} y2={r2} /><line x1={r2} y1={-r2} x2={-r2} y2={r2} />
          </g>
        )}
        {attributes.implant && <text y={r2 + 15} textAnchor="middle" fill={getColor(attributes.implant)} fontWeight="bold" fontSize="14">I</text>}
        {attributes.endodontics && <text y={-r2 - 8} textAnchor="middle" fill={getColor(attributes.endodontics)} fontWeight="bold" fontSize="12">Tc</text>}
      </g>
      <text y={r2 + 32} textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold" pointerEvents="none">{id}</text>
    </g>
  );
};

const Odontograma = ({ initialData, onDataChange, isReadOnly = false }) => {
  const [view, setView] = useState('adult'); 
  const [data, setData] = useState(initialData || {
    adult: { teethState: {}, connections: [] },
    child: { teethState: {}, connections: [] },
    observaciones: '',
    elementos_dentarios: '',
    version: 1,
    treatments: []
  });
  const [selectedTool, setSelectedTool] = useState('cursor');
  const [interactionStep, setInteractionStep] = useState(null);
  const lastInitialData = useRef();

  // Update internal state when initialData changes
  useEffect(() => {
    if (initialData && JSON.stringify(initialData) !== JSON.stringify(lastInitialData.current)) {
      lastInitialData.current = initialData;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(initialData);
    }
  }, [initialData]);

  const updateData = (newData) => {
    // Si es read-only, no permitir cambios
    if (isReadOnly) return;
    
    setData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  // Notify parent when data changes - removed to avoid infinite loop

  const currentTeethUpper = view === 'adult' ? ADULTO_UPPER : NINO_UPPER;
  const currentTeethLower = view === 'adult' ? ADULTO_LOWER : NINO_LOWER;

  const getCoords = (id, currentView) => {
    const teethU = currentView === 'adult' ? ADULTO_UPPER : NINO_UPPER;
    const teethL = currentView === 'adult' ? ADULTO_LOWER : NINO_LOWER;
    const isUpper = teethU.includes(id);
    const index = isUpper ? teethU.indexOf(id) : teethL.indexOf(id);
    if (index === -1) return null;

    const offset = currentView === 'child' ? (ADULTO_UPPER.length - NINO_UPPER.length) * (CONSTANTS.TOOTH_RADIUS + CONSTANTS.GAP/2) : 0;
    const x = 60 + offset + index * (CONSTANTS.TOOTH_RADIUS * 2 + CONSTANTS.GAP);
    const y = isUpper ? 80 : 80 + CONSTANTS.TOOTH_RADIUS * 2 + CONSTANTS.ROW_GAP;
    return { x, y, isUpper };
  };

  const handleToothInteraction = (e, id) => {
    // Si está en modo lectura, no permitir interacciones
    if (isReadOnly) return;
    
    const targetId = e.target.id;
    const viewData = data[view];

    if (selectedTool.startsWith('face_') && targetId.startsWith('face-')) {
      const face = targetId.split('-')[2];
      const color = selectedTool.split('_')[1];
      const tooth = viewData.teethState[id] || { faces: {}, attributes: {} };
      const newFaces = { ...tooth.faces, [face]: tooth.faces[face] === color ? null : color };
      updateData({ ...data, [view]: { ...viewData, teethState: { ...viewData.teethState, [id]: { ...tooth, faces: newFaces } } } });
      return;
    }

    const toolPrefix = selectedTool.split('_')[0];
    const attrMap = { crown: 'crown', missing: 'missing', tc: 'endodontics', imp: 'implant' };
    if (attrMap[toolPrefix]) {
      const color = selectedTool.split('_')[1];
      const attrKey = attrMap[toolPrefix];
      const tooth = viewData.teethState[id] || { faces: {}, attributes: {} };
      const newVal = tooth.attributes[attrKey] === color ? null : color;
      updateData({ ...data, [view]: { ...viewData, teethState: { ...viewData.teethState, [id]: { ...tooth, attributes: { ...tooth.attributes, [attrKey]: newVal } } } } });
      return;
    }

    if (selectedTool.startsWith('bridge')) {
      if (!interactionStep) {
        setInteractionStep({ startId: id });
      } else if (interactionStep.startId !== id) {
        const parts = selectedTool.split('_');
        const newConn = { start: interactionStep.startId, end: id, type: parts[1], color: parts[2] };
        updateData({ ...data, [view]: { ...viewData, connections: [...viewData.connections, newConn] } });
        setInteractionStep(null);
      }
    }
  };

  return (
    <div className="odontograma-app">
      <div className="view-selector">
        <button className={`view-btn ${view === 'adult' ? 'active' : ''}`} onClick={() => {setView('adult'); setInteractionStep(null);}} disabled={isReadOnly}>Adulto</button>
        <button className={`view-btn ${view === 'child' ? 'active' : ''}`} onClick={() => {setView('child'); setInteractionStep(null);}} disabled={isReadOnly}>Niño</button>
      </div>

      <div className="controls-panel">
        <ToolGroup title="Básico" tools={[{id: 'cursor', label: 'Cursor'}]} selectedTool={selectedTool} onSelect={(id) => {setSelectedTool(id); setInteractionStep(null);}} disabled={isReadOnly} />
        <ToolGroup title="Caries/Obt." tools={[{id: 'face_red', label: '●', className: 'text-red'}, {id: 'face_blue', label: '●', className: 'text-blue'}]} selectedTool={selectedTool} onSelect={(id) => {setSelectedTool(id); setInteractionStep(null);}} disabled={isReadOnly} />
        <ToolGroup title="Coronas" tools={[{id: 'crown_red', label: '○', className: 'text-red'}, {id: 'crown_blue', label: '○', className: 'text-blue'}]} selectedTool={selectedTool} onSelect={(id) => {setSelectedTool(id); setInteractionStep(null);}} disabled={isReadOnly} />
        <ToolGroup title="Pieza Aus." tools={[{id: 'missing_red', label: 'X', className: 'text-red'}, {id: 'missing_blue', label: 'X', className: 'text-blue'}]} selectedTool={selectedTool} onSelect={(id) => {setSelectedTool(id); setInteractionStep(null);}} disabled={isReadOnly} />
        <ToolGroup title="TC / Imp" tools={[{id: 'tc_red', label: 'Tc', className: 'text-red'}, {id: 'tc_blue', label: 'Tc', className: 'text-blue'}, {id: 'imp_red', label: 'I', className: 'text-red'}, {id: 'imp_blue', label: 'I', className: 'text-blue'}]} selectedTool={selectedTool} onSelect={(id) => {setSelectedTool(id); setInteractionStep(null);}} disabled={isReadOnly} />
        <ToolGroup title="Prót. Fija" tools={[{id: 'bridge_fixed_red', label: '▭', className: 'text-red'}, {id: 'bridge_fixed_blue', label: '▭', className: 'text-blue'}]} selectedTool={selectedTool} onSelect={(id) => {setSelectedTool(id); setInteractionStep(null);}} disabled={isReadOnly} />
        <ToolGroup title="Prót. Rem." tools={[{id: 'bridge_removable_red', label: '⟷', className: 'text-red'}, {id: 'bridge_removable_blue', label: '⟷', className: 'text-blue'}]} selectedTool={selectedTool} onSelect={(id) => {setSelectedTool(id); setInteractionStep(null);}} disabled={isReadOnly} />
      </div>

      <div className="svg-container">
        <svg viewBox="0 0 1000 350" className="odontograma-svg">
          {data[view].connections.map((conn, i) => {
            const s = getCoords(conn.start, view);
            const e = getCoords(conn.end, view);
            if (!s || !e) return null;
            const color = conn.color === 'red' ? CONSTANTS.COLORS.RED : CONSTANTS.COLORS.BLUE;

            if (conn.type === 'fixed') {
              const xMin = Math.min(s.x, e.x) - CONSTANTS.TOOTH_RADIUS - 2;
              const xMax = Math.max(s.x, e.x) + CONSTANTS.TOOTH_RADIUS + 2;
              const yMin = s.y - CONSTANTS.TOOTH_RADIUS - 2;
              return (
                <g key={i} onClick={() => {
                  const newConns = data[view].connections.filter((_, idx) => idx !== i);
                  updateData({...data, [view]: {...data[view], connections: newConns}});
                }} style={{cursor:'pointer'}}>
                  <rect x={xMin} y={yMin} width={xMax - xMin} height={CONSTANTS.TOOTH_RADIUS * 2 + 4} fill="none" stroke={color} strokeWidth="3" rx="4" />
                  <circle cx={(xMin + xMax)/2} cy={yMin} r="8" fill="#444" /><text x={(xMin + xMax)/2} y={yMin + 4} textAnchor="middle" fill="white" fontSize="10">x</text>
                </g>
              );
            } else {
              const x1 = s.x; const x2 = e.x;
              const yBase = s.y + (s.isUpper ? -CONSTANTS.TOOTH_RADIUS : CONSTANTS.TOOTH_RADIUS);
              const yLine = yBase + (s.isUpper ? -25 : 25);
              return (
                <g key={i} onClick={() => {
                   const newConns = data[view].connections.filter((_, idx) => idx !== i);
                   updateData({...data, [view]: {...data[view], connections: newConns}});
                }} style={{cursor:'pointer'}}>
                  <path d={`M ${x1} ${yBase} L ${x1} ${yLine} L ${x2} ${yLine} L ${x2} ${yBase}`} stroke={color} strokeWidth="3" fill="none" />
                  <circle cx={(x1+x2)/2} cy={yLine} r="8" fill="#444" /><text x={(x1+x2)/2} y={yLine+4} textAnchor="middle" fill="white" fontSize="10">x</text>
                </g>
              );
            }
          })}

          {currentTeethUpper.map(id => <SingleTooth key={id} id={id} {...getCoords(id, view)} data={data[view].teethState[id] || {}} isSelected={interactionStep?.startId === id} onInteraction={handleToothInteraction} />)}
          <line x1="40" y1="175" x2="960" y2="175" stroke="#eee" strokeWidth="2" />
          {currentTeethLower.map(id => <SingleTooth key={id} id={id} {...getCoords(id, view)} data={data[view].teethState[id] || {}} isSelected={interactionStep?.startId === id} onInteraction={handleToothInteraction} />)}
        </svg>
      </div>

      <div className="odontograma-fields">
        <div className="field-group">
          <label htmlFor="elementos_dentarios">Elementos Dentarios:</label>
          <input
            id="elementos_dentarios"
            type="text"
            value={data.elementos_dentarios || ''}
            onChange={(e) => updateData({...data, elementos_dentarios: e.target.value})}
            placeholder="Ej: 32"
            disabled={isReadOnly}
          />
        </div>
        <div className="field-group">
          <label htmlFor="observaciones">Observaciones:</label>
          <textarea
            id="observaciones"
            value={data.observaciones || ''}
            onChange={(e) => updateData({...data, observaciones: e.target.value})}
            placeholder="Observaciones del odontograma..."
            rows="5"
            disabled={isReadOnly}
          />
        </div>
        {isReadOnly && (
          <div className="readonly-notice">
            ℹ️ Esta versión anterior es de solo lectura. Solo puedes ver los datos.
          </div>
        )}
      </div>
    </div>
  );
};

export default Odontograma;