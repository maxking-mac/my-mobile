// 历史记录页
const { getHistory, clearHistory, formatTime } = require('../../utils/storage');

Page({
  data: {
    history: []
  },

  onShow() {
    this.loadHistory();
  },

  loadHistory() {
    const raw = getHistory();
    const history = raw.map(item => ({
      ...item,
      timeStr: formatTime(item.timestamp)
    }));
    this.setData({ history });
  },

  viewDetail(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.history[index];
    if (!item || !item.ingredients) {
      wx.showToast({ title: '记录已损坏', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: `/pages/result/result?source=${encodeURIComponent(item.source || 'local')}&ingredients=${encodeURIComponent(item.ingredients)}&name=${encodeURIComponent(item.name)}&barcode=${encodeURIComponent(item.barcode || '')}`
    });
  },

  onClear() {
    wx.showModal({
      title: '清空记录',
      content: '确定清空所有扫描记录？',
      success: (res) => {
        if (res.confirm) {
          clearHistory();
          this.setData({ history: [] });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  goScan() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
