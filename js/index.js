initG();
$('.header_item').click(function() {
  G.select(this.id);

  if(this.id === 'area-focus'){
  	// remove semantic's time menu active
    $('.active').removeClass('active')
    $('.item[value="w"]').addClass('active');
    G.focusArea('all', 38);
  }
  else if (!isBubbleExist){
    bubbleChart();
  }
  console.log('state: ' + this.id.split('-')[1]);
})

$('.header_left').click(function(){
	G.select(this.id);
})

