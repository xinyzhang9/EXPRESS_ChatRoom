var express = require('express');
var path = require('path');
var app = express();
app.use(express.static(path.join(__dirname,'./static')));
app.set('views',path.join(__dirname,'./views'));
app.set('view engine','ejs');

app.get('/',function(req,res){
	res.render('index');
})

var active_users = {};
var chat_log = "";

var server = app.listen(8000,function(){
	console.log('listening on port 8000...');
});

var io = require('socket.io').listen(server);

io.sockets.on('connection',function(socket){
	console.log('Socket ' + socket.id + ' has connected to the chatroom.');
	socket.on('create:name',function(data){
		if(active_users[data.username] === undefined){
			active_users[data.username] = socket.id;
			console.log('hello '+ data.username);
			console.log('your socket id is '+active_users[data.username]);
			socket.emit('send_all',{history: chat_log});
		}else{
			console.log("error: name exists");
			socket.emit('name:failed',{error:'name exists'});
		}
	})

	socket.on('send:message',function(data){
		chat_log += data.message;
		socket.broadcast.emit('send:new_message',{new_message:data.message});
		console.log(data);
	})


	socket.on('disconnect',function(socket){
		console.log('Socket ' + socket.id + ' has disconencted from the chatroom.')
	})

})



