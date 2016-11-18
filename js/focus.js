//bar chart 排序後顏色沒有對上item
//bar chart 刪除空白項

var margin = {
        top: 50,
        right: 30,
        bottom: 40,
        left: 400
    },
    bar_width = 960 - margin.left - margin.right,
    bar_height = 1500 - margin.top - margin.bottom;

var pie_height = 600,
    pie_width = 1000;
var areaName

var svg = d3.select("#bar-chart").append("svg")
    .attr("width", bar_width + margin.left + margin.right)
    .attr("height", bar_height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var pie_svg = d3.select("#pie-chart").append("svg")
    .attr("width", pie_width)
    .attr("height", pie_height)
    .append("g")
    .attr("transform", "translate(" + pie_width / 2 + "," + pie_height / 2 + ")");

var radius = Math.min(pie_width, pie_height) / 2;
var color = [
    "#E57373 ",
    "#D4E157 ", "#CDDC39 ",
    "#AB47BC ", "#8E24AA ",
    "#BA68C8 ",
    "#9FA8DA ", "#7986CB ", "#5C6BC0 ", "#3F51B5 ", "#3949AB ", "#303F9F ",
    "#283593 ", "#1A237E ",
    "#B2DFDB ", "#4DB6AC ", "#009688 ", "#00796B ", "#004D40 ",
    "#A5D6A7 ", "#81C784 ", "#66BB6A ", "#66BB6A ", "#43A047 ", "#388E3C ", "#2E7D32 ",
    "#FFCCBC ", "#FF8A65 ", "#FF5722 ", "#E64A19 ", "#BF360C ",
    "#8D6E63 ", "#6D4C41 "
];
/*************************pie-chart************************/
var service_name = { "違規停車": 0, "路燈故障": 1, "噪音舉發": 2, "騎樓舉發": 3, "道路維修": 4, "交通運輸": 5, "髒亂及污染": 6, "民生管線": 7, "動物救援": 8 };

function filtJSON(json, key, value) {
    var count = 0;
    for (var foo in json["listData"]) { //service_name
        if (json["listData"][foo][key] == value) {
            count = count + 1;
        }
    }
    return count;
}

var array = [];
var count = 0;
var sum = 0;


d3.json("../../src/fack_areas.json", function(error, data) {
    if (error) {
        console.log(error);
    }
    //console.log(data);
    //shall select correct area
   
    var d = data[0];
    areaName = d.area;
    var array = []; //array用來儲存過濾後可畫圖的資料
    var count = 0;
    var sum = 0;
    for (var foo in service_name) {
        var temp = [];
        temp.push(service_name[foo]); //類別對應數字
        temp.push(filtJSON(d, "serviceName", foo)); //類別之事件發生數
        temp.push(foo); //類別名稱
        array.push(temp);
    }

    array = array.sort(function(a, b) { //大到小排序
        return d3.descending(a[1], b[1]);
    });

    for (var foo in array) {
        if (count > 2) {
            sum += array[foo][1];
        }
        count = count + 1;
    }
    var temp = [];
    temp.push(9); //其他歸類在第9項
    temp.push(sum); //事件發生數量
    temp.push("其他");
    array.splice(3, count - 3, temp); //保留前三高，其餘加總到「其他」

    //creatDonut
    var pie = d3.layout.pie();
    var arc = d3.svg.arc()
        .innerRadius(radius / 3)
        .outerRadius(radius / 4);
    var arc2 = d3.svg.arc()
        .innerRadius(radius / 2)
        .outerRadius(radius / 3);

    var arcs = pie_svg.selectAll("g.arc")
        .data(pie(
            array.map( //遍尋處理每個array element，並取得特定欄位 = 數量
                function(element, index, array) {
                    return element[1];
                })
        ))
        .enter()
        .append("g")
        .attr({
            "class": "arc"
        });

    var color2 = ['#E57373', '#DCE775', '#F06292', '#BA68C8', '#7986CB', '#4DB6AC', '#81C784', '#FF8A65', '#A1887F', '#E0E0E0']
    var path = arcs.append("path")
        .attr({
            "fill": function(d, i) {
                return color2[array[i][0]]; //color的array
            },
            "d": arc,
            "class": "pie-path",
            "id": function(d, i) {
                return array[i][2];
            }
        })
        // .on("mouseover", function() {
        //     pie_svg.append("text")
        //         .attr({
        //             "class": "subject_" + this.id,
        //             "x": (radius / 2),
        //             "y": (radius / 2),
        //             "text-anchor": "middle"
        //         })
        //         .text(this.id);
        // })
        // .on("mouseout", function() {
        //     pie_svg.selectAll(".subject_" + this.id).remove();
        // })

    path.transition()
        .duration(1000)
        .attr({
            "d": arc2
        });
    //createDonut("all_item.json", "東區" , "column")
    //filename: json filename, name: 區名, column_object: 預計要榜定的tag class
});

/**********************************************************/


//bar chart****************************************************
d3.json("../../src/fack_items.json", function(error, data) {

    // console.log(data);
    // console.log(data);
    // data = data.filter(barhasCase);//順序會改變

    var dataNoEmpty = [];

    for(var key in data){
        if(data[key].caseCount>0)
            dataNoEmpty.push(data[key]);
    }
    function hasCase(value){
        return value>0;
    }
    function barhasCase(value,index,arr){
        console.log(index)
        return value.caseCount>0;
    }

    var array = dataNoEmpty.map(function(d) {
        return d.item;
    });

    var x = d3.scale.linear().domain(d3.extent(dataNoEmpty, function(d) {
            return d.caseCount;
        })).nice()
        .range([0, bar_width]);

    var y = d3.scale.ordinal().domain(array)
        .rangeRoundBands([0, bar_height], 0.1);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("top")
        .tickSize(0)
        .ticks(10)
        .tickPadding(10)
        .tickFormat(d3.format("d"));;

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSize(0)
        .tickPadding(10);

    // Draw the x Grid lines
    function make_x_axis() {
        return d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(4);
    }
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + bar_height + ")")
        .call(make_x_axis()
            .tickSize(-bar_height, 0, 0)
            .tickFormat("")
        )

    var bars = svg.selectAll(".bar").data(dataNoEmpty).enter()
        .append("g").attr("class", "bar");

    var bar = bars.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {
            return x(Math.min(0, d.caseCount)) + 4;
        })
        .attr("y", function(d) {
            return y(d.item) + 10;
        })
        // .attr("width",  function(d) { return Math.abs(x(d.caseCount) - x(0)); })
        .attr("width", 0)
        .attr("height", 20)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("fill", function(d, i) {
            return color[i]
        })
        .style("fill-opacity", 0.5);

    bar.transition()
        .delay(500)
        .duration(function(d, i) {
            return 60 * i;
        })
        .ease("linear")
        .attr("width", function(d) {
            return x(d.caseCount) - x(0);
        })
        .style("fill-opacity", 1);




    //sort the data
    dataNoEmpty.sort(function(a, b) {
        return d3.descending(a.caseCount, b.caseCount);
    });

    console.log("data:")
    console.log(dataNoEmpty);

    //the second pie

    var pie = d3.layout.pie().sort(null);
    var piepie = d3.layout.pie().sort(null);
    var array = dataNoEmpty.map(function(d) {
        return d.caseCount;
    });
    // console.log(array);
    var array = array.filter(hasCase);
    var pie2 = pie(array);

    console.log("first pie2")
    console.log(pie(array))
    // console.log(array);

    var donut2_arc1 = d3.svg.arc()
        .innerRadius((radius / 3))
        .outerRadius((radius / 4));
    var donut2_arc2 = d3.svg.arc()
        .innerRadius((radius - 100))
        .outerRadius((radius - 50));

    var arcs = pie_svg.selectAll("g.arcs")
        .data(pie2)
        .enter()
        .append("g")
        .attr({
            "class": "arcs",
        });

    var item_name = dataNoEmpty.map(function(d) {
        return d.item;
    })

    var path = arcs.append("path")
        .attr({
            "fill": function(d, i) {
                return color[i]; //color的array
            },
            "d": donut2_arc1,
            "class": "pie-path",
            "id": function(d, i) {
                return item_name[i] + "_inner";
            }
        })
        // .on("mouseover", function(d, i) {
        //     pie_svg.append("text")
        //         .attr({
        //             "class": "subject_" + this.id + "_inner",
        //             "x": (radius / 2),
        //             "y": (radius / 2),
        //             "text-anchor": "middle"
        //         })
        //         .text(item_name[i]);
        // })
        // .on("mouseout", function() {
        //     pie_svg.selectAll(".subject_" + this.id + "_inner").remove();
        // })

    path.transition()
        .duration(1000)
        .attr({
            "d": donut2_arc2
        });

    //pie marker

    pie2.forEach(function(d){
        var a = d.a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
        d.cy = Math.sin(a) * (radius - 75);
        d.cx = Math.cos(a) * (radius - 75);
    })

    var tmp = [];

console.log(pie2);
    pie_svg.selectAll("text").data(pie2)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("x", function(d,i) {
            return d.x = Math.cos(d.a) * (radius - 20);
        })
        .attr("y", function(d,i) {
            return d.y = Math.sin(d.a) * (radius - 20);
        })
        .text(function(d, i) {

            return item_name[i];
        })
        .each(function(d, i) {
        var bbox = this.getBBox();
        d.sx = d.x - bbox.width/2 - 2;
        d.ox = d.x + bbox.width/2 + 2;
        d.sy = d.oy = d.y + 5;
        tmp.push(d);


        if (i === pie2.length-1) {
           
            drawPath(pie_svg, tmp);
        }
    });

pie_svg.append("defs").append("marker")
    .attr("id", "circ")
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("refX", 3)
    .attr("refY", 3)
    .append("circle")
    .attr("cx", 3)
    .attr("cy", 3)
    .attr("r", 3);



    //the second pie end



    y = d3.scale.ordinal().domain(dataNoEmpty.map(function(d) {
            return d.item;
        }))
        .rangeRoundBands([0, bar_height], 0.1);

    bar.data(dataNoEmpty)
        // .sort(sortItems)
        .transition()
        .delay(function(d, i) {
            return i * 50;
        })
        .duration(1000)
        .attr("width", function(d) {
            return x(d.caseCount) - x(0);
        })
        .attr("y", function(d, i) {
            return y(d.item) + 10;
        }).style("fill-opacity", 1);;


    yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSize(0)
        .tickPadding(10);

        //長條圖旁邊的數字
    bars.append("text").text(function(d) {
            return d.caseCount + "件";
        })
        .attr("x", function(d, i) {
            return x(d.caseCount) + 10;
        })
        .attr("y", function(d) {
            return y(d.item) + 23;
        })
        .attr("class", "bartip");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,0)")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + x(0) + ",0)")
        .call(yAxis);

         pie_svg.append("text")
        .attr({
            "class": "area_name",
            "x": 0,
            "y": 0,
            "text-anchor": "middle"
        })
        .text(areaName);
        console.log(areaName);
});

function drawPath(pie_svg, pie2){ 
    console.log(pie2);
    pie_svg.selectAll("path.pointer").data(pie2).enter()
    .append("path")
    .attr("class", "pointer")
    .style("fill", "none")
    .style("stroke", "black")
    .style("stroke-width",.5)
    .attr("marker-end", "url(#circ)")
    .attr("d", function(d) {
        if (d.cx > d.ox) {
            return "M" + d.sx + "," + d.sy + "L" + d.ox + "," + d.oy + " " + d.cx + "," + d.cy;
        } else {
            return "M" + d.ox + "," + d.oy + "L" + d.sx + "," + d.sy + " " + d.cx + "," + d.cy;
        }
    });
}

//bar chart****************************************************
