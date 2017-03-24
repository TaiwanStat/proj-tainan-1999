var isBubbleExist = false;
var d3 = window.d3;
var $ = window.$;
var G = window.G;
var moment = window.moment;

var bubbleChart = function () {

  if (isBubbleExist) {
    return;
  }
  isBubbleExist = true;

  var width = 800;
  var height = 600;
  var padding = 7;
  var tooltipDiv = d3.select('#bubbule_tooltip')
                      .append('div')
                      .attr('class', 'bubble_tooltip')
                      .attr('opacity', 1);

  var jsonData;
  // parser data, 之後將改成call api的方式, 不需要d3.json
  // d3.json('../src/faked.json', function (error, data) {
  //   if (error) {
  //     console.log(error);
  //   }
  //   draw(data, 's');
  // });


  /* TODO:改成call api 並且改變最早時間 ---------
  /* jsonData = G.getItemsData('2017-01-01', '2017-01-01', ['新化區', '新營區']);
  /* draw(data);
  /* 預先設置pack layout
  /*/

  jsonData = G.getItemsData('2017-01-01', '2017-01-01', ['新化區', '新營區']);
  draw(jsonData);

  var bubble = d3.layout.pack()
    .sort(null)
    .size([width, height])
    .padding(padding);

  var svg = d3.select('#bubble_chart')
    .append('svg')
    .attr({
      'width': width,
      'height': height,
      'id': 'bubble_chart'
    });

  var startDate = '2017-01-01';
  var selectDate = moment(startDate); // TODO:設定最早時間
  var lastData = startDate;
  var nowDate = new moment(); // 取得當前時間

  var sliderValue = 0;  // sliderValue save the slider percent
  var durationDay = parseInt((nowDate._d - selectDate._d) / (1000 * 60 * 60 * 24), 10);
  var dateGOGO = d3.time.format('%Y-%m-%d');
  var slider = $('input');

  // draw the slider
  slider.on('mouseenter', function () {
    slider.on('click', function () {
      sliderValue = slider.val();
      changeSlider(sliderValue);
    });
    slider.on('mousemove', function () {
      sliderValue = slider.val();
      changeSlider2(sliderValue);
    });
  });

  // change the slider status(color bar)
  function changeSlider2(n) {
    slider.css({
      'background-image': '-webkit-linear-gradient(left ,#222 0%,#222 ' + n + '%,#d3d3d5 ' + n + '%, #d3d3d5 100%)'
    });
  }

  function changeSlider(n) {
    slider.css({
      'background-image': '-webkit-linear-gradient(left ,#222 0%,#222 ' + n + '%,#d3d3d5 ' + n + '%, #d3d3d5 100%)'
    });
    // get the duration of the day which slider bar selected
    var durationSet = moment.duration({ 'days': (durationDay / 100) * n });
    // get the time
    selectDate = moment(startDate).add(durationSet);
    // d3.selectAll('#show_date').text(dateGOGO(selectDate._d));
    if (lastData !== dateGOGO(selectDate._d)) {
      // TODO
      // 改成call api
      // jsonData = G.getItemsData(startDate, dateGOGO(selectDate._d), ['新化區', '新營區']);
      d3.json('../../src/faked2.json', function (error, data) {
        if (error) {
          console.log(error);
        }
        draw(data, 'c');
      });
      lastData = dateGOGO(selectDate._d);
    }
  }

  function draw(data, option) {
    /*
      option:
        's' : start (first time)
        'c' : change data
    */
    option = option || 'c';

    var detail = {};
    var filtedData = dataFilter(data);
    var allEventNumber = [];
    var initValue = 0;

    for (var itemName in DB.serviceItems) {
      detail[DB.serviceItems[itemName]] = '';
    }

    for (var foo in data) {
      // establish the each district information
      var district = {};
      // use DB.areas to create the object array whose indice are area names
      for (var bar in DB.areas) {
        district[DB.areas[bar]] = 0;
      }
      // use data.listData column to fetch object array by the evnet area by chinese area names
      for (var bar in data[foo].listData) {
        district[data[foo].listData[bar].area]++;
      }
      // sorted the ojbect array for choosing the 3 highest areas
      var districtSorted = Object.keys(district).sort(function (a, b) {
        return district[b] - district[a];
      });

      detail[data[foo].item] = districtSorted[0] + district[districtSorted[0]] + '件<br>' +
                               districtSorted[1] + district[districtSorted[1]] + '件<br>' +
                               districtSorted[2] + district[districtSorted[2]] + '件<br>';
    }

    for (var foo in filtedData.children) {
      if (filtedData.children[foo].value >= initValue) {
        initValue = filtedData.children[foo].value;
      }
      allEventNumber.push(filtedData.children[foo].value);
    }

    var mean = d3.quantile(allEventNumber, 0.1);
    var bubbleData = bubble.nodes(filtedData)
      .filter(function (d) {
        return d.parent;
      });

    if (option === 's') {
      var drawNode = svg.selectAll('circle')
                         .data(bubbleData)
                         .enter()
                         .append('circle')
                         .attr({
                           cx: function (d) {
                             return d.x;
                           },
                           cy: function (d) {
                             return 0;
                           },
                           r: function (d) {
                            return d.r;
                           },
                           fill: function (d, i) {
                             return d.itemColor;
                           },
                           id: function (d, i) {
                             return 'id' + d.item;
                           },
                           opacity: 0
                         });
    } else {
      var drawNode = svg
        .selectAll('circle')
        .data(bubbleData);
    }

    drawNode
      .on('mouseover', function (thisData) {
        d3.select(this).attr({
          'stroke': 'rgba(0, 0, 0, 0.2)',
          'stroke-width': 3
        });

        tooltipDiv.transition()
          .duration(100)
          .style({
            'opacity': 0.9
          });
        tooltipDiv.html('<span class="bubble_tooltipName">' + d3.select(this).attr('id').slice(2) + '( ' + thisData.value + '件 )</span><br>' + detail[d3.select(this).attr('id').slice(2)])
          .style({
            'left': (d3.event.pageX) + 'px',
            'top': (d3.event.pageY) + 'px'
          });
      })
      .on('mouseout', function () {
        tooltipDiv.transition()
          .duration(100)
          .style({
            'opacity': 0
          });
        d3.select(this).attr({
          'stroke-width': 1
        });
      });

    if (option === 's') {
      drawNode.transition()
        .duration(1000)
        .attr({
          opacity: 1,
          cy: function (d) {
            return d.y;
          }
        });
    } else {
      drawNode.transition()
        .duration(1000)
        .attr({
          cx: function (d) {
            return d.x;
          },
          cy: function (d) {
            return d.y;
          },
          r: function (d) {
            return d.r;
          }
        });
    }

    resetItemText();

    var textNode = svg.selectAll('#item_text')
      .data(bubbleData)
      .enter()
      .append('text')
      .attr({
        'x': function (d) {
          return d.x - 5;
        },
        'y': function (d) {
          return d.y - 5;
        },
        'id': 'item_text'
      })
      .style({
        'text-anchor': 'middle'
      })
      .text(function (d) {
        // return ;
        if (d.value > mean) {
          if ((d3.select('#id' + d.item).attr('r') / (d.item.length)) >= 7) {
            return d.item;
          }
        }
      })
      .transition()
      .duration(1000)
      .attr({
        x: function (d) {
          return d.x;
        },
        y: function (d) {
          return d.y;
        },
        opacity: 1
      });

    // ------- 取前三高的事件數顯示出來 ---------
    updateSideBox(data);
  }

  // 解析api data!，之後可能會因為api更動而需要更改
  function dataFilter(data) {
    var newData = [];
    data.forEach(function (d, i) {
      var value = d.caseCount;
      var itemColor = G.colorServiceItem[i];

      newData.push({
        value: value,
        itemColor: itemColor,
        item: d.item
      });
    });
    // 因為只需要一個pack，所以將data包於children中
    return { children: newData };
  }


  // ----- Control Option Button ------
  // event紀錄interval事件，將其包於option可助於clearInterval刪除該事件
  var event;
  var playState = 'pause';
  d3.select('#play_icon')
    .on('click', function () {
      if(playState === 'pause') {
        playState = 'play';

        $('#play_icon')
          .removeClass('fa-play')
          .addClass('fa-pause');

        $('html, body').animate(
          { scrollTop: $('#scroll_container').offset().top - 5}, 'easeInBack'
        );

        // 以set interval來達到輪播更動
        // $('<style>input[type='range']::-webkit-slider-thumb{left:' + 0 + '%;}</style>').appendTo('head');
        event = setInterval(function () {
          // 以now_bar_value紀錄當前bar的數值，對齊作加減，假如等於now_data即不再更新
          // $('#header_id').remove();
          if (dateGOGO(selectDate._d) !== dateGOGO(nowDate._d) && sliderValue < 100) {
            var durationSet = moment.duration({ 'days': 1 });
            selectDate = selectDate.add(durationSet);
            // d3.select('#show_date').text(dateGOGO(selectDate._d));
            sliderValue = parseInt(sliderValue, 10) + (100 / durationDay);
            changeSlider(parseInt(sliderValue, 10));

            var x = document.getElementById('slider_input');
            x.value = parseInt(sliderValue, 10);

            if (dateGOGO(selectDate._d) === dateGOGO(nowDate._d) || sliderValue >= 100) {
              clearInterval(event);
            }
          } else {
            clearInterval(event);
          }
        }, 2000);
      } else if (playState === 'play') {
        // Pause
        playState = 'pause';
        clearInterval(event);

        $('#play_icon')
          .removeClass('fa-pause')
          .addClass('fa-play');
      }
    });

  d3.select('#stop_icon')
    .on('click', function () {
      // 因為stop，將bar_value改回0，並更新svg!
      var x = document.getElementById('slider_input');
      sliderValue = 0;
      changeSlider(sliderValue);
      x.value = parseInt(sliderValue, 10);
      clearInterval(event);

      playState = 'pause';
      $('#play_icon')
          .removeClass('fa-pause')
          .addClass('fa-play');
    });

  function updateSideBox(data) {
    var sortData = data.sort(function (a, b) {
      if (a.caseCount < b.caseCount) {
        return 1;
      } else if (a.caseCount > b.caseCount) {
        return -1;
      } else {
        return 0; // a 必須等於 b
      }
    });

    $('.descriptionTime').text(dateGOGO(selectDate._d));
    for ( var i = 0; i < 3; i++ ) {
      $('.descriptionItem>#item' + i).text((i + 1) + '. ' +
        sortData[i].item + ': ' + sortData[i].caseCount + '件');
    }
  }

  function resetItemText() {
    svg.selectAll('#item_text').remove();
  }
};
