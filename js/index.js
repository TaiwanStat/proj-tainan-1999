/*
* Global variable: G
*
* parameter ---
* @last	: last state
* @now : current state
* 
* method ---
* @select : select state
*/

var G = {
	last: $('#overview'),
	now: $('#overview'),
	select: function(id){
		G.last = G.now;
		G.now = $('#'+id);
		G.last.toggleClass('disable');
		G.now.toggleClass('disable');

		// set hash
		window.location.hash = id ;
	}
}

$('.item').click(function(){
	G.select(this.id.split('_')[1]);

	console.log('state: '+this.id.split('_')[1]);
})

