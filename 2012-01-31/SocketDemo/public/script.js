$ = function(arg) { return document.querySelector(arg); };

random = function(from, to) {
	return Math.ceil(Math.random() * (to-from)) + from;
 }

	 
load = function() {
	var name = prompt('Who are you?');
	startGame(name);
}

startGame = function(name) {

	socket = io.connect('http://localhost');

	socket.emit('start', name);
	
	 socket.on('background', function(data) {
		$('body').style.backgroundColor = data.color;
	 })

	 socket.on('thing', function(data) {
		$('#thing').setAttribute('src', 'img/'+data.img+'.png');
		$('#thing').setAttribute('data-img', data.img);
		
		$('#thing').style.display = data.display;
		$('#thing').style.opacity = 0.8;
		$('#thing').style.top  = random(100,window.innerHeight-250) + 'px';
		$('#thing').style.left = random(100,window.innerWidth-200) + 'px';
		
		setTimeout(function() {
			$('#thing').style.opacity = 0;
		}, 500);

	 });
	 
	 socket.on('points', function(players) {
		var txt = '<tr><td>Name</td><td>Points</td></tr>';
		Object.keys(players).forEach(function(k) {
			var player = players[k];
			txt += '<tr><td>' + player.name + '</td><td>' + player.points  + '</td></tr>';
		});
		$('#points').innerHTML = txt;
	 });
	 
	click = function(el) {
		var code = el.getAttribute('data-img');
		socket.emit('guess', {code: code});
		console.log('emite: ', code);
	}
	
}
 