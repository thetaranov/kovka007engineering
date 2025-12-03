// --- engineering/trussAnalysis.ts (Обновлено) ---

import { CalculatedTruss, TrussMember } from '../types';

/**
 * Решает систему линейных уравнений 2x2:
 * a1*x + b1*y = c1
 * a2*x + b2*y = c2
 */
function solve2x2(a1: number, b1: number, c1: number, a2: number, b2: number, c2: number): [number, number] | null {
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < 1e-9) { // Определитель равен нулю, система не имеет единственного решения
    return null;
  }
  const x = (c1 * b2 - c2 * b1) / det;
  const y = (a1 * c2 - a2 * c1) / det;
  return [x, y];
}

/**
 * Выполняет статический анализ 2D фермы методом вырезания узлов.
 * @param truss - Геометрия фермы (узлы и стержни)
 * @param loads - Массив внешних нагрузок, приложенных к узлам [в кН]
 * @returns {TrussMember[]} - Массив стержней с рассчитанными осевыми усилиями.
 */
export function analyzeTruss(truss: CalculatedTruss, loads: number[]): TrussMember[] {
  const { nodes, members } = truss;
  const forces = new Array(members.length).fill(NaN);

  // 1. Найти опорные реакции (для симметричной фермы и вертикальных нагрузок)
  const totalLoad = loads.reduce((sum, load) => sum + load, 0);
  const reactionY = totalLoad / 2;

  // 2. Итеративно обходить узлы
  // Создадим карту узлов для удобного поиска стержней, сходящихся в узле
  const nodeMap: number[][] = nodes.map(() => []);
  members.forEach((member, i) => {
    nodeMap[member.startNode].push(i);
    nodeMap[member.endNode].push(i);
  });

  // Начинаем с левого опорного узла (индекс 0)
  let knownForcesCount = 0;
  const processedNodes = new Array(nodes.length).fill(false);

  // Цикл будет продолжаться, пока не найдем все усилия
  while (knownForcesCount < members.length) {
    let progressMade = false;
    for (let i = 0; i < nodes.length; i++) {
      if (processedNodes[i]) continue;

      const unknownMembersIndices = nodeMap[i].filter(mIdx => isNaN(forces[mIdx]));

      if (unknownMembersIndices.length === 2) {
        let sumFx = 0;
        let sumFy = loads[i] || 0;

        // Если это опорный узел, добавляем реакцию опоры
        if (i === 0 || i === nodes.findIndex(n => n.x === config.width && n.y === 0)) {
           sumFy += reactionY;
        }

        // Суммируем проекции известных сил
        nodeMap[i].forEach(mIdx => {
          if (!isNaN(forces[mIdx])) {
            const member = members[mIdx];
            const force = forces[mIdx];
            const otherNodeIndex = member.startNode === i ? member.endNode : member.startNode;
            const angle = Math.atan2(nodes[otherNodeIndex].y - nodes[i].y, nodes[otherNodeIndex].x - nodes[i].x);
            sumFx += force * Math.cos(angle);
            sumFy += force * Math.sin(angle);
          }
        });

        // Составляем систему уравнений для двух неизвестных
        const m1_idx = unknownMembersIndices[0];
        const m2_idx = unknownMembersIndices[1];
        const member1 = members[m1_idx];
        const member2 = members[m2_idx];

        const otherNode1 = nodes[member1.startNode === i ? member1.endNode : member1.startNode];
        const otherNode2 = nodes[member2.startNode === i ? member2.endNode : member2.startNode];

        const angle1 = Math.atan2(otherNode1.y - nodes[i].y, otherNode1.x - nodes[i].x);
        const angle2 = Math.atan2(otherNode2.y - nodes[i].y, otherNode2.x - nodes[i].x);

        // a1*F1 + b1*F2 = c1  (ΣFx = 0)
        // a2*F1 + b2*F2 = c2  (ΣFy = 0)
        const a1 = Math.cos(angle1), b1 = Math.cos(angle2), c1 = -sumFx;
        const a2 = Math.sin(angle1), b2 = Math.sin(angle2), c2 = -sumFy;

        const solution = solve2x2(a1, b1, c1, a2, b2, c2);

        if (solution) {
          forces[m1_idx] = solution[0];
          forces[m2_idx] = solution[1];
          processedNodes[i] = true;
          progressMade = true;
          knownForcesCount += 2;
        }
      }
    }
    // Если за целый проход не нашли ни одного узла, выходим, чтобы избежать бесконечного цикла
    if (!progressMade) break;
  }

  // Возвращаем стержни с посчитанными усилиями
  return members.map((member, i) => ({
    ...member,
    force: forces[i] || 0, // Если что-то не посчиталось, будет 0
  }));
}