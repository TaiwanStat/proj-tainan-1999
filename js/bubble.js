(function() {

  var width = 800;
  var height = 600;
  var json_data;
  var padding = 7;

  var format = d3.format(",d");
  var tooltip_div = d3.select("#bubbule_tooltip").append("div")
    .attr("class", "bubble_tooltip")
    .attr("opacity", 1);

  //parser data, 之後將改成call api的方式, 不需要d3.json
  d3.json("../../src/faked.json", function(error, data) {
    if (error) {
      console.log(error);
    }
    draw(data, 's');
  });


  //------ TODO:改成call api 並且改變最早時間 ---------
  //			json_data = G.getItemsData('2016-11-09', '2016-11-09', ['新化區', '新營區']);
  //draw(data);
  //預先設置pack layout
  // -----------------------------------------------
  var bubble = d3.layout.pack()
    .sort(null)
    .size([width, height])
    .padding(padding);

  var svg = d3.select("#bubble_chart")
    .append("svg")
    .attr({
      "width": width,
      "height": height,
      "id": "bubble_chart",
    });
  //使用moment.js來p解析時間
  var select_date = moment("2016-11-09"); //TODO:設定最早時間
  var last_data = "2016-11-09";

  var now_date = new moment(); //取得當前時間
  //slider_value save the slider percent
  var slider_value = 0;
  var duration_day = parseInt((now_date._d - select_date._d) / (1000 * 60 * 60 * 24));
  var dateGOGO = d3.time.format("%Y-%m-%d");
  var slider = $("input");
  //draw the slider
  slider.on('mouseenter', function() {
    console.log(slider_value);
    slider.on('click', function() {
      slider_value = slider.val();
      // console.log(slider_value);
      change_slider(slider_value);
    });
    slider.on('mousemove', function() {
      slider_value = slider.val();
      // if(slider_value)
      // console.log(slider_value);
      change_slider2(slider_value);
    });
  });
  //change the slider status(color bar)
  function change_slider2(n) {
    slider.css({
      'background-image': '-webkit-linear-gradient(left ,#222 0%,#222 ' + n + '%,#d3d3d5 ' + n + '%, #d3d3d5 100%)'
    });
  }

  function change_slider(n) {
    // $('#header_id').remove();
    slider.css({
      'background-image': '-webkit-linear-gradient(left ,#222 0%,#222 ' + n + '%,#d3d3d5 ' + n + '%, #d3d3d5 100%)'
    });
    //get the duration of the day which slider bar selected
    var duration_set = moment.duration({ 'days': (duration_day / 100) * n });
    //get the time
    select_date = moment("2016-11-09").add(duration_set);
    // d3.selectAll("#show_date").text(dateGOGO(select_date._d));
    if (last_data != dateGOGO(select_date._d)) {
      //TODO
      //改成call api
      //          json_data = G.getItemsData('2016-11-09', dateGOGO(select_date._d), ['新化區', '新營區']);
      d3.json("../../src/faked2.json", function(error, data) {
        if (error) {
          console.log(error);
        }
        draw(data, 'c');
      })
      last_data = dateGOGO(select_date._d);
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
    var filted_data = data_filter(data);
    var all_event_number = [];
    var init_value = 0;

    for (var foo in DB.serviceItems) {
      detail[DB.serviceItems[foo]] = "";
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
      //sorted the ojbect array for choosing the 3 highest areas
      district_sorted = Object.keys(district).sort(function(a, b) {
          return district[b] - district[a] 
        })

      detail[data[foo].item] = district_sorted[0] + district[district_sorted[0]] + "件<br>" + district_sorted[1] + district[district_sorted[1]] + "件<br>" + district_sorted[2] + district[district_sorted[2]] + "件<br>";
    }

    for (var foo in filted_data.children) {
      if (filted_data.children[foo].value >= init_value) {
        init_value = filted_data.children[foo].value;
        // show_text = filted_data.children[foo].item;
      }
      all_event_number.push(filted_data.children[foo].value);
    };

    var mean = d3.quantile(all_event_number, 0.1);
    bubble_data = bubble.nodes(filted_data)
      .filter(
        function(d) {
          return d.parent;
        }
      );

    if( option === 's'){
      var draw_node = svg.selectAll("circle")
      .data(bubble_data)
      .enter()
      .append("circle")
      .attr({
        cx: function(d) {
          return d.x;
        },
        cy: function(d) {
          return 0;
        },
        r: function(d) {
          return d.r;
        },
        fill: function(d, i) {
          return d.item_color;
        },
        id: function(d, i) {
          return "id" + d.item;
        },
        opacity: 0
      });
    }else{
      var draw_node = svg
        .selectAll("circle")
        .data(bubble_data)
    }

    draw_node
      .on("mouseover", function(thisData) {
        d3.select(this).attr({
          "stroke": "rgba(0, 0, 0, 0.2)",
          "stroke-width": 3,
        })
        tooltip_div.transition()
          .duration(100)
          .style({
            "opacity": 0.9
          });
        tooltip_div.html('<span class = "bubble_tooltipName">' + d3.select(this).attr("id").slice(2) + "( " + thisData.value + "件 )</span><br>" + detail[d3.select(this).attr("id").slice(2)])
          .style({
            "left": (d3.event.pageX) + "px",
            "top": (d3.event.pageY) + "px"
          });
      })
      .on("mouseout", function() {
        tooltip_div.transition()
          .duration(100)
          .style({
            "opacity": 0
          });
        d3.select(this).attr({
          "stroke-width": 1,
        });
      });

    if ( option === 's'){
      draw_node.transition()
        .duration(1000)
        .attr({
          opacity: 1,
          cy: function(d) {
            return d.y;
          },
        })
    }else{
      draw_node.transition()
        .duration(1000)
        .attr({
          cx: function(d) {
            return d.x;
          },
          cy: function(d) {
            return d.y;
          },
          r: function(d) {
            return d.r;
          },
        });
    }

    resetItemText();

    var text_node = svg.selectAll("#item_text")
      .data(bubble_data)
      .enter()
      .append("text")
      .attr({
        "x": function(d) {
          return d.x - 5;
        },
        "y": function(d) {
          return d.y - 5;
        },
        "id": "item_text"
      })
      .style({
        "text-anchor": "middle"
      })
      .text(function(d) {
        // return ;
        if (d.value > mean) {
          if ((d3.select("#id" + d.item).attr("r") / (d.item.length)) >= 7) {
            return d.item;
          }
        }
      })
      .transition()
      .duration(1000)
      .attr({
        x: function(d) {
          return d.x;
        },
        y: function(d) {
          return d.y;
        },
        opacity: 1
      })

    // ------- 取前三高的事件數顯示出來 ---------
    updateSideBox(data);
  }
 
  //解析api data!，之後可能會因為api更動而需要更改
  function data_filter(data) {
    var new_data = [];
    data.forEach(function(d, i) {
      var value = d.caseCount;
      var item_color = G.colorServiceItem[i];

      new_data.push({
        value: value,
        item_color: item_color,
        item: d.item
      });
    });
    //因為只需要一個pack，所以將data包於children中
    return { children: new_data };
  }


  // ----- Control Option Button ------
  //event紀錄interval事件，將其包於option可助於clearInterval刪除該事件
  var event;
  var play_state = 'pause';
  d3.select("#play_icon")
    .on("click", function() {
    	if(play_state === 'pause'){
    		play_state = 'play';

    		$('#play_icon')
    			.removeClass('fa-play')
    			.addClass('fa-pause')

    		$('html, body').animate(
          { scrollTop: $('#scroll_container').offset().top - 5},'easeInBack'
        )

        //以set interval來達到輪播更動
        // $('<style>input[type="range"]::-webkit-slider-thumb{left:' + 0 + '%;}</style>').appendTo("head");
        event = setInterval(function() {
          //以now_bar_value紀錄當前bar的數值，對齊作加減，假如等於now_data即不再更新
          // $('#header_id').remove();
          if (dateGOGO(select_date._d) != dateGOGO(now_date._d) && slider_value < 100) {
            var duration_set = moment.duration({ 'days': 1 });
            // console.log(select_date);
            select_date = select_date.add(duration_set);
            // console.log(dateGOGO(select_date._d));
            // d3.select('#show_date').text(dateGOGO(select_date._d));
            console.log(slider_value);
            slider_value = parseInt(slider_value) + (100 / duration_day);
            console.log(slider_value);
            change_slider(parseInt(slider_value));
            // console.log(slider_value);
            // $('#header_id').remove();
            // $('<style id="header_id">input[type="range"]::-webkit-slider-thumb{left:' + parseInt(slider_value) + '%;}</style>').appendTo("head");
            x = document.getElementById("slider_input");
            x.value = parseInt(slider_value);
            // 					d3.select(".d3-slider-handle")
            // 						.style({
            // 							left: function(){
            // 								//更新bar的數值，sytle:"left"
            // //								console.log((now_bar_value / duration_day)*100 + "%")
            // 								return ((now_bar_value / duration_day)*100) + "%";
            // 							}
            // 						});
            //TODO：改成api call的方式！
            //					json_data = G.getItemsData('2016-11-09', dateGOGO(select_date._d), ['新化區', '新營區']);
            // d3.json("../../src/faked2.json", function(error, data){
            // 	if (error){
            // 		console.log(error);
            // 	}
            // 	change(data);
            // })
            if (dateGOGO(select_date._d) === dateGOGO(now_date._d) || slider_value >= 100) {
              clearInterval(event);
            }
          } else {
          	console.log(event);
            clearIntnterval(event);
          }
        }, 2000)
      }else if(play_state === 'play'){
      	// Pause
      	play_state = 'pause';
	      clearInterval(event);

	      $('#play_icon')
    			.removeClass('fa-pause')
    			.addClass('fa-play')
      }else{
      	alert('這真的出錯了！！')
      }
    });

  d3.select("#stop_icon")
    .on("click", function() {
      //因為stop，將bar_value改回0，並更新svg!
      slider_value = 0;
      change_slider(slider_value)
      x = document.getElementById("slider_input");
      x.value = parseInt(slider_value);
      clearInterval(event);

      play_state = 'pause';
      $('#play_icon')
    			.removeClass('fa-pause')
    			.addClass('fa-play')

      // $('#show_date').text('按下播放鍵-播放動畫圖表')
    });

  function updateSideBox(data){
    var sortData = data.sort(function(a, b){
      if (a.caseCount < b.caseCount) {
        return 1;
      }
      else if (a.caseCount > b.caseCount){
        return -1;  
      }else{
        return 0; // a 必須等於 b
      }
    })

    $('.descriptionTime').text(dateGOGO(select_date._d));
    for ( var i = 0; i < 3; i++ ){
      $('.descriptionItem>#item' + i).text((i + 1) + '. ' + sortData[i].item + ': '+sortData[i].caseCount + '件');
    }
  }

  function resetItemText(){
    svg.selectAll("#item_text").remove();
  }
})()
