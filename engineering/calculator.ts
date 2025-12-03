// --- engineering/calculator.ts ---

import { CanopyConfig, CalculationResult, CalculatedTruss, TrussMember, SpecificationItem } from '../types';
import { calculateSnowLoad, calculateWindLoad } from './loads';
import { findOptimalProfile } from './materials';
import { analyzeTruss } from './trussAnalysis';

/**
 * Главная функция, выполняющая полный цикл расчета навеса.
 * @param config - Входные параметры от пользователя.
 * @returns {CalculationResult} - Готовый объект с результатами.
 */
export function runCalculation(config: CanopyConfig): CalculationResult {
  // 1. Расчет нагрузок
  const snowLoad = calculateSnowLoad(config.region, config.roofAngle);
  const windLoad = calculateWindLoad();
  // Нагрузка на ферму (кг/м) = нагрузка (кг/м²) * шаг ферм (м)
  const totalLoadPerMeter = (snowLoad + windLoad) * (config.spacing / 1000);
  const totalLoadPerMeterKN = totalLoadPerMeter * 9.81 / 1000; // в кН/м

  // 2. Построение геометрии фермы
  const trussGeometry = buildTrussGeometry(config);

  // 3. Статический анализ (используем заглушку)
  const membersWithForces = analyzeTruss(trussGeometry, totalLoadPerMeterKN);

  // 4. Подбор сечений и создание спецификации
  const finalMembers: TrussMember[] = [];
  const specMap: Map<string, SpecificationItem> = new Map();

  membersWithForces.forEach(member => {
    // ЗАГЛУШКА: Упрощенный подбор профиля.
    // Реальный расчет требует проверки на устойчивость (гибкость).
    const isCompressed = member.force < 0;
    let requiredArea = Math.abs(member.force) / (21 * 0.9); // Упрощенная формула прочности, кН / (кН/см²)
    let requiredInertia = 0;

    if (isCompressed) {
        // Упрощенная формула для требуемого момента инерции от гибкости
        const flexibility = 100; // Принимаем условную гибкость
        requiredInertia = (requiredArea * (member.length / 10) ** 2) / (Math.PI ** 2 * 21000) * flexibility;
    }

    const profile = findOptimalProfile(requiredArea, requiredInertia);

    if (profile) {
      finalMembers.push({ ...member, profile });

      const baseName = member.id.split(' ')[0]; // "Верхний", "Нижний" и т.д.
      const key = `${baseName}|${profile.name}`;

      if (specMap.has(key)) {
        const item = specMap.get(key)!;
        item.count++;
        item.totalLength += member.length / 1000;
      } else {
        specMap.set(key, {
          name: baseName,
          profileName: profile.name,
          length: member.length,
          count: 1,
          totalLength: member.length / 1000,
        });
      }
    }
  });

  const specification = Array.from(specMap.values()).map(item => ({
      ...item,
      totalLength: parseFloat(item.totalLength.toFixed(2)),
  }));

  return {
    config,
    truss: { nodes: trussGeometry.nodes, members: finalMembers },
    specification,
    loads: { snowLoad, windLoad },
  };
}

/**
 * Строит геометрию фермы на основе конфигурации.
 * (Реализовано для W-образной двускатной фермы)
 */
function buildTrussGeometry(config: CanopyConfig): CalculatedTruss {
  const { width, height } = config;
  const nodes: { x: number; y: number }[] = [];
  const members: Omit<TrussMember, 'profile' | 'force'>[] = [];

  // Основные узлы
  nodes.push({ x: 0, y: 0 }); // 0 - Левая опора
  nodes.push({ x: width / 2, y: height }); // 1 - Конек
  nodes.push({ x: width, y: 0 }); // 2 - Правая опора
  nodes.push({ x: width / 4, y: 0 }); // 3 - Узел нижнего пояса
  nodes.push({ x: (width * 3) / 4, y: 0 }); // 4 - Узел нижнего пояса
  nodes.push({ x: width / 4, y: height / 2 }); // 5 - Узел верхнего пояса
  nodes.push({ x: (width * 3) / 4, y: height / 2 }); // 6 - Узел верхнего пояса

  // Функция для добавления стержня
  const addMember = (start: number, end: number, id: string) => {
    const startNode = nodes[start];
    const endNode = nodes[end];
    const length = Math.hypot(endNode.x - startNode.x, endNode.y - startNode.y);
    members.push({ id, startNode: start, endNode: end, length });
  };

  // Верхний пояс
  addMember(0, 5, "Верхний пояс 1");
  addMember(5, 1, "Верхний пояс 2");
  addMember(1, 6, "Верхний пояс 3");
  addMember(6, 2, "Верхний пояс 4");

  // Нижний пояс
  addMember(0, 3, "Нижний пояс 1");
  addMember(3, 4, "Нижний пояс 2");
  addMember(4, 2, "Нижний пояс 3");

  // Решетка (W-тип)
  addMember(5, 3, "Раскос 1");
  addMember(1, 3, "Стойка 1");
  addMember(1, 4, "Стойка 2");
  addMember(6, 4, "Раскос 2");

  return { nodes, members: members as any };
}