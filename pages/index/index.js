const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}
const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

Page({
  data: {
    tempNow: '',
    weatherNow: '',
    weatherBackgroundNow: '',
    forecastHourly: []
  },
  onLoad() {
    this.getNow()
  },
  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },
  getNow(callback) {
    wx.request({
      complete: () => {
        callback && callback()
      },
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: '北京市'
      },
      success: res => {
        let result = res.data.result;
        this.setNow(result)
        this.setForecastHourly(result)
      }
    })
  },
  setNow(result) {
    let temp = result.now.temp;
    let weather = result.now.weather;
    this.setData({
      tempNow: temp + '°',
      weatherNow: weatherMap[weather],
      weatherBackgroundNow: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },
  setForecastHourly(result) {
    let forecastList = result.forecast;
    let forecastNow = [];
    let hourNow = new Date().getHours()
    for (let i = 0; i < 8; i += 1) {
      forecastNow.push({
        time: (i*3 + hourNow) % 24 + '时',
        iconPath: '/images/' + forecastList[i].weather + '-icon.png',
        temp: forecastList[i].temp + '°'
      })
    }
    forecastNow[0].time = '现在'
    this.setData({
      forecastHourly: forecastNow
    })
  }
})
