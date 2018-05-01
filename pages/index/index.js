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

const MapWX = require('../../libs/qqmap-wx-jssdk.js')

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

Page({
  data: {
    tempNow: '',
    weatherNow: '',
    weatherBackgroundNow: '',
    forecastHourly: [],
    tempToday: '',
    dateToday: '',
    city: '广州市',
    locationAuthType: UNPROMPTED,
  },
  onLoad() {
    this.mapsdk = new MapWX({
      key: '7RIBZ-EAYKK-DAGJR-ASYVE-DDYVH-CTFNO'
    }),
    wx.getSetting({
      success: res => {
        let auth = res.authSetting['scope.userLocation']
        this.setData({
          locationAuthType: auth ? AUTHORIZED :
            (auth === false) ? UNAUTHORIZED : UNPROMPTED
        })
        if (auth)
          this.getLocationAndWeather()
        else
          this.getNow()
      }
    })
  },
  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },
  onTapDayWeather() {
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city
    })
  },
  onTapLocation() {
    if (this.data.locationAuthType === UNAUTHORIZED)
      wx.openSetting({
        success: res => {
          let auth = res.authSetting['scope.userLocation']
          if (auth) {
            this.getLocationAndWeather()
          }
        }
      })
    else
      this.getLocationAndWeather()
  },
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city
      },
      success: res => {
        let result = res.data.result;
        this.setNow(result)
        this.setForecastHourly(result)
        this.setToday(result)
      },
      complete: () => {
        callback && callback()
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
  },
  setToday(result) {
    let date = new Date()
    this.setData({
      tempToday: `${result.today.minTemp}° - ${result.today.maxTemp}°`,
      dateToday: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} 今天`
    })
  },
  getLocationAndWeather() {
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED,
        })
        this.mapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            this.setData({
              city: city
            })
            this.getNow()
          }
        })
      },
      fail: () => {
        this.setData({
          locationAuthType: UNAUTHORIZED,
        })
      }
    })
    
  }
})
