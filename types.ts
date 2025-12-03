// --- types.ts ---

/**
 * Входные параметры, которые задает пользователь в панели управления.
 */
export interface CanopyConfig {
  width: number; // Полная ширина фермы (пролет), мм
  height: number; // Высота фермы в коньке, мм
  roofAngle: number; // Угол наклона кровли, градусы
  trussType: 'W' | 'N'; // Тип решетки фермы: W-образная, N-образная
  region: SnowRegion; // Снеговой регион для расчета нагрузок
  spacing: number; // Шаг установки ферм, мм
}

/**
 * Результат полного инженерного расчета.
 * Содержит все данные для отображения чертежа и спецификации.
 */
export interface CalculationResult {
  config: CanopyConfig;
  truss: CalculatedTruss;
  specification: SpecificationItem[];
  loads: {
    snowLoad: number; // Расчетная снеговая нагрузка, кг/м²
    windLoad: number; // Расчетная ветровая нагрузка, кг/м²
  };
}

/**
 * Описание геометрии и состава рассчитанной фермы.
 */
export interface CalculatedTruss {
  nodes: { x: number; y: number }[]; // Координаты всех узлов фермы
  members: TrussMember[]; // Все стержни (элементы) фермы
}

/**
 * Описание одного стержня (элемента) фермы.
 */
export interface TrussMember {
  id: string; // Уникальный идентификатор, например "Верхний пояс 1"
  startNode: number; // Индекс начального узла в массиве nodes
  endNode: number; // Индекс конечного узла
  profile: SteelProfile; // Подобранный профиль из сортамента
  force: number; // Осевое усилие в стержне, кН ( > 0 растяжение, < 0 сжатие)
  length: number; // Длина стержня, мм
}

/**
 * Строка в таблице спецификации.
 */
export interface SpecificationItem {
  name: string; // Наименование позиции, например "Верхний пояс"
  profileName: string; // Марка профиля, например "100x100x4"
  length: number; // Длина, мм
  count: number; // Количество
  totalLength: number; // Общая длина, м
}

/**
 * Свойства стандартного стального профиля по ГОСТ.
 */
export interface SteelProfile {
  name: string; // Наименование, "100x100x4"
  height: number; // Высота h, мм
  width: number; // Ширина b, мм
  thickness: number; // Толщина стенки t, мм
  area: number; // Площадь сечения, см²
  ix: number; // Момент инерции относительно оси X, см⁴
  iy: number; // Момент инерции относительно оси Y, см⁴
  massPerMeter: number; // Масса 1 метра, кг
}

// Снеговые регионы РФ по СП 20.13330.2016
export type SnowRegion = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII';