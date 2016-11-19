$('.item').click(function(){
	G.select(this.id);
	console.log('state: '+this.id.split('_')[1]);
})

