// 未收录页
Page({
  data: {
    barcode: ''
  },

  onLoad(options) {
    this.setData({ barcode: options.barcode || '' });
  },

  goPhotoScan() {
    wx.navigateTo({
      url: `/pages/photo-scan/photo-scan?barcode=${this.data.barcode}`
    });
  },

  goManualInput() {
    wx.navigateTo({
      url: `/pages/manual-input/manual-input?barcode=${this.data.barcode}`
    });
  }
});
