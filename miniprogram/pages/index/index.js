// 首页
const { queryProduct } = require('../../utils/api');
const { DEMO_PRODUCTS } = require('../../data/local-products');

Page({
  data: {
    barcodeInput: '',
    demoProducts: DEMO_PRODUCTS,
    loading: false
  },

  onLoad() {},

  // 扫码
  onScan() {
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode', 'qrCode'],
      success: (res) => {
        const barcode = res.result;
        if (barcode) {
          this.searchByBarcode(barcode);
        }
      },
      fail(err) {
        if (err.errMsg && err.errMsg.includes('cancel')) return;
        wx.showToast({ title: '扫码失败，请重试', icon: 'none' });
      }
    });
  },

  // 手动输入条码变化
  onBarcodeInput(e) {
    this.setData({ barcodeInput: e.detail.value });
  },

  // 搜索按钮
  onBarcodeSearch() {
    const barcode = this.data.barcodeInput.trim();
    if (!barcode) {
      wx.showToast({ title: '请输入条形码', icon: 'none' });
      return;
    }
    this.searchByBarcode(barcode);
  },

  // 演示产品快捷按钮
  onDemoTap(e) {
    const { barcode } = e.currentTarget.dataset;
    this.setData({ barcodeInput: barcode });
    this.searchByBarcode(barcode);
  },

  // 查询条码
  searchByBarcode(barcode) {
    if (this.data.loading) return;
    this.setData({ loading: true });

    wx.showLoading({ title: '查询中...', mask: true });

    queryProduct(barcode).then(({ source, product }) => {
      wx.hideLoading();
      this.setData({ loading: false });

      if (source === 'notfound' || !product) {
        // 跳转到未收录页
        wx.navigateTo({
          url: `/pages/not-found/not-found?barcode=${barcode}`
        });
      } else {
        // 跳转到结果页
        const app = getApp();
        app.incrementScanCount();
        const encoded = encodeURIComponent(JSON.stringify(product));
        wx.navigateTo({
          url: `/pages/result/result?source=${source}&product=${encoded}`
        });
      }
    }).catch(() => {
      wx.hideLoading();
      this.setData({ loading: false });
      wx.showToast({ title: '查询失败，请检查网络', icon: 'none' });
    });
  }
});
