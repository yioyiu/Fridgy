import { Ingredient } from '@/utils/types/ingredient';

// 获取当前日期并创建相对日期的辅助函数
const getDateOffset = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0]!; // 返回 YYYY-MM-DD 格式
};

export const SAMPLE_INGREDIENTS: Ingredient[] = [
  {
    id: '1',
    user_id: 'user-1',
    name: '牛奶',
    category: '乳制品',
    quantity: 1,
    unit: '升',
    purchase_date: getDateOffset(-3), // 3天前购买
    expiration_date: getDateOffset(7), // 7天后过期 (fresh)
    location: '冰箱',
    images: [],
    notes: '有机全脂牛奶',
    status: 'fresh', // 会被重新计算
    freshness_score: 0.8, // 会被重新计算
    created_at: getDateOffset(-3),
    updated_at: getDateOffset(-3),
  },
  {
    id: '2',
    user_id: 'user-1',
    name: '菠菜',
    category: '蔬菜',
    quantity: 200,
    unit: '克',
    purchase_date: getDateOffset(-2), // 2天前购买
    expiration_date: getDateOffset(2), // 2天后过期 (near_expiry)
    location: '冰箱',
    images: [],
    notes: '新鲜嫩菠菜',
    status: 'near_expiry', // 会被重新计算
    freshness_score: 0.3, // 会被重新计算
    created_at: getDateOffset(-2),
    updated_at: getDateOffset(-2),
  },
  {
    id: '3',
    user_id: 'user-1',
    name: '鸡胸肉',
    category: '肉类',
    quantity: 500,
    unit: '克',
    purchase_date: getDateOffset(-1), // 1天前购买
    expiration_date: getDateOffset(5), // 5天后过期 (fresh)
    location: '冰箱',
    images: [],
    notes: '无骨无皮',
    status: 'fresh', // 会被重新计算
    freshness_score: 0.9, // 会被重新计算
    created_at: getDateOffset(-1),
    updated_at: getDateOffset(-1),
  },
  {
    id: '4',
    user_id: 'user-1',
    name: '面包',
    category: '面包',
    quantity: 1,
    unit: '个',
    purchase_date: getDateOffset(-4), // 4天前购买
    expiration_date: getDateOffset(1), // 1天后过期 (near_expiry)
    location: '储物柜',
    images: [],
    notes: '全麦面包',
    status: 'near_expiry', // 会被重新计算
    freshness_score: 0.2, // 会被重新计算
    created_at: getDateOffset(-4),
    updated_at: getDateOffset(-4),
  },
  {
    id: '5',
    user_id: 'user-1',
    name: '鸡蛋',
    category: '鸡蛋',
    quantity: 12,
    unit: '个',
    purchase_date: getDateOffset(-5), // 5天前购买
    expiration_date: getDateOffset(15), // 15天后过期 (fresh)
    location: '冰箱',
    images: [],
    notes: '大号棕色鸡蛋',
    status: 'fresh', // 会被重新计算
    freshness_score: 0.95, // 会被重新计算
    created_at: getDateOffset(-5),
    updated_at: getDateOffset(-5),
  },
  // 添加一些过期的食材用于展示expired insights
  {
    id: '6',
    user_id: 'user-1',
    name: '酸奶',
    category: '乳制品',
    quantity: 1,
    unit: '杯',
    purchase_date: getDateOffset(-7), // 7天前购买
    expiration_date: getDateOffset(-2), // 2天前就过期了 (expired)
    location: '冰箱',
    images: [],
    notes: '希腊酸奶',
    status: 'expired', // 会被重新计算
    freshness_score: 0.0, // 会被重新计算
    created_at: getDateOffset(-7),
    updated_at: getDateOffset(-7),
  },
  {
    id: '7',
    user_id: 'user-1',
    name: '西红柿',
    category: '蔬菜',
    quantity: 3,
    unit: '个',
    purchase_date: getDateOffset(-3), // 3天前购买
    expiration_date: getDateOffset(3), // 3天后过期 (near_expiry - 正好在临界值)
    location: '台面',
    images: [],
    notes: '新鲜西红柿',
    status: 'near_expiry', // 会被重新计算
    freshness_score: 0.3, // 会被重新计算
    created_at: getDateOffset(-3),
    updated_at: getDateOffset(-3),
  },
  // 添加一些更老的数据用于测试时间过滤
  {
    id: '8',
    user_id: 'user-1',
    name: '大米',
    category: '谷物',
    quantity: 1,
    unit: '千克',
    purchase_date: getDateOffset(-15), // 15天前购买
    expiration_date: getDateOffset(365), // 1年后过期
    location: '储物柜',
    images: [],
    notes: '白米',
    status: 'fresh',
    freshness_score: 0.9,
    created_at: getDateOffset(-15),
    updated_at: getDateOffset(-15),
  },
  {
    id: '9',
    user_id: 'user-1',
    name: '意大利面',
    category: '谷物',
    quantity: 500,
    unit: '克',
    purchase_date: getDateOffset(-35), // 35天前购买
    expiration_date: getDateOffset(300), // 300天后过期
    location: '储物柜',
    images: [],
    notes: '意大利面条',
    status: 'fresh',
    freshness_score: 0.9,
    created_at: getDateOffset(-35),
    updated_at: getDateOffset(-35),
  },
  {
    id: '10',
    user_id: 'user-1',
    name: '橄榄油',
    category: '调味品',
    quantity: 500,
    unit: '毫升',
    purchase_date: getDateOffset(-100), // 100天前购买
    expiration_date: getDateOffset(200), // 200天后过期
    location: '储物柜',
    images: [],
    notes: '特级初榨橄榄油',
    status: 'fresh',
    freshness_score: 0.8,
    created_at: getDateOffset(-100),
    updated_at: getDateOffset(-100),
  },
];
