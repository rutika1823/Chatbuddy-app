const chatForm = document.getElementById('chat-form')//form chat html file
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

//get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
})

// console.log(username, room);

const socket = io()

//Join chatroom
socket.emit('joinRoom', { username, room })

//get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room)
  outputUsers(users)
})

//load messages 
socket.on('load', data => {
  loadChat(data)
})
//(here gets the broadcast welcome or any other message from server.js)
//Message form serverjs
socket.on('message', message => {
  console.log(message)

  outputMessage(message)

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
  })

//Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault()

    //get message text
    const msg = e.target.elements.msg.value

    // if (!msg) {
    // return false;
    // }

    //Emit message to server
    socket.emit('chatMessage', msg)
    
    //clear input
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
  })

//Output message to DOM
//(each first div class has sub div class that used here message from chat.html)

function outputMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text"> ${message.text} </p>`
  document.querySelector('.chat-messages').appendChild(div)
}

function loadChat(chat) {
  chat.map(c => {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${c.sender} <span>${c.timestamp}</span></p>
      <p class="text"> ${c.message} </p>`
    document.querySelector('.chat-messages').appendChild(div)
  })
}

//Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room
}

//Add room users to DOM
function outputUsers(users) {
  userList.innerHTML = `${users
    .map(user => `<li>${user.username}</li>`)
    .join('')}`
}