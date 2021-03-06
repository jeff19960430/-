var app=getApp();
var icon = require('../../icon/icon.js');
Page({
//设置变量，以便存储输入的数据
    data: {
    match_theme: '',
    match_time: '',
    match_week:'',
    match_address: '',
    match_address_name: '',
    match_rule: '',
    match_directions: '',
    match_remarks: '',
    uuid:'',
    openid: '',
    icon_map:'',
    edit_list:[],
      current: 0,
      max: 100,
      height:0,
  },

  limit: function (e) {
    var value = e.detail.value;
    var length = parseInt(value.length);
    if (length > this.data.noteMaxLen) {
      return;
    }

    this.setData({
      current: length,
      match_directions: e.detail.value
    });
  },
    
  onLoad: function (option){
    this.setData({
      icon_map:icon.icon_map,
      edit_list: JSON.parse(option.information_list),//接上个界面传来的数据
      match_theme: JSON.parse(option.information_list).theme,
      match_address: JSON.parse(option.information_list).address,
      match_time:JSON.parse(option.information_list).match_time,
      match_week: JSON.parse(option.information_list).week,
      match_directions: JSON.parse(option.information_list).directions,
      match_remarks: JSON.parse(option.information_list).remarks,
      match_rule: JSON.parse(option.information_list).rule,
      uuid: JSON.parse(option.information_list).uuid,
      longitude:JSON.parse(option.information_list).longitude,
      latitude: JSON.parse(option.information_list).latitude,
      height: getApp().globalData.winHeight - 120,
    })
    app.globalData.time = JSON.parse(option.information_list).match_time;
    app.globalData.week = JSON.parse(option.information_list).week;
    console.log("edit:",this.data.edit_list);
},
  //点击按钮，将值传给后端
  save_match: function (e) {
    var that = this;
    var app = getApp();
    //判断主题时间地址是否填写，进行逻辑交互处理
    if (that.data.match_theme == "" || that.data.match_time == "" || that.data.match_address == "") {
      wx.showToast({
        title: '主题时间地点不能为空！',
        icon: 'none',
        duration: 2000//持续的时间
      })
    }
    else {

          //连接mysql数据库 传送数据
          wx.request({
            url: 'http://192.168.0.105:8080/Jeff/MyServlet?method=edit_match',
            data: {
              match_theme: that.data.match_theme,
              match_time: that.data.match_time,
              match_week: app.globalData.week,
              match_address: that.data.match_address,
              match_address_name: that.data.match_address_name,
              match_rule: that.data.match_rule,
              match_directions: that.data.match_directions,
              match_remarks: that.data.match_remarks,
              uuid:that.data.uuid,
              openid: getApp().globalData.openid,
              longitude: that.data.longitude,
              latitude: that.data.latitude

            },
            method: 'GET',
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              getApp().globalData.sign=2;
              wx.showToast({
                title: '成功保存',
                icon: 'success',
                duration: 2000//持续的时间

              })
              console.log("修改比赛成功，将此比赛写入数据库：", res.data);
                wx.navigateTo({
                url: '../index/index'
              })
            },
            fail: function (res) {
              console.log(".....fail.....");
              //成功后才界面的跳转

            }
          })
        } 
  },
  //点击删除该比赛记录
  delete_match:function(e){
    var that = this;
    wx.request({
      url: 'http://192.168.0.105:8080/Jeff/MyServlet?method=delete_match',
      data: {
        uuid: that.data.uuid,
        openid: getApp().globalData.openid,

      },
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        getApp().globalData.sign = 1;
        console.log("删除比赛成功：", res.data);
        wx.showToast({
          title: '成功删除',
          icon: 'success',
          duration: 2000//持续的时间

        })
        wx.navigateTo({
          url: '../index/index'
        })
      },
      fail: function (res) {
        console.log(".....fail.....");
        //成功后才界面的跳转

      }
    })
  },
  //比赛主题
  match_theme_input: function (e) {
    this.setData({
      match_theme: e.detail.value
    })
  },

  //获取时间日期
  bindSelect: function (e) {
    console.log("time:", e.detail)//选择结果值,这里的函数来源于date2.js。下拉选择器选择了什么则传入什么值，这边将time和week拆开
    getApp().globalData.time=e.detail[0];
     getApp().globalData.match_week=e.detail[1]
  
  },


 //备注
  match_remarks_input: function (e) {
    this.setData({
      match_remarks: e.detail.value
    })
  },

  //地图
  chooseLocation: function (e) {
    var that = this;
    var app = getApp();
    wx.chooseLocation({

      success: function (res) {

        console.log(res);
        app.globalData.latitude = res.latitude;
        app.globalData.longitude = res.longitude;
        that.setData({
          match_address: res.name,
        })

      }

    })
  },
  
})