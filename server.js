var http = require('http')
var express = require('express'),
	app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server);//引入socket.io模块，并绑定到服务器
    users = []; //保存所有在线的用户
app.use('/',express.static(__dirname+'/www'))//指定静态html文件的位置

// server.on('request',function(req,res){
// 	res.writeHead(200,{'Content-Type':'text/plain'})
// 	res.write('hello world')
// 	res.end()
// })
//在connection事件的回调函数中，socket表示的是当前连接到服务器的那个客户端。
//所以代码socket.emit('foo')则只有自己收得到这个事件，而socket.broadcast.emit('foo')则表示向除自己外的
//所有人发送该事件，另外，上面代码中，io表示服务器整个socket连接，所以代码io.sockets.emit('foo')
//表示所有人都可以收到该事件。
io.on('connection',function(socket){
	//接受并处理客户端发送的foo事件
	socket.on('foo',function(data){
		console.log(data)
	})
	socket.on('login',function(nickName){
		//检查用户名是否存在
		//console.log('名字已发送到服务端')
		if(users.indexOf(nickName)>-1){
			//如果存在则触发nickExisted事件,告诉当前客户端
			socket.emit('nickExisted');
		}
		else{
			socket.userIndex = users.length;
			socket.nickName = nickName;
			users.push(nickName);
			socket.emit('longinSuccess');
			//向所有连接到服务器的客户端发送当前登陆用户的昵称 (包括自己)
			io.sockets.emit('system',nickName,users.length,'login');
		}
	})
	//某客户端离开
	socket.on('disconnect',function(){
		//将断开连接的用户从users中删去  
		users.splice(socket.userIndex,1);
		//告诉所有用户，除了自己
		socket.broadcast.emit('system',socket.nickName,users.length,'logout')
	})
	//从客户端接受聊天的内容
	socket.on('postMsg',function(msg,color){
		//然后发送给出自己之外的人
		socket.broadcast.emit('newMsg',socket.nickName,msg,color)
	})
	socket.on('img',function(imgData){
		//广播图片给非本机客户端
		console.log('recevice img')
		socket.broadcast.emit('newImg',socket.nickName,imgData);
	})
})

server.listen(8080);
console.log('server running...')