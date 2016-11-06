var width = 400,
    height = 325;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
d3.json("../../src/county.json", function(topodata) {
    var subunits = topojson.feature(topodata, topodata.objects["Town_MOI_1041215"]);
    console.log(subunits);
    var projection = d3.geo.mercator()
        .scale(500)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path().projection( // 路徑產生器
        d3.geo.mercator().center([120.85, 23]).scale(30000) // 座標變換函式
    );

    svg.append("path")
        .datum(subunits)
        .attr("d", path);

    svg.selectAll(".subunit")
        .data(subunits.features)
        .enter().append("path")
        .attr("class", function(d) {
            return d.properties.C_Name === "臺南市" ? "subunit " : "foo"; //tag foo to be removed later
        })
        .style("fill", function(d) {
            return "hsl(" + Math.random() * 360 + ",50%,60%)";
        })
        .style("opacity", function(d) {
            var style = 1;
            if (!(d.properties.C_Name === "臺南市")) style = 0;
            return style;
        })
        .style("stroke-width", .5)
        .style("stroke", "white")
        .on("click", function(d, i) {
            console.log(d.properties.T_Name);
        })
        .attr("d", path);

    //remove the background taiwan
    svg.select("path").remove();
    //remove foo
    var foo = d3.selectAll("path.foo").remove();
});
