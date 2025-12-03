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

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' };
const groupStyle: React.CSSProperties = { marginBottom: '16px' };

export const Controls: React.FC<ControlsProps> = ({ config, setConfig, onCalculate, onExportDxf, onExportTxt, isResultReady }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: Number(value) }));
  };

  return (
    <div className="controls-panel">
      <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Параметры навеса</h2>
      <div style={groupStyle}><label style={labelStyle}>Ширина фермы, мм</label><input style={inputStyle} type="number" name="trussWidth" value={config.trussWidth} onChange={handleChange} /></div>
      <div style={groupStyle}><label style={labelStyle}>Высота фермы, мм</label><input style={inputStyle} type="number" name="trussHeight" value={config.trussHeight} onChange={handleChange} /></div>
      <div style={groupStyle}><label style={labelStyle}>Высота колонн, мм</label><input style={inputStyle} type="number" name="columnHeight" value={config.columnHeight} onChange={handleChange} /></div>
      <div style={groupStyle}><label style={labelStyle}>Расстояние между колонн, мм</label><input style={inputStyle} type="number" name="columnSpacing" value={config.columnSpacing} onChange={handleChange} /></div>
      <div style={groupStyle}><label style={labelStyle}>Шаг ферм, мм</label><input style={inputStyle} type="number" name="trussSpacing" value={config.trussSpacing} onChange={handleChange} /></div>
      <div style={groupStyle}><label style={labelStyle}>Снеговой регион</label><select style={inputStyle} name="region" value={config.region} onChange={(e) => setConfig(p => ({...p, region: e.target.value as SnowRegion}))}>
          <option value="I">I (80 кг/м²)</option><option value="II">II (120 кг/м²)</option><option value="III">III (180 кг/м²)</option><option value="IV">IV (240 кг/м²)</option><option value="V">V (320 кг/м²)</option>
      </select></div>
      <button onClick={onCalculate} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '6px', backgroundColor: '#1f2937', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '16px' }}>Пересчитать</button>
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