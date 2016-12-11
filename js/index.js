initG();

$('.header_item').click(function() {
  G.select(this.id);
  if(this.id === 'area-focus') {
    // remove semantic's time menu active
    $('.active').removeClass('active')
    $('.item[value="w"]').addClass('active');
    $('.focus_selectArea > .text').text('台南市');
    G.focusArea('all', 38);
  }
  else if (!isBubbleExist) {
    bubbleChart();
  }
})

$('.header_left').click(function() {
  G.select(this.id);
})

