// 人群设置页
Page({
  data: {
    selectedGroups: [],
    groups: [
      { id: '婴幼儿', icon: '👶', name: '婴幼儿（0-3岁）', desc: '关注添加剂耐受性、禁用成分' },
      { id: '儿童', icon: '🧒', name: '儿童（3-12岁）', desc: '关注色素、甜味剂对行为的影响' },
      { id: '孕妇', icon: '🤰', name: '孕妇', desc: '关注亚硝酸盐、酒精、高风险添加剂' },
      { id: '糖尿病', icon: '🩺', name: '糖尿病', desc: '关注各类糖和高GI成分' },
      { id: '高血压', icon: '❤️', name: '高血压', desc: '关注钠含量、磷酸盐等' },
      { id: '肾脏疾病', icon: '🫘', name: '肾脏疾病', desc: '关注磷、钾、钠的摄入' },
      { id: '过敏体质', icon: '🌿', name: '过敏体质', desc: '关注常见致敏成分：大豆、坚果、亚硫酸盐等' }
    ]
  },

  onShow() {
    const app = getApp();
    this.setData({ selectedGroups: [...(app.globalData.userGroups || [])] });
  },

  toggleGroup(e) {
    const { id } = e.currentTarget.dataset;
    const { selectedGroups } = this.data;
    const idx = selectedGroups.indexOf(id);
    let newGroups;
    if (idx > -1) {
      newGroups = selectedGroups.filter(g => g !== id);
    } else {
      newGroups = [...selectedGroups, id];
    }
    this.setData({ selectedGroups: newGroups });
    const app = getApp();
    app.updateUserGroups(newGroups);
  },

  clearAll() {
    wx.showModal({
      title: '清除设置',
      content: '确定清除所有人群设置？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ selectedGroups: [] });
          const app = getApp();
          app.updateUserGroups([]);
          wx.showToast({ title: '已清除', icon: 'success' });
        }
      }
    });
  }
});
