var icon = require('../../icon/icon.js');
var app = getApp();
Page({
  data: {
     information_list:[],
     nickName: '',
     openid:'',
     uuid:'',
     match_time:'',
     disabled_join:false,
     disabled_leave: false,
     userInfo:[],
     join_information:[],
     leave_information: [],
     join_count:'',
     leave_count: '',
     longitude:'',
     latitude:'',
     icon_right:'',
     icon_map:'',
     icon_share:'',
     icon_edit:'',
     icon_home:'',
     height:0,  
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    var that = this;
  //统一根据uuid来重新获取，这样不管是在程序中的还是分享进来的，都使用用一个方法
    that.setData({
      icon_right:icon.right,
      icon_map:icon.icon_map,
      icon_share:icon.share,
      icon_edit:icon.edit,
      icon_home:icon.icon_home,            
      uuid: options.uuid,
      match_time:options.time,
      height: getApp().globalData.winHeight-100,
    })
    getApp().globalData.match_time=options.time; //接受分享界面传来的
    getApp().globalData.uuid = options.uuid;//接受分享界面传来的
    getApp().globalData.sign_share=options.sign_share,
    console.log("结束的uuid:",getApp().globalData.uuid);
    console.log("time:", that.data.match_time);
    console.log("结束的uuid2:", getApp().globalData.sign_share);
  // 取出key为openid的值.openid在app.js的onload界面已经存在storage中
    app.callback().then(res => {
    wx.getStorage({      
      key: 'openid',
      success: function (res) {
        that.setData({
          openid: res.data
        })
        //向后台请求，根据uuid获取对应比赛信息。并且将用户和这场比赛绑定起来
        wx.request({
          url: 'http://192.168.0.105:8080/Jeff/MyServlet?method=take_basisUuid',
          data: {
            uuid: that.data.uuid,
            openid: that.data.openid
          },
          method: 'GET',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            console.log("成功接收：", res.data);
            //成功后，接收这场比赛的信息
            that.setData({
              information_list: res.data.match_information[0],
              //接收后台处理好的报名人和请假人的数据信息
              join_information: res.data.json_register,
              leave_information: res.data.json_leave,
               //接收后台传来关于该用户是否已经报名或请假，从而控制报名或请假按钮是否禁用
              disabled_join: res.data.disable_join,
              disabled_leave: res.data.disable_leave,
              join_count: res.data.json_register.length,
              leave_count: res.data.json_leave.length,
              longitude:res.data.longitude,
              latitude:res.data.latitude
            })
           
          },
          fail: function (res) {
            console.log(".....fail.....");
          }
        })
      },
    })
    })
      // 要求小程序返回分享目标信息
      wx.showShareMenu({
        withShareTicket: true
      })


  },

  //报名按钮,点击报名按钮，把这场比赛的uuid和该用户的openid传到大后台 
  user_join: function () {
    var that = this;
    that.setData({       //点击后将禁用值变为true，则成功禁用此按钮
      disabled_join:true,
      disabled_leave:false
    })

    //连接mysql数据库 传送数据
    wx.request({
      url: 'http://192.168.0.105:8080/Jeff/MyServlet?method=sign_up',
      data: {
          openid:this.data.openid,
          uuid:this.data.uuid,
          time:this.data.match_time
      },
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        //成功后，分别将接受到的报名人信息和请假人信息分别赋值给这个页面中的变量
        that.setData({
          join_information: res.data.json_register,
          leave_information: res.data.json_leave,
          join_count: res.data.json_register.length,
          leave_count: res.data.json_leave.length,
        })
        console.log("app.js从后台获取的数据(register)：", res.data);
        console.log("报名个数：", that.data.join_count);
      },
      fail: function (res) {
        console.log(".....fail.....");
      }
    })
  },

  //请假按钮,点击请假按钮，把这场比赛的uuid和该用户的openid传到大后台 
  user_leave: function (){
    var that = this;
    that.setData({       //点击后将禁用值变为true，则成功禁用此按钮
      disabled_join:false,
      disabled_leave: true
    })  

    //连接mysql数据库 传送数据
    wx.request({
      url: 'http://192.168.0.105:8080/Jeff/MyServlet?method=leave',
      data: {
        openid: this.data.openid,
        uuid: this.data.uuid,
        time: this.data.match_time
      },
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        //成功后，分别将接受到的报名人信息和请假人信息分别赋值给这个页面中的变量
        that.setData({
          join_information: res.data.json_register,
          leave_information: res.data.json_leave,
          join_count: res.data.json_register.length,
          leave_count: res.data.json_leave.length,
        })
        console.log("app.js从后台获取的数据(leave)：", res.data);
      },
      fail: function (res) {
        console.log(".....fail.....");
      }
    })
  },


  //转发
  onShareAppMessage: function (ops) {
    if (ops.from ==='shareBtn') {
      // 来自页面内转发按钮
      console.log(ops.target)
      console.log("uuid:",this.data.uuid)
    }
    console.log("uuid:", this.data.uuid)
    return {
      title:'赶紧进来报名吧！',
      path: 'pages/match_information/match_information?uuid='+ this.data.uuid+'&time='+this.data.match_time+'&sign_share='+1,
      success: function (res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }

  },
  //返回首页
  back:function(){
    wx.navigateTo({
      url: '../index/index',
    })
  },
  //打开地图
  openLocation: function () {
    wx.openLocation({
      latitude: this.data.latitude,
      longitude: this.data.longitude,
    })
  },
 
 //编辑比赛信息
  edit:function(){
    console.log("imformation:", this.data.information_list)
    wx.navigateTo({
      url: '../edit/edit?information_list='+JSON.stringify(this.data.information_list)
    })
  },

 //报名队员
  registration_member:function(){

    wx.navigateTo({
      url: '../registration_member/registration_member?registration_member=' + JSON.stringify(this.data.join_information)+'&registration_count='+this.data.join_count
    })
  },
  //请假队员
  leave_member: function () {

    wx.navigateTo({
      url: '../leave_member/leave_member?leave_member=' + JSON.stringify(this.data.leave_information) + '&leave_count=' + this.data.leave_count
    })
  }

})
