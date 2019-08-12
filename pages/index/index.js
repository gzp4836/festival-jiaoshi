/* eslint-disable no-undef */
//获取应用实例
const app = getApp(),
  config = require('../../config'),
  origin = config.origin;
Page({
  data: {
    biz: 'dlbyfgTeacher',
    motto: 'Hello World',
    code: '',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    traditional: false,
    popupOne: false,
    popupTwo: false,
    indexData: {},
    zongziData: {},
    token: '',
    getToken: '',
    scissorNum: '',
    goldenNum: '',
    noScissorForm: false,
    freeForm: false,
    congratsGoldForm: false,
    congratsSilverForm: false,
    noZongziForm: false,
    congratsGoldFormAgain: false,
    congratsSilverFormAgain: false,
    noSilverForms: false,
    collectCompleteForm: false,
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
    debug: true
  },
  onLoad: function () {
    let that = this;

    //获取页面数据
    this.indexDataFn();
    // this.setData({ code: app.globalData.code })
    // 获取token
    // this.getTokenFn()
    // mock邀请
    // this.yfgInviteMock(code)
    // mock金剪刀
    // this.goldTestfn(code)
    // mock银剪刀
    // this.yintestMock(code)

    //视屏
    // app.getCode().then((code) => {
    if (wx.createRewardedVideoAd) {
      // 加载激励视频广告
      this.data.videoAd = wx.createRewardedVideoAd({
        adUnitId: this.adUnitId
      })
      //捕捉错误
      this.data.videoAd.onError(err => {
        // 进行适当的提示
      })
      // 监听关闭
      this.data.videoAd.onClose((status) => {
        if (status && status.isEnded || status === undefined) {
          // 正常播放结束，下发奖励
          console.log('正常播放结束')
          that.setData({
            noSilverForms: false
          })
          app.getCode().then((code) => {
            console.log('看视频code：' + code)
            wx.request({
              url: `${origin.festival}/front/lottery/addCount`,
              method: 'POST',
              data: {
                biz: this.data.biz,
                code: code
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded',
              },
              success: function (res) {
                console.log("/front/lottery/addCount", res)
                let datas = res.data.data;
                if (res.data.success == true) {
                  that.setData({
                    noSilverForms: false,
                    congratsSilverForm: true,
                    scissorNum: datas
                  })
                }
                if (res.data.code == 'A_000002' || res.data.code == 'Z003') {
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
                }
              },
              fail: function (error) {
                console.error('/lottery/addCount', error);
              }
            });
          })
        } else {
          // 播放中途退出，进行提示
          console.log('播放中途退出')
        }
      })
    }
    // })

  },

  onReady: function () {

  },

  onShow: function () {
    this.isAvili({ start: '2019/07/10', end: '2019/08/10', beTitle: '', beContent: '活动未开始', afTitle: '活动已结束', afContent: '请您在8月12日24点前完成提现，小程序将于8月13日关闭' });
  },

  onHide: function () {

  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  // 活动结束
  isAvili(opt) {
    let
      currentTime = new Date(),
      startTime = new Date(Date.parse(opt.start)),
      endTime = new Date(Date.parse(opt.end));
    if (currentTime < startTime || currentTime > endTime) {
      let title = currentTime < startTime ? beTitle : afTitle;
      let content = currentTime < startTime ? beContent : afContent;
      wx.showModal({
        title: title,
        content: content,
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('弹框后点取消')
          } else {
            console.log('弹框后点取消')
          }
        }
      })
      return false;
    }
    return true;
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
              if (datas == null) { console.error('data is null'); return }
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
              // console.log(myZongziArr)
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
                  if (res.confirm) {
                    console.log('弹框后点取消')
                  } else {
                    console.log('弹框后点取消')
                  }
                }
              })

            }
          },
          fail: function (error) {
            console.error('/lottery/indexData', error);
          }
        });
      })
    })
  },
  addCard() {
    this.setData({ showCard: true, currentCard: null })
  },
  // 获取token
  getTokenFn(code) {
    let that = this;
    return new Promise((resolve, reject) => {
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
      });
    })
  },

  // 顶部点击粽子
  openFn() {
    if (!this.isAvili({ start: '2019/07/10', end: '2019/08/10', beTitle: '', beContent: '活动未开始', afTitle: '活动已结束', afContent: '请您在8月12日24点前完成提现，小程序将于8月13日关闭' })) {
      return
    }
    let goldenScissorCount = this.data.indexData.goldenScissorCount,
      notOpen = this.data.indexData.notOpen,
      silverScissorCount = this.data.indexData.silverScissorCount,
      that = this;
    //有粽子
    // debugger
    if (notOpen > 0) {
      if (silverScissorCount <= 0 && goldenScissorCount <= 0) { //没剪刀
        that.setData({
          noScissorForm: true,
          musk: true
        })
      } else { //有剪刀
        this.peelGoldFn()
      }
    } else if (notOpen <= 0) { //没粽子
      this.setData({
        noZongziForm: true,
        musk: true
      })
    }
  },

  // 领金剪刀
  goldFn(e) {
    let formId = e.detail.formId;
    this.fromidFn(formId)
    console.log('金剪刀formid' + e.detail.formId)
    let goldenScissorCount = this.data.indexData.goldenScissorCount,
      that = this;
    if (goldenScissorCount <= 0) {
      that.setData({
        noScissorForm: false,
        freeForm: true
      })
    }
  },

  // 获取金剪刀
  getGoldFn() {
    wx.navigateTo({
      url: '../pay/pay'
    })
  },

  // 领银剪刀
  silverFn(e) {
    let formId = e.detail.formId;
    this.fromidFn(formId)
    console.log('银剪刀formid' + e.detail.formId)
    this.setData({
      noScissorForm: false,
      noSilverForms: true,
      musk: true
    })
  },

  // 剥粽子
  peelGoldFn(e) {
    if (!this.isAvili({ start: '2019/07/10', end: '2019/08/10', beTitle: '', beContent: '活动未开始', afTitle: '活动已结束', afContent: '请您在8月12日24点前完成提现，小程序将于8月13日关闭' })) {
      return
    }
    // debugger
    wx.showToast({
      title: '',
      icon: 'loading',
      mask: true,
    });
    let that = this;
    let getToken = wx.getStorageSync('getToken') || '';
    if (getToken == '' || getToken == null) {
      app.getCode().then((code) => {
        that.setData({ code, code })
        that.getTokenFn()
      })
    }
    try {
      console.log('剥粽子的token：' + getToken)
      app.getCode().then((code) => {
        wx.request({
          url: `${origin.festival}/front/lottery/lottery`,
          method: 'POST',
          data: {
            biz: this.data.biz,
            code: code,
            token: getToken,
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          success: function (res) {
            console.log('剥粽子的Data：' + JSON.stringify({
              biz: this.data.biz,
              code: code,
              token: getToken,
            }))
            console.log("front/lottery/lottery", res)
            wx.hideToast();
            that.setData({
              congratsGoldForm: false,
              congratsSilverForm: false
            })
            let datas = res.data.data;
            if (res.data.success == true) {

              that.setData({
                zongziData: datas,
                congratsGoldFormAgain: false,
                congratsSilverFormAgain: false,
              })
              that.indexDataFn().then(() => {
                let myZongziLength = that.data.myZongziLength,
                  goldenScissorCount = that.data.indexData.goldenScissorCount,
                  silverScissorCount = that.data.indexData.silverScissorCount;
                // debugger

                if (myZongziLength.length < 8) { //未集齐8种
                  if (datas.bonus == '' || datas.bonus == undefined || datas.bonus == null) { //银剪刀
                    that.setData({
                      congratsGoldFormAgain: false,
                      congratsSilverFormAgain: true,
                      collectCompleteForm: false
                    })
                  } else { //金剪刀
                    that.setData({
                      congratsSilverFormAgain: false,
                      congratsGoldFormAgain: true,
                      collectCompleteForm: false
                    })
                  }
                } else if (myZongziLength.length >= 8) { //集齐8种
                  that.pickUpRewardFn() //兑换红包
                  that.setData({
                    congratsGoldFormAgain: false,
                    congratsSilverFormAgain: false,
                    collectCompleteForm: true

                  })
                }
              })
            }
            if (res.data.code == 'A_000002') {
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
            }
            if (res.data.code == 'Z001') { //没有粽子
              that.setData({
                noZongziForm: true,
                congratsSilverFormAgain: false,
                congratsGoldFormAgain: false,
                congratsGoldForm: false,
                congratsSilverForm: false,
                noScissorForm: false
              })
            } else if (res.data.code == 'Z002') { //没有剪刀
              that.setData({
                noScissorForm: true,
                congratsSilverFormAgain: false,
                congratsGoldFormAgain: false,
                congratsGoldForm: false,
                congratsSilverForm: false
              })

            }


          },
          fail: function (error) {
            wx.hideToast();
            console.error('/lottery/lottery', error);
          }
        });
      })

    } catch (e) {

    }

    if (e) {
      let formId = e.detail.formId;
      this.fromidFn(formId)
    }
  },

  // 看视频
  watchVideo() {
    console.log('打开激励视频');
    // 在合适的位置打开广告

    if (this.data.videoAd) {
      this.data.videoAd.show().catch(err => {
        // 失败重试
        this.data.videoAd.load()
          .then(() => this.data.videoAd.show())
      })
    }
  },

  // 没剪刀打开弹窗
  openScissorForm() {
    if (!this.isAvili({ start: '2019/07/10', end: '2019/08/10', beTitle: '', beContent: '活动未开始', afTitle: '活动已结束', afContent: '请您在8月12日24点前完成提现，小程序将于8月13日关闭' })) {
      return
    }
    let goldenScissorCount = this.data.indexData.goldenScissorCount,
      silverScissorCount = this.data.indexData.silverScissorCount;
    if (goldenScissorCount <= 0 && silverScissorCount <= 0) {
      this.setData({
        noScissorForm: true
      })
    }

  },

  // 兑换红包
  pickUpRewardFn() {
    if (!this.isAvili({ start: '2019/06/01', end: '2019/08/12', beTitle: '', beContent: '活动未开始', afTitle: '兑换功能已关闭', afContent: '请您在8月12日24点前完成提现，小程序将于8月13日关闭' })) {
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
            // that.setData({
            //   balance: datas
            // })
          }
          if (res.data.code == 'A_000002' || res.data.code == 'F_000002' || res.data.code == 'Z004') {
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
          }


        },
        fail: function (error) {
          console.error('/lottery/pickUpReward', error);
        }
      });
    })

  },

  // 提现
  withDrawFn(e) {
    if (!this.isAvili({ start: '2019/06/01', end: '2019/08/13', beTitle: '', beContent: '活动未开始', afTitle: '提现功能已关闭', afContent: '感谢您对七夕节的支持' })) {
      return
    }
    let formId = e.detail.formId,
      that = this;
    wx.showToast({
      title: '请稍候...',
      icon: 'loading',
      mask: true
    });
    app.getCode().then((code) => {
      wx.request({
        url: `${origin.festival}/front/duolabao/duoLaBaoWithDraw`,
        method: 'POST',
        data: {
          biz: this.data.biz,
          code: code
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        success: function (res) {
          console.log("/front/duolabao/duoLaBaoWithDraw", res)
          let datas = res.data.data,
            stateCode = res.data.code;
          if (res.data.success == true) {
            that.indexDataFn(code)
            wx.showModal({
              title: '提示',
              content: '提现成功，请到微信零钱查看',
              showCancel: false,
              success: function (res) {
                wx.hideToast();
                if (res.confirm) {
                  console.log('弹框后点取消')
                } else {
                  console.log('弹框后点取消')
                }
              }
            })
          } else if (res.data.success == false) {
            if (stateCode == 'A_000002' || stateCode == 'Z009' || stateCode == 'Z005' || stateCode == 'Z010' || stateCode == 'Z011') {
              wx.showModal({
                title: '提示',
                content: res.data.msg,
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    console.log('弹框后点取消')
                  } else {
                    console.log('弹框后点取消')
                  }
                }
              })
            } else if (stateCode == 'F_000007') {
              wx.showModal({
                title: '提示',
                content: '微信规定小程序每日发奖上限30万元，今日额度已用尽，您可在24点微信更新额度后正常提现。',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    console.log('弹框后点取消')
                  } else {
                    console.log('弹框后点取消')
                  }
                }
              })
            } else {
              wx.showModal({
                title: '提示',
                content: '请稍后再试',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    console.log('弹框后点取消')
                  } else {
                    console.log('弹框后点取消')
                  }
                }
              })
            }
          }

        },
        fail: function (error) {
          wx.hideToast();
          console.error('/duolabao/duoLaBaoWithDraw', error);
        }
      });
    })
    this.fromidFn(formId)
  },

  // 收集formid
  fromidFn(formId) {
    app.getCode().then((code) => {
      wx.request({
        url: `${origin.festival}/front/duolabao/formid`,
        method: 'POST',
        data: {
          biz: this.data.biz,
          code: code,
          formid: formId
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        success: function (res) {
          console.log('/front/duolabao/formid', res)
          if (res.data.code == 'A_000002') {
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
          }
        },
        fail: function (error) {
          console.error('/front/duolabao/formid', error);
        }
      });
    })

  },

  // 转发分享
  onShareAppMessage: function (res) {
    let token = this.data.token;

    return {
      title: '金剪刀赢现金红包，提现秒到零钱',
      path: `pages/index/index?token=${token}`,
      imageUrl: '../../images/share.jpg',
      success: function (res) {
        // 转发成功
        console.log(`pages/index/index?token=${token}`)
      },
      fail: function (res) {
        // 转发失败
      }
    }

    this.setData({
      noZongziForm: false
    })

  },

  // 活动规则
  ruleFn() {
    let ruleForms = this.data.ruleForms;
    if (ruleForms) {
      this.setData({
        ruleForms: false
      })
    } else {
      this.setData({
        ruleForms: true
      })
    }

  },

  // 关闭弹框
  closeForm() {
    this.setData({
      noZongziForm: false,
      collectCompleteForm: false,
      musk: false
    })
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
  closeCard() {
    this.setData({ showCard: false })
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
            // let cards = res.data.data;
            // that.setData({ cards: cards })
            _this.setData({ showCard: false })
            _this.indexDataFn();
          } else {
            wx.showModal({
              title: 'saveCard',
              content: res.data.msg,
              success: function (res) {
                if (res.confirm) {
                  console.log('弹框后点取消')
                } else {
                  console.log('弹框后点取消')
                }
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
            // wx.showModal({
            //   title: 'getCardList',
            //   content: res.data.msg,
            //   success: function (res) {
            //     if (res.confirm) {
            //       console.log('弹框后点取消')
            //     } else {
            //       console.log('弹框后点取消')
            //     }
            //   }
            // })
          }
        }
      })
    })
  },
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

  // // 金剪刀发放mock接口
  // goldTestfn(code) {
  //   wx.request({
  //     url: `${origin.festival}/test/front/yfgGoldMock?gold=1&code=${code}`,
  //     method: 'POST',
  //     success: function (res) {

  //       if (res.data.code == 'A_000002') {
  //         wx.showModal({
  //           title: '提示',
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
  //     },
  //     fail: function (error) {
  //       console.error('/lottery/indexData', error);
  //     }
  //   });
  // },

  // // 邀请粽子mock接口
  // yfgInviteMock(code) {
  //   wx.request({
  //     url: `${origin.festival}/test/front/yfgInviteMock?code=${code}&openid=190`,
  //     method: 'POST',
  //     success: function (res) {

  //       if (res.data.code == 'A_000002') {
  //         wx.showModal({
  //           title: '提示',
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
  //     },
  //     fail: function (error) {
  //       console.error('/lottery/indexData', error);
  //     }
  //   });
  // },

  // // 银剪刀mock接口
  // yintestMock(code) {
  //   wx.request({
  //     url: `${origin.festival}/front/lottery/addCount`,
  //     method: 'POST',
  //     data: {
  //       biz: this.data.biz,
  //       code: code
  //     },
  //     header: {
  //       'content-type': 'application/x-www-form-urlencoded',
  //     },
  //     success: function (res) {
  //       let datas = res.data.data;
  //       if (res.data.result == 'success') {
  //         that.setData({
  //           scissorNum: datas
  //         })
  //       }
  //       if (res.data.code == 'A_000002' || res.data.code == 'Z003') {
  //         wx.showModal({
  //           title: '提示',
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
  //     },
  //     fail: function (error) {
  //       console.error('/lottery/addCount', error);
  //     }
  //   });
  // }

})