// --- engineering/materials.ts ---

import { SteelProfile } from '../types';

// Сортамент замкнутых гнутосварных профилей (квадратных) по ГОСТ 30245-2003 (упрощенный)
export const STEEL_PROFILES: SteelProfile[] = [
  // h x h x t
  { name: '40x40x3', height: 40, width: 40, thickness: 3, area: 4.09, ix: 8.56, iy: 8.56, massPerMeter: 3.21 },
  { name: '40x40x4', height: 40, width: 40, thickness: 4, area: 5.13, ix: 10.1, iy: 10.1, massPerMeter: 4.03 },

  { name: '60x60x3', height: 60, width: 60, thickness: 3, area: 6.49, ix: 32.2, iy: 32.2, massPerMeter: 5.10 },
  { name: '60x60x4', height: 60, width: 60, thickness: 4, area: 8.33, ix: 39.5, iy: 39.5, massPerMeter: 6.54 },
  { name: '60x60x5', height: 60, width: 60, thickness: 5, area: 10.1, ix: 45.7, iy: 45.7, massPerMeter: 7.93 },

  { name: '80x80x4', height: 80, width: 80, thickness: 4, area: 11.5, ix: 101, iy: 101, massPerMeter: 9.06 },
  { name: '80x80x5', height: 80, width: 80, thickness: 5, area: 14.1, ix: 121, iy: 121, massPerMeter: 11.1 },
  { name: '80x80x6', height: 80, width: 80, thickness: 6, area: 16.6, ix: 139, iy: 139, massPerMeter: 13.0 },

  { name: '100x100x4', height: 100, width: 100, thickness: 4, area: 14.8, ix: 213, iy: 213, massPerMeter: 11.6 },
  { name: '100x100x5', height: 100, width: 100, thickness: 5, area: 18.1, ix: 257, iy: 257, massPerMeter: 14.2 },
  { name: '100x100x6', height: 100, width: 100, thickness: 6, area: 21.4, ix: 298, iy: 298, massPerMeter: 16.8 },

  { name: '120x120x5', height: 120, width: 120, thickness: 5, area: 22.1, ix: 469, iy: 469, massPerMeter: 17.4 },
  { name: '120x120x6', height: 120, width: 120, thickness: 6, area: 26.2, ix: 546, iy: 546, massPerMeter: 20.6 },

  { name: '140x140x6', height: 140, width: 140, thickness: 6, area: 31.0, ix: 921, iy: 921, massPerMeter: 24.3 },
  { name: '140x140x8', height: 140, width: 140, thickness: 8, area: 40.0, ix: 1160, iy: 1160, massPerMeter: 31.4 },
];

/**
 * Функция для поиска самого легкого (экономичного) профиля,
 * который удовлетворяет заданным требованиям.
 * 
 * @param requiredArea - Требуемая площадь сечения (см²)
 * @param requiredInertia - Требуемый момент инерции (см⁴)
 * @returns {SteelProfile} - Подходящий профиль или null
 */
export function findOptimalProfile(requiredArea: number, requiredInertia: number): SteelProfile | null {
    const suitableProfiles = STEEL_PROFILES.filter(p => p.area >= requiredArea && p.ix >= requiredInertia);

    if (suitableProfiles.length === 0) {
        // Если ничего не найдено, возвращаем самый "мощный" профиль для избежания ошибок
        return STEEL_PROFILES[STEEL_PROFILES.length - 1];
    }

    // Сортируем по массе и возвращаем самый легкий
    suitableProfiles.sort((a, b) => a.massPerMeter - b.massPerMeter);
    return suitableProfiles[0];
}