/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
//获取应用实例
const app = getApp(),
  config = require('../../config'),
  origin = config.origin;
let that = null;
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
    that.setData({ clert: opt })
  },
  close: function () {
    that.setData({ clert: { show: false } })
  }
}

Page({
  data: {
    biz: 'dlbyfgTeacher',
    awardTotal: 5,
    indexData: {},
    zongziData: {},
    token: '',
    scissorNum: '',
    goldenNum: '',
    videoAd: null,
    ruleForms: false,
    myBalance: 0,
    myZongziArr: [],
    myZongziLength: 0,
    cards: null,
    currentCard: null,
    showCard: false,
    adUnitId: 'adunit-facea3e23a0fe01f',
    addCardArray: [],
    debug: true,
    clert: {}
  },
  onReady: function () {
  },
  onShow: function () {
    // this.clertnoZongziForm();
  },
  onLoad: function () {
    that = this;
    if (this.notAvili({ start: '2019/07/10', end: '2019/08/15', beTitle: '', beContent: '活动未开始', afTitle: '活动已结束', afContent: '请您在8月12日24点前完成提现，小程序将于8月13日关闭' })) return
    //获取页面数据
    this.indexDataFn();
    //视屏
    if (wx.createRewardedVideoAd) {
      // 加载激励视频广告
      this.data.videoAd = wx.createRewardedVideoAd({ adUnitId: this.adUnitId })
      //捕捉错误
      this.data.videoAd.onError(err => { })
      // 监听关闭
      this.data.videoAd.onClose((status) => {
        // 正常播放结束，下发奖励
        if (status && status.isEnded || status === undefined) {
          clert.close();
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
  },

  clertFn: function (e) {
    let fnName = e.currentTarget.dataset.fn;
    let fn = clert.opt[e.currentTarget.dataset.fn];
    fn ? fn() : that[fnName]();
  },
  clertnoZongziForm() {
    clert.show({
      content: '将贺卡送给两名好友，两名好友成功送出贺卡，即可获得一个新礼盒。',
      title: '',
      btns: [{ btnTxt: "送贺卡", class: "alc-btn-mai", fn: "share" }, { btnTxt: '放弃', class: 'alc-btn-sec', fn: 'closeForm' }],
      closeForm() { clert.close() }
    })
  },
  clertfreeForm() {
    clert.show({
      content: '只需1分押金，即可送花一次，送出后自动退款（退款需24小时）',
      title: '',
      btns: [{ btnTxt: "送花", class: "alc-btn-mai", fn: "getGoldFn" }, { btnTxt: '放弃', class: 'alc-btn-sec', fn: 'closeForm' }],
      getGoldFn: function () {
        wx.navigateTo({ url: '../pay/pay' })
      },
      closeForm() { clert.close() }
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
      content: '新竹高于旧竹枝，\n 全凭老干为扶持。\n 下年再有新生者，\n 十丈龙孙绕凤池。',
      title: '',
      btns: [{ btnTxt: "感谢您对教师节的支持", class: "alc-btn-mai", fn: "closeForm" }],
      closeForm() { clert.close() }
    })
  },
  clertnoScissorForm() {
    that.setData({ noScissorForm: true })
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
  getTokenFn() {
    let that = this;
    return new Promise((resolve, reject) => {
      app.getCode().then(code => function (code) {
        wx.request({
          url: `${origin.festival}/front/lottery/sharePage`,
          method: 'POST',
          data: {
            biz: this.data.biz,
            code: code
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          success: function (res) {
            console.log("/front/lottery/sharePage", res)
            if (res.data.code == 'A_000000') {
              // debugger
              let token = res.data.data;
              that.setData({
                token: token
              })
              console.log(`token:${token}`)
              resolve(res.data);
            } else {
              wx.showModal({
                title: '提示',
                content: res.data.msg,
                success: function (res) {
                  if (res.confirm) {
                    console.log('弹框后点取消')
                  } else {
                    console.log('弹框后点取消')
                  }
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
    })
  },

  // 顶部点击粽子
  openFn() {
    if (this.notAvili({ start: '2019/07/10', end: '2019/08/10', beTitle: '', beContent: '活动未开始', afTitle: '活动已结束', afContent: '请您在8月12日24点前完成提现，小程序将于8月13日关闭' })) {
      return
    }
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
    if (this.notAvili({ start: '2019/07/10', end: '2019/08/10', beTitle: '', beContent: '活动未开始', afTitle: '活动已结束', afContent: '请您在8月12日24点前完成提现，小程序将于8月13日关闭' })) {
      return
    }
    wx.showToast({
      title: '',
      icon: 'loading',
      mask: true,
    });
    let that = this;
    let getToken = wx.getStorageSync('getToken') || '';
    if (getToken == '' || getToken == null) {
      that.getTokenFn()
    }
    let _data = {
      biz: this.data.biz, code: code, token: getToken,
    }
    app.getCode().then((code) => {
      wx.request({
        url: `${origin.festival}/front/lottery/lottery`,
        method: 'POST',
        data: _data,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: function (res) {
          wx.hideToast();
          clert.close();
          let datas = res.data.data;
          if (res.data.code == 'A_000000') {
            that.setData({ zongziData: datas })
            that.indexDataFn().then(() => {
              let myZongziLength = that.data.myZongziLength
              //未集齐8种
              if (myZongziLength.length < that.data.awardTotal) {
                //银剪刀
                if (datas.bonus == '' || datas.bonus == undefined || datas.bonus == null) {
                  clertcongratsSilverFormAgain()
                } else {
                  //金剪刀
                  clertcongratsGoldFormAgain();
                }
              } else {
                //集齐8种
                that.pickUpRewardFn() //兑换红包
                clertcollectCompleteForm();
              }
            })
          } else if (res.data.code == 'Z001') {
            //没有粽子
            this.clertnoZongziForm()

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
  //   if (this.notAvili({ start: '2019/07/10', end: '2019/08/10', beTitle: '', beContent: '活动未开始', afTitle: '活动已结束', afContent: '请您在8月12日24点前完成提现，小程序将于8月13日关闭' })) {
  //     return
  //   }
  //   let goldenScissorCount = this.data.indexData.goldenScissorCount,
  //     silverScissorCount = this.data.indexData.silverScissorCount;
  //   if (goldenScissorCount <= 0 && silverScissorCount <= 0) {
  //     that.clertnoScissorForm()
  //   }
  // },

  // 兑换红包
  pickUpRewardFn() {
    if (this.notAvili({ start: '2019/06/01', end: '2019/08/12', beTitle: '', beContent: '活动未开始', afTitle: '兑换功能已关闭', afContent: '请您在8月12日24点前完成提现，小程序将于8月13日关闭' })) {
      return
    };
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
    if (this.notAvili({ start: '2019/06/01', end: '2019/08/13', beTitle: '', beContent: '活动未开始', afTitle: '提现功能已关闭', afContent: '感谢您对七夕节的支持' })) {
      return
    }
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
          let datas = res.data.data,
            stateCode = res.data.code;
          if (res.data.code === 'A_000000') {
            that.indexDataFn()
            wx.showModal({
              title: '提示',
              content: '提现成功，请到微信零钱查看',
              showCancel: false,
              success: function (res) {
                wx.hideToast();
                console.log(res.confirm)
              }
            })
          } else if (stateCode == 'F_000007') {
            wx.showModal({
              title: '提示',
              content: '微信规定小程序每日发奖上限30万元，今日额度已用尽，您可在24点微信更新额度后正常提现。',
              showCancel: false,
              success: function (res) {
                consolo.log(res.confirm)
              }
            })
          } else if (stateCode == 'A_000002' || stateCode == 'Z009' || stateCode == 'Z005' || stateCode == 'Z010' || stateCode == 'Z011') {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel: false,
              success: function (res) {
                consolo.log(res.confirm)
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '请稍后再试',
              showCancel: false,
              success: function (res) {
                consolo.log(res.confirm)
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
    clert.close();
    let token = this.data.token;
    return {
      title: '金剪刀赢现金红包，提现秒到零钱',
      path: `pages/index/index?token=${token}`,
      imageUrl: '../../images/share.jpg',
      success: function (res) {
        // 转发成功
        console.log(`pages/index/index?token=${token}`)
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
    app.getCode().then(code => {
      let _data = e.detail.value;
      if (!_data.name || !_data.school || !_data.content || !_data.teacherPhone) {
        wx.showToast({
          title: '必须全部填写哦',
          icon: 'none',
        })
        return;
      }
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
            let addCardTimes = (that.data.indexData.thanksCardAllTimes - that.data.indexData.thanksCardUsedTimes)
            let addCardLeft = 3 - cards.length;
            let addCardArrayLength = 0;
            if (cards && addCardLeft > 0) {
              addCardArrayLength = addCardTimes > addCardLeft ? addCardLeft : addCardTimes;
            }
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