Page({
  data: {
    code: ''
  },
  onInput(event) {
    this.setData({ code: event.detail.value.trim() });
  },
  login() {
    const app = getApp();
    if (this.data.code === app.globalData.companyCode) {
      wx.setStorageSync('sfds_authed', true);
      wx.switchTab({ url: '/pages/dashboard/dashboard' });
      return;
    }
    wx.showToast({ title: '公司代码不正确', icon: 'none' });
  }
});
