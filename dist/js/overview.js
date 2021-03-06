(function () {
  var serviceName = {
    '違規停車': 0,
    '路燈故障': 1,
    '噪音舉發': 2,
    '騎樓舉發': 3,
    '道路維修': 4,
    '交通運輸': 5,
    '髒亂及汙染': 6,
    '民生管線': 7,
    '動物救援': 8,
    '其他': 9
  };

  var width;
  var height;
  var lengendXparameter;
  var lengendYparameter;
  var caseCountTextX;

  initTime();
  setChartSize();
  var startDate = G.time.lastWTime;
  var endDate = G.time.curTime;

  // window.overview = overview;

  var qData = G.getAreasData(startDate, endDate);
  var allArray = [ // 用來存全區資料
    [0, 0, '違規停車'],
    [1, 0, '路燈故障'],
    [2, 0, '噪音舉發'],
    [3, 0, '騎樓舉發'],
    [4, 0, '道路維修'],
    [5, 0, '交通運輸'],
    [6, 0, '髒亂及污染'],
    [7, 0, '民生管線'],
    [8, 0, '動物救援'],
    [9, 0, '其他']
  ];

  qData.areasArray.map(function (d, areaIndex) {
    var areaName = d.area;
    var array = []; // array用來儲存過濾後可畫圖的資料
    var otherSum = 0;
    var nameObj = {
      cName: areaName,
      eName: DB.areasE[areaName]
    };

    for (var name in serviceName) {
      var temp = [];
      temp.push(serviceName[name]); // 類別對應數字
      temp.push(filtJSON(d, 'serviceName', name)); // 類別之事件發生數
      temp.push(name); // 類別名稱
      array.push(temp);
    }

    for (var i = 0; i < 10; i++) {
      // 把每次的資料夾到全區累計
      allArray[i][1] += array[i][1];
    }

    array = array.sort(function (a, b) { 
      // 由大到小排序
      return d3.descending(a[1], b[1]);
    });

    array.forEach(function (value, index) { 
      // 取前三高，其他加總到其他
      if (index > 2) {
        otherSum += array[index][1];
      }
    })
    // console.log(array, nameObj);
    array.splice(3, array.length - 3, [9, otherSum, '其他']); //保留前三高，其餘加總到「其他」
    createDonut(array, nameObj, 'column', d.caseCount, areaIndex); //畫圖(各區)
  });

  allArray = allArray.sort(function (a, b) { // 由大到小排序
    return d3.descending(a[1], b[1]);
  });

  var allOtherSum = 0;
  var allSum = 0;
  allArray.forEach(function (value, index) {
    if (index > 2) {
      allOtherSum += allArray[index][1];
    }
    allSum += allArray[index][1];
  });

  allArray.splice(3, allArray.length - 3, [9, allOtherSum, '其他']);
  var allNameObj = {
    cName: '台南市',
    eName: 'Tainan'
  };
  createDonut(allArray, allNameObj, 'column', allSum, -1); // 畫圖(各區) 


  function createDonut(array, name, column_object, caseCount, areaIndex) {
    var pie = d3.layout.pie();
    if (areaIndex < 0) {
      var svg = d3.select('.' + column_object)
        .insert('svg', ':first-child')
        .attr({
          'width': width,
          'height': height
        });
    } else {
      var svg = d3.select('.' + column_object)
        .append('svg')
        .attr({
          'width': width,
          'height': height
        });
    }

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
      array.map( // 遍尋處理每個array element，並取得特定欄位 = 數量
        function (element, index, array) {
          return element[1];
        })
      );

    var arcs = svg.selectAll('g.arc')
      .data(pieData)
      .enter()
      .append('g')
      .attr({
        'class': 'arc',
        'transform': 'translate(' + (width / 2) + ', ' + (width / 2) + ')'
      });

    var tooltip = d3.select('.row').append('tooltip').attr('class', 'toolTip');
    var color = G.colorServiceName;
    var path = arcs.append('path')
      .attr({
        'fill': function (d, i) {
          return color[array[i][0]]; //color的array
        },
        'd': arc,
        'class': function (d, i) {
          if (i === 0) { //最大的有特效
            return 'path_special';
          }
          return 'path';
        },
        'id': function (d, i) {
          return array[i][2];
        }
      })
      .on('mousemove', function (d, i) {
        var percent = (parseFloat(array[i][1]) / caseCount * 100).toFixed(1);

        tooltip.style('left', d3.event.pageX + 10 + 'px')
               .style('top', d3.event.pageY - 25 + 'px')
               .style('display', 'inline-block')
               .html(array[i][2] + '<br>' + percent + '％');
      })
      .on('mouseout', function (d) {
        tooltip.style('display', 'none');
      });

    d3.selectAll('.path_special')
      .attr({
        'd': arc3
      });

    path.transition()
      .duration(1000)
      .attr({
        'd': arc2
      });

    svg.append('text')
      .attr({
        'id': 'caseCount_' + name.eName,
        'class': 'overview_caseCount',
        'x': function (d) {
          if (caseCount < 10)
            return width / 2 - caseCountTextX * 5;
          else if (caseCount < 100)
            return width / 2 - caseCountTextX * 9;
          else if (caseCount < 1000)
            return width / 2 - caseCountTextX * 11;
          else if (caseCount < 10000)
            return width / 2 - caseCountTextX * 14;

        },
        'y': height / 2 - 10
      })
      .style('opacity', 0)
      .text(caseCount)
      .transition()
      .duration(800)
      .style({
        'opacity': 1
      });

    svg.append('text')
      .attr('class', 'overview_caseCountI')
      .attr('x', function (d) {
        var x = parseInt($('#caseCount_' + name.eName).attr('x'));
        if (caseCount < 10)
          return x + caseCountTextX * 7;
        else if (caseCount < 100)
          return x + caseCountTextX * 13;
        else if (caseCount < 1000)
          return x + caseCountTextX * 20;
        else if (caseCount < 10000)
          return x + caseCountTextX * 26;
      })
      .attr('y', $('#caseCount_'+name.eName).attr('y') - 3)
      .style('opacity', 0)
      .text('件')
      .transition()
      .duration(800)
      .style({
        'opacity': 1
      });

    svg.append('text') //區域名稱，放在圖下
      .attr({
        'id': name.eName,
        'class': 'overview_areaName',
        'x': width / 2 - 35,
        'y': height - 30
      })
      .text(function (d) {
        return name.cName + ' ›';
      })
      .on('click', function (d) {

        // remove semantic's time menu active
        $('.active').removeClass('active');
        $('.item[value="w"]').addClass('active');
        G.focusArea(this.id, 'w');
      });


    // ------ Map colorArray ------- //

    var items = Object.keys(serviceName);
    var lengedColor = array.map(function (d) {
      return [color[d[0]], items[d[0]]];
    });

    // 把其他移掉
    lengedColor.pop();

    var legendRectSize = 18;
    var legendSpacing = 3;
    var legend = svg.selectAll('.legend')
      .data(lengedColor)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function (d, i) {
        var height = legendRectSize + legendSpacing;
        var offset = height * lengedColor.length / 2;
        var horz = lengendXparameter * legendRectSize;
        var vert = i * height + lengendYparameter * offset;
        return 'translate(' + horz + ',' + vert + ')';
      });

    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', function (d) {
        return d[0];
      })
      .style('stroke', color);

    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function (d) {
        return d[1];
      });
  }

  function filtJSON(data, key, value) {
    var count = 0;
    for (var foo in data.listData) { //serviceName
      if (data.listData[foo][key] === value) {
        count += data.listData[foo].caseCount;
      }
    }
    return count;
  }

  function setChartSize() {
    if ($(window).width() <= 1520) {
      width = 380;
      height = 380;
      lengendXparameter = 8.3;
      lengendYparameter = 6.3;
      caseCountTextX = 5;
    } else {
      width = 450;
      height = 450;
      lengendXparameter = 10;
      lengendYparameter = 7.8;
      caseCountTextX = 7;
    }
  }

  function initTime() {
    var curTime = G.time.curTime;
    var lastTime = G.time.lastWTime;
    $('.overview_title .date').text('． ' + lastTime.split('-')[1] + '/' +
        lastTime.split('-')[2] + ' ~ ' + curTime.split('-')[1] + '/' +
        curTime.split('-')[2] + ' ．');
  }

  $('.ui.dropdown.overview_selectArea')
    .dropdown({
      onChange: function (value, text, selectItem) {
        $('html, body').animate({ scrollTop: $('#' + value).offset().top - 400 },
          'easeInBack',
          function () {
            window.location.hash = value;
          }
        );
      }
    });
})();
