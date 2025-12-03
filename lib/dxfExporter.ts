// --- lib/dxfExporter.ts ---

import { CalculationResult, TrussMember } from '../types';

export function exportToDxf(result: CalculationResult): string {
  const { nodes, members } = result.truss;
  let dxfContent = `
0
SECTION
2
HEADER
9
$ACADVER
1
AC1009
0
ENDSEC
0
SECTION
2
TABLES
0
ENDSEC
0
SECTION
2
BLOCKS
0
ENDSEC
0
SECTION
2
ENTITIES
`;

  // Добавляем стержни как линии
  members.forEach(member => {
    const start = nodes[member.startNode];
    const end = nodes[member.endNode];
    dxfContent += `
0
LINE
8
MEMBERS
10
${start.x.toFixed(2)}
20
${start.y.toFixed(2)}
11
${end.x.toFixed(2)}
21
${end.y.toFixed(2)}
`;
  });

  // Добавляем размеры
  const width = result.config.width;
  const height = result.config.height;
  const dimOffset = -500; // Смещение размерных линий

  // Горизонтальный размер
  dxfContent += `
0
DIMENSION
8
DIMENSIONS
10
0
20
${dimOffset}
11
${width}
21
${dimOffset}
13
0
23
0
14
${width}
24
0
70
33
`;

  // Вертикальный размер
  dxfContent += `
0
DIMENSION
8
DIMENSIONS
10
${-dimOffset}
20
0
11
${-dimOffset}
21
${height}
13
${width / 2}
23
0
14
${width / 2}
24
${height}
70
34
`;

  dxfContent += `
0
ENDSEC
0
EOF
`;

  return dxfContent.trim();
}