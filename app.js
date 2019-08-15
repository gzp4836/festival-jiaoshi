/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// const ald = require('./utils/ald-stat.js')

App({
  globalData: {
    userInfo: null,
    code: ''
  },
  onLaunch: function () {
    // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //       this.globalData.code = res.code;
    //     console.log(this.globalData.code)
    //   }
    // })
  },

  getCode(n) {
    return new Promise((resolve, reject) => {
      let beDate = new Date().getTime();
      wx.login({
        success: res => {
          n = n || ''
          console.log(n + " getCode耗时：", (new Date().getTime() - beDate) / 1000, res.code);
          resolve(res.code);
        }
      })
    })
  },
})