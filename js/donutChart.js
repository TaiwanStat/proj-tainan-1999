//列出所有項目，以map array形式
var service_name = { "違規停車": 0, "路燈故障": 1, "噪音舉發": 2, "騎樓舉發": 3, "道路維修": 4, "交通運輸": 5, "髒亂及污染": 6, "民生管線": 7, "動物救援": 8 };
//過濾出ListData中的特定欄位的特定名稱元素個數，詳細請參考市府json
function filterJSON(json, key, value) {
    var count = 0;
    for (var foo in json["ListData"]) { //service_name
        if (json["ListData"][foo][key] == value) {
            count = count + 1;
        }
    }
    return count;
}
createDonut("../../src/all_item.json", "安平區", "column")
    //filename: json filename, name: 區名, column_object: 預計要榜定的tag class
function createDonut(filename, name, column_object) {
    d3.json(filename, function(error, data) {
        if (error) {
            console.log(error);
        }
        console.log(data);
        var array = []; //array用來儲存過濾後的資料
        var count = 0;
        var sum = 0;
        for (var foo in service_name) {
            var temp = []; //簡單建立三維陣列
            temp.push(service_name[foo]); //第一元素為綁定的顏色
            temp.push(filterJSON(data, "service_name", foo)); //過濾出特定欄位(service_name)的資料，
            //TODO
            //should be removed 沒有用到 test用
            temp.push(foo); //第三元素為榜定的類別name
            array.push(temp);
        }
        //還沒做好自動選取下標題div 只好寫死啦！
        d3.select("." + column_object + "_name").text(name);
        array = array.sort(function(a, b) { //排序
            return d3.descending(a[1], b[1]);
        });
        //TODO
        //should be removed
        console.log(array);
        var count = 0,
            sum = 0;
        for (var foo in array) { //前三高
            if (count > 2) {
                sum += array[foo][1]; //加總「其他」的個數
            }
            count = count + 1;
        }
        //TODO should be removed
        console.log(count);
        //製造「例外」欄位
        var temp = [];
        temp.push(16);
        temp.push(sum);
        temp.push("其他");
        //使用剛剛計算出的count來刪除其他除了前三高外的元素
        array.splice(3, count - 3, temp);
        var width = 250,
            height = 250;
        var pie = d3.layout.pie();
        var svg = d3.select("." + column_object)
            .append("svg")
            .attr({
                "width": width,
                "height": height,
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
                array.map( //遍尋處理每個array element，並取得特定欄位= 數量
                    function(element, index, array) {
                        console.log(element[1]);
                        return element[1];
                    })
            ))
            .enter()
            .append("g")
            .attr({
                "class": "arc",
                "transform": "translate(" + (width / 2) + ", " + (width / 2) + ")",
            });
        console.log(array);
        var color = d3.scale.category20();
        //    for(var foo ; foo<20; foo++){
        //        console.log(color(foo));
        //    }
        //    console.log("123");
        var path = arcs.append("path")
            .attr({
                "fill": function(d, i) {
                    //TODO?
                    //不知道為什麼沒有綁定顏色
                    //我一直以為他是scale= =
                    console.log(color(array[i][0]));
                    return color(array[i][0]);
                },
                "d": arc,
                "class": function(d, i) {
                    console.log(i);
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
                console.log(this.id);
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
    });
}
