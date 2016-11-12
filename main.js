var width = 800;
var format = d3.format(",d");
//對應33項之color array
var color = [
	"#E57373",
	"#D4E157", "#CDDC39",
	"#AB47BC", "#8E24AA",
	"#BA68C8",
	"#9FA8DA", "#7986CB", "#5C6BC0", "#3F51B5", "#3949AB", "#303F9F",
	"#283593", "#1A237E",
	"#B2DFDB", "#4DB6AC", "#009688", "#00796B", "#004D40",
	"#A5D6A7", "#81C784", "#66BB6A", "#66BB6A", "#43A047", "#388E3C", "#2E7D32",
	"#FFCCBC", "#FF8A65", "#FF5722", "#E64A19", "#BF360C",
	"#8D6E63", "#6D4C41"
];
var height = 600;
var data;
var json_data;
var padding = 2;
var json_data;
//parser data, 之後將改成call api的方式, 不需要d3.json
 d3.json("faked.json", function(error, data){
     if (error){
         console.log(error);
     }
     console.log(data);
     draw(data);
 });
//TODO:改成call api 並且改變最早時間
//			json_data = G.getItemsData('2016-11-09', '2016-11-09', ['新化區', '新營區']);
//draw(data);
//預先設置pack layout
var bubble = d3.layout.pack()
				  .sort(null)
				  .size([width, height])
				  .padding(padding);
//預先設置svg
var svg = d3.select("#chart")
			.append("svg")
			.attr({
				"width": width,
				"height": height,
				"class": "bubble_chart",
			});
//繪製option內容
option();
//使用moment.js來p解析時間
var select_date = moment("2016-11-09");//TODO:設定最早時間
var now_date = new moment();//取得當前時間
//以now_bar_value來紀錄當前bar的數值（因為bar是由sytle:"left:0%"決定
var now_bar_value = 0;
var duration_day = parseInt((now_date._d - select_date._d) / (1000 * 60 * 60 * 24));
var dateGOGO = d3.time.format("%Y-%m-%d");
d3.select('#scroll_bar').call(
	d3.slider().min(0).max(duration_day).step(1)
		.on("slide", function(evt, value) {
			now_bar_value = value;
			var duration_set = moment.duration({'days' : value});
			select_date = moment("2016-11-09").add(duration_set);
			d3.select('#show_date').text(dateGOGO(select_date._d));
			//改成call api
//			json_data = G.getItemsData('2016-11-09', dateGOGO(select_date._d), ['新化區', '新營區']);
			d3.json("faked2.json", function(error, data){
			 	if (error){
			 		console.log(error);
			 	}
				change(data);
			})
		})
);
//繪製最初的svg，因為之後都只會更新dom，所以不會再呼叫他了！
function draw(data){

    bubble_data = bubble.nodes(data_filter(data))
                        .filter(
                            function(d){
                                return d.parent;
                            }
                        );
    var draw_node = svg.selectAll("circle")
                    .data(bubble_data)
                    .enter()
                    .append("circle")
                    .attr({
                        cx: function(d){
                            return d.x;
                        },
                        cy: function(d){
                            return 0;
                        },
                        r: function(d){
                            return d.r;
                        },
                        fill: function(d,i){
                            return d.item_color;
                        },
						id: function(d, i){
							return d.item;
						},
						opacity: 0
                    })
					.on("mouseover", function(){
						d3.select(this).attr({
							"stroke": "rgba(0, 0, 0, 0.2)",
							"stroke-width": 2,
						})
						d3.select("#description").text(d3.select(this).attr("id"));
					})
					.on("mouseout", function(){
						d3.select(this).attr({
								"stroke-width": 0,
						});
					});
	draw_node.transition()
				.duration(1000)
				.attr({
					opacity: 1,
					cy: function(d){
						return d.y;
					},
				})
	var text_node = svg.selectAll("#item_text")
						.data(bubble_data)
						.enter()
						.append("text")
						.attr({
							"x": function(d){
								return d.x;
							},
							"y": function(d){
								return 0;
							},
							"id": "item_text"
						})
						.style({
							"text-anchor": "middle"
						})
						.text(function(d){
							if(d.value<=0){
									return;
							}else{
									return d.item;
							}
						})
						.transition()
						.duration(1000)
						.attr({
							"y": function(d){
								return d.y;
							},
						})
}
//更新svg的dom！因為api data的順序已經寫死，所以可以利用其對應關係做出更新
function change(data){
    bubble_data2 = bubble.nodes(data_filter(data))
                        .filter(
                            function(d){
                                return d.parent;
                            }
                        );
    var draw_node = svg.selectAll("circle")
                    .data(bubble_data2)
	draw_node.transition()
			.duration(1000)
			.attr({
				cx: function(d){
					return d.x;
				},
				cy: function(d){
					return d.y;
				},
				r: function(d){
					return d.r;
				},
			});
	//但text不更新dom，直接重新繪製
	svg.selectAll("#item_text").remove();
	var text_node = svg.selectAll("#item_text")
						.data(bubble_data2)
						.enter()
						.append("text")
						.attr({
							"id": "item_text"
						})
						.style({
							"text-anchor": "middle"
						})
						.text(function(d){
							if(d.value<=0){
									return;
							}else{
								return d.item;
							}
						})
						.attr({
							opacity: 0
						});
				text_node.transition()
						.duration(1000)
						.attr({
							x: function(d){
								return d.x;
							},
							y: function(d){
								return d.y;
							},
							opacity: 1
						})
}
//解析api data!，之後可能會因為api更動而需要更改
function data_filter(data) {
    var new_data = [];
    data.forEach(function(d, i) {
        var value = d.caseCount;
        var item_color = color[i];

        new_data.push({
            value: value,
            item_color: item_color,
            item: d.item
        });
    });
    //因為只需要一個pack，所以將data包於children中
	return {children: new_data};
}
//繪製option
function option() {
	//event紀錄interval事件，將其包於option可助於clearInterval刪除該事件
	var event;
	//對三個icon做出相對應的動作
	d3.select("#play_icon")
		.on("click", function(){
			//以set interval來達到輪播更動
			event = setInterval(function(){
				//以now_bar_value紀錄當前bar的數值，對齊作加減，假如等於now_data即不再更新
				if(dateGOGO(select_date._d) != dateGOGO(now_date._d))
				{
					var duration_set = moment.duration({'days' : 1});
					console.log(select_date);
					select_date = select_date.add(duration_set);
					console.log(dateGOGO(select_date._d));
					d3.select('#show_date').text(dateGOGO(select_date._d));
					now_bar_value++;
					d3.select(".d3-slider-handle")
						.style({
							left: function(){
								//更新bar的數值，sytle:"left"
//								console.log((now_bar_value / duration_day)*100 + "%")
								return ((now_bar_value / duration_day)*100) + "%";
							}
						});
				//TODO：改成api call的方式！
//					json_data = G.getItemsData('2016-11-09', dateGOGO(select_date._d), ['新化區', '新營區']);
					d3.json("faked2.json", function(error, data){
						if (error){
							console.log(error);
						}
						change(data);
					})
					if(dateGOGO(select_date._d) === dateGOGO(now_date._d)){
						clearInterval(event);
					}
				}else{
					clearIntnterval(event);
				}
				},2000)
		});

	d3.select("#pause_icon")
		.on("click", function(){
			clearInterval(event);
		});
	d3.select("#stop_icon")
		.on("click", function(){
		//因為stop，將bar_value改回0，並更新svg!
			now_bar_value = 0;
			d3.select('#show_date').text(dateGOGO(now_date._d));
			d3.select(".d3-slider-handle")
				.style({
					left: "0%"
					
				});
		//TODO
		//改成call api
		//			json_data = G.getItemsData('2016-11-09', dateGOGO(now_date._d), ['新化區', '新營區']);
			d3.json("faked2.json", function(error, data){
				if (error){
					console.log(error);
				}
				change(data);
			})
			clearInterval(event);
		});
	d3.select("#show_date").text()
}