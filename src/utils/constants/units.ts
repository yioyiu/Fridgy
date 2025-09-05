import { Unit } from '@/utils/types/ingredient';

export const DEFAULT_UNITS: Unit[] = [
  {
    id: '1',
    name: 'Kilogram',
    abbreviation: 'kg',
    is_weight: true,
    is_volume: false,
    is_count: false,
  },
  {
    id: '2',
    name: 'Gram',
    abbreviation: 'g',
    is_weight: true,
    is_volume: false,
    is_count: false,
  },
  {
    id: '3',
    name: 'Pound',
    abbreviation: 'lb',
    is_weight: true,
    is_volume: false,
    is_count: false,
  },
  {
    id: '4',
    name: 'Liter',
    abbreviation: 'L',
    is_weight: false,
    is_volume: true,
    is_count: false,
  },
  {
    id: '5',
    name: 'Milliliter',
    abbreviation: 'ml',
    is_weight: false,
    is_volume: true,
    is_count: false,
  },
  {
    id: '6',
    name: 'Piece',
    abbreviation: 'pc',
    is_weight: false,
    is_volume: false,
    is_count: true,
  },
  {
    id: '7',
    name: 'Pack',
    abbreviation: 'pack',
    is_weight: false,
    is_volume: false,
    is_count: true,
  },
  {
    id: '8',
    name: 'Bottle',
    abbreviation: 'bottle',
    is_weight: false,
    is_volume: false,
    is_count: true,
  },
];

export const getUnitByName = (name: string): Unit | undefined => {
  return DEFAULT_UNITS.find(unit => unit.name === name);
};

export const getUnitByAbbreviation = (abbreviation: string): Unit | undefined => {
  return DEFAULT_UNITS.find(unit => unit.abbreviation === abbreviation);
};

export const getWeightUnits = (): Unit[] => {
  return DEFAULT_UNITS.filter(unit => unit.is_weight);
};

export const getVolumeUnits = (): Unit[] => {
  return DEFAULT_UNITS.filter(unit => unit.is_volume);
};

export const getCountUnits = (): Unit[] => {
  return DEFAULT_UNITS.filter(unit => unit.is_count);
};
