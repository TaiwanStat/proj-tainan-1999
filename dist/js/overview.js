!function(){function t(t,e,n,c){var l=d3.layout.pie(),u=d3.select("."+n).append("svg").attr({width:a,height:r}),d=d3.svg.arc().innerRadius(a/5).outerRadius(a/5),p=d3.svg.arc().innerRadius(a/4).outerRadius(a/3),f=d3.svg.arc().innerRadius(a/3).outerRadius(a/2.5),h=l(t.map(function(t,e,n){return t[1]})),v=u.selectAll("g.arc").data(h).enter().append("g").attr({class:"arc",transform:"translate("+a/2+", "+a/2+")"}),g=d3.select(".row").append("tooltip").attr("class","toolTip"),m=G.colorServiceName,y=v.append("path").attr({fill:function(e,n){return m[t[n][0]]},d:d,class:function(t,e){return 0==e?"path_special":"path"},id:function(e,n){return t[n][2]}}).on("mousemove",function(e,n){g.style("left",d3.event.pageX+10+"px"),g.style("top",d3.event.pageY-25+"px"),g.style("display","inline-block"),g.html(t[n][2]+"<br>"+t[n][1]+"件")}).on("mouseout",function(t){g.style("display","none")});d3.selectAll(".path_special").attr({d:f}),y.transition().duration(1e3).attr({d:p}),u.append("text").attr({id:e.eName,class:"overview_areaName",x:a/2-33,y:r-30}).text(function(t){return e.cName}).on("click",function(t){G.focusArea(this.id,c)});var x=Object.keys(o),w=t.map(function(t){return[m[t[0]],x[t[0]]]}),N=18,R=4,k=u.selectAll(".legend").data(w).enter().append("g").attr("class","legend").attr("transform",function(t,e){var n=N+R,a=n*w.length/2,r=i*N,o=e*n+s*a;return"translate("+r+","+o+")"});k.append("rect").attr("width",N).attr("height",N).style("fill",function(t){return t[0]}).style("stroke",m),k.append("text").attr("x",N+R).attr("y",N-R).text(function(t){return t[1]})}function e(t,e,n){var a=0;for(var r in t.listData)t.listData[r][e]==n&&(a+=1);return a}function n(){$(window).width()<=1280?(a=380,r=380,i=8.2,s=3.5):(a=450,r=450,i=10,s=4.1)}var a,r,i,s,o={"違規停車":0,"路燈故障":1,"噪音舉發":2,"騎樓舉發":3,"道路維修":4,"交通運輸":5,"髒亂及污染":6,"民生管線":7,"動物救援":8,"其他":9};n(),d3.json("../../src/fack_areas.json",function(n,a){n&&console.log(n),a.map(function(n,a){var r=n.area,i=[],s=0,c={cName:r,eName:DB.areasE[r]};for(var l in o){var u=[];u.push(o[l]),u.push(e(n,"serviceName",l)),u.push(l),i.push(u)}i=i.sort(function(t,e){return d3.descending(t[1],e[1])}),i.forEach(function(t,e){e>2&&(s+=i[e][1])}),i.splice(3,i.length-3,[9,s,"其他"]),t(i,c,"column",a)})})}();