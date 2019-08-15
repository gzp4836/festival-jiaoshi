/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
//获取应用实例

const app = getApp(),
  config = require('../../config'),
  origin = config.origin;
let that = null;
let adUnitId = 'adunit-7f3ec8486b359225'
const awardTotal = 5
let shareToken, ownToken
let notAviliData = { start: '2019/08/14', end: '2019/09/15', beTitle: '', beContent: '活动未开始', afTitle: '活动已结束', afContent: '请您在9月17日24点前完成提现，小程序将于9月18日关闭' };
const clert = {
  opt: {},
  show: function (opt) {
    opt.show = true;
    this.opt = opt;
    for (let i in opt.btns) {
      if ('share' != opt.btns[i].fn) {
        opt.btns[i].fnName = 'clertFn';
      } else {
        opt.btns[i].share = 'share';
      }
    }
    that.closeForm()
    that.setData({ clert: opt })
  },
  close: function () {
    that.setData({ clert: { show: false }, noZongziForm: false, noScissorForm: false })
  }
}

Page({
  data: {
    biz: 'dlbyfgTeacher',
    imgs: [
      'https://hsp.jdpay.com/?appid=88&filepath=/front/award-item-1.png&auth=jC4m+vdm9SCCPz7ghY00kJM67ydhPTg4JmU9MTk2NTc2NTQxNSZ0PTE1NjU3NjU0MTYmZj02N18xOTA4XzcyMl82NDcmcj0wOHlobWNGMkQx'

      , 'https://hsp.jdpay.com/?appid=88&filepath=/front/award-item-2.png&auth=7hST5oWG0BPgTKlO66ZpqHBKvNdhPTg4JmU9MTk2NTc2NTQ1OCZ0PTE1NjU3NjU0NTkmZj01MV8xOTA4XzcxOV81NyZyPW12V093V0FQQ1Y='

      , 'https://hsp.jdpay.com/?appid=88&filepath=/front/award-item-3.png&auth=ncgyNbn09gRwoZDK+rXZVneu4+BhPTg4JmU9MTk2NTc2NTQ4MSZ0PTE1NjU3NjU0ODImZj00OF8xOTA4XzcyM180OCZyPUlCNEltSGZKdVo='

      , 'https://hsp.jdpay.com/?appid=88&filepath=/front/award-item-4.png&auth=ugVy96w8kEDUOGAc+pXMVYoC6TthPTg4JmU9MTk2NTc2NTQ5NiZ0PTE1NjU3NjU0OTcmZj00OF8xOTA4XzcyM181NyZyPUhRcXNoNFVaOEc='

      , 'https://hsp.jdpay.com/?appid=88&filepath=/front/award-item-5.png&auth=qFO1yFZS3P4iaBZMP6CjetTQaClhPTg4JmU9MTk2NTc2NTUwNyZ0PTE1NjU3NjU1MDgmZj00MV8xOTA4XzcyMl85MCZyPUVLbGVKcW5IU1E='

    ],
    indexData: {},
    zongziData: {},
    scissorNum: '',
    goldenNum: '',
    videoAd: null,
    ruleForms: false,
    myBalance: 0,
    myZongziArr: [],
    noScissorForm: false, noZongziForm: false,
    myZongziLength: 0,
    cards: null,
    currentCard: null,
    showCard: false,
    addCardArray: [],
    debug: true,
    clert: {}
  },
  onReady: function () {
  },
  onShow: function () {
    // this.clertnoZongziForm();
    // this.clertnoZongziForm();
    // this.clertfreeForm();
  },
  onLoad: function (opt) {
    if (opt && opt.token) {
      shareToken = opt.token
      wx.setStorageSync('shareToken', shareToken)
      console.log('获取分享的shareToken：' + shareToken)
    }
    that = this;
    if (this.notAvili(notAviliData)) return
    //获取页面数据
    this.indexDataFn()
    //视屏
    if (wx.createRewardedVideoAd) {
      // 加载激励视频广告
      this.data.videoAd = wx.createRewardedVideoAd({ adUnitId: adUnitId })
      //捕捉错误
      this.data.videoAd.onError(err => { })
      // 监听关闭
      this.data.videoAd.onClose((status) => {
        // 正常播放结束，下发奖励
        if (status && status.isEnded || status === undefined) {
          that.closeForm()
          app.getCode().then((code) => {
            let _data = { biz: that.data.biz, code: code }
            wx.request({
              url: `${origin.festival}/front/lottery/addCount`,
              method: 'POST',
              data: _data,
              header: { 'content-type': 'application/x-www-form-urlencoded', },
              success: function (res) {
                if ('F_000000' === res.data.code) {
                  that.clertcongratsSilverForm();
                  that.setData({ scissorNum: res.data.data })
                } else {
                  wx.showModal({
                    title: '提示',
                    content: res.data.msg,
                    success: function (res) {
                      console.log(res.confirm)
                    }
                  })
                }
                // if (res.data.code == 'A_000002' || res.data.code == 'Z003') {
                //   wx.showModal({
                //     title: '提示',
                //     content: res.data.msg,
                //     success: function (res) {
                //       console.log(res.confirm)
                //     }
                //   })
                // }
              }
            })
          })
        }
      })
    }
    // 获取自己的分享token
    this.getOwnTokenFn()
  },

  clertFn: function (e) {
    let fnName = e.currentTarget.dataset.fn;
    let fn = clert.opt[e.currentTarget.dataset.fn];
    fn ? fn() : that[fnName]();
  },
  closeForm() {
    clert.close()
  },
  clertnoZongziForm() {
    this.closeForm()
    this.setData({ noZongziForm: true })
    // clert.show({
    //   content: '将贺卡送给两名好友，两名好友成功送出贺卡，即可获得一个新贺卡。',
    //   title: '',
    //   btns: [{ btnTxt: "送贺卡", class: "alc-btn-mai", fn: "share" }, { btnTxt: '放弃', class: 'alc-btn-sec', fn: 'closeForm' }],
    // })
  },
  clertnoScissorForm() {
    this.closeForm()
    that.setData({ noScissorForm: true })
  },
  clertfreeForm() {
    clert.show({
      content: '只需1分押金，即可获得金刚笔，用金钢笔得现金红包（押金24小时退款）',
      title: '',
      btns: [{ btnTxt: "送花", class: "alc-btn-mai", fn: "getGoldFn" }, { btnTxt: '放弃', class: 'alc-btn-sec', fn: 'closeForm' }],
      getGoldFn: function () {
        wx.navigateTo({ url: '../pay/pay' })
      }
    })
  },
  clertnoSilverForms() {
    clert.show({
      content: '落红不是无情物，\n 化作春泥更护花。\n (何况还要看广告)',
      title: '',
      btns: [{ btnTxt: "换金刚笔", class: "alc-btn-mai", fn: "clertfreeForm" }, { btnTxt: '坚持就用银钢笔', class: 'alc-btn-sec', fn: 'watchVideo' }]
    })
  },
  clertcongratsGoldForm() {
    clert.show({
      content: '每次送贺卡都能获得现金红包',
      title: '恭喜获得金刚笔',
      btns: [{ btnTxt: "送贺卡", class: "alc-btn-mai", fn: "peelGoldFn", getFormId: true }]
    })
  },
  clertcongratsSilverForm() {
    clert.show({
      content: '看视频辛苦了',
      title: '恭喜获得银钢笔',
      btns: [{ btnTxt: "送贺卡", class: "alc-btn-mai", fn: "peelGoldFn", getFormId: true }]
    })
  },
  clertcongratsGoldFormAgain() {
    clert.show({
      content: '获得' + this.data.zongziData.bonus / 100 + '元现金 \n ' + this.data.zongziData.name,
      title: '恭喜获得奖励',
      btns: [{ btnTxt: "再送一个", class: "alc-btn-mai", fn: "peelGoldFn", getFormId: true }]
    })
  },
  clertcongratsSilverFormAgain() {
    clert.show({
      content: this.data.zongziData.name,
      title: '获得奖励',
      btns: [{ btnTxt: "再送一个", class: "alc-btn-mai", fn: "peelGoldFn", getFormId: true }]
    })
  },
  clertcollectCompleteForm() {
    clert.show({
      content: '新竹高于旧竹枝，\n 全凭老干为扶持。\n 下年再有新生者，\n 十丈龙孙绕凤池。\n（5元学习津贴已到账）',
      title: '',
      btns: [{ btnTxt: "感谢您对教师节的支持", class: "alc-btn-mai", fn: "closeForm" }]
    })
  },


  // 活动结束
  notAvili(opt) {
    let
      currentTime = new Date(),
      startTime = new Date(Date.parse(opt.start)),
      endTime = new Date(Date.parse(opt.end));
    if (currentTime < startTime || currentTime > endTime) {
      let title = currentTime < startTime ? opt.beTitle : opt.afTitle;
      let content = currentTime < startTime ? opt.beContent : opt.afContent;
      wx.showModal({
        title: title,
        content: content,
        showCancel: false,
        success: function (res) {
          console.log(res.confirm)
        }
      })
      return true
    }
    return false
  },

  // 获取首页数据
  indexDataFn() {
    wx.showToast({
      title: '',
      icon: 'loading',
      mask: true,
    });
    return new Promise((resolve, reject) => {
      app.getCode().then(code => {
        let that = this;
        let _data = { biz: this.data.biz, code: code };
        let _t = new Date().getTime();
        if (this.data.debug) console.log("indexDataFn 获取首页数据->", _data)
        wx.request({
          url: `${origin.festival}/front/lottery/indexData`,
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          data: _data,
          success: function (res) {

            if (that.data.debug) console.log("indexDataFn 获取首页数据<-", (new Date().getTime() - _t) / 1000, res)
            if (res.data.code === 'F_000000') {
              let datas = res.data.data;
              if (datas == null) {
                wx.showToast({ title: '数据请求为空', icon: 'none', }); return
              }
              datas.residueHuor = datas.currentTimestamp ? 24 - parseInt(new Date(datas.currentTimestamp).getHours()) : 0;
              // let datas =  Object.assign(data, residueHuor);
              // console.log(datas)
              let myZongziArr = Array(5).fill({ name: '', index: '' });
              let myZongziLength = 0;
              let myZongzi = datas.myZongzi;
              myZongziLength = Object.keys(myZongzi)
              for (let key in myZongzi) {
                let o = myZongzi[key];
                myZongziArr[o.index - 1] = o;
              }
              datas.thanksCardAllTimes = 3;
              that.setData({
                indexData: datas,
                goldenNum: datas.goldenScissorCount,
                scissorNum: datas.silverScissorCount,
                myBalance: datas.myBalance,
                myZongziArr: myZongziArr,
                myZongziLength: myZongziLength
              })
              wx.hideToast();
              // 获取已填写好的贺卡
              that.getCardList()
              resolve(myZongziLength);
            } else {
              wx.showModal({
                title: 'indexDataFn',
                content: res.data.msg,
                success: function (res) {
                  console.log(res.confirm);
                }
              })
            }
          }
        })
      })
    })
  },

  // 添加贺卡
  addCard() {
    this.setData({ showCard: true, currentCard: null })
  },

  // 获取token
  getOwnTokenFn() {
    app.getCode().then(code => {
      let _data = { biz: this.data.biz, code: code }
      console.log('getOwnTokenFn 获取自己分享token -> ', _data)
      wx.request({
        url: `${origin.festival}/front/lottery/sharePage`,
        method: 'POST',
        data: _data,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: function (res) {
          console.log("getOwnTokenFn 获取自己分享token <- ", res)
          if (res.data.code == "F_000000") {
            // debugger
            ownToken = res.data.data;
          } else {
            wx.showModal({
              title: 'getOwnTokenFn',
              content: res.data.msg,
              success: function (res) {
              }
            })
            reject(res.data);
          }
        },
        fail: function (error) {
          console.error('/lottery/lottery', error);
          reject(res.data);
        }
      })
    })
  },

  // 顶部点击粽子
  openFn() {
    if (this.notAvili(notAviliData)) return
    let goldenScissorCount = this.data.indexData.goldenScissorCount,
      notOpen = this.data.indexData.notOpen,
      silverScissorCount = this.data.indexData.silverScissorCount,
      that = this;
    //有粽子
    if (notOpen > 0) {
      if (silverScissorCount <= 0 && goldenScissorCount <= 0) { //没剪刀
        that.clertnoScissorForm();
      } else { //有剪刀
        this.peelGoldFn()
      }
    } else if (notOpen <= 0) { //没粽子
      this.clertnoZongziForm();
    }
  },


  // 领金剪刀
  goldFn(e) {
    let formId = e.detail.formId;
    this.fromidFn(formId)
    console.log('金剪刀formid' + e.detail.formId)
    let goldenScissorCount = this.data.indexData.goldenScissorCount;
    if (goldenScissorCount <= 0) {
      this.clertfreeForm();
    }
  },

  // 领银剪刀
  silverFn(e) {
    let formId = e.detail.formId;
    this.fromidFn(formId)
    this.clertnoSilverForms();
  },

  // 剥粽子
  peelGoldFn(e) {
    if (this.notAvili(notAviliData)) return
    wx.showToast({
      title: '',
      icon: 'loading',
      mask: true,
    });
    let that = this
    app.getCode().then((code) => {
      let _data = {
        biz: this.data.biz, code: code, token: shareToken || wx.getStorageSync('shareToken'),
      }
      wx.request({
        url: `${origin.festival}/front/lottery/lottery`,
        method: 'POST',
        data: _data,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: function (res) {
          wx.hideToast();
          that.closeForm()
          let datas = res.data.data;
          if (res.data.code == 'F_000000') {
            that.setData({ zongziData: datas })
            that.indexDataFn().then(() => {
              let myZongziLength = that.data.myZongziLength
              //未集齐8种
              if (myZongziLength.length < awardTotal) {
                //银剪刀
                if (datas.bonus == '' || datas.bonus == undefined || datas.bonus == null) {
                  that.clertcongratsSilverFormAgain()
                } else {
                  //金剪刀
                  that.clertcongratsGoldFormAgain();
                }
              } else {
                //集齐8种
                that.pickUpRewardFn() //兑换红包
                clertcollectCompleteForm();
              }
            })
          } else if (res.data.code == 'Z001') {
            //没有粽子
            that.clertnoZongziForm()
          } else if (res.data.code == 'Z002') {
            //没有剪刀
            that.clertnoScissorForm()
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              success: function (res) {
                console.log(res.confirm)
              }
            })
          }
        },
        fail: function (error) {
          wx.hideToast();
          console.error('/lottery/lottery', error);
        }
      });
    })
    if (e) {
      let formId = e.detail.formId;
      this.fromidFn(formId)
    }
  },

  // 看视频
  watchVideo() {
    if (this.data.videoAd) {
      this.data.videoAd.show().catch(err => {
        // 失败重试
        this.data.videoAd.load().then(() => this.data.videoAd.show())
      })
    }
  },

  // 没剪刀打开弹窗
  // openScissorForm() {
  // if(this.notAvili(notAviliData) return
  //   let goldenScissorCount = this.data.indexData.goldenScissorCount,
  //     silverScissorCount = this.data.indexData.silverScissorCount;
  //   if (goldenScissorCount <= 0 && silverScissorCount <= 0) {
  //     that.clertnoScissorForm()
  //   }
  // },

  // 兑换红包
  pickUpRewardFn() {
    let _notAviliData = notAviliData
    _notAviliData.end = '2019/9/16'
    _notAviliData.afTitle = '兑换功能已关闭'
    _notAviliData.afContent = '请您在9月17日24点前完成提现，小程序将于9月18日关闭'
    if (this.notAvili(_notAviliData)) return
    app.getCode().then((code) => {
      let that = this;
      wx.request({
        url: `${origin.festival}/front/lottery/pickUpReward`,
        method: 'POST',
        data: {
          biz: this.data.biz,
          code: code
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        success: function (res) {
          console.log("/front/lottery/pickUpReward", res)
          let datas = res.data.data;
          if (res.data.success == true) {
            that.indexDataFn()
          }
          if (res.data.code == 'A_000002' || res.data.code == 'F_000002' || res.data.code == 'Z004') {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              success: function (res) {
                console.log(res.confirm)
              }
            })
          }
        },
        fail: function (error) {
          console.error('/lottery/pickUpReward', error);
        }
      })
    })
  },

  // 提现
  withDrawFn(e) {
    let _notAviliData = notAviliData
    _notAviliData.end = '2019/9/18'
    _notAviliData.afTitle = '提现功能已关闭'
    _notAviliData.afContent = '感谢您对教师节的支持'
    if (this.notAvili(_notAviliData)) return
    let formId = e.detail.formId, that = this;
    wx.showToast({
      title: '请稍候...',
      icon: 'loading',
      mask: true
    });
    app.getCode().then((code) => {
      wx.request({
        url: `${origin.festival}/front/duolabao/duoLaBaoWithDraw`,
        method: 'POST',
        data: { biz: this.data.biz, code: code },
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: function (res) {
          console.log("/front/duolabao/duoLaBaoWithDraw", res)
          wx.hideToast();
          let datas = res.data.data,
            stateCode = res.data.code;
          if (res.data.code === 'A_000000') {
            that.indexDataFn()
            wx.showModal({
              title: '提示',
              content: '提现成功，请到微信零钱查看',
              showCancel: false,
              success: function (res) {
                console.log(res.confirm)
              }
            })
          } else if (stateCode == 'F_000007') {
            wx.showModal({
              title: '提示',
              content: '微信规定小程序每日发奖上限30万元，今日额度已用尽，您可在24点微信更新额度后正常提现。',
              showCancel: false,
              success: function (res) {
                console.log(res.confirm)
              }
            })
          } else if (stateCode == 'A_000002' || stateCode == 'Z009' || stateCode == 'Z005' || stateCode == 'Z010' || stateCode == 'Z011') {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel: false,
              success: function (res) {
                console.log(res.confirm)
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '请稍后再试',
              showCancel: false,
              success: function (res) {
                console.log(res.confirm)
              }
            })
          }
        },
        fail: function (error) {
          wx.hideToast();
          console.error('/duolabao/duoLaBaoWithDraw', error);
        }
      })
    })
    this.fromidFn(formId)
  },

  // 收集formid
  fromidFn(formId) {
    app.getCode().then((code) => {
      wx.request({
        url: `${origin.festival}/front/duolabao/formid`,
        method: 'POST',
        data: { biz: this.data.biz, code: code, formid: formId },
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: function (res) {
          console.log('/front/duolabao/formid', res)
        },
        fail: function (error) {
          console.error('/front/duolabao/formid', error);
        }
      });
    })
  },

  // 转发分享
  onShareAppMessage: function (res) {
    this.closeForm()
    if (!ownToken) {
      this.getOwnTokenFn()
      return
    }
    console.log('onShareAppMessage 分享链接 : ', `pages/index/index?token=${ownToken}`)
    return {
      title: '金钢笔送贺卡得现金红包，提现秒到零钱',
      path: `pages/index/index?token=${ownToken}`,
      imageUrl: '../../images/share.jpg',
      success: function (res) {
        // 转发成功
        console.log('onShareAppMessage 已分享 : ', `pages/index/index?token=${ownToken}`)
      }
    }
  },

  // 活动规则
  ruleFn() {
    this.setData({ ruleForms: !this.data.ruleForms })
  },

  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    this.onLoad(); //我对onLoad方法进行了重新加载，你可以执行别的方法
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh()
  },

  // 小程序跳转
  toOtherHome(e) {
    wx.navigateToMiniProgram({
      appId: 'wxb500baa882321a60',
      path: 'bh_step/pages/index/index?ald_media_id=20810&ald_link_key=19fc3454c4b53b7f',
      envVersion: 'release',
    });
  },
  // 关闭贺卡
  toggleCard() {
    this.setData({ showCard: !this.data.showCard })
  },
  // 保存贺卡
  saveCard(e) {
    let _data = e.detail.value;
    if (!_data.name || !_data.school || !_data.content || !_data.teacherPhone) {
      wx.showToast({
        title: '必须全部填写哦',
        icon: 'none',
      })
      return;
    }
    app.getCode().then(code => {
      _data.code = code;
      _data.biz = this.data.biz
      let _this = this
      let _url = `${origin.festival}/front/duolabao/TeachersDay/insert`
      let _key = e.currentTarget.dataset.key;
      if (_key) {
        _data.key = _key;
        _url = `${origin.festival}/front/duolabao/TeachersDay/update`
      }
      console.log("保存贺卡 saveCard -> ", _data);
      wx.request({
        url: _url,
        data: _data,
        success: function (res) {
          console.log("保存贺卡 saveCard <- ", res);
          if (res.data.code === 'F_000000') {
            _this.toggleCard();
            _this.indexDataFn();
            // this.getCardList()
          } else {
            wx.showModal({
              title: 'saveCard',
              content: res.data.msg,
              success: function (res) {
                console.log(res.confirm)
              }
            })
          }
        }
      })
    })
  },
  // 查询贺卡列表
  getCardList() {
    app.getCode().then((code) => {
      let _data = { code: code, biz: this.data.biz }, that = this;
      if (this.data.debug) console.log("获取贺卡列表 getCardList -> ", _data);
      let _t = new Date().getTime();
      wx.request({
        url: `${origin.festival}/front/duolabao/TeachersDay/queryList`,
        data: _data,
        success: function (res) {
          if (that.data.debug) console.log("获取贺卡列表 getCardList <- ", (new Date().getTime() - _t) / 1000, res);
          if (res.data.code === 'F_000000') {
            let cards = res.data.data;
            that.setData({ cards: cards })
            let addCardArrayLength = that.data.indexData.thanksCardAllTimes - that.data.indexData.thanksCardUsedTimes
            // 获取添加贺卡数组
            that.setData({ addCardArray: Array(addCardArrayLength) })
          } else {
            console.error(res);
          }
        }
      })
    })
  },
  // 贺卡详情
  getCardDetail(e) {
    let index = e.currentTarget.dataset.index;
    let currentCard = this.data.cards[index];
    this.setData({ currentCard: currentCard, showCard: true })
    // app.getCode().then((code)=>function(){
    //   let _data = { code: code, biz: this.data.biz }, that = this;
    //   wx.request({
    //     url: `${origin.festival}/test/front/duolabao/TeachersDay/queryList`,
    //     data: _data,
    //     success: function (res) {
    //       if (res.data.code === 'F_000000') {
    //         let cards = res.data.data;
    //         that.setData({ cards: cards })
    //       } else {
    //         wx.showModal({
    //           title: '错误',
    //           content: res.data.msg,
    //           success: function (res) {
    //             if (res.confirm) {
    //               console.log('弹框后点取消')
    //             } else {
    //               console.log('弹框后点取消')
    //             }
    //           }
    //         })
    //       }
    //     }
    //   })
    // })
  }
})