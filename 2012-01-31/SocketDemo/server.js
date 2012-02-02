var http = require('http'),
	fs = require('fs'),
	socketIO = require('socket.io');

var config = {
	html: './public'
}

var server = http.createServer(function(req, res) {
	
	//Normaliza el nombre del archivo
	var file = req.url == '/'? '/index.html' : req.url;

	var st = fs.createReadStream(config.html + file);
	st.once('fd', function() {
		res.writeHead(200);
	});
	st.on('error', function(err) {
		res.writeHead(404);
		res.write(JSON.stringify(err));
		res.end();
	});
	st.pipe(res);
	
});

server.listen(3000);

var io = socketIO.listen(server);
 io.set('log level', 0);
 
function nuevo_color() {
  function c() { return Math.floor(Math.random()*256).toString(16) }
  return "#"+c()+c()+c();
}

var players = {};

setInterval(function() {
	io.sockets.emit('background', {color: nuevo_color()});
}, 700);


function sendThing() {

	setTimeout(sendThing, 1000*(Math.random()*3));
	
	var playerKeys = Object.keys(players);
	if (playerKeys.length<2) return;

	var idx = Math.ceil(Math.random() * playerKeys.length)-1;
	
	var choosen = players[playerKeys[idx]],
		randomImg = Math.ceil(Math.random() * 8);

	io.sockets.socket(choosen.id).broadcast.emit('thing', {display: 'block', img: randomImg+''})
	io.sockets.socket(choosen.id).emit          ('thing', {display: 'block', img: 'win'});
}
sendThing();

io.sockets.on('connection', function(socket) {

	var addr = socket.handshake.address;
	console.log('CONN: ', addr, ' con id: ', socket.id);
	
	var player = players[socket.id] = {host: addr.address, port: addr.port, id: socket.id, points: 0, name: '?'};
	
	socket.on('start', function(data) {
		console.log('USER: ', addr, '->', data);
		player.name = data;
		io.sockets.emit('points', players);
	});
	
	socket.on('disconnect', function() {
		console.log('QUIT: ', player.name, socket.id);
		delete players[socket.id];
		io.sockets.emit('points', players);
	});
	
	socket.on('guess', function(data) {
		console.log('GUES:', player.name, data);

		if (data.code=='win') 
			player.points += 10;
		else
			player.points -= 15;

		io.sockets.emit('points', players);
	});
	
});