var width=400,height=325,svg=d3.select("#map").append("svg").attr("width",width).attr("height",height);d3.json("../../src/county.json",function(t){var e=topojson.feature(t,t.objects.Town_MOI_1041215);console.log(e);var o=(d3.geo.mercator().scale(500).translate([width/2,height/2]),d3.geo.path().projection(d3.geo.mercator().center([120.85,23]).scale(3e4)));svg.append("path").datum(e).attr("d",o),svg.selectAll(".subunit").data(e.features).enter().append("path").attr("class",function(t){return"臺南市"===t.properties.C_Name?"subunit ":"foo"}).style("fill",function(t){return"hsl("+360*Math.random()+",50%,60%)"}).style("opacity",function(t){var e=1;return"臺南市"!==t.properties.C_Name&&(e=0),e}).style("stroke-width",.5).style("stroke","white").on("click",function(t,e){console.log(t.properties.T_Name)}).attr("d",o),svg.select("path").remove();d3.selectAll("path.foo").remove()});