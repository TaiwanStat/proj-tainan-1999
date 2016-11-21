(function() {
  var service_name = { "違規停車": 0, "路燈故障": 1, "噪音舉發": 2, "騎樓舉發": 3, "道路維修": 4, "交通運輸": 5, "髒亂及污染": 6, "民生管線": 7, "動物救援": 8, "其他": 9 };
  var width;
  var height;
  var lengendXparameter;
  var lengendYparameter;

  // init Time
  initTime()
  // set donutChart size;
  setSize();
  d3.json("../../src/fack_areas.json", function(error, data) {
    if (error) {
      console.log(error);
    }

    data.map(function(d, i) {
      var areaName = d.area;
      var array = []; //array用來儲存過濾後可畫圖的資料
      var count = 0;
      var otherSum = 0;
      var nameObj = {
        cName: areaName,
        eName: DB.areasE[areaName]
      }

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

      // 取前三高，其他加總到其他
      array.forEach(function(value, index){
        if (index > 2){
          otherSum += array[index][1];
        }
      })

      array.splice(3, array.length - 3, [9, otherSum, '其他']); //保留前三高，其餘加總到「其他」
      createDonut(array, nameObj, "column", i); //畫圖
    })
  });

  //createDonut("all_item.json", "東區" , "column")
  //filename: json filename, name: 區名, column_object: 預計要榜定的tag class
  function createDonut(array, name, column_object, areaIndex) {
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

    var pieData = pie(
      array.map( //遍尋處理每個array element，並取得特定欄位 = 數量
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
        "transform": "translate(" + (width / 2) + ", " + (width / 2) + ")",
      });

    var tooltip = d3.select(".row").append("tooltip").attr("class", "toolTip");
    var color = G.colorServiceName;
    var path = arcs.append("path")
      .attr({
        "fill": function(d, i) {
          return color[array[i][0]]; //color的array
        },
        "d": arc,
        "class": function(d, i) {
          if (i == 0) { //最大的有特效
            return "path_special";
          }
          return "path";
        },
        "id": function(d, i) {
          return array[i][2];
        }
      })
      .on("mousemove", function(d, i) {
        tooltip.style("left", d3.event.pageX + 10 + "px");
        tooltip.style("top", d3.event.pageY - 25 + "px");
        tooltip.style("display", "inline-block");
        tooltip.html(array[i][2] + "<br>" + array[i][1] + "件");
      })
      .on("mouseout", function(d) {
        tooltip.style("display", "none");
      })
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

    svg.append("text") //區域名稱，放在圖下
      .attr({
        'id': name.eName,
        'class': 'overview_areaName',
        "x": width/2 - 35,
        "y": height - 30
      })
      .text(function(d) {
        return name.cName + " ›";
      })
      .on("click", function(d){
        G.focusArea(this.id, areaIndex);
      });

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
        var offset = height * lengedColor.length / 2;
        var horz = lengendXparameter * legendRectSize;
        var vert = i * height + lengendYparameter * offset;
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
      .text(function(d) {
        return d[1];
      });
  }

  function filtJSON(json, key, value) {
    var count = 0;
    for (var foo in json["listData"]) { //service_name
      if (json["listData"][foo][key] == value) {
        count = count + 1;
      }
    }
    return count;
  }

  function setSize(){
    if ( $(window).width() <= 1280){
      width = 380;
      height = 380;
      lengendXparameter = 8.2;
      lengendYparameter = 3.5;
    }
    else{
      width = 450;
      height = 450;
      lengendXparameter = 10;
      lengendYparameter = 4.1;
    }
  }

  function initTime(){
    var curTime = G.time.curTime;
    var lastTime = G.time.lastWTime;



    $('.overview_title .date').text('( ' + lastTime.split('-')[1] + '/' + lastTime.split('-')[2] + ' ~ ' + curTime.split('-')[1] + '/' + curTime.split('-')[2] + ' )');
  }

  $('.ui.dropdown.overview_selectArea')
    .dropdown({
      action: 'hide',
      onChange: function(value, text, selectItem){

        $('html, body').animate(
          { scrollTop: $('#'+value).offset().top - 400 },
          'easeInBack',
          function(){
            window.location.hash = value ;
          }
        )
      }
    })
  ;

})()
