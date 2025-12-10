import { Location } from '@/utils/types/ingredient';

export const DEFAULT_LOCATIONS: Location[] = [
  {
    id: '1',
    name: '冰箱',
    icon: 'fridge',
    color: '#87CEEB',
    sort_order: 1,
  },
  {
    id: '2',
    name: '冷冻室',
    icon: 'snowflake',
    color: '#4ECDC4',
    sort_order: 2,
  },
  {
    id: '3',
    name: '储物柜',
    icon: 'cupboard',
    color: '#D4A574',
    sort_order: 3,
  },
  {
    id: '4',
    name: '台面',
    icon: 'counter',
    color: '#FFD93D',
    sort_order: 4,
  },
];

export const getLocationByName = (name: string): Location | undefined => {
  return DEFAULT_LOCATIONS.find(location => location.name === name);
};

export const getLocationById = (id: string): Location | undefined => {
  return DEFAULT_LOCATIONS.find(location => location.id === id);
};
