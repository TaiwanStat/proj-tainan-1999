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

var G = {
	last: $('#overview'),
	now: $('#overview'),
	select: _select,
	colorServiceName: [],
	colorServiceItem: [],
	getAreasData: _getAreasData,
	getItemsData: _getItemsData
};

var DB = {
	key : "0x8209A3AA4B5607A5C644BE908F83A350361A8B8ECFCDCCE5E105379B92C62F1E",
	url : "http://1999.tainan.gov.tw:83/api/",
	areasTotal : 37,
	areas: [],
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
	"#A1887F"
]

G.colorServiceItem = [
	"#E57373",
	"#D4E157","#CDDC39",
	"#AB47BC","#8E24AA",
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
	"路面坑洞", "寬頻管線、孔蓋損壞", "路面下陷、凹陷", "路面掏空、塌陷", "路樹傾倒", "地下道積水",
	"人孔蓋聲響、凹陷、漏水", "人孔蓋凹陷坑洞",
	"號誌故障", "號誌秒差調整", "公車動態 LED 跑馬燈資訊異常", "交通疏導", "佔用道路",
	"空氣汙染", "其他汙染舉發", "環境髒亂", "道路散落物", "小廣告、旗幟", "大型廢棄物清運", "市區道路路面油漬",
	"電信孔蓋鬆動、電信線路掉落、電信桿傾倒", "停電、漏電、電線掉落、孔蓋鬆動", "漏水、停水、消防栓漏水或損壞", "天然氣外洩", "瓦斯管溝修補、孔蓋鬆動",
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