// --- components/Controls.tsx ---

import React from 'react';
import { CanopyConfig, SnowRegion } from '../types';

interface ControlsProps {
  config: CanopyConfig;
  setConfig: React.Dispatch<React.SetStateAction<CanopyConfig>>;
  onCalculate: () => void;
  onExportDxf: () => void;
  onExportTxt: () => void;
  isResultReady: boolean;
}

// Стили для удобства
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#4b5563',
  marginBottom: '4px',
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  boxSizing: 'border-box',
};

export const Controls: React.FC<ControlsProps> = ({
  config,
  setConfig,
  onCalculate,
  onExportDxf,
  onExportTxt,
  isResultReady,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: name === 'trussType' ? value : Number(value) }));
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConfig(prev => ({ ...prev, region: e.target.value as SnowRegion }));
  }

  return (
    <div className="controls-panel">
      <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Параметры навеса</h2>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Ширина пролета (L), мм</label>
        <input style={inputStyle} type="number" name="width" value={config.width} onChange={handleChange} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Высота фермы (H), мм</label>
        <input style={inputStyle} type="number" name="height" value={config.height} onChange={handleChange} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Угол кровли, °</label>
        <input style={inputStyle} type="number" name="roofAngle" value={config.roofAngle} onChange={handleChange} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Шаг ферм, мм</label>
        <input style={inputStyle} type="number" name="spacing" value={config.spacing} onChange={handleChange} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Снеговой регион</label>
        <select style={inputStyle} name="region" value={config.region} onChange={handleRegionChange}>
          <option value="I">I (80 кг/м²)</option>
          <option value="II">II (120 кг/м²)</option>
          <option value="III">III (180 кг/м²)</option>
          <option value="IV">IV (240 кг/м²)</option>
          <option value="V">V (320 кг/м²)</option>
        </select>
      </div>

      <button
        onClick={onCalculate}
        style={{
          width: '100%',
          padding: '12px',
          border: 'none',
          borderRadius: '6px',
          backgroundColor: '#1f2937',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '16px',
        }}
      >
        Запустить расчет
      </button>

      <div style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '24px', display: isResultReady ? 'block' : 'none' }}>
        <h3 style={{ marginTop: 0 }}>Экспорт</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onExportDxf} style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>Экспорт в DXF</button>
            <button onClick={onExportTxt} style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>Спецификация TXT</button>
        </div>
      </div>
    </div>
  );
};