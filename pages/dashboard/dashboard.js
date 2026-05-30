const store = require('../../utils/store');

Page({
  data: {
    stats: {}
  },
  onShow() {
    if (wx.getStorageSync('sfds_authed') !== true) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.setData({ stats: store.calcDashboard() });
  }
});
