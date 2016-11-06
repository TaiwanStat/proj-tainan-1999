/*
  It's all by  `canner-core` to transform
*/
var route = [
  {
    data: {
      path: './',
      title: 'Hello guys',
      first_word: 'It is a good template'
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
    layout:  "./layout/map.hbs",
    filename: "./map.html"
  }
];
module.exports = route;