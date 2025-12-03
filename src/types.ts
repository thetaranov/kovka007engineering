export interface CanopyConfig {
  trussWidth: number;
  trussHeight: number;
  columnHeight: number;
  columnSpacing: number;
  columnWidth: number;
  region: SnowRegion;
  trussSpacing: number; // Шаг установки ферм, мм
}

export interface CalculationResult {
  config: CanopyConfig;
  truss: CalculatedTruss;
  columns: CalculatedColumn[];
  specification: SpecificationItem[];
  loads: {
    snowLoad: number;
    windLoad: number;
  };
}

export interface CalculatedColumn {
    x: number; // center x
    height: number;
    width: number;
}

export interface CalculatedTruss {
  nodes: { x: number; y: number }[];
  members: TrussMember[];
}

export interface TrussMember {
  id: string;
  startNode: number;
  endNode: number;
  profile: SteelProfile;
  force: number;
  length: number;
}

export interface SpecificationItem {
  name: string;
  profileName: string;
  length: number;
  count: number;
  totalLength: number;
}

export interface SteelProfile {
  name: string;
  height: number;
  width: number;
  thickness: number;
  area: number;
  ix: number;
  iy: number;
  massPerMeter: number;
}

export type SnowRegion = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII';