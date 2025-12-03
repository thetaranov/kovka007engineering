import React, { useState, useCallback, useEffect } from 'react';
import './styles/index.css';
import { CanopyConfig, CalculationResult } from './types';
import { Controls } from './components/Controls';
import { DrawingViewer } from './components/DrawingViewer';
import { Specification } from './components/Specification';
import { runCalculation } from './engineering/calculator';
import { exportToDxf } from './lib/dxfExporter';
import { exportToTxt } from './lib/textExporter';

const INITIAL_CONFIG: CanopyConfig = {
  trussWidth: 6660,
  trussHeight: 882,
  columnHeight: 2000,
  columnSpacing: 5500,
  columnWidth: 80,
  region: 'III',
  trussSpacing: 3000,
};

function App() {
  const [config, setConfig] = useState<CanopyConfig>(INITIAL_CONFIG);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleCalculate = useCallback(() => {
    const calculationResult = runCalculation(config);
    setResult(calculationResult);
  }, [config]);

  // Запускаем расчет при первой загрузке
  useEffect(() => {
    handleCalculate();
  }, []);

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportDxf = useCallback(() => {
    if (result) {
      const dxfContent = exportToDxf(result);
      downloadFile(`canopy_${result.config.trussWidth}x${result.config.trussHeight}.dxf`, dxfContent, 'application/dxf');
    }
  }, [result]);

  const handleExportTxt = useCallback(() => {
    if (result) {
      const txtContent = exportToTxt(result);
      downloadFile(`spec_${result.config.trussWidth}x${result.config.trussHeight}.txt`, txtContent, 'text/plain');
    }
  }, [result]);

  return (
    <div className="app-container">
      <Controls
        config={config}
        setConfig={setConfig}
        onCalculate={handleCalculate}
        onExportDxf={handleExportDxf}
        onExportTxt={handleExportTxt}
        isResultReady={!!result}
      />
      <main className="drawing-area">
        <DrawingViewer result={result} />
        <Specification items={result?.specification || []} />
      </main>
    </div>
  );
}

export default App;