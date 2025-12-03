import React from 'react';
import { CalculationResult } from '../types';

interface DrawingViewerProps {
  result: CalculationResult | null;
}

const DIM_OFFSET = 400; // Отступ для размерных линий

// Хелпер для отрисовки размерных линий
const Dimension = ({ x1, y1, x2, y2, text, orientation = 'horizontal' }: any) => {
    const offset = 20;
    const textOffset = 8;

    if (orientation === 'horizontal') {
        return <g stroke="#4b5563" strokeWidth="1" fontSize="120" textAnchor="middle" fill="#374151">
            <line x1={x1} y1={y1 - offset} x2={x2} y2={y2 - offset} />
            <line x1={x1} y1={y1} x2={x1} y2={y1 - offset - 5} />
            <line x1={x2} y1={y2} x2={x2} y2={y2 - offset - 5} />
            <text x={(x1 + x2) / 2} y={y1 - offset - textOffset} style={{ transform: 'scale(1, -1)' }}>{text}</text>
        </g>
    }

    return <g stroke="#4b5563" strokeWidth="1" fontSize="120" textAnchor="middle" fill="#374151">
        <line x1={x1 - offset} y1={y1} x2={x2 - offset} y2={y2} />
        <line x1={x1} y1={y1} x2={x1 - offset - 5} y2={y1} />
        <line x1={x2} y1={y2} x2={x2 - offset - 5} y2={y2} />
        <text x={x1 - offset - textOffset} y={(y1 + y2) / 2} transform={`rotate(-90, ${x1 - offset - textOffset}, ${(y1+y2)/2})`} style={{ transform: `scale(1, -1) rotate(90deg) translate(${(y1+y2)/-2}px, ${x1 - offset - textOffset}px)` }}>{text}</text>
    </g>
};


export const DrawingViewer: React.FC<DrawingViewerProps> = ({ result }) => {
  if (!result) return <div className="drawing-viewer"><p style={{ color: '#9ca3af' }}>Расчет...</p></div>;

  const { truss, columns, config } = result;
  const { trussWidth, trussHeight, columnHeight } = config;

  const totalHeight = columnHeight + trussHeight;
  const viewBox = `${-DIM_OFFSET * 2} ${-columnHeight - DIM_OFFSET * 2} ${trussWidth + DIM_OFFSET * 4} ${totalHeight + DIM_OFFSET * 4}`;

  const panelNodes = truss.members.filter(m => m.id.startsWith("Нижний")).map(m => truss.nodes[m.startNode]);
  panelNodes.push(truss.nodes[truss.members.find(m => m.id.endsWith(panelNodes.length.toString()))!.endNode]);

  return (
    <div className="drawing-viewer">
      <svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" >
        <g style={{ transform: `translate(0, ${-columnHeight}) scale(1, -1)` }}>
          {/* Колонны */}
          {columns.map((col, i) => (
            <rect key={i} x={col.x - col.width / 2} y={-col.height} width={col.width} height={col.height} fill="none" stroke="#1f2937" strokeWidth="2" />
          ))}
          {/* Ферма */}
          <g transform={`translate(0, ${trussHeight})`}>
            {truss.members.map((member, i) => {
              const start = truss.nodes[member.startNode];
              const end = truss.nodes[member.endNode];
              return <line key={i} x1={start.x} y1={start.y-trussHeight} x2={end.x} y2={end.y-trussHeight} stroke="#1f2937" strokeWidth="3" />;
            })}
          </g>
           {/* Размеры */}
            <g>
                {/* Размеры панелей */}
                {panelNodes.slice(0, -1).map((node, i) => {
                    const nextNode = panelNodes[i+1];
                    if (Math.abs(nextNode.x - node.x) < 1) return null;
                    return <Dimension key={i} x1={node.x} y1={0} x2={nextNode.x} y2={0} text={Math.round(nextNode.x - node.x)} />
                })}
                {/* Общие размеры */}
                <Dimension x1={trussWidth/2} y1={trussHeight} x2={trussWidth} y2={0} text={Math.round(trussWidth/2)} />
                <Dimension x1={0} y1={0} x2={trussWidth} y2={0} text={trussWidth} />
                <Dimension x1={columns[0].x} y1={-columnHeight} x2={columns[1].x} y2={-columnHeight} text={config.columnSpacing} />
                <Dimension orientation="vertical" x1={0} y1={0} x2={0} y2={-columnHeight} text={columnHeight} />
                <Dimension orientation="vertical" x1={trussWidth / 2} y1={0} x2={trussWidth / 2} y2={trussHeight} text={trussHeight} />
            </g>
        </g>
      </svg>
    </div>
  );
};