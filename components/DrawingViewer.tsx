// --- components/DrawingViewer.tsx ---

import React from 'react';
import { CalculationResult } from '../types';

interface DrawingViewerProps {
  result: CalculationResult | null;
}

const SVG_PADDING = 50;
const DIM_OFFSET = 30; // Отступ для размерных линий

export const DrawingViewer: React.FC<DrawingViewerProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="drawing-viewer">
        <p style={{ color: '#9ca3af' }}>Задайте параметры и запустите расчет</p>
      </div>
    );
  }

  const { truss, config } = result;
  const { width, height } = config;

  // Рассчитываем viewBox для SVG, чтобы ферма вписывалась с отступами
  const viewBox = `
    ${-SVG_PADDING - DIM_OFFSET} 
    ${-SVG_PADDING - DIM_OFFSET} 
    ${width + (SVG_PADDING + DIM_OFFSET) * 2} 
    ${height + (SVG_PADDING + DIM_OFFSET) * 2}
  `;

  return (
    <div className="drawing-viewer">
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ transform: 'scale(1, -1)' }} // Переворачиваем Y-ось
      >
        {/* Стержни фермы */}
        {truss.members.map((member, i) => {
          const start = truss.nodes[member.startNode];
          const end = truss.nodes[member.endNode];
          return (
            <line
              key={i}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="#1f2937"
              strokeWidth="2"
            />
          );
        })}

        {/* --- Размерные линии --- */}
        <g stroke="#6b7280" strokeWidth="1" style={{ transform: 'scale(1, -1)' }}>
          {/* Горизонтальный размер */}
          <line x1="0" y1={-DIM_OFFSET} x2={width} y2={-DIM_OFFSET} />
          <line x1="0" y1={0} x2="0" y2={-DIM_OFFSET - 5} />
          <line x1={width} y1={0} x2={width} y2={-DIM_OFFSET - 5} />
          <text x={width / 2} y={-DIM_OFFSET - 8} textAnchor="middle" fontSize="12" fill="#374151">
            {width} мм
          </text>

          {/* Вертикальный размер */}
          <line x1={-DIM_OFFSET} y1="0" x2={-DIM_OFFSET} y2={height} />
          <line x1={0} y1="0" x2={-DIM_OFFSET - 5} y2="0" />
          <line x1={width / 2} y1={height} x2={-DIM_OFFSET - 5} y2={height} />
          <text
            x={-DIM_OFFSET - 8}
            y={height / 2}
            textAnchor="middle"
            fontSize="12"
            fill="#374151"
            transform={`rotate(-90, ${-DIM_OFFSET - 8}, ${height / 2})`}
          >
            {height} мм
          </text>
        </g>
      </svg>
    </div>
  );
};