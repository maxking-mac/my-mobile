// 本地产品数据库 - 演示用产品
const LOCAL_PRODUCTS = [
  {
    barcode: '6901234567890',
    name: '可口可乐（罐装）',
    brand: '可口可乐公司',
    image: '',
    ingredients: '水,白砂糖,二氧化碳,焦糖色,磷酸,天然香料,咖啡因',
    weight: '330ml'
  },
  {
    barcode: '6902890090800',
    name: '旺仔牛奶',
    brand: '旺旺集团',
    image: '',
    ingredients: '全脂奶粉,白砂糖,水,食用香精,维生素A,维生素D',
    weight: '125ml'
  },
  {
    barcode: '6920702888138',
    name: '卫龙魔芋爽（辣条）',
    brand: '卫龙食品',
    image: '',
    ingredients: '魔芋粉,水,辣椒,植物油,食盐,白砂糖,酱油,醋,味精,辣椒素,山梨酸钾,苯甲酸钠,红曲红,辣椒红,食用香精',
    weight: '20g'
  },
  {
    barcode: '6923644251811',
    name: '奥利奥夹心饼干',
    brand: '卡夫亿滋',
    image: '',
    ingredients: '小麦粉,白砂糖,植物油,可可粉,玉米淀粉,食盐,碳酸氢钠,大豆磷脂,香草香精',
    weight: '97g'
  },
  {
    barcode: '4901050131007',
    name: '养乐多（乳酸菌饮料）',
    brand: '养乐多本社',
    image: '',
    ingredients: '水,脱脂奶粉,白砂糖,葡萄糖,干酪乳杆菌代田株,香料',
    weight: '100ml'
  },
  {
    barcode: '6907992530305',
    name: '康师傅冰红茶',
    brand: '顶新国际集团',
    image: '',
    ingredients: '水,白砂糖,茶叶,柠檬酸,维生素C,柠檬香精,蜂蜜',
    weight: '500ml'
  },
  {
    barcode: '6970399980309',
    name: '三只松鼠混合坚果',
    brand: '三只松鼠',
    image: '',
    ingredients: '腰果,巴旦木,核桃,榛子,夏威夷果,蔓越莓干(蔓越莓,白砂糖,葵花籽油),葡萄干,花生,南瓜子',
    weight: '185g'
  }
];

// 演示快捷键
const DEMO_PRODUCTS = [
  { name: '可口可乐', barcode: '6901234567890' },
  { name: '旺仔牛奶', barcode: '6902890090800' },
  { name: '卫龙辣条', barcode: '6920702888138' },
  { name: '奥利奥', barcode: '6923644251811' },
  { name: '养乐多', barcode: '4901050131007' },
  { name: '冰红茶', barcode: '6907992530305' },
  { name: '三只松鼠', barcode: '6970399980309' }
];

module.exports = { LOCAL_PRODUCTS, DEMO_PRODUCTS };
