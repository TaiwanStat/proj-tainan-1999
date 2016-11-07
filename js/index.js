
$('.item').click(function(){
	G.select(this.id.split('_')[1]);
	// G.getData();
	console.log('state: '+this.id.split('_')[1]);
})

