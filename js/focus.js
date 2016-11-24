function focus(areaEName, fackId, timeInterval) {

  var margin = {
    top: 50,
    right: 300,
    bottom: 40,
    left: 350
  };
  var pie_width = $('#pie-chart').width();
  var pie_height = 600;

  var radius = Math.min(pie_width, pie_height) / 2;

  var serviceArray = []; //array用來儲存過濾後可畫圖的資料
  var count = 0;
  var otherSum = 0;
  var caseSum = 0; // 案件總數

  var pie_svg = d3.select("#pie-chart").append("svg")
    .attr("width", pie_width)
    .attr("height", pie_height)
    .append("g")
    .attr("transform", "translate(" + pie_width / 2 + "," + pie_height / 2 + ")");

  var tooltip = d3.select("#pie-chart").append("tooltip").attr("class", "toolTip");

  var areaCName = findAreaCName(areaEName);

  // unbind click event
  $('.infocus').off('click');
  $('.infocus .reactive').click(function() {
    var selectedInterval = $(this).attr("value");
    if(selectedInterval.length < 2){
      $('.active').removeClass('active')
      $(this).addClass('active');
      G.focusArea(areaEName, fackId, selectedInterval);
    }
    else{
      G.select('item_overview');
    }
  })

  $('.area_name').text(areaCName);

  console.log("state:focus-" + areaCName)



  /**********************The First Pie-chart ************************/
  var service_name = { "違規停車": 0, "路燈故障": 1, "噪音舉發": 2, "騎樓舉發": 3, "道路維修": 4, "交通運輸": 5, "髒亂及汙染": 6, "民生管線": 7, "動物救援": 8 };

  function filtJSON(json, key, value) {
    var count = 0;
    for (var foo in json["listData"]) { //service_name
      if (json["listData"][foo][key] === value) {
        count = count + 1;
      }
    }
    return count;
  }

  //****** uncomment to connect 1999 api
  // area = "東區"
  var qStarTime = getTimeString(DateAdd(now, timeInterval, -1));
  var qEndTime = getTimeString(now);
  // console.log(qStarTime + "/" + qEndTime + "/" + area);
  // var qData = G.getAreasData(qStarTime, qEndTime, [area])
  // console.log(qData)
  //******************************************    

  // ******use fake data

  d3.json("../../src/fack_areas.json", function(error, data) {
    if (error) {
      console.log(error);
    }
    //********************

    // inner donut chart
    var d = data[fackId];

    for (var foo in service_name) {
      var temp = [];
      temp.push(service_name[foo]); //類別對應數字
      temp.push(filtJSON(d, "serviceName", foo)); //類別之事件發生數
      temp.push(foo); //類別名稱
      serviceArray.push(temp);
    }

    // serviceArray = serviceArray.sort(function(a, b) { //大到小排序
    //     return d3.descending(a[1], b[1]);
    // });

    // array.forEach(function(value, index) {
    //     if (index > 2) {
    //         otherSum += array[index][1];
    //     }
    // })

    // array.splice(3, array.length - 3, [9, otherSum, '其他']); //保留前三高，其餘加總到「其他」

    //creatDonut
    var pie = d3.layout.pie().sort(null);
    pie = pie(
      serviceArray.map( //遍尋處理每個array element，並取得特定欄位 = 數量
        function(element, index, array) {
          return element[1];
        })
    )
    var arc = d3.svg.arc()
      .innerRadius(radius - 195)
      .outerRadius(radius - 145);
    var arc2 = d3.svg.arc()
      .innerRadius(radius - 165)
      .outerRadius(radius - 115);


    var arcs = pie_svg.selectAll("g.arc")
      .data(pie)
      .enter()
      .append("g")
      .attr({
        "class": "arc"
      });



    var path = arcs.append("path")
      .attr({
        "fill": function(d, i) {
          return G.colorServiceName[serviceArray[i][0]]; //color的array
        },
        "d": arc,
        "class": "pie-path",
        "id": function(d, i) {
          return serviceArray[i][2];
        }
      })
      .on("mousemove", function(d, i) {
        tooltip.style("left", d3.event.pageX + 10 + "px");
        tooltip.style("top", d3.event.pageY - 25 + "px");
        tooltip.style("display", "inline-block");
        tooltip.html(serviceArray[i][2] + "<br>" + serviceArray[i][1] + "件");
      })
      .on("mouseout", function(d) {
        tooltip.style("display", "none");
      });

    path.transition()
      .duration(400)
      .ease('sin')
      .attr({
        "d": arc2
      });
    
    pie_svg.append('text')
      .attr('x', function(){
          var caseCount = d.caseCount;
          if (caseCount < 10)
            return -25;
          else if (caseCount < 100)
            return -60;
          else if (caseCount < 1000)
            return -90;
        })
      .attr('y', 0)
      .attr('id', 'focus_caseCount_' + areaEName)
      .attr('class', 'focus_caseCount')
      .text(d.caseCount);

    pie_svg.append('text')
      .attr('x', function(){
          var x = parseInt($('#focus_caseCount_' + areaEName).attr('x'));
          var caseCount = d.caseCount;
          if (caseCount < 10)
            return x + 55;
          else if (caseCount < 100)
            return x + 100;
          else if (caseCount < 1000)
            return x + 160;
        })
      .attr('y', -4)
      .attr('class', 'focus_caseCountI')
      .text('件');

    // Append time
    pie_svg.append("text")
      .attr({
        "class": "time_intaveral",
        "x": 0,
        "y": 40,
        "text-anchor": "middle"
      })
      .text(qStarTime + " ~ " + qEndTime);

  });

  /********************* Bar Chart **************************/

  //****** uncomment to connect 1999 api
  // console.log(qStarTime + "/" + qEndTime + "/" + area);
  // var qData = G.getItemsData(qStarTime, qEndTime, [area])
  // console.log(qData)
  //**************************

  //*******use fake_items data
  // Beacuse ude fake data , we can't choose correct things.
  // 除非給我們用真的API 才能選
  d3.json("../../src/fack_items.json", function(error, data) {

    //outer donut chart & bar chart

    var dataNoEmpty = [];


    // for (var key in qData) {
    //     if (qData[key].caseCount > 0) {
    //         dataNoEmpty.push(qData[key]);
    //         caseSum += qData[key].caseCount;
    //     }

    // }

    for (var key in data) {
      if (data[key].caseCount > 0) {
        dataNoEmpty.push(data[key]);
        caseSum += data[key].caseCount;
      }

    }

    var bar_width = 1000 - margin.left - margin.right;
    var bar_height = data.length * 46 - margin.top - margin.bottom;

    var bar_svg = d3.select("#bar-chart").append("svg")
      .attr("width", bar_width + margin.left + margin.right)
      .attr("height", bar_height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var array = dataNoEmpty.map(function(d) {
      return d.item;
    });

    var dataArray = data.map(function(d) {
      return d.item;
    })

    var x = d3.scale.linear().domain(d3.extent(data, function(d) {
        return d.caseCount;
      })).nice()
      .range([0, bar_width]);

    var y = d3.scale.ordinal().domain(dataArray)
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
        .ticks(0);
    }
    bar_svg.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + bar_height + ")")
      .call(make_x_axis()
        .tickSize(-bar_height, 0, 0)
        .tickFormat("")
      );

    //bar chart border
    // var borderPath = bar_svg.append("rect")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("height", bar_height)
    //     .attr("width", bar_width)
    //     .style("stroke", "#E0E0E0")
    //     .style("fill", "E0E0E0")
    //     .style("stroke-width", .5);

    var bars = bar_svg.selectAll(".bar").data(data).enter()
      .append("g").attr("class", "bar");

    var bar = bars.append("rect")
      .attr("class", "bar")
      .attr("x", function(d) {
        return x(Math.min(0, d.caseCount)) + 4;
      })
      .attr("y", function(d) {
        return y(d.item) + 10;
      })
      .attr("width", 0)
      .attr("height", 20)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", function(d, i) {
        for (var key in DB.areas) {
          if (DB.serviceItems[key] === d.item)
            return G.colorServiceItem[key]; //color的array
        }
      })
      .style("fill-opacity", 0.2);


    //********* The Second Pie **************//

    var pieOuter = d3.layout.pie().sort(null);
    var array = dataNoEmpty.map(function(d) {
      return d.caseCount;
    });
    var array = array.filter(hasCase);
    var pie2 = pieOuter(array);
    // console.log(array);
    var tmp = []; // tmp array to use drawPath()

    var donut2_arc1 = d3.svg.arc()
      .innerRadius((radius - 130))
      .outerRadius((radius - 95));
    var donut2_arc2 = d3.svg.arc()
      .innerRadius((radius - 100))
      .outerRadius((radius - 65));

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
          for (var key in DB.areas) {
            if (DB.serviceItems[key] === item_name[i]) {
              return G.colorServiceItem[key]; //color的array
            }
          }

        },
        "d": donut2_arc1,
        "class": "pie-path",
        "id": function(d, i) {
          return item_name[i] + "_inner";
        }
      })
      .on("mousemove", function(d, i) {
        tooltip.style("left", d3.event.pageX + 10 + "px");
        tooltip.style("top", d3.event.pageY - 25 + "px");
        tooltip.style("display", "inline-block");
        tooltip.html(item_name[i] + "<br>" + d.value + "件");
      })
      .on("mouseout", function(d) {
        tooltip.style("display", "none");
      })

    path.transition()
      .duration(400)
      .ease('sin')
      .attr({
        "d": donut2_arc2
      });

    //pie marker

    pie2.forEach(function(d) {
      var a = d.a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
      d.cy = Math.sin(a) * (radius - 75);
      d.cx = Math.cos(a) * (radius - 75);
    })

    // ---- Bug:
    // pie[0] , pie[1] , pie[2]沒有進去
    // 應該是因為 pie2 那裡有問題（對與不對的時候會不一樣）
    // ----
    pie_svg.selectAll("text").data(pie2)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr('class', 'focus_markerText')
      .attr("x", function(d, i) {
        console.log(i);
        return d.x = Math.cos(d.a) * (radius - 20) * 1.5;
        // return d.x = Math.cos(d.a)>0?400:-400;
      })
      .attr("y", function(d, i) {
        console.log(i);
        return d.y = Math.sin(d.a) * (radius - 20) * 1.02;
      })
      .text(function(d, i) {
        console.log(i);
        // console.log(d.value);
        if (d.value < (caseSum / 40)){
          return "";
        }
        else{
          return item_name[i] + ' ' + formatFloat((d.value / caseSum) * 100, 1) + '%';
        }
      })
      .each(function(d, i) {
        var bbox = this.getBBox();
        d.sx = d.x - bbox.width / 2 - 2;
        d.ox = d.x + bbox.width / 2 + 2;
        d.sy = d.oy = d.y + 5;
        tmp.push(d);
        if (i === pie2.length - 1) {
          drawPath(pie_svg, tmp);
        }
      });
    pie_svg.selectAll(".foo").remove();

    pie_svg.append("defs").append("marker")
      .attr("id", "circ")
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("refX", 5)
      .attr("refY", 5)
      .append("circle")
      .attr("cx", 5)
      .attr("cy", 5)
      .style("fill-opacity", 0.6)
      .attr("r", 5);

    //The Second pie end
    //sort the data
    data.sort(function(a, b) {
      return d3.descending(a.caseCount, b.caseCount);
    });

    y = d3.scale.ordinal().domain(data.map(function(d) {
        return d.item;
      }))
      .rangeRoundBands([0, bar_height], 0.1);

    bar.attr("y", function(d, i) {
      return y(d.item) + 10;
    }).style("fill-opacity", 1);

    bar.transition()
      .delay(function(d, i) {
        return i * 30;
      })
      .duration(800)
      .ease('bounce')
      .attr("width", function(d) {
        return x(d.caseCount) - x(0);
      })

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

    bar_svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0,0)")
      .call(xAxis);

    bar_svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + x(0) + ",0)")
      .call(yAxis);

  });

  function drawPath(pie_svg, pie2) {
    // console.log(pie2);
    pie_svg.selectAll("path.pointer").data(pie2).enter()
      .append("path")
      .attr("class", function(d) {
        var className;
        if (d.value > (caseSum / 40))
          className = "pointer"
        else
          className = "foo"
        return className;
      })
      .style("fill", "none")
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("stroke-opacity", 0.2)
      .attr("marker-end", "url(#circ)")
      .attr("d", function(d) {
        if (d.cx > d.ox) {
          return "M" + d.sx + "," + d.sy + "L" + d.ox + "," + d.oy + " " + d.cx + "," + d.cy;
        } else {
          return "M" + d.ox + "," + d.oy + "L" + d.sx + "," + d.sy + " " + d.cx + "," + d.cy;
        }
      });
  }

  function findAreaCName(areaEName) {
    //find areaCName
    for (var key in DB.areasE) {
      if (DB.areasE[key] === areaEName) {
        return key;
      }
    }
  }

  function hasCase(value) {
    console.log(value);
    return value > 0;
  }

}

function resetFocus() {
  d3.select('#pie-chart').selectAll("*").remove();
  d3.select('#bar-chart').selectAll("*").remove();
}

function formatFloat(num, pos)
{
  var size = Math.pow(10, pos);
  return Math.round(num * size) / size;
}

$('.ui.dropdown.focus_selectArea')
  .dropdown({
    onChange: function(value, text) {
      var setInterval = $('.active').attr('value');
      G.focusArea(value, 2, setInterval);
    }
  });
