/*
G: 

parameter ---
@last	: last state
@now : current state

method ---
@select : select state
@getData : get data select 'time' 'area'

ex:
	G.getData('2016-07-01', '2016-07-10', ['新化區', '新營區', ...])

@
*/

/*
Global fun:
@getAPIsearch
@getAPIone


ask 啟軒 promise
Data 測試：
// 成功的 Msg = ''
// 失敗的 Msg = '查無案件資料'
// 若是不放service-name 會搜尋滿久的。
一開始只有 data.caseCoount , data.ListCount 有用

先設立一種data取用方式 取用api --> 先幫學弟抓好 overview 所需資料 --> 輸入時間所需資料
overview.listData{
  "description": "大內區環湖里57-2號前面 路燈故障",
  "status": "已完工",
  "service_name": "民生管線",
  "service_request_id": "UN201607200642",
  "area": "大內區",
  "subproject": "9盞以下路燈故障",
  "updated_datetime": "2016-07-22 10:57:40",
  "requested_datetime": "2016-07-20 14:27:00"
}

items:{
	item: '違規道路'
	caseCount
	listData:[{
	  "description": "大內區環湖里57-2號前面 路燈故障",
	  "status": "已完工",
	  "service_name": "民生管線",
	  "service_request_id": "UN201607200642",
	  "area": "大內區",
	  "subproject": "9盞以下路燈故障",
	  "updated_datetime": "2016-07-22 10:57:40",
	  "requested_datetime": "2016-07-20 14:27:00"
	}]
}
*/

var G = {
	last: $('#overview'),
	now: $('#overview'),
	select: _select,
	getAreasData: _getAreasData,
	getItemsData: _getItemsData,
};

var DB = {
	key : "0x8209A3AA4B5607A5C644BE908F83A350361A8B8ECFCDCCE5E105379B92C62F1E",
	url : "http://1999.tainan.gov.tw:83/api/",
	areasTotal : 37,
	area: [],
	serviceName: [],
	serviceItems: [],
	oneMonth: {},
	oneYear: {},
	oneWeek: {}
}

DB.area = [
	'新化區', '新營區', '鹽水區', '白河區', '柳營區', '後壁區', '東山區', '麻豆區', 
	'下營區', '六甲區', '官田區', '大內區', '佳里區', '學甲區', '西港區', '七股區',
	'將軍區', '北門區', '善化區', '新市區', '安定區', '山上區', '玉井區', '楠西區',
	'南化區', '左鎮區', '仁德區', '歸仁區', '關廟區', '龍崎區', '永康區', '東區',
	'南區', '北區' , '中西區', '安南區',  '安平區'
];

DB.serviceName = [
	"違規停車",
	"路燈故障",
	"噪音舉發",
	"騎樓舉發",
	"道路維修",
	"交通運輸",
	"髒亂及污染",
	"民生管線",
	"動物救援"
];

DB.serviceItems = [
	"違規停車",
	"9盞以下路燈故障", "10盞以上路燈故障",
	"妨害安寧", "場所連續噪音",
	"騎樓舉發",
	"路面坑洞", "寬平管線、孔蓋損壞", "路面下陷、凹陷", "路面掏空、塌陷", "路樹傾倒", "地下道積水",
	"人孔蓋或溝蓋聲響、鬆動", "人孔蓋凹陷坑洞",
	"號誌故障", "號誌秒差調整", "公車動態 LED 跑馬燈資訊異常", "交通疏導", "佔用道路",
	"空氣污染", "其他污染舉發", "環境髒亂", "道路散落物", "小廣告、旗幟", "大型廢棄物清運", "市區道路路面油漬",
	"電信孔蓋鬆動、電信線路掉落", "停電、漏電...「電」", "停水、漏水...「水」...", "天然氣外洩", "瓦斯管溝修補、孔蓋鬆動",
	"遊蕩犬隻捕捉管制", "犬貓急難救援"
];

function _select(id){
	this.last = this.now;
	this.now = $('#'+id);
	this.last.toggleClass('disable');
	this.now.toggleClass('disable');

	// set hash
	window.location.hash = id ;
}

// Overview , map
function _getAreasData(startDate, endDate, areaArray){
	
	var mergeArray = [];
	areaArray = areaArray || [];

	while( areaArray.length !== 0 ){
		var currentArea = areaArray.pop();
		var data = getAPIsearch(startDate, endDate, currentArea);
		var newListData = [];

		data.ListData.forEach(function(value, index){
			newListData.push({
				description: value.description,
				status: value.status,
	  		serviceName: value.service_name,
	  		serviceRequestId: value.service_request_id,
	  		serviceItems: value.subproject,
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
	}

	// ask --> 明明是異步 why 成功？
	if(areaArray.length === 0){
		console.log(2);
		return mergeArray;
	}
}

// Items
// 先call getAreas 合併
G.getItemsData('2016-07-01', '2016-07-10', '違規停車');

function _getItemsData(startDate, endDate, items){
	var itemsDataArray = [];
	var areaData = this.getAreasData(startDate, endDate, ['新化區', '新營區'], items);
	areaData.forEach(function(value, index){
		value.listData.forEach(function(value , index){
			console.log(1);
		})
	})
}

// getAPIone('UN201607020156');
// getAPIsearch('新化區', '2016-07-01', '2016-07-30', '違規停車');
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
    	// console.log(data);
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
    	// console.log(data);
    	obj = data;
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log('Error in Operation\n' + textStatus + errorThrown);
    }
	});

	return obj;
}