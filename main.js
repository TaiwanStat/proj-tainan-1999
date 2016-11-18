var service_name = {"違規停車": 0,"路燈故障": 1 ,"噪音舉發": 2,"騎樓舉發": 3,"道路維修": 4,"交通運輸": 5,"髒亂及污染": 6,"民生管線": 7,"動物救援": 8 , "其他":9};
var areaNameE = {
    '新化區':'Xinhua', '新營區':'Xinying', '鹽水區':'Yanshui', '白河區':'Baihe',
    '柳營區':'Liuying', '後壁區':'Houbi', '東山區':'Dongshan', '麻豆區':'Madou',
    '下營區':'Xiaying', '六甲區':'Liujia', '官田區':'Guantian', '大內區':'Danei',
    '佳里區':'Jiali', '學甲區':'Xuejia', '西港區':'Xigang', '七股區':'Qigu',
    '將軍區':'Jiangjun', '北門區':'Beimen', '善化區':'Shanhua', '新市區':'Xinshi',
    '安定區':'Anding', '山上區':'Shanshang', '玉井區':'Yujing', '楠西區':'Nanxi',
    '南化區':'Nanhua', '左鎮區':'Zuozhen', '仁德區':'Rende', '歸仁區':'Guiren',
    '關廟區':'Guanmiao', '龍崎區':'Longqi', '永康區':'Yongkang', '東區':'East',
    '南區':'South', '北區':'North' , '中西區':'WestCentral', '安南區':'Annan',
    '安平區':'Anping' , '全區':'All'
};

function filtJSON(json, key, value) {
    var count = 0;
    for(var foo in json["listData"]){//service_name
        if (json["listData"][foo][key] == value){
            count = count + 1;
        }
    }
    return count;
}

var array =[];
var count = 0;
var sum = 0;
d3.json("fake_areas.json", function(error, data){
    if (error){
        console.log(error);
    }

    data.map(function(d){
        var areaName = d.area;
        var array = [];//array用來儲存過濾後可畫圖的資料
        var count = 0;
        var sum = 0;
        for(var foo in service_name){
            var temp = [];
            temp.push(service_name[foo]);//類別對應數字
            temp.push(filtJSON(d, "serviceName", foo));//類別之事件發生數
            temp.push(foo);//類別名稱
            array.push(temp);
        }

        array = array.sort(function(a, b) {//大到小排序
                    return d3.descending(a[1], b[1]);
                });

        for(var foo in array){
            if(count > 2){
                sum +=array[foo][1];
            }
            count = count + 1;
        }

        var temp = [];
        temp.push(9);//其他歸類在第9項
        temp.push(sum);//事件發生數量
        temp.push("其他");
        var nameObj = {
            cName: areaName,
            eName: areaNameE[areaName]
        }
        array.splice(3, count - 3, temp);//保留前三高，其餘加總到「其他」
        createDonut( array , nameObj , "column");//畫圖
    })
});

//createDonut("all_item.json", "東區" , "column")
//filename: json filename, name: 區名, column_object: 預計要榜定的tag class
function createDonut(array, name, column_object){
    var width = 450, height = 450;
    var pie = d3.layout.pie();
    var svg = d3.select("." + column_object)
                .append("svg")
                .attr({
                    "width": width,
                    "height": height,
                });
    var arc = d3.svg.arc()
                    .innerRadius((width/5))
                    .outerRadius((width/5));
    var arc2 = d3.svg.arc()
                    .innerRadius((width/4))
                    .outerRadius((width/3));
    var arc3 = d3.svg.arc()
                    .innerRadius((width/3))
                    .outerRadius((width/2.5));

    var pieData = pie(
                    array.map(//遍尋處理每個array element，並取得特定欄位 = 數量
                        function(element, index, array) {
                            return element[1];
                    })
                  )

    var arcs = svg.selectAll("g.arc")
                .data(pieData)
                .enter()
                .append("g")
                .attr({
                    "class": "arc",
                    "transform": "translate(" + (width/2) + ", " + (width/2) + ")",
                });

    var div = d3.select("body").append("div").attr("class","toolTip");
    var color = ['#E57373','#DCE775','#F06292','#BA68C8','#7986CB','#4DB6AC','#81C784','#FF8A65','#A1887F','#E0E0E0']
    var path = arcs.append("path")
                    .attr({
                        "fill": function(d, i){
                            return color[array[i][0]];//color的array
                        },
                        "d": arc,
                        "class": function(d,i){
                            if(i == 0){//最大的有特效
                                return "path_special";
                            }
                            return "path";
                        },
                        "id": function(d, i){
                            return array[i][2];
                        }
                    })
                    .on("mousemove", function(d, i){
                        div.style("left", d3.event.pageX+10+"px");
                        div.style("top", d3.event.pageY-25+"px");
                        div.style("display", "inline-block");
                        div.html(array[i][2]+"<br>"+array[i][1]+"件");
                    })
                    .on("mouseout", function(d){
                        div.style("display", "none");
                    });
                    // .on("mouseover", function(){
                    //     svg.append("text")
                    //         .attr({
                    //             "class": "subject_" + this.id,
                    //             "x": (width/2),
                    //             "y": (width/2),
                    //             "text-anchor": "middle"
                    //         })
                    //         .text(this.id);
                    // })
                    // .on("mouseout", function(){
                    //     svg.selectAll(".subject_" + this.id).remove();
                    // })

    d3.selectAll(".path_special")
      .attr({
            "d": arc3,
      })

    path.transition()
        .duration(1000)
        .attr({
            "d": arc2
        });

    svg.append("text")//區域名稱，放在圖下
       .attr({
            "id": name.eName,
            "x": width/2 - 23,
            "y": height - 30
       })
       .style("font-size","20px")
       .text(function(d){
            return name.cName;
       })

    var items = Object.keys(service_name);
    var lengedColor = array.map(function(d) {
        return [color[d[0]], items[d[0]]];
    })

    var legendRectSize = 18;
    var legendSpacing = 4;
    var legend = svg.selectAll('.legend')
                    .data(lengedColor)
                    .enter()
                    .append('g')
                    .attr('class', 'legend')
                    .attr('transform', function(d, i) {
                        var height = legendRectSize + legendSpacing;
                        var offset =  height * lengedColor.length / 2;
                        var horz = 10 * legendRectSize;
                        var vert = i * height +  4.1*offset;
                        return 'translate(' + horz + ',' + vert + ')';
                    });

        legend.append('rect')
              .attr('width', legendRectSize)
              .attr('height', legendRectSize)
              .style('fill', function(d) {
                    return d[0];
              })
              .style('stroke', color);

        legend.append('text')
              .attr('x', legendRectSize + legendSpacing)
              .attr('y', legendRectSize - legendSpacing)
              .text(function(d) { return d[1]; });

}