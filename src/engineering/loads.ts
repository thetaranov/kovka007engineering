// --- engineering/loads.ts ---

import { SnowRegion } from '../types';

// Нормативная снеговая нагрузка Sg для регионов РФ, кгс/м²
// (согласно карте 1 Приложения Ж СП 20.13330.2016)
const SNOW_LOAD_MAP: Record<SnowRegion, number> = {
  'I': 80,
  'II': 120,
  'III': 180,
  'IV': 240,
  'V': 320,
  'VI': 400,
  'VII': 480,
  'VIII': 560,
};

/**
 * Рассчитывает расчетную снеговую нагрузку на 1 м² горизонтальной проекции покрытия.
 * @param region - Снеговой регион
 * @param roofAngle - Угол наклона кровли в градусах
 * @returns Расчетная нагрузка S в кг/м²
 */
export function calculateSnowLoad(region: SnowRegion, roofAngle: number): number {
  const normativeLoadSg = SNOW_LOAD_MAP[region];

  // Коэффициент перехода от веса снегового покрова земли к снеговой нагрузке на покрытие
  let mu = 1;
  if (roofAngle > 60) {
    mu = 0;
  } else if (roofAngle > 25) {
    // Линейная интерполяция для углов от 25 до 60 градусов
    mu = (60 - roofAngle) / 35;
  }

  // Термический коэффициент Ct, коэффициент сноса Ce и др. принимаем равными 1 для упрощения.
  const ce = 1.0;
  const ct = 1.0;

  // Нормативное значение снеговой нагрузки S0
  const s0 = mu * ce * ct * normativeLoadSg;

  // Коэффициент надежности по нагрузке
  const gamma_f = 1.4;

  // Расчетное значение снеговой нагрузки S
  const fullLoad = s0 * gamma_f;

  return parseFloat(fullLoad.toFixed(2));
}

/**
 * Рассчитывает расчетную ветровую нагрузку.
 * (ЗАГЛУШКА: Возвращает фиксированное значение, требует полной реализации)
 * @returns Расчетная нагрузка в кг/м²
 */
export function calculateWindLoad(): number {
  // TODO: Реализовать полный расчет ветровой нагрузки по СП 20.13330.2016
  return 30; // Условное значение
}