//bar chart 排序後顏色沒有對上item
//bar chart 刪除空白項

var margin = {
        top: 50,
        right: 30,
        bottom: 40,
        left: 400
    },
    width = 960 - margin.left - margin.right,
    height = 1500 - margin.top - margin.bottom;


var svg = d3.select("#bar-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


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
d3.json("fack_areas.json", function(error, data) {
            if (error) {
                console.log(error);
            }
            //console.log(data);
            //shall select correct area
            var d = data[0];
            var areaName = d.area;
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
            createDonut(array, areaName, "pie-chart"); //畫圖

            //createDonut("all_item.json", "東區" , "column")
            //filename: json filename, name: 區名, column_object: 預計要榜定的tag class
            function createDonut(array, name, column_object) {
                var pie = d3.layout.pie();
                var svg = d3.select("#" + column_object)
                    .append("svg")
                    .attr({
                        "width": 500,
                        "height": 500,
                    });
                var arc = d3.svg.arc()
                    .innerRadius((width / 5))
                    .outerRadius((width / 5));
                var arc2 = d3.svg.arc()
                    .innerRadius((width / 4))
                    .outerRadius((width / 3));
                var arc3 = d3.svg.arc()
                    .innerRadius((width / 3))
                    .outerRadius((width / 2.5));
                var arcs = svg.selectAll("g.arc")
                    .data(pie(
                        array.map( //遍尋處理每個array element，並取得特定欄位 = 數量
                            function(element, index, array) {
                                return element[1];
                            })
                    ))
                    .enter()
                    .append("g")
                    .attr({
                        "class": "arc",
                        "transform": "translate(" + (width / 2) + ", " + (width / 2) + ")",
                    });

                var color = ['#E57373', '#DCE775', '#F06292', '#BA68C8', '#7986CB', '#4DB6AC', '#81C784', '#FF8A65', '#A1887F', '#E0E0E0']
                var path = arcs.append("path")
                    .attr({
                        "fill": function(d, i) {
                            return color[array[i][0]]; //color的array
                        },
                        "d": arc,
                        "class": function(d, i) {
                            //給最大的一點特效！！
                            if (i == 0) {
                                return "path_special";
                            }
                            return "path";
                        },
                        "id": function(d, i) {
                            return array[i][2];
                        }
                    })
                    .on("mouseover", function() {
                        svg.append("text")
                            .attr({
                                "class": "subject_" + this.id,
                                "x": (width / 2),
                                "y": (width / 2),
                                "text-anchor": "middle"
                            })
                            .text(this.id);
                    })
                    .on("mouseout", function() {
                        svg.selectAll(".subject_" + this.id).remove();
                    })
                d3.selectAll(".path_special")
                    .attr({
                        "d": arc3,
                    })
                path.transition()
                    .duration(1000)
                    .attr({
                        "d": arc2
                    });
            }
        });

            /**********************************************************/


            //bar chart****************************************************
            d3.json("fack_items.json", function(error, data) {
                console.log(data);

                // data.sort(function(a,b) { return +a.caseCount - +b.caseCount; }).reverse();
                // console.log(d3.extent(data, function(d) { return d.caseCount; }));
                // console.log(d3.map(data,function(d) { return d.item; }));

                //the second pie
                // var piedata2 = pie();


                //the second pie end

                var x = d3.scale.linear().domain(d3.extent(data, function(d) {
                        return d.caseCount;
                    })).nice()
                    .range([0, width]);

                var y = d3.scale.ordinal().domain(data.map(function(d) {
                        return d.item;
                    }))
                    .rangeRoundBands([0, height], 0.1);

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
                    .attr("transform", "translate(0," + height + ")")
                    .call(make_x_axis()
                        .tickSize(-height, 0, 0)
                        .tickFormat("")
                    )

                var bars = svg.selectAll(".bar").data(data).enter()
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




                //sort the bars
                data.sort(function(a, b) {
                    return +a.caseCount - +b.caseCount;
                }).reverse();

                //remove empty item
                var puredata = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].caseCount != 0) {
                        var t = {};
                        t.caseCount = data[i].caseCount;
                        t.item = data[i].item;
                        console.log(data[i].caseCount)
                        puredata.push(t);
                    }
                }
                console.log(puredata);


                y = y = d3.scale.ordinal().domain(data.map(function(d) {
                        console.log(d.item)
                        return d.item;
                    }))
                    .rangeRoundBands([0, height], 0.1);

                console.log(data);
                bar.data(data)
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
            });

            //bar chart****************************************************
