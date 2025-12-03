// --- lib/textExporter.ts ---

import { CalculationResult } from '../types';

export function exportToTxt(result: CalculationResult): string {
  let txt = `СПЕЦИФИКАЦИЯ МЕТАЛЛА\n`;
  txt += `========================================\n`;
  txt += `Навес ${result.config.width}x${result.config.height} мм, Регион: ${result.config.region}\n`;
  txt += `Снеговая нагрузка: ${result.loads.snowLoad} кг/м²\n\n`;

  txt += `Поз. | Наименование   | Профиль      | Длина, мм | Кол-во | Общая L, м\n`;
  txt += `----------------------------------------------------------------------\n`;

  result.specification.forEach((item, index) => {
    const pos = (index + 1).toString().padEnd(4);
    const name = item.name.padEnd(14);
    const profile = item.profileName.padEnd(12);
    const length = item.length.toFixed(0).padEnd(9);
    const count = item.count.toString().padEnd(6);
    const totalL = item.totalLength.toFixed(2);
    txt += `${pos} | ${name} | ${profile} | ${length} | ${count} | ${totalL}\n`;
  });

  txt += `========================================\n`;

  return txt;
}