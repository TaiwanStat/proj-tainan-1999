var isFocusExist = false;

(function (window) {
  window.focus = focus;
  window.resetFocus = resetFocus;
  initCalendar();

  $('.ui.dropdown.focus_selectArea')
    .dropdown({
      onChange: function (value, text) {
        var setInterval = $('.active').attr('value');
        var qStarTime = $('#startDate').val();
        var qEndTime = $('#endDate').val();
        console.log(setInterval);
        G.focusArea(value, setInterval, qStarTime, qEndTime);
      }
    });

  function focus(areaEName, timeInterval, startDate, endDate) {
    isFocusExist = true;
    var margin = {
      top: 50,
      right: 300,
      bottom: 40,
      left: 350
    };
    var pieWidth = $('#pie-chart').width();
    var pieHeight = 600;
    var radius = Math.min(pieWidth, pieHeight) / 2;

    var serviceArray = []; // array用來儲存過濾後可畫圖的資料
    var qStarTime = '';
    var qEndTime = '';

    var pieSvg = d3.select('#pie-chart').append('svg')
      .attr('width', pieWidth)
      .attr('height', pieHeight)
      .append('g')
      .attr('transform', 'translate(' + pieWidth / 2 + ',' + pieHeight / 2 + ')');

    var tooltip = d3.select('#pie-chart').append('tooltip').attr('class', 'toolTip');
    var areaCName = findAreaCName(areaEName);

    // Data Setting
    var qData;
    var areasData;
    var itemsData;
    var caseSum;

    // unbind click event
    $('.infocus').off('click');
    $('.infocus .reactive').click(function () {
      var selectedInterval = $(this).attr('value');
      if (selectedInterval.length < 2) {
        $('.active').removeClass('active');
        $(this).addClass('active');
        G.focusArea(areaEName, selectedInterval, qStarTime, qEndTime);
      } else {
        G.select('item_overview');
      }
    });

    $('#self-define').off('click');
    $('#self-define').click(function () {
      $('.ui.modal')
        .modal({
          onApprove: function () {
            qStarTime = $('#startDate').val();
            qEndTime = $('#endDate').val();

            if (qStarTime === '' || qEndTime === '') {
              return;
            }
            G.focusArea(areaEName, 's', qStarTime, qEndTime);
          }
        })
        .modal('show');

      var selectedInterval = $(this).attr('value');
      if (selectedInterval.length < 2) {
        $('.active').removeClass('active');
        $(this).addClass('active');
      } else {
        G.select('item_overview');
      }
    });

    $('.area_name').text(areaCName);

    var serviceName = { '違規停車': 0, '路燈故障': 1, '噪音舉發': 2, '騎樓舉發': 3, '道路維修': 4, '交通運輸': 5, '髒亂及汙染': 6, '民生管線': 7, '動物救援': 8, '其他': 9 };
    function filtJSON(data, key, value) {
      var count = 0;
      for (var foo in data.listData) { // serviceName
        if (data.listData[foo][key] === value) {
          count += data.listData[foo].caseCount;
        }
      }
      return count;
    }

    // Check if it is 'self-control'
    if (!(timeInterval === 's')) {
      qStarTime = window.getTimeString(window.dateAdd(window.now, timeInterval, -1));
      qEndTime = window.getTimeString(window.now);
    } else {
      qStarTime = startDate;
      qEndTime = endDate;
    }

    /*
     * GET DATA!
     */
    // Check if it is 'All'
    if (areaCName === '台南市') {
      var newListData = [];
      qData = G.getItemsData(qStarTime, qEndTime, DB.areas);
      areasData = [{
        'area': '台南市',
        'caseCount': 0,
        'listData': newListData,
      }];
      qData.areasArray.forEach(function(value, index){
        areasData[0].caseCount += value.caseCount;
        Array.prototype.push.apply(newListData, value.listData)
      });
      qData.areasArray = areasData;
    }else {
      qData = G.getItemsData(qStarTime, qEndTime, [areaCName]);
      areasData = qData.areasArray;
    }

    itemsData = qData.itemsArray; 
    caseSum = qData.count; // 案件總數

    // inner donut chart
    var d = areasData[0];
    for (var service in serviceName) {
      var temp = [];
      temp.push(serviceName[service]); // 類別對應數字
      temp.push(filtJSON(d, 'serviceName', service)); // 類別之事件發生數
      temp.push(service); // 類別名稱
      serviceArray.push(temp);
    }

    // creatDonut
    var pie = d3.layout.pie().sort(null);
    pie = pie(
      serviceArray.map( //遍尋處理每個array element，並取得特定欄位 = 數量
      function (element, index, array) {
        return element[1];
      })
    );

    var arc = d3.svg.arc()
      .innerRadius(radius - 195)
      .outerRadius(radius - 145);
    var arc2 = d3.svg.arc()
      .innerRadius(radius - 165)
      .outerRadius(radius - 115);


    var arcs = pieSvg.selectAll('g.arc')
      .data(pie)
      .enter()
      .append('g')
      .attr({
        'class': 'arc'
      });

    var path = arcs.append('path')
      .attr({
        'fill': function (d, i) {
          return G.colorServiceName[serviceArray[i][0]]; // color的array
        },
        'd': arc,
        'class': 'pie-path',
        'id': function (d, i) {
          return serviceArray[i][2];
        }
      })
      .on('mousemove', function (d, i) {
        tooltip.style('left', d3.event.pageX + 10 + 'px')
               .style('top', d3.event.pageY - 25 + 'px')
               .style('display', 'inline-block')
               .html(serviceArray[i][2] + '<br>' + serviceArray[i][1] + '件');
      })
      .on('mouseout', function (d) {
        tooltip.style('display', 'none');
      });

    path.transition()
      .duration(400)
      .ease('sin')
      .attr({
        'd': arc2
      });

    function drawText() {
      pieSvg.append('text')
        .attr('x', function () {
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

      pieSvg.append('text')
        .attr('x', function () {
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
      pieSvg.append('text')
        .attr({
          'class': 'time_intaveral',
          'x': 0,
          'y': 40,
          'text-anchor': 'middle'
        })
        .text(qStarTime + ' ~ ' + qEndTime);
    }
    setTimeout(drawText, 0);

    /********************* Bar Chart **************************/

    //outer donut chart & bar chart
    var dataNoEmpty = [];
    
    itemsData.forEach(function(value, index){
      if (value.caseCount > 0) {
        dataNoEmpty.push(value);
        // caseSum += value.caseCount;
      }
    })

    var barWidth = 1000 - margin.left - margin.right;
    var barHeight = itemsData.length * 46 - margin.top - margin.bottom;

    var barSvg = d3.select('#bar-chart').append('svg')
      .attr('width', barWidth + margin.left + margin.right)
      .attr('height', barHeight + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var array = dataNoEmpty.map(function (d) {
      return d.item;
    });

    var dataArray = itemsData.map(function (d) {
      return d.item;
    });

    var x = d3.scale.linear().domain(d3.extent(itemsData, function (d) {
      return d.caseCount;
    })).nice()
    .range([0, barWidth]);

    var y = d3.scale.ordinal().domain(dataArray)
      .rangeRoundBands([0, barHeight], 0.1);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('top')
      .tickSize(0)
      .ticks(10)
      .tickPadding(10)
      .tickFormat(d3.format('d'));

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .tickSize(0)
      .tickPadding(10);

    // Draw the x Grid lines
    function makeXAxis() {
      return d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(0);
    }
    barSvg.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(0,' + barHeight + ')')
      .call(makeXAxis()
        .tickSize(-barHeight, 0, 0)
        .tickFormat('')
      );

    var bars = barSvg.selectAll('.bar').data(itemsData).enter()
      .append('g').attr('class', 'bar');

    var bar = bars.append('rect')
      .attr('class', 'bar')
      .attr('x', function (d) {
        return x(Math.min(0, d.caseCount)) + 4;
      })
      .attr('y', function (d) {
        return y(d.item) + 10;
      })
      .attr('width', 0)
      .attr('height', 20)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', function (d, i) {
        for (var key in DB.areas) {
          if (DB.serviceItems[key] === d.item) {
            return G.colorServiceItem[key]; // color的array
          }
        }
      })
      .style('fill-opacity', 0.2);

    // Outer Pie
    var pieOuter = d3.layout.pie().sort(null);
    array = dataNoEmpty.map(function (d) {
      return d.caseCount;
    });
    array = array.filter(hasCase);
    var pie2 = pieOuter(array);
    var tmp = []; // tmp array to use drawPath()

    var donut2Arc1 = d3.svg.arc()
      .innerRadius((radius - 130))
      .outerRadius((radius - 95));
    var donut2_arc2 = d3.svg.arc()
      .innerRadius((radius - 100))
      .outerRadius((radius - 65));

    var arcs = pieSvg.selectAll('g.arcs')
      .data(pie2)
      .enter()
      .append('g')
      .attr({
        'class': 'arcs'
      });

    var itemName = dataNoEmpty.map(function (d) {
      return d.item;
    });

    /*
     * BUG: 若是點擊台南市的話 Array 沒有進來（沒有執行fill，可是其他得屬性都有進去）
     */
    var path = arcs.append('path')
      .attr({
        'd': donut2Arc1,
        'class': 'pie-path',
        'id': function (d, i) {
          return itemName[i] + '_outer';
        }
      })
      .style('fill', function (d, i) {
        for (var key in DB.areas) {
          console.log(DB.serviceItems[key], itemName[i], i);
          if (DB.serviceItems[key] === itemName[i]) {
            return G.colorServiceItem[key]; // color的array
          }
        }
      })
      .on('mousemove', function (d, i) {
        tooltip.style('left', d3.event.pageX + 10 + 'px')
               .style('top', d3.event.pageY - 25 + 'px')
               .style('display', 'inline-block')
               .html(itemName[i] + '<br>' + d.value + '件');
      })
      .on('mouseout', function (d) {
        tooltip.style('display', 'none');
      });

    path.transition()
      .duration(400)
      .ease('sin')
      .attr({
        'd': donut2_arc2
      });

    // pie marker
    pie2.forEach(function (d) {
      var a = d.a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
      d.cy = Math.sin(a) * (radius - 75);
      d.cx = Math.cos(a) * (radius - 75);
    });

    pieSvg.selectAll('text').data(pie2)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('class', 'focus_markerText')
      .attr('x', function (d) {
        d.x = Math.cos(d.a) * (radius - 20) * 1.5;
        return d.x;
      })
      .attr('y', function (d) {
        d.y = Math.sin(d.a) * (radius - 20) * 1.02;
        return d.y;
      })
      .text(function (d, i) {
        if (d.value < (caseSum / 40)) {
          return '';
        } else {
          return itemName[i] + ' ' + formatFloat((d.value / caseSum) * 100, 1) + '%';
        }
      })
      .each(function (d, i) {
        var bbox = this.getBBox();
        d.sx = d.x - bbox.width / 2 - 2;
        d.ox = d.x + bbox.width / 2 + 2;
        d.sy = d.oy = d.y + 5;
        tmp.push(d);
        if (i === pie2.length - 1) {
          drawPath(pieSvg, tmp);
        }
      });

    pieSvg.selectAll('.foo').remove();
    pieSvg.append('defs').append('marker')
      .attr('id', 'circ')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('refX', 5)
      .attr('refY', 5)
      .append('circle')
      .attr('cx', 5)
      .attr('cy', 5)
      .style('fill-opacity', 0.6)
      .attr('r', 5);

    // The Second pie end
    // sort the data
    itemsData.sort(function (a, b) {
      return d3.descending(a.caseCount, b.caseCount);
    });

    y = d3.scale.ordinal().domain(itemsData.map(function (d) {
      return d.item;
    }))
    .rangeRoundBands([0, barHeight], 0.1);

    bar.attr('y', function (d, i) {
      return y(d.item) + 10;
    }).style('fill-opacity', 1);

    bar.transition()
      .delay(function (d, i) {
        return i * 30;
      })
      .duration(800)
      .ease('bounce')
      .attr('width', function (d) {
        return x(d.caseCount) - x(0);
      });

    yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .tickSize(0)
      .tickPadding(10);

    // 長條圖旁邊的數字
    bars.append('text').text(function (d) {
      return d.caseCount + '件';
    })
    .attr('x', function (d) {
      return x(d.caseCount) + 10;
    })
    .attr('y', function (d) {
      return y(d.item) + 23;
    })
    .attr('class', 'bartip');

    barSvg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,0)')
      .call(xAxis);

    barSvg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + x(0) + ',0)')
      .call(yAxis);

    function drawPath(pieSvg, pie2) {
      // console.log(pie2);
      pieSvg.selectAll('path.pointer').data(pie2).enter()
        .append('path')
        .attr('class', function (d) {
          var className;
          if (d.value > (caseSum / 40))
            className = 'pointer';
          else
            className = 'foo';
          return className;
        })
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .style('stroke-opacity', 0.2)
        .attr('marker-end', 'url(#circ)')
        .attr('d', function (d) {
          if (d.cx > d.ox) {
            return 'M' + d.sx + ',' + d.sy + 'L' + d.ox + ',' + d.oy + ' ' + d.cx + ',' + d.cy;
          } else {
            return 'M' + d.ox + ',' + d.oy + 'L' + d.sx + ',' + d.sy + ' ' + d.cx + ',' + d.cy;
          }
        });
    }
    function hasCase(value) {
      return value > 0;
    }     

    function findAreaCName(areaEName) {
      // find areaCName
      for (var key in DB.areasE) {
        if (DB.areasE[key].toLowerCase() === areaEName.toLowerCase()) {
          return key;
        }
      }
    }
  }

  function resetFocus() {
    d3.select('#pie-chart').selectAll('*').remove();
    d3.select('#bar-chart').selectAll('*').remove();
  }

  function formatFloat(num, pos) {
    var size = Math.pow(10, pos);
    return Math.round(num * size) / size;
  }

  function initCalendar() {
    $('#rangestart').calendar({
      type: 'date',
      inline: true,
      endCalendar: $('#rangeend'),
      formatter: {
        date: function (date, settings) {
          if (!date) return '';
          var day = date.getDate();
          var month = date.getMonth() + 1;
          var year = date.getFullYear();
          var dateString = year + '-' + month + '-' + day;
          return dateString;
        }
      }
    });

    $('#rangeend').calendar({
      type: 'date',
      inline: true,
      startCalendar: $('#rangestart'),
      formatter: {
        date: function (date, settings) {
          if (!date) return '';
          var day = date.getDate();
          var month = date.getMonth() + 1;
          var year = date.getFullYear();
          var dateString = year + '-' + month + '-' + day;
          return dateString;
        }
      }
    });
  }
})(window);
