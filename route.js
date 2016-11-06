/*
  It's all by  `canner-core` to transform
*/
var route = [
  {
    data: {
      path: './',
      title: 'Tainan-1999'
    },
    partials: './partial.js',
    layout:  "./layout/index.hbs",
    filename: "./index.html"
  },{
    data: {
      path: './',
    },
    partials: './partial.js',
    layout:  "./layout/donutChart.hbs",
    filename: "./donutChart.html"
  },{
    data: {
      path: './',
    },
    partials: './partial.js',
    layout:  "./layout/ching_map.hbs",
    filename: "./ching_map.html"
  }
];
module.exports = route;