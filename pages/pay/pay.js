//logs.js
const util = require('../../utils/util.js'),
   app = getApp();

Page({
  data: {
    webUrl:''
  },
  onLoad: function () {
 
    app.getCode().then((code) => {
      let webUrl =`https://pb.jd.com/activity/2019/duolabao/html/index.html?from=dlb&appId=${code}`;
      
     
      console.log(webUrl)
      this.setData({
        webUrl: webUrl
      })
    })
  }
})
