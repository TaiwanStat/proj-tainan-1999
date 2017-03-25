var $ = window.$;
/*
【 G 】 API data controller

時間到搜尋日期的 23:59:59 !

- parameter
@last : last state
@now : current state

- method:
@select : select state
@getAreasData : get data select 'time' 'area', return order by 'area'
@getItemsData : get data select 'time' 'area', return order by 'item'

  ex:
    G.getAreasData('2016-07-01', '2016-07-10', ['新化區', '新營區', ...])
      return {
        "count": 3876,
        "areasArray": [{
          "area": "安平區",
          "caseCount": 265,
          "listData": [{...}, {...}, ...]
        },{ ... }]
      }


    G.getItemsData('2016-07-01', '2016-07-03', ['新化區', '新營區', ...])
      return {
        "count": 3876,
        "itemsArray": [{
          "item": "違規停車",
          "caseCount": 265,
        },{ ... }]
      }

    listData:
    {
      "caseCount": 119,
      "serviceName": "違規停車",
      "serviceItems": "違規停車",
      "area": "安平區"
    }
*/
var now = new Date();
var monthArray = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月'
];

var weekArray = [
  '星期日',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六'
];


var G = {
  last: null,
  now: null,
  select: _select,
  focusArea: _focusArea,
  colorServiceName: [],
  colorServiceItem: [],
  getAreasData: _getAreasData,
  getItemsData: _getItemsData,
  time: {},
  initPage: initPage
};


var DB = {
  key: '0x8209A3AA4B5607A5C644BE908F83A350361A8B8ECFCDCCE5E105379B92C62F1E',
  url: 'http://1999.tainan.gov.tw:83/api/',
  areasTotal: 37,
  areas: [],
  areasE: {},
  serviceName: [],
  serviceItems: [],
  monthAreaData: [],
  monthItemsData: []
};

G.colorServiceName = [
  '#E57373',
  '#DCE775',
  '#F06292',
  '#BA68C8',
  '#7986CB',
  '#4DB6AC',
  '#81C784',
  '#FF8A65',
  '#A1887F',
  'rgba(224, 224, 224, 0.4)'
];

G.colorServiceItem = [
  '#E57373',
  '#D4E157',
  '#CDDC39',
  '#E91E63',
  '#F06292',
  '#BA68C8',
  '#9FA8DA',
  '#7986CB',
  '#5C6BC0',
  '#3F51B5',
  '#3949AB',
  '#303F9F',
  '#283593',
  '#1A237E',
  '#B2DFDB',
  '#4DB6AC',
  '#009688',
  '#00796B',
  '#004D40',
  '#A5D6A7',
  '#81C784',
  '#66BB6A',
  '#66BB6A',
  '#43A047',
  '#388E3C',
  '#2E7D32',
  '#FFCCBC',
  '#FF8A65',
  '#FF5722',
  '#E64A19',
  '#BF360C',
  '#8D6E63',
  '#6D4C41'
];

DB.areas = [
  '新化區', '新營區', '鹽水區', '白河區', '柳營區', '後壁區', '東山區', '麻豆區',
  '下營區', '六甲區', '官田區', '大內區', '佳里區', '學甲區', '西港區', '七股區',
  '將軍區', '北門區', '善化區', '新市區', '安定區', '山上區', '玉井區', '楠西區',
  '南化區', '左鎮區', '仁德區', '歸仁區', '關廟區', '龍崎區', '永康區', '東區',
  '南區', '北區', '中西區', '安南區', '安平區'
];

DB.areasE = {
  '新化區': 'Xinhua', '新營區': 'Xinying', '鹽水區': 'Yanshui', '白河區': 'Baihe',
  '柳營區': 'Liuying', '後壁區': 'Houbi', '東山區': 'Dongshan', '麻豆區': 'Madou',
  '下營區': 'Xiaying', '六甲區': 'Liujia', '官田區': 'Guantian', '大內區': 'Danei',
  '佳里區': 'Jiali', '學甲區': 'Xuejia', '西港區': 'Xigang', '七股區': 'Qigu',
  '將軍區': 'Jiangjun', '北門區': 'Beimen', '善化區': 'Shanhua', '新市區': 'Xinshi',
  '安定區': 'Anding', '山上區': 'Shanshang', '玉井區': 'Yujing', '楠西區': 'Nanxi',
  '南化區': 'Nanhua', '左鎮區': 'Zuozhen', '仁德區': 'Rende', '歸仁區': 'Guiren',
  '關廟區': 'Guanmiao', '龍崎區': 'Longqi', '永康區': 'Yongkang', '東區': 'East',
  '南區': 'South', '北區': 'North', '中西區': 'WestCentral', '安南區': 'Annan',
  '安平區': 'Anping', '台南市': 'Focus'
};

DB.serviceName = [
  '違規停車',
  '路燈故障',
  '噪音舉發',
  '騎樓舉發',
  '道路維修',
  '交通運輸',
  '髒亂及汙染',
  '民生管線',
  '動物救援'
];

DB.serviceItems = [
  '違規停車',
  '9盞以下路燈故障', '10盞以上路燈故障',
  '妨害安寧', '場所連續噪音',
  '騎樓舉發',
  '路面坑洞', '寬頻管線、孔蓋損壞', '路面下陷、凹陷', '路面掏空、塌陷', '路樹傾倒', '地下道積水',
  '人孔蓋聲響、凹陷、漏水', '人孔蓋凹陷坑洞',
  '號誌故障', '號誌秒差調整', '公車動態 LED 跑馬燈資訊異常', '交通疏導', '佔用道路',
  '空氣汙染', '其他汙染舉發', '環境髒亂', '道路散落物', '小廣告、旗幟', '大型廢棄物清運', '市區道路路面油漬',
  '電信孔蓋鬆動、電信線路掉落、電信桿傾倒', '停電、漏電、電線掉落、孔蓋鬆動', '漏水、停水、消防栓漏水或損壞', '天然氣外洩', '瓦斯管溝修補、孔蓋鬆動',
  '遊蕩犬隻捕捉管制', '犬貓急難救援'
];

function initG() {
  /*
    monthNum: 月份的數字（0 代表 一月）
    monthC: 中文月份
    date: 日期 ex:21
    day: 星期幾（ 0 代表星期日）
    dayC: 星期一

    curTime: '2016-11-21'
    lastWTime: '2016-11-14'
    lastMTime: '2016-10-21'
    lastYTime: '2015-11-21'
  */

  G.time.month = now.getMonth() + 1;
  G.time.monthC = monthArray[G.time.month - 1];
  G.time.date = now.getDate();
  G.time.day = now.getDay();
  G.time.dayC = weekArray[G.time.day];

  G.time.curTime = getTimeString(now);
  G.time.lastWTime = getTimeString(dateAdd(now, 'w', -1));
  G.time.lastMTime = getTimeString(dateAdd(now, 'm', -1));
  G.time.lastYTime = getTimeString(dateAdd(now, 'y', -1));

  // init supportBox
  DB.serviceName.forEach(function(value, index) {
    $('#itemBox9').append('<p class="box"><span style="background-color:' + G.colorServiceName[index] + '""></span>' + value + '</p>&nbsp;');
  });

  DB.serviceItems.forEach(function(value, index) {
    $('#itemBox33').append('<p class="box"><span style="background-color:' + G.colorServiceItem[index] + '""></span>' + value + '</p>&nbsp;');
  });
}

function _select(itemId) {
  var arr = itemId.split('-');
  var isInit = this.last ? false : true;
  var id = arr.length > 1 ? arr[1] : 'overview';

  this.last = this.now;
  if (!isInit) {
    this.last.toggleClass('disable');
  }
  this.now = $('#section-' + id);
  this.now.toggleClass('disable');

  // set hash
  window.location.hash = itemId;

  // select nav item
  $('.headerItemActive').removeClass('headerItemActive');
  $('#' + itemId).addClass('headerItemActive');
  $('html,body').scrollTop(0);
}

function _focusArea(area, timeInterval, startDate, endDate) {
  timeInterval = timeInterval || 'w';
  startDate = startDate || G.time.lastWTime;
  endDate = endDate || G.time.curTime;
  console.log(timeInterval);

  G.select('area-focus');
  window.resetFocus();
  focus(area, timeInterval, startDate, endDate);
  window.location.hash = 'area-' + area.toLowerCase();
}

// console.log(G.getAreasData('2016-01-01', '2016-07-03', DB.areas));
// This inputs one area in API per time...
// NO INPUT ALL AREAS in one time!! Cuz the name will be wrong...(除非server修好這個bug)
function _getAreasData(startDate, endDate, inptAreasArray) {
  var obj = {
    count: 0,
    areasArray: [],
  };

  inptAreasArray = inptAreasArray || [];

  while (inptAreasArray.length !== 0) {
    var currentArea = inptAreasArray.pop();
    var data = getAPIsearch(startDate, endDate, currentArea);
    var newListData = [];
    var caseCount = 0;

    if(data.CaseCount === '0') {
      obj.areasArray.push({
        area: currentArea,
        caseCount: 0,
        listData: []
      });
    } else{
      data.ListAreaData[0].Subprojects.forEach(function(value, index) {
        newListData.push({
          caseCount: parseInt(value.count),
          serviceName: value.service,
          serviceItems: formatItemName(value.subproject),
          area: currentArea
        });

        caseCount += parseInt(value.count);
      });

      obj.areasArray.push({
        area: currentArea,
        caseCount: caseCount,
        listData: newListData
      });
    }

    obj.count += caseCount;
  }

  return obj;

  function formatItemName(name) {
    var outputName = name;

    if (outputName === '妨礙安寧') {
      outputName = '妨害安寧';
    } else if (outputName === '路面油漬') {
      outputName = '市區道路路面油漬';
    } else if (outputName === '公車動態LED跑馬燈資訊顯示異常') {
      outputName = '公車動態 LED 跑馬燈資訊異常';
    }
    return outputName;
  }
}


// Items
function _getItemsData(startDate, endDate, areas) {
  var data = initItemsData();
  var areaData = this.getAreasData(startDate, endDate, areas);
  data.areasArray = areaData.areasArray;
  var districted
  areaData.areasArray.forEach(function(value) {
    data.count += value.caseCount;

    value.listData.forEach(function(listDataValue) {
      var index = DB.serviceItems.indexOf(listDataValue.serviceItems);
      var areasIndex = DB.areas.indexOf(listDataValue.area);
      if (index !== -1) {
        data.itemsArray[index].caseCount += listDataValue.caseCount;
        var district = {};
        for (var trav in DB.areas) {
          district[DB.areas[trav]] = 0;
        }
        areaData.areasArray.forEach(function(value) {
          value.listData.forEach(function(areasDataValue) {
            if(areasDataValue.serviceItems === listDataValue.serviceItems) {
              district[areasDataValue.area] += areasDataValue.caseCount;
            }
          });
        });
        var districtSorted = Object.keys(district).sort(function (a, b) {
          return district[b] - district[a];
        });
        var obj1 = {};
        obj1[districtSorted[0]] = district[districtSorted[0]];
        obj1[districtSorted[0]] = district[districtSorted[0]];
        obj1[districtSorted[0]] = district[districtSorted[0]];
        data.itemsArray[index].topAreas.push(obj1);
         console.log(data.itemsArray[index].topAreas);
      }
    });
  });

  return data;
}


function initItemsData() {
  var obj = {
    count: 0,
    itemsArray: [],
    areasArray: [],
  };
  DB.serviceItems.forEach(function(value, index) {
    obj.itemsArray.push({
      item: value,
      caseCount: 0,
      topAreas: [],
    });
  });
  return obj;
}

// console.log(getAPIsearch('2017-03-01', '2017-03-', '中西區'))
function getAPIsearch(startDate, endDate, area) {
  var obj = {};
  var send = {
    startAt: startDate,
    endAt: endDate
  };

  area = area || false;

  if (area) {
    send.area = area;
  }

  $.ajax({
    contentType: 'application/json; charset=utf-8',
    url: DB.url + 'DataVisualization',
    headers: { 'Authorization': DB.key },
    async: false, // 為了可以回傳值，要改成同步
    type: 'GET',
    dataType: 'json',
    data: send,
    success: function(data, textStatus, xhr) {
      obj = data;
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log('Error in Operation\n' + textStatus + errorThrown);
    }
  });

  return obj;
}

function getAPIone(sn) {
  var obj = {};

  $.ajax({
    contentType: 'application/json; charset=utf-8',
    url: DB.url + 'servicerequestquery/' + sn,
    headers: { 'Authorization': DB.key },
    async: false,
    type: 'Get',
    success: function(data, textStatus, xhr) {
      obj = data;
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log('Error in Operation\n' + textStatus + errorThrown);
    }
  });

  return obj;
}


/* ---------- Format Time Func. -----------
  return '2016-11-21'
*/
var getTimeString = function(time) {
  var now = time;
  var year = now.getFullYear(); // 年
  var month = now.getMonth() + 1; // 月
  var day = now.getDate(); // 日

  var hh = now.getHours(); // 时
  var mm = now.getMinutes(); // 分

  var clock = year + '-';

  if (month < 10) {
    clock += '0';
  }

  clock += month + '-';

  if (day < 10) {
    clock += '0';
  }

  clock += day;

  return (clock);
};

var dateAdd = function(curTime, strInterval, Number) {
  var dtTmp = curTime;
  switch (strInterval) {
    case 's':
      return new Date(Date.parse(dtTmp) + (1000 * Number));
    case 'n':
      return new Date(Date.parse(dtTmp) + (60000 * Number));
    case 'h':
      return new Date(Date.parse(dtTmp) + (3600000 * Number));
    case 'd':
      return new Date(Date.parse(dtTmp) + (86400000 * Number));
    case 'w':
      return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));
    case 'm':
      return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number,
                      dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
    case 'y':
      return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
  }
};

function initPage() {
  var hash = window.location.hash;
  var arr = hash.split('-');
  console.log(arr);
  if (hash.indexOf('area') > 0) {
    $('#section-overview').addClass('disable');
    $('.active').removeClass('active');
    $('.item[value="w"]').addClass('active');
    this.now = $('#section-focus');
    this.focusArea(arr[1], '', '');
  } else if (hash.indexOf('bubble') > 0) {
    $('#section-overview').addClass('disable');
    this.now = $('#section-bubble');
    G.select('dynamic-bubble');
    window.bubbleChart();
  } else {
    this.now = $('#section-overview');
    G.select('overview');
  }
}
