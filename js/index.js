initG();
$('.header_item').click(function() {
  G.select(this.id);

  if(this.id === 'item_focus'){
  	// remove semantic's time menu active
    $('.active').removeClass('active')
    $('.item[value="w"]').addClass('active');
    G.focusArea('all', -1);
  }
  console.log('state: ' + this.id.split('_')[1]);
})

$('.header_left').click(function(){
	G.select(this.id);
})

