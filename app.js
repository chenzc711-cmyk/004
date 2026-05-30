App({
  globalData: {
    companyCode: 'sfds'
  },
  onLaunch() {
    const authed = wx.getStorageSync('sfds_authed') === true;
    if (!authed) {
      wx.reLaunch({ url: '/pages/login/login' });
    }
  }
});
