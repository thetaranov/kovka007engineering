// --- engineering/trussAnalysis.ts ---

import { CalculatedTruss, TrussMember } from '../types';

/**
 * (ЗАГЛУШКА) Выполняет статический анализ фермы.
 * В реальной реализации здесь будет использоваться метод вырезания узлов или МКЭ.
 * 
 * @param truss - Геометрия фермы (узлы и стержни)
 * @param totalLoad - Суммарная равномерно-распределенная нагрузка на верхний пояс, кН/м
 * @returns {TrussMember[]} - Массив стержней с рассчитанными осевыми усилиями.
 */
export function analyzeTruss(truss: CalculatedTruss, totalLoad: number): TrussMember[] {
  const widthMeters = Math.max(...truss.nodes.map(n => n.x)) / 1000;

  // Имитация расчета: просто присваиваем примерные усилия
  // Это НЕ является реальным инженерным расчетом!
  return truss.members.map(member => {
    let force = 0;
    const isTopChord = member.id.includes('Верхний');
    const isBottomChord = member.id.includes('Нижний');
    const isWeb = member.id.includes('Раскос') || member.id.includes('Стойка');

    // Усилия сильно зависят от нагрузки и геометрии. Это грубая аппроксимация.
    const baseForce = totalLoad * widthMeters * 2.0; // Примерный множитель

    if (isTopChord) {
      force = -baseForce; // Сжатие
    } else if (isBottomChord) {
      force = baseForce * 0.9; // Растяжение
    } else if (isWeb) {
      // Усилия в раскосах зависят от их угла
      const startNode = truss.nodes[member.startNode];
      const endNode = truss.nodes[member.endNode];
      const angle = Math.atan2(Math.abs(endNode.y - startNode.y), Math.abs(endNode.x - startNode.x));
      const direction = (endNode.x - startNode.x) * (endNode.y - startNode.y);

      // Упрощенно: если раскос "поднимается" к центру - он сжат, иначе - растянут
      force = (baseForce / 3) / Math.sin(angle);
      if (direction > 0) {
        force = -force;
      }
    }

    return { ...member, force };
  });
}