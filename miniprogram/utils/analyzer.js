// 配料分析引擎
const { ADDITIVES } = require('../data/additives');
const { NATURAL_KEYWORDS } = require('../data/natural-keywords');

// 分类中文名
const CATEGORY_NAMES = {
  preservative: '防腐剂',
  sweetener: '甜味剂',
  colorant: '色素',
  thickener: '增稠剂',
  emulsifier: '乳化剂',
  acidulant: '酸度调节剂',
  leavening: '膨松剂',
  antioxidant: '抗氧化剂',
  flavor: '香料香精',
  nutrient: '营养强化剂',
  natural: '天然原料',
  other: '其他'
};

// 分类对应颜色
const CATEGORY_COLORS = {
  preservative: '#F44336',
  sweetener: '#FF9800',
  colorant: '#E91E63',
  thickener: '#9C27B0',
  emulsifier: '#3F51B5',
  acidulant: '#2196F3',
  leavening: '#00BCD4',
  antioxidant: '#009688',
  flavor: '#8BC34A',
  nutrient: '#4CAF50',
  natural: '#4CAF50',
  other: '#9E9E9E'
};

// 关注等级标签
const LEVEL_LABELS = ['无需关注', '低关注', '中关注', '较高关注', '高关注'];
const LEVEL_COLORS = ['#9E9E9E', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];

/**
 * 将配料文字解析为数组
 * 支持逗号、顿号、分号、斜杠分隔
 */
function parseIngredients(text) {
  if (!text) return [];
  // 清理括号内的说明（如：大豆磷脂（来自大豆））
  // 保留主名称，去掉括号说明
  let cleaned = text.trim();
  // 分割
  const items = cleaned.split(/[,，、；;\/\n]+/);
  return items
    .map(s => s.trim().replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim())
    .filter(s => s.length > 0);
}

/**
 * 识别单个配料
 * 返回 { name, category, level, desc, source, groupWarnings, isNatural }
 */
function identifyIngredient(name) {
  const trimmed = name.trim();

  // 1. 先在添加剂库中精确匹配
  for (const additive of ADDITIVES) {
    if (additive.name === trimmed || additive.aliases.includes(trimmed)) {
      return {
        name: trimmed,
        category: additive.category,
        categoryName: CATEGORY_NAMES[additive.category] || '其他',
        categoryColor: CATEGORY_COLORS[additive.category] || '#9E9E9E',
        level: additive.level,
        levelLabel: LEVEL_LABELS[additive.level],
        levelColor: LEVEL_COLORS[additive.level],
        desc: additive.desc,
        source: additive.source,
        groupWarnings: additive.groupWarnings || [],
        isNatural: false,
        matched: true
      };
    }
  }

  // 2. 模糊匹配添加剂（包含关键词）
  for (const additive of ADDITIVES) {
    const allNames = [additive.name, ...additive.aliases];
    for (const n of allNames) {
      if (trimmed.includes(n) || n.includes(trimmed)) {
        return {
          name: trimmed,
          category: additive.category,
          categoryName: CATEGORY_NAMES[additive.category] || '其他',
          categoryColor: CATEGORY_COLORS[additive.category] || '#9E9E9E',
          level: additive.level,
          levelLabel: LEVEL_LABELS[additive.level],
          levelColor: LEVEL_COLORS[additive.level],
          desc: additive.desc + '（模糊匹配）',
          source: additive.source,
          groupWarnings: additive.groupWarnings || [],
          isNatural: false,
          matched: true
        };
      }
    }
  }

  // 3. 在天然原料中匹配
  for (const keyword of NATURAL_KEYWORDS) {
    if (trimmed === keyword || trimmed.includes(keyword) || keyword.includes(trimmed)) {
      return {
        name: trimmed,
        category: 'natural',
        categoryName: '天然原料',
        categoryColor: CATEGORY_COLORS.natural,
        level: 0,
        levelLabel: '无需关注',
        levelColor: LEVEL_COLORS[0],
        desc: '天然食材原料，安全性高。',
        source: '天然来源',
        groupWarnings: [],
        isNatural: true,
        matched: true
      };
    }
  }

  // 4. 未能识别
  return {
    name: trimmed,
    category: 'other',
    categoryName: '其他',
    categoryColor: CATEGORY_COLORS.other,
    level: 1,
    levelLabel: '低关注',
    levelColor: LEVEL_COLORS[1],
    desc: '未在本地数据库中找到此成分，建议查阅权威资料了解详情。',
    source: '未知',
    groupWarnings: [],
    isNatural: false,
    matched: false
  };
}

/**
 * 计算配料简洁度评分
 * 公式：天然占比×60 + (1-平均关注度/4)×30 + max(0,10-加工成分数) 限制5-100
 */
function calculateScore(ingredientResults) {
  if (!ingredientResults || ingredientResults.length === 0) return 50;

  const total = ingredientResults.length;
  const naturalCount = ingredientResults.filter(i => i.isNatural || i.category === 'natural').length;
  const processedItems = ingredientResults.filter(i => !i.isNatural && i.category !== 'natural');
  const processedCount = processedItems.length;
  const avgLevel = processedCount > 0
    ? processedItems.reduce((sum, i) => sum + i.level, 0) / processedCount
    : 0;

  const naturalRatio = naturalCount / total;
  const score = Math.round(
    naturalRatio * 60 +
    (1 - avgLevel / 4) * 30 +
    Math.max(0, 10 - processedCount)
  );

  return Math.min(100, Math.max(5, score));
}

/**
 * 获取评分标签
 */
function getScoreLabel(score) {
  if (score >= 85) return { label: '极简配料', color: '#4CAF50', bgColor: '#E8F5E9' };
  if (score >= 65) return { label: '较为简洁', color: '#8BC34A', bgColor: '#F1F8E9' };
  if (score >= 45) return { label: '成分较多', color: '#FF9800', bgColor: '#FFF3E0' };
  return { label: '成分复杂', color: '#F44336', bgColor: '#FFEBEE' };
}

/**
 * 对用户关注人群进行特殊标注
 */
function applyGroupWarnings(ingredientResults, userGroups) {
  if (!userGroups || userGroups.length === 0) return ingredientResults;
  return ingredientResults.map(item => {
    const activeWarnings = (item.groupWarnings || []).filter(g => userGroups.includes(g));
    return { ...item, activeGroupWarnings: activeWarnings };
  });
}

/**
 * 主分析函数
 * @param {string} ingredientsText - 配料表文字
 * @param {string[]} userGroups - 用户关注人群
 * @returns {object} 分析结果
 */
function analyzeIngredients(ingredientsText, userGroups = []) {
  const names = parseIngredients(ingredientsText);
  if (names.length === 0) {
    return {
      ingredients: [],
      score: 0,
      scoreLabel: { label: '无法分析', color: '#9E9E9E', bgColor: '#F5F5F5' },
      highlights: [],
      stats: { total: 0, natural: 0, processed: 0, highConcern: 0 }
    };
  }

  let results = names.map(n => identifyIngredient(n));
  results = applyGroupWarnings(results, userGroups);

  const score = calculateScore(results);
  const scoreLabel = getScoreLabel(score);
  const highlights = results.filter(i => i.level >= 3);
  const natural = results.filter(i => i.isNatural || i.category === 'natural').length;

  return {
    ingredients: results,
    score,
    scoreLabel,
    highlights,
    stats: {
      total: results.length,
      natural,
      processed: results.length - natural,
      highConcern: highlights.length
    }
  };
}

module.exports = {
  analyzeIngredients,
  parseIngredients,
  identifyIngredient,
  calculateScore,
  getScoreLabel,
  CATEGORY_NAMES,
  CATEGORY_COLORS,
  LEVEL_LABELS,
  LEVEL_COLORS
};
