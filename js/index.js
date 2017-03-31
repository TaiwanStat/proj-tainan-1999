initG();

$('.header_item').click(function() {
  G.select(this.id);
  if(this.id === 'area-focus') {
    if(!isFocusExist) {
      // remove semantic's time menu active
      $('.active').removeClass('active');
      $('.item[value="w"]').addClass('active');
      $('.focus_selectArea > .text').text('台南市');
      G.focusArea('Tainan', 'w');
    }
  }
  else if (!isBubbleExist) {
    bubbleChart();
  }
})

$('.header_left').click(function() {
  G.select(this.id);
})

