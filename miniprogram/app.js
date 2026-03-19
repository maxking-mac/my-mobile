// app.js
App({
  globalData: {
    userGroups: [], // 用户关注的特殊人群
    scanCount: 0,   // 当日扫码次数（免费版限制）
    lastScanDate: ''
  },

  onLaunch() {
    // 读取本地设置
    const groups = wx.getStorageSync('userGroups') || [];
    this.globalData.userGroups = groups;

    const today = new Date().toDateString();
    const savedDate = wx.getStorageSync('lastScanDate');
    const savedCount = wx.getStorageSync('scanCount') || 0;

    if (savedDate === today) {
      this.globalData.scanCount = savedCount;
    } else {
      this.globalData.scanCount = 0;
      wx.setStorageSync('scanCount', 0);
      wx.setStorageSync('lastScanDate', today);
    }
    this.globalData.lastScanDate = today;

    // 云开发初始化（如已开通）
    // if (wx.cloud) {
    //   wx.cloud.init({ env: 'your-env-id', traceUser: true });
    // }
  },

  incrementScanCount() {
    this.globalData.scanCount++;
    wx.setStorageSync('scanCount', this.globalData.scanCount);
  },

  updateUserGroups(groups) {
    this.globalData.userGroups = groups;
    wx.setStorageSync('userGroups', groups);
  }
});
