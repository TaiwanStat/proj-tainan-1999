initG();

$('.header_item').click(function() {
  var section = $(this).data('myid');
  G.select(section);
  if(section === 'area-focus') {
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

  // If Mobile, disappear menu
  $('.mob-menu').removeClass('mob-menu-active');
})

$('#mob-support-icon').click(function() {
  $('.mob-support .supportBox').toggleClass('active');
})

$('.mob-active').click(function() {
  $('.mob-menu').toggleClass('mob-menu-active');
})



