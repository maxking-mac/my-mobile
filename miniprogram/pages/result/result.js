// 结果页
const { analyzeIngredients } = require('../../utils/analyzer');
const { addHistory } = require('../../utils/storage');
const { saveToCloud } = require('../../utils/api');

const SOURCE_LABELS = {
  local: '本地数据库',
  cloud: '社区贡献',
  openfoodfacts: 'Open Food Facts',
  ai: 'AI识别',
  manual: '手动输入'
};

Page({
  data: {
    product: null,
    result: null,
    sourceLabel: '',
    activeTab: 0,
    expandedCards: {},
    groupAlerts: [],
    showSaveCommunity: false,
    savedToCommunity: false,
    loading: true
  },

  onLoad(options) {
    const { source, product, ingredients, name, barcode } = options;

    let productObj = null;
    let sourceStr = source || 'manual';

    if (product) {
      try {
        productObj = JSON.parse(decodeURIComponent(product));
      } catch (e) {
        productObj = null;
      }
    }

    // 如果是直接传配料文字（手动输入/AI识别路径）
    if (!productObj && ingredients) {
      productObj = {
        barcode: barcode || '',
        name: name ? decodeURIComponent(name) : '未知产品',
        brand: '',
        ingredients: decodeURIComponent(ingredients)
      };
    }

    if (!productObj) {
      wx.showToast({ title: '数据加载失败', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    this.setData({
      product: productObj,
      sourceLabel: SOURCE_LABELS[sourceStr] || sourceStr,
      showSaveCommunity: (sourceStr === 'ai' || sourceStr === 'manual') && !!productObj.barcode
    });

    this.runAnalysis(productObj.ingredients || '');
  },

  runAnalysis(ingredientsText) {
    const app = getApp();
    const userGroups = app.globalData.userGroups || [];
    const result = analyzeIngredients(ingredientsText, userGroups);

    // 计算人群警告汇总
    const groupAlerts = [];
    if (userGroups.length > 0) {
      result.ingredients.forEach(item => {
        const active = (item.activeGroupWarnings || []);
        if (active.length > 0) {
          groupAlerts.push({
            name: item.name,
            groups: active,
            desc: item.desc ? item.desc.substring(0, 40) + '...' : ''
          });
        }
      });
    }

    this.setData({ result, groupAlerts, loading: false });

    // 保存历史
    const { product, sourceLabel } = this.data;
    addHistory({
      barcode: product.barcode || '',
      name: product.name,
      brand: product.brand || '',
      score: result.score,
      scoreLabel: result.scoreLabel,
      source: sourceLabel,
      ingredients: ingredientsText
    });

    // 绘制圆环
    wx.nextTick(() => {
      this.drawScoreRing(result.score, result.scoreLabel.color);
    });
  },

  // 绘制圆环评分
  drawScoreRing(score, color) {
    const ctx = wx.createCanvasContext('scoreRing', this);
    const size = 100; // rpx -> px factor handled by canvas
    const cx = size, cy = size;
    const r = 75;
    const lineWidth = 12;

    // 背景圆
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.setStrokeStyle('#f0f0f0');
    ctx.setLineWidth(lineWidth);
    ctx.stroke();

    // 进度弧
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (score / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.setStrokeStyle(color || '#4CAF50');
    ctx.setLineWidth(lineWidth);
    ctx.setLineCap('round');
    ctx.stroke();

    ctx.draw();
  },

  // 切换Tab
  switchTab(e) {
    this.setData({ activeTab: parseInt(e.currentTarget.dataset.tab) });
  },

  // 展开/收起配料卡片
  toggleCard(e) {
    const { index } = e.currentTarget.dataset;
    const { expandedCards } = this.data;
    const newExpanded = { ...expandedCards };
    newExpanded[index] = !newExpanded[index];
    this.setData({ expandedCards: newExpanded });
  },

  // 保存到社区
  onSaveCommunity() {
    const { product } = this.data;
    if (!product || !product.barcode) return;

    wx.showLoading({ title: '保存中...', mask: true });
    saveToCloud(product).then(() => {
      wx.hideLoading();
      this.setData({ savedToCommunity: true });
      wx.showToast({ title: '已保存到社区', icon: 'success' });
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({ title: '保存失败（需开通云开发）', icon: 'none' });
    });
  }
});
