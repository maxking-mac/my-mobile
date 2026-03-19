// 拍照识别页
const { recognizeIngredientsByImage } = require('../../utils/api');

Page({
  data: {
    barcode: '',
    imagePath: '',
    loading: false,
    recognizedText: '',
    productName: '',
    recognizeFailed: false,
    failedReason: ''
  },

  onLoad(options) {
    this.setData({ barcode: options.barcode || '' });
  },

  // 拍照
  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      camera: 'back',
      success: (res) => {
        this.setData({
          imagePath: res.tempFiles[0].tempFilePath,
          recognizeFailed: false,
          recognizedText: ''
        });
      },
      fail(err) {
        if (err.errMsg && err.errMsg.includes('cancel')) return;
        wx.showToast({ title: '无法调用相机', icon: 'none' });
      }
    });
  },

  // 从相册
  chooseFromAlbum() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        this.setData({
          imagePath: res.tempFiles[0].tempFilePath,
          recognizeFailed: false,
          recognizedText: ''
        });
      },
      fail(err) {
        if (err.errMsg && err.errMsg.includes('cancel')) return;
        wx.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  },

  // 开始AI识别
  startRecognize() {
    const { imagePath } = this.data;
    if (!imagePath) return;

    this.setData({ loading: true, recognizeFailed: false });

    recognizeIngredientsByImage(imagePath).then(text => {
      this.setData({
        loading: false,
        recognizedText: text
      });
    }).catch(err => {
      this.setData({
        loading: false,
        recognizeFailed: true,
        failedReason: err.message || 'AI识别失败，请检查API Key配置或尝试手动输入'
      });
    });
  },

  // 编辑识别文字
  onTextEdit(e) {
    this.setData({ recognizedText: e.detail.value });
  },

  // 输入产品名
  onNameInput(e) {
    this.setData({ productName: e.detail.value });
  },

  // 进入分析
  goAnalyze() {
    const { recognizedText, productName, barcode } = this.data;
    if (!recognizedText.trim()) {
      wx.showToast({ title: '请确认配料内容', icon: 'none' });
      return;
    }
    const name = productName || '未知产品';
    wx.navigateTo({
      url: `/pages/result/result?source=ai&ingredients=${encodeURIComponent(recognizedText)}&name=${encodeURIComponent(name)}&barcode=${barcode}`
    });
  },

  // 去手动输入
  goManual() {
    wx.navigateTo({
      url: `/pages/manual-input/manual-input?barcode=${this.data.barcode}`
    });
  },

  // 重置图片
  resetImage() {
    this.setData({ imagePath: '', recognizedText: '', recognizeFailed: false });
  },

  // 重置全部
  resetAll() {
    this.setData({
      imagePath: '',
      recognizedText: '',
      recognizeFailed: false,
      loading: false,
      productName: ''
    });
  }
});
