// pages/list/list.js
const dayMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

Page({
  data: {
    dateList: [],
    city: '广州市'
  },
  onLoad(options) {
    this.setData({
      city: options.city
    })
    this.getFuture()
  },
  onPullDownRefresh() {
    this.getFuture(() => {
      wx.stopPullDownRefresh()
    })
  },
  getFuture(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        city: this.data.city,
        time: new Date().getTime()
      },
      success: res => {
        let result = res.data.result
        this.setDateWeather(result)
      },
      complete: () => {
        callback && callback()
      },
    })
  },
  setDateWeather(result) {
    let weathers = []
    let i = 0
    result.forEach(w => {
      let date = new Date()
      date.setDate(date.getDate() + i)
      weathers.push({
        day: dayMap[date.getDay()],
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        temp: `${w.minTemp}° - ${w.maxTemp}°`,
        iconPath: '/images/' + w.weather + '-icon.png'
      })
      i++
    })
    weathers[0].day = '今天'
    this.setData({
      dateList: weathers
    })
  }
})