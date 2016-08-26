// Setup basic express server
   // 作者：whitebaby
   //  邮箱：632244160@qq.com
   //  移动端地址：http://shouji.baidu.com/software/9797753.html 
   //  版本v1.0.0 
var express = require('express');
var app = express();
// var server = require('http').createServer(app);
// var io = require('../..')(server);
var port = process.env.PORT || 3000;
var server1 = require('http').createServer(app);
server1.listen(port, function () {
  console.log('Server listening at port %d', port);
});
var io = require('socket.io')(server1);

var https = require('https'),fs = require("fs");
var options = {
    key: fs.readFileSync('private.key'),
    cert: fs.readFileSync('certificate.crt')
};
var server2 = https.createServer(options,app).listen(3011, function() {
    console.log('Https server listening on port ' + 3011);
});
var io2 = require('socket.io')(server2);
// Routing
app.use(express.static(__dirname + '/public'));
app.all('*', function(req, res, next) {  
    res.header("Access-Control-Allow-Origin", "*");  
    res.header("Access-Control-Allow-Headers", "X-Requested-With");  
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");  
    res.header("X-Powered-By",' 3.2.1')  
    res.header("Content-Type", "application/json;charset=utf-8");  
    next();  
});  
// Chatroom
// var roomList2 = [{ roomID: 1, roomMember: ["user1", "user111"] }, { roomID: 2, roomMember: [] }, { roomID: 3, roomMember: ["user5", "user6"] }, { roomID: 4, roomMember: ["user4", "user44"] },{ roomID: 5, roomMember: ["user5"] },{ roomID: 6, roomMember: ["user6"] }];
var roomList2 = [{ roomID: 1, roomMember: [] }, { roomID: 2, roomMember: [] }, { roomID: 3, roomMember: [] }, { roomID: 4, roomMember: [] },{ roomID: 5, roomMember: [] },{ roomID: 6, roomMember: [] }];
//获取当前房间数
var roomlength = roomList2.length;
var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    targetRoom = userLogin(socket.username);
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });
  //房间查找
  socket.on('roomFind', function (username) {
    targetRoom = roomFind();
    socket.emit('roomFindResult', {
      targetRoom:targetRoom
    });
    console.log(username+" is finding roomID" +targetRoom);
    // echo globally (all clients) that a person has connected
  });
  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;
      userLogout(socket.username);
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

// io2.set('match original protocol', true);
io2.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    targetRoom = userLogin(socket.username);
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });
  //房间查找
  socket.on('roomFind', function (username) {
    targetRoom = roomFind();
    socket.emit('roomFindResult', {
      targetRoom:targetRoom
    });
    console.log(username+" is finding roomID" +targetRoom);
    // echo globally (all clients) that a person has connected
  });
  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;
      userLogout(socket.username);
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

function userLogin(userName) {
    //此处roomID，可以直接传入roomFind()函数 
    //遍历查找房间，添加用户到制定房间
    var roomID = roomFind();
    for (var i = 0; i < roomlength; i++) {
        if (roomList2[i]['roomID'] === roomID) {
            roomList2[i]['roomMember'].push(userName) + 1;
            // console.log(typeof(handleRoom));
            console.log(userName + " login " + roomID + " Room");
        }
    }
    console.log(roomList2);
    return roomID;
}

function userLogout(userName) {
    //遍历查找房间，添加用户到制定房间
    for (var i = 0; i < roomlength; i++) {
        for (var j = 0; j < roomList2[i]['roomMember'].length; j++) {
            if (roomList2[i]['roomMember'][j] === userName) {
                roomList2[i]['roomMember'].splice(j, 1);
                var handleRoom = i+1;
                console.log(typeof(handleRoom));
                console.log(userName + " logout " + handleRoom + " Room");
            }
        }
    }
    console.log(roomList2);
}

function roomFind() {
    // console.log(username+" is findingRoom");
    // 房间查找，先筛选一个人的房间
    var hasTwoPerson = [];
    var hasOnePerson = [];
    var hasZeroPerson = [];
    for (var i = 0; i < roomlength; i++) {
        if (roomList2[i]['roomMember'].length === 1) {
            hasOnePerson.push(roomList2[i]['roomID']);
        }
    }
    if (hasOnePerson.length === 0) {
        //当没有一人房间时候，检查空房间
        console.log("noOnePerson");
        for (var i = 0; i < roomlength; i++) {
            if (roomList2[i]['roomMember'].length === 0) {
                hasZeroPerson.push(roomList2[i]['roomID']);
            }
        }
        roomIDRuslt = Math.min.apply(null, hasZeroPerson);
    } else {
    // console.log(roomList2);
        //当筛选空房间列表不为0时候
        roomIDRuslt = Math.min.apply(null, hasOnePerson);
    }
    console.log("Now " + roomIDRuslt + " is Target RoomID");
    return roomIDRuslt;
}
// var targetRoom = roomFind();