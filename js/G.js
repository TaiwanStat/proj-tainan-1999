/*
【 G 】 

- parameter
@last	: last state
@now : current state

- method:
@select : select state
@getAreasData : get data select 'time' 'area', return order by 'area'
@getItemsData : get data select 'time' 'area', return order by 'item'
	
	ex:
		G.getAreasData('2016-07-01', '2016-07-10', ['新化區', '新營區', ...])

		return array = [{
			area: '新化區',
			caseCount: 1,
			listData:[{...},{...}]
		}]


		G.getItemsData('2016-07-01', '2016-07-03', ['新化區', '新營區', ...])

		return array = [{
			item: '違規道路',
			caseCount: 3,
			listData:[{...},{...},{...}]
		}]

- the new list data:
listData:
{
	description: "大內區環湖里57-2號前面 路燈故障",
  status: "已完工",
  serviceName: "民生管線",
  serviceRequestId: "UN201607200642",
  area: "大內區",
  serviceItem: "9盞以下路燈故障",
  updateTime: "2016-07-22 10:57:40",
  requestedTime": "2016-07-20 14:27:00"
}


Global function:

* It can choose 'serveceName' *
@getAPIsearch(startDate, endDate, area, serviceName)
	return {
		CaseCount: ..,
		ListData: [...]
	}

* use requestId to search *
@getAPIone(sn)
	return {
		CaseCount: ..,
		ListData: [{...}]
	}
-----

ask 啟軒 promise

Data 測試：
// 成功的 Msg = ''
// 失敗的 Msg = '查無案件資料'
// 若是不放service-name 會搜尋滿久的。
// 一直error loading

// 約超過35秒會要求逾時

*/
var now = new Date();
var monthArray = [
	"一月",
	"二月",
	"三月",
	"四月",
	"五月",
	"六月",
	"七月",
	"八月",
	"九月",
	"十月",
	"十一月",
	"十二月"
];

var weekArray = [
	"星期日",
	"星期一",
	"星期二",
	"星期三",
	"星期四",
	"星期五",
	"星期六",
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
	key : "0x8209A3AA4B5607A5C644BE908F83A350361A8B8ECFCDCCE5E105379B92C62F1E",
	url : "http://1999.tainan.gov.tw:83/api/",
	areasTotal : 37,
	areas: [],
	areasE: {},
	serviceName: [],
	serviceItems: [],
	monthAreaData: [],
	monthItemsData: []
}

G.colorServiceName = [
	"#E57373",
	"#DCE775",
	"#F06292",
	"#BA68C8",
	"#7986CB",
	"#4DB6AC",
	"#81C784",
	"#FF8A65",
	"#A1887F",
	"rgba(224, 224, 224, 0.4)"
]

G.colorServiceItem = [
	"#E57373",
	"#D4E157","#CDDC39",
	"#E91E63","#F06292",
	"#BA68C8",
	"#9FA8DA","#7986CB","#5C6BC0","#3F51B5","#3949AB","#303F9F",
	"#283593","#1A237E",
	"#B2DFDB","#4DB6AC","#009688","#00796B","#004D40",
	"#A5D6A7","#81C784","#66BB6A","#66BB6A","#43A047","#388E3C","#2E7D32",
	"#FFCCBC","#FF8A65","#FF5722","#E64A19","#BF360C",
	"#8D6E63","#6D4C41"
];

DB.areas = [
	'新化區', '新營區', '鹽水區', '白河區', '柳營區', '後壁區', '東山區', '麻豆區', 
	'下營區', '六甲區', '官田區', '大內區', '佳里區', '學甲區', '西港區', '七股區',
	'將軍區', '北門區', '善化區', '新市區', '安定區', '山上區', '玉井區', '楠西區',
	'南化區', '左鎮區', '仁德區', '歸仁區', '關廟區', '龍崎區', '永康區', '東區',
	'南區', '北區' , '中西區', '安南區',  '安平區'
];

DB.areasE = {
	'新化區':'Xinhua', '新營區':'Xinying', '鹽水區':'Yanshui', '白河區':'Baihe',
  '柳營區':'Liuying', '後壁區':'Houbi', '東山區':'Dongshan', '麻豆區':'Madou',
  '下營區':'Xiaying', '六甲區':'Liujia', '官田區':'Guantian', '大內區':'Danei',
  '佳里區':'Jiali', '學甲區':'Xuejia', '西港區':'Xigang', '七股區':'Qigu',
  '將軍區':'Jiangjun', '北門區':'Beimen', '善化區':'Shanhua', '新市區':'Xinshi',
  '安定區':'Anding', '山上區':'Shanshang', '玉井區':'Yujing', '楠西區':'Nanxi',
  '南化區':'Nanhua', '左鎮區':'Zuozhen', '仁德區':'Rende', '歸仁區':'Guiren',
  '關廟區':'Guanmiao', '龍崎區':'Longqi', '永康區':'Yongkang', '東區':'East',
  '南區':'South', '北區':'North' , '中西區':'WestCentral', '安南區':'Annan',
  '安平區':'Anping' , '台南市':'All'
}

DB.serviceName = [
	"違規停車",
	"路燈故障",
	"噪音舉發",
	"騎樓舉發",
	"道路維修",
	"交通運輸",
	"髒亂及汙染",
	"民生管線",
	"動物救援"
];

DB.serviceItems = [
	"違規停車",
	"9盞以下路燈故障", "10盞以上路燈故障",
	"妨害安寧", "場所連續噪音",
	"騎樓舉發",
	"路面坑洞", "寬頻管線、孔蓋損壞", "路面下陷、凹陷", "路面掏空、塌陷", "路樹傾倒", "地下道積水",
	"人孔蓋聲響、凹陷、漏水", "人孔蓋凹陷坑洞",
	"號誌故障", "號誌秒差調整", "公車動態 LED 跑馬燈資訊異常", "交通疏導", "佔用道路",
	"空氣汙染", "其他汙染舉發", "環境髒亂", "道路散落物", "小廣告、旗幟", "大型廢棄物清運", "市區道路路面油漬",
	"電信孔蓋鬆動、電信線路掉落、電信桿傾倒", "停電、漏電、電線掉落、孔蓋鬆動", "漏水、停水、消防栓漏水或損壞", "天然氣外洩", "瓦斯管溝修補、孔蓋鬆動",
	"遊蕩犬隻捕捉管制", "犬貓急難救援"
];

function initG(){
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
	G.time.lastWTime = getTimeString(DateAdd(now,'w',-1));
	G.time.lastMTime = getTimeString(DateAdd(now,'m',-1));
	G.time.lastYTime = getTimeString(DateAdd(now,'y',-1));

	// init supportBox
	DB.serviceName.forEach(function(value, index){
		$('#itemBox9').append('<p class="box"><span style="background-color:' + G.colorServiceName[index] + '"></span>' + value + '</p>&nbsp;');
	})

	DB.serviceItems.forEach(function(value, index){
		$('#itemBox33').append('<p class="box"><span style="background-color:' + G.colorServiceItem[index] + '"></span>' + value + '</p>&nbsp;');
	})
}

function _select(itemId){
  var id;
  var arr = itemId.split('-');
  var isInit = this.last ? false : true;

  if (arr.length > 1)
	  id = arr[1];
	else
	  id = 'overview';

	this.last = this.now;
  if (!isInit) {
	  this.last.toggleClass('disable');
  }
  console.log(itemId, this.now);
	this.now = $('#section-' + id);
	this.now.toggleClass('disable');

	// set hash
	window.location.hash = itemId;

	// select nav item
	$('.headerItemActive').removeClass('headerItemActive')
	$('#' + itemId).addClass('headerItemActive');
	$('html,body').scrollTop(0);
}

function _focusArea(area, i, timeInterval,startDate,endDate){
	timeInterval = timeInterval || 'w';

	G.select('area-focus');
	resetFocus();
	focus(area, i, timeInterval,startDate,endDate);
	window.location.hash = "area-" + i + "-" + area.toLowerCase();
}

// console.log(G.getAreasData('2016-07-01', '2016-07-03', DB.areas));
function _getAreasData(startDate, endDate, areasArray){
	
	var mergeArray = [];
	areasArray = areasArray || [];

	while( areasArray.length !== 0 ){
		var currentArea = areasArray.pop();
		var data = getAPIsearch(startDate, endDate, currentArea);
		var newListData = [];

		data.ListData.forEach(function(value, index){
			newListData.push({
				description: value.description,
				status: value.status,
	  		serviceName: value.service_name,
	  		serviceRequestId: value.service_request_id,
	  		serviceItems: formatItemName(value.subproject),
	  		requestedTime: value.requested_datetime,
	  		finishedTime: value.updated_datetime,
	  		area: value.area
			})
		})

		mergeArray.push({
			area: currentArea,
			caseCount: data.CaseCount,
			listData: newListData
		});

		console.log(currentArea);
	}
	return mergeArray;


	function formatItemName(name){
		var outputName = name;

		if (outputName === '妨礙安寧')
			outputName = '妨害安寧'
		else if (outputName == '路面油漬')
			outputName = '市區道路路面油漬';
		else if (outputName === '公車動態LED跑馬燈資訊顯示異常')
			outputName = '公車動態 LED 跑馬燈資訊異常'

		return outputName;
	}	
}


// Items
// var textObject = G.getItemsData('2016-06-01', '2016-07-30', ['新化區', '新營區', '鹽水區', '白河區']);
// document.write(JSON.stringify(textObject));
// console.log(textObject);
function _getItemsData(startDate, endDate, areas){
	var itemsDataArray = [];
	var areaData = this.getAreasData(startDate, endDate, areas);

	initItemArray(itemsDataArray);
	areaData.forEach(function(value, index){
		value.listData.forEach(function(value , index){
			var index = DB.serviceItems.indexOf(value.serviceItems);
			// DB.serviceItems != value.serviceItems 
			if( index === -1){
				console.log(value);
				console.log(value.serviceItems);
			} else{
				itemsDataArray[index].caseCount++ ;
				itemsDataArray[index].listData.push(value);
			}
		})
	})

	return itemsDataArray;
}

function initItemArray(array){
	DB.serviceItems.forEach(function(value, index){
		array.push({
			item: value,
			caseCount: 0,
			listData: []
		})
	})	
	return array;
}

// getAPIone('UN201607020156');
// console.log(getAPIsearch('2016-07-02', '2016-07-07', '歸仁區', '違規停車'));
function getAPIsearch(startDate, endDate, area, serviceName){
	var obj = {};
	var send = {
		QFPlanStartDateS: startDate,
		QFPlanStartDateE: endDate,
		QUArea: area,
	}

	serviceName = serviceName || false;

	if (serviceName){
		send.QUMainItems = serviceName;
	}

	$.ajax({
    contentType: "application/json; charset=utf-8",
    url: DB.url + 'servicerequestsquery',
    headers: { "Authorization": DB.key },
    async: false, // 為了可以回傳值，要改成同步 
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify(send),
    success: function(data, textStatus, xhr) {
    	obj = data;
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log('Error in Operation\n' + textStatus + errorThrown);
    }
	});

	return obj;
}

function getAPIone(sn){
	var obj = {};

	$.ajax({
    contentType: "application/json; charset=utf-8",
    url: DB.url + 'servicerequestquery/' + sn,
    headers: { "Authorization": DB.key },
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
  var year = now.getFullYear(); //年
  var month = now.getMonth() + 1; //月
  var day = now.getDate(); //日

  var hh = now.getHours(); //时
  var mm = now.getMinutes(); //分

  var clock = year + "-";

  if (month < 10)
    clock += "0";

  clock += month + "-";

  if (day < 10)
    clock += "0";

  clock += day;

  return (clock);
}

var DateAdd = function(curTime, strInterval, Number) {
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
      return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
    case 'y':
      return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
  }
}

function initPage() {
  var hash = window.location.hash;
  var arr = hash.split('-');

  if (hash.indexOf('area') > 0) {
    $('#section-overview').addClass('disable');
    $('.active').removeClass('active')
    $('.item[value="w"]').addClass('active');
    this.now = $('#section-focus');
    this.focusArea(arr[2], parseInt(arr[1]),'','');
  }
  else if (hash.indexOf('bubble') > 0) {
    $('#section-overview').addClass('disable');
    this.now = $('#section-bubble');
    G.select('dynamic-bubble');
    bubbleChart();
  }
  else {
    this.now = $('#section-overview');
    G.select('overview');
  }
}
