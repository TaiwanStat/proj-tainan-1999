function initG(){G.time.month=now.getMonth()+1,G.time.monthC=monthArray[G.time.month-1],G.time.date=now.getDate(),G.time.day=now.getDay(),G.time.dayC=weekArray[G.time.day],G.time.curTime=getTimeString(now),G.time.lastWTime=getTimeString(dateAdd(now,"w",-1)),G.time.lastMTime=getTimeString(dateAdd(now,"m",-1)),G.time.lastYTime=getTimeString(dateAdd(now,"y",-1)),DB.serviceName.forEach(function(e,t){$("#itemBox9").append('<p class="box"><span style="background-color:'+G.colorServiceName[t]+'""></span>'+e+"</p>&nbsp;")}),DB.serviceItems.forEach(function(e,t){$("#itemBox33").append('<p class="box"><span style="background-color:'+G.colorServiceItem[t]+'""></span>'+e+"</p>&nbsp;")})}function _select(e){var t=e.split("-"),a=!this.last,n=t.length>1?t[1]:"overview";this.last=this.now,a||this.last.toggleClass("disable"),this.now=$("#section-"+n),this.now.toggleClass("disable"),window.location.hash=e,$(".headerItemActive").removeClass("headerItemActive"),$("#"+e).addClass("headerItemActive"),$("html,body").scrollTop(0)}function _focusArea(e,t,a,n){t=t||"w",a=a||G.time.lastWTime,n=n||G.time.curTime,G.select("area-focus"),window.resetFocus(),focus(e,t,a,n),window.location.hash="area-"+e.toLowerCase()}function _getAreasData(e,t,a){function n(e){var t=e;return"妨礙安寧"===t?t="妨害安寧":"路面油漬"===t?t="市區道路路面油漬":"公車動態LED跑馬燈資訊顯示異常"===t&&(t="公車動態 LED 跑馬燈資訊異常"),t}var r={count:0,areasArray:[]};for(a=a||[];0!==a.length;){var s=a.pop(),i=getAPIsearch(e,t,s),o=[],c=0;"0"===i.CaseCount?r.areasArray.push({area:s,caseCount:0,listData:[]}):(i.ListAreaData[0].Subprojects.forEach(function(e,t){o.push({caseCount:parseInt(e.count),serviceName:e.service,serviceItems:n(e.subproject),area:s}),c+=parseInt(e.count)}),r.areasArray.push({area:s,caseCount:c,listData:o})),r.count+=c}return r}function _getItemsData(e,t,a){var n=initItemsData(),r=this.getAreasData(e,t,a);return n.areasArray=r.areasArray,r.areasArray.forEach(function(e){n.count+=e.caseCount,e.listData.forEach(function(e){var t=DB.serviceItems.indexOf(e.serviceItems);t!==-1&&(n.itemsArray[t].caseCount+=e.caseCount)})}),n}function initItemsData(){var e={count:0,itemsArray:[],areasArray:[]};return DB.serviceItems.forEach(function(t,a){e.itemsArray.push({item:t,caseCount:0})}),e}function getAPIsearch(e,t,a){var n={},r={startAt:e,endAt:t};return a=a||!1,a&&(r.area=a),$.ajax({contentType:"application/json; charset=utf-8",url:DB.url+"DataVisualization",headers:{Authorization:DB.key},async:!1,type:"GET",dataType:"json",data:r,success:function(e,t,a){n=e},error:function(e,t,a){console.log("Error in Operation\n"+t+a)}}),n}function getAPIone(e){var t={};return $.ajax({contentType:"application/json; charset=utf-8",url:DB.url+"servicerequestquery/"+e,headers:{Authorization:DB.key},async:!1,type:"Get",success:function(e,a,n){t=e},error:function(e,t,a){console.log("Error in Operation\n"+t+a)}}),t}function initPage(){var e=window.location.hash,t=e.split("-");console.log(t),e.indexOf("area")>0?($("#section-overview").addClass("disable"),$(".active").removeClass("active"),$('.item[value="w"]').addClass("active"),this.now=$("#section-focus"),this.focusArea(t[1],"","")):e.indexOf("bubble")>0?($("#section-overview").addClass("disable"),this.now=$("#section-bubble"),G.select("dynamic-bubble"),window.bubbleChart()):(this.now=$("#section-overview"),G.select("overview"),window.overview())}var $=window.$,now=new Date,monthArray=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],weekArray=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],G={last:null,now:null,select:_select,focusArea:_focusArea,colorServiceName:[],colorServiceItem:[],getAreasData:_getAreasData,getItemsData:_getItemsData,time:{},initPage:initPage},DB={key:"0x8209A3AA4B5607A5C644BE908F83A350361A8B8ECFCDCCE5E105379B92C62F1E",url:"http://1999.tainan.gov.tw:83/api/",areasTotal:37,areas:[],areasE:{},serviceName:[],serviceItems:[],monthAreaData:[],monthItemsData:[]};G.colorServiceName=["#E57373","#DCE775","#F06292","#BA68C8","#7986CB","#4DB6AC","#81C784","#FF8A65","#A1887F","rgba(224, 224, 224, 0.4)"],G.colorServiceItem=["#E57373","#D4E157","#CDDC39","#E91E63","#F06292","#BA68C8","#9FA8DA","#7986CB","#5C6BC0","#3F51B5","#3949AB","#303F9F","#283593","#1A237E","#B2DFDB","#4DB6AC","#009688","#00796B","#004D40","#A5D6A7","#81C784","#66BB6A","#66BB6A","#43A047","#388E3C","#2E7D32","#FFCCBC","#FF8A65","#FF5722","#E64A19","#BF360C","#8D6E63","#6D4C41"],DB.areas=["新化區","新營區","鹽水區","白河區","柳營區","後壁區","東山區","麻豆區","下營區","六甲區","官田區","大內區","佳里區","學甲區","西港區","七股區","將軍區","北門區","善化區","新市區","安定區","山上區","玉井區","楠西區","南化區","左鎮區","仁德區","歸仁區","關廟區","龍崎區","永康區","東區","南區","北區","中西區","安南區","安平區"],DB.areasE={"新化區":"Xinhua","新營區":"Xinying","鹽水區":"Yanshui","白河區":"Baihe","柳營區":"Liuying","後壁區":"Houbi","東山區":"Dongshan","麻豆區":"Madou","下營區":"Xiaying","六甲區":"Liujia","官田區":"Guantian","大內區":"Danei","佳里區":"Jiali","學甲區":"Xuejia","西港區":"Xigang","七股區":"Qigu","將軍區":"Jiangjun","北門區":"Beimen","善化區":"Shanhua","新市區":"Xinshi","安定區":"Anding","山上區":"Shanshang","玉井區":"Yujing","楠西區":"Nanxi","南化區":"Nanhua","左鎮區":"Zuozhen","仁德區":"Rende","歸仁區":"Guiren","關廟區":"Guanmiao","龍崎區":"Longqi","永康區":"Yongkang","東區":"East","南區":"South","北區":"North","中西區":"WestCentral","安南區":"Annan","安平區":"Anping","台南市":"Focus"},DB.serviceName=["違規停車","路燈故障","噪音舉發","騎樓舉發","道路維修","交通運輸","髒亂及汙染","民生管線","動物救援"],DB.serviceItems=["違規停車","9盞以下路燈故障","10盞以上路燈故障","妨害安寧","場所連續噪音","騎樓舉發","路面坑洞","寬頻管線、孔蓋損壞","路面下陷、凹陷","路面掏空、塌陷","路樹傾倒","地下道積水","人孔蓋聲響、凹陷、漏水","人孔蓋凹陷坑洞","號誌故障","號誌秒差調整","公車動態 LED 跑馬燈資訊異常","交通疏導","佔用道路","空氣汙染","其他汙染舉發","環境髒亂","道路散落物","小廣告、旗幟","大型廢棄物清運","市區道路路面油漬","電信孔蓋鬆動、電信線路掉落、電信桿傾倒","停電、漏電、電線掉落、孔蓋鬆動","漏水、停水、消防栓漏水或損壞","天然氣外洩","瓦斯管溝修補、孔蓋鬆動","遊蕩犬隻捕捉管制","犬貓急難救援"];var getTimeString=function(e){var t=e,a=t.getFullYear(),n=t.getMonth()+1,r=t.getDate(),s=(t.getHours(),t.getMinutes(),a+"-");return n<10&&(s+="0"),s+=n+"-",r<10&&(s+="0"),s+=r},dateAdd=function(e,t,a){var n=e;switch(t){case"s":return new Date(Date.parse(n)+1e3*a);case"n":return new Date(Date.parse(n)+6e4*a);case"h":return new Date(Date.parse(n)+36e5*a);case"d":return new Date(Date.parse(n)+864e5*a);case"w":return new Date(Date.parse(n)+6048e5*a);case"m":return new Date(n.getFullYear(),n.getMonth()+a,n.getDate(),n.getHours(),n.getMinutes(),n.getSeconds());case"y":return new Date(n.getFullYear()+a,n.getMonth(),n.getDate(),n.getHours(),n.getMinutes(),n.getSeconds())}};