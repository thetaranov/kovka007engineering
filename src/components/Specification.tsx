// --- components/Specification.tsx ---

import React from 'react';
import { SpecificationItem } from '../types';

interface SpecificationProps {
  items: SpecificationItem[];
}

export const Specification: React.FC<SpecificationProps> = ({ items }) => {
  return (
    <div className="specification-table">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ padding: '8px 4px' }}>Поз.</th>
            <th style={{ padding: '8px 4px' }}>Наименование</th>
            <th style={{ padding: '8px 4px' }}>Профиль</th>
            <th style={{ padding: '8px 4px' }}>Длина, мм</th>
            <th style={{ padding: '8px 4px' }}>Кол-во</th>
            <th style={{ padding: '8px 4px' }}>Общая L, м</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '8px 4px' }}>{index + 1}</td>
              <td style={{ padding: '8px 4px' }}>{item.name}</td>
              <td style={{ padding: '8px 4px', fontWeight: 500 }}>{item.profileName}</td>
              <td style={{ padding: '8px 4px' }}>{item.length.toFixed(0)}</td>
              <td style={{ padding: '8px 4px' }}>{item.count}</td>
              <td style={{ padding: '8px 4px' }}>{item.totalLength.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};