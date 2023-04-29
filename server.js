const express = require('express');
const path = require('path');//node js core module
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/message')
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./utils/users')
const mysql = require('mysql')
// const fs = require('fs');

// const {
//   DATABASE_HOST,
//   DATABASE_USER,
//   DATABASE_PASSWORD,
//   DATABASE_NAME
// } = require('./config')

//initialize variable
const app = express()
const server = http.createServer(app)
const io = socketio(server)


//DB Config
const db = mysql.createConnection({
  host : 'localhost' , 
  user : 'root' , 
  password : 'rutika' , 
  database : 'chatbuddy'
})


db.connect((err) => {
  if(err) console.log(err)
  else {
    console.log('Database is connected and running !')
    server.listen(process.env.PORT || 3000, () => console.log('Server running'))
  }
});


//set static folder
app.use(express.static(path.resolve(__dirname, 'public')))

const botName = 'ChatBuddy App';// Name of the application 

//run when client connects
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(room)

    
    //welcome current user
    // console.log('New WS Connection...');
    socket.emit('message', formatMessage(botName, 'Welcome to ChatBuddy!!'))
    
      db.query('select * from messages where room = ?', [room], (err,data) => {
          // console.log("Yeh run ho rha hai")
          if(err) console.log('Could not get messages')
          io.to(room).emit('load', data);
    })
 
    //Broadcast when a user connects
    socket.broadcast
    .to(user.room)
    .emit(
      'message',
      formatMessage(botName, `${user.username} has joined the chat`)
    )//to all client expect client which is

    //send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    })
  })

    //io.emit()//to all other client which are connected

    //Listen for chatMessage (this can be seen in the terminal of vscode)

    socket.on('chatMessage', (message) => {
      const user = getCurrentUser(socket.id)
      console.log("User info is : ", user)     
        db.query('insert into messages(sender,message,room) values (?,?,?)', [user.username,message,user.room], (err,data) => {
        if(err) console.log('Not entered in the database !')
      })   
      io.to(user.room).emit('message', formatMessage(user.username, message))
    })

    //Runs when client disconnects
    socket.on('disconnect', () => {
      const user = userLeave(socket.id)
  
      if (user) {
        io.to(user.room).emit(
          'message',
          formatMessage(botName, `${user.username} has left the chat`)
        )
     
          // Send users and room info
          io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room),
          })
        }
      })
    })


    