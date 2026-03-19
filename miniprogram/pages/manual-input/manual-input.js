// 手动输入页
Page({
  data: {
    barcode: '',
    productName: '',
    ingredientsText: '',
    examples: [
      {
        name: '可口可乐（示例）',
        text: '水、白砂糖、二氧化碳、焦糖色、磷酸、天然香料、咖啡因'
      },
      {
        name: '奥利奥（示例）',
        text: '小麦粉、白砂糖、植物油、可可粉、玉米淀粉、食盐、碳酸氢钠、大豆磷脂、香草香精'
      },
      {
        name: '辣条（示例）',
        text: '面粉、植物油、辣椒、食盐、白砂糖、酱油、味精、山梨酸钾、辣椒红、食用香精'
      }
    ]
  },

  onLoad(options) {
    this.setData({ barcode: options.barcode || '' });
  },

  onNameInput(e) {
    this.setData({ productName: e.detail.value });
  },

  onIngredientInput(e) {
    this.setData({ ingredientsText: e.detail.value });
  },

  useExample(e) {
    const { text, name } = e.currentTarget.dataset;
    this.setData({ ingredientsText: text, productName: name });
  },

  goAnalyze() {
    const { ingredientsText, productName, barcode } = this.data;
    if (!ingredientsText.trim()) {
      wx.showToast({ title: '请输入配料内容', icon: 'none' });
      return;
    }
    const name = productName.trim() || '未知产品';
    wx.navigateTo({
      url: `/pages/result/result?source=manual&ingredients=${encodeURIComponent(ingredientsText)}&name=${encodeURIComponent(name)}&barcode=${encodeURIComponent(barcode)}`
    });
  }
});
