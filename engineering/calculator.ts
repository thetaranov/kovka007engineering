// --- engineering/calculator.ts ---

import { CanopyConfig, CalculationResult, CalculatedTruss, TrussMember, SpecificationItem } from '../types';
import { calculateSnowLoad, calculateWindLoad } from './loads';
import { findOptimalProfile } from './materials';
import { analyzeTruss } from './trussAnalysis';

/**
 * Главная функция, выполняющая полный цикл расчета навеса.
 */
export function runCalculation(config: CanopyConfig): CalculationResult {
  // 1. Расчет нагрузок (в кг/м²)
  const snowLoad = calculateSnowLoad(config.region, config.roofAngle);
  const windLoad = calculateWindLoad();
  const totalLoadPerSqm = snowLoad + windLoad;

  // 2. Построение геометрии фермы
  const trussGeometry = buildTrussGeometry(config);

  // 3. Распределение нагрузки по узлам
  const nodeLoads = new Array(trussGeometry.nodes.length).fill(0);
  const tributaryWidth = config.spacing / 1000; // Ширина сбора нагрузки на ферму, в метрах

  // Находим узлы верхнего пояса (кроме опорных)
  const upperChordInternalNodes = trussGeometry.members
    .filter(m => m.id.startsWith('Верхний'))
    .flatMap(m => [m.startNode, m.endNode])
    .filter((nodeIdx) => {
        const node = trussGeometry.nodes[nodeIdx];
        // Исключаем опорные узлы (те, что на y=0)
        return node.y > 1e-6; 
    })
    .filter((value, index, self) => self.indexOf(value) === index); // Оставляем только уникальные

  // Площадь сбора на один узел (упрощенно: шаг ферм * шаг панелей)
  const panelWidthMeters = (config.width / 1000) / (trussGeometry.members.filter(m => m.id.startsWith('Нижний')).length);
  const loadPerNodeKg = totalLoadPerSqm * tributaryWidth * panelWidthMeters;
  const loadPerNodeKN = (loadPerNodeKg * 9.81) / 1000; // в кН

  upperChordInternalNodes.forEach(nodeIndex => {
    // Нагрузка прикладывается вертикально вниз
    nodeLoads[nodeIndex] = -loadPerNodeKN;
  });

  // 4. Статический анализ
  const membersWithForces = analyzeTruss(trussGeometry, nodeLoads);

  // 5. Подбор сечений и создание спецификации
  const finalMembers: TrussMember[] = [];
  const specMap: Map<string, SpecificationItem> = new Map();

  membersWithForces.forEach(member => {
    const isCompressed = member.force < 0;
    // Расчетная прочность стали С245 Ry=240 МПа = 24 кН/см²
    const designResistance = 24 * 0.9; // Ry * gamma_c

    let requiredArea = Math.abs(member.force) / designResistance;
    let requiredInertia = 0;

    if (isCompressed) {
        // Упрощенная формула Эйлера для требуемого момента инерции от гибкости
        // I_req ≈ (F * (μ * L)^2) / (π² * E)
        const E_knsm2 = 2.06e4; // Модуль упругости в кН/см²
        const mu = 0.9; // Коэффициент расчетной длины для сжатых стержней решетки
        const lef_cm = mu * (member.length / 10);
        requiredInertia = (Math.abs(member.force) * lef_cm ** 2) / (Math.PI ** 2 * E_knsm2);
    }

    const profile = findOptimalProfile(requiredArea, requiredInertia);

    if (profile) {
      finalMembers.push({ ...member, profile });
      const baseName = member.id.split(' ')[0];
      const key = `${baseName}|${profile.name}`;

      const item = specMap.get(key);
      if (item) {
        item.count++;
        item.totalLength += member.length / 1000;
      } else {
        specMap.set(key, {
          name: baseName, profileName: profile.name, length: member.length,
          count: 1, totalLength: member.length / 1000,
        });
      }
    }
  });

  const specification = Array.from(specMap.values()).map(item => ({
      ...item, totalLength: parseFloat(item.totalLength.toFixed(2)),
  }));

  return {
    config,
    truss: { nodes: trussGeometry.nodes, members: finalMembers },
    specification,
    loads: { snowLoad, windLoad },
  };
}

/**
 * Строит параметрическую геометрию W-образной фермы.
 */
function buildTrussGeometry(config: CanopyConfig): CalculatedTruss {
  const { width, height } = config;
  const nodes: { x: number; y: number }[] = [];
  const members: Omit<TrussMember, 'profile' | 'force'>[] = [];

  // Определяем количество панелей, должно быть четным. Примерно 1.2м на панель.
  let numPanels = Math.max(4, Math.floor(width / 1200) * 2);
  if (numPanels % 2 !== 0) numPanels++;

  const panelWidth = width / numPanels;
  const halfNumPanels = numPanels / 2;

  // Создаем узлы нижнего и верхнего поясов
  const lowerNodesIdx: number[] = [];
  const upperNodesIdx: number[] = [];

  for (let i = 0; i <= numPanels; i++) {
    // Нижний пояс
    nodes.push({ x: i * panelWidth, y: 0 });
    lowerNodesIdx.push(nodes.length - 1);

    // Верхний пояс (кроме опор)
    if (i > 0 && i < numPanels) {
      const x = i * panelWidth;
      const y = i <= halfNumPanels
        ? (x * (height / (width / 2)))
        : ((width - x) * (height / (width / 2)));
      nodes.push({ x, y });
      upperNodesIdx.push(nodes.length - 1);
    }
  }

  const addMember = (startIdx: number, endIdx: number, id: string) => {
    const len = Math.hypot(nodes[endIdx].x - nodes[startIdx].x, nodes[endIdx].y - nodes[startIdx].y);
    members.push({ id, startNode: startIdx, endNode: endIdx, length: len });
  };

  // Стержни поясов
  for (let i = 0; i < numPanels; i++) {
    addMember(lowerNodesIdx[i], lowerNodesIdx[i+1], `Нижний пояс ${i+1}`);
  }
  // Верхний пояс сложнее, т.к. узлы разбросаны
  addMember(lowerNodesIdx[0], upperNodesIdx[0], `Верхний пояс 1`);
  for (let i = 0; i < upperNodesIdx.length - 1; i++) {
     addMember(upperNodesIdx[i], upperNodesIdx[i+1], `Верхний пояс ${i+2}`);
  }
  addMember(upperNodesIdx[upperNodesIdx.length - 1], lowerNodesIdx[numPanels], `Верхний пояс ${numPanels}`);

  // Стержни решетки (W-тип)
  for (let i = 0; i < halfNumPanels; i++) {
    // Левая половина
    addMember(upperNodesIdx[i], lowerNodesIdx[i], `Стойка ${i+1}`);
    addMember(upperNodesIdx[i], lowerNodesIdx[i+1], `Раскос ${i+1}`);
    // Правая половина (зеркально)
    const upperRightIdx = upperNodesIdx[numPanels - 2 - i];
    const lowerRightIdx1 = lowerNodesIdx[numPanels - 1 - i];
    const lowerRightIdx2 = lowerNodesIdx[numPanels - i];
    addMember(upperRightIdx, lowerRightIdx1, `Раскос ${halfNumPanels + i + 1}`);
    addMember(upperRightIdx, lowerRightIdx2, `Стойка ${halfNumPanels + i + 1}`);
  }

  return { nodes, members: members as any };
}