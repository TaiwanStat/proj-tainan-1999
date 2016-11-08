
$('.item').click(function(){
	G.select(this.id.split('_')[1]);
	console.log('state: '+this.id.split('_')[1]);
})

