const express=require('express')
const path = require('path')
const http=require('http')
const socketio=require('socket.io')
const app=express()
const Filter= require('bad-words')
const { generateMessage, generateLocationMessage }=require('./utils/messages')
const {addUser,getUser,getUsersInRoom,removeUser}=require('./utils/users')

const server=http.createServer(app)
const io=socketio(server)

const publicDirPath= path.join(__dirname,'../public')
app.use(express.static(publicDirPath))


io.on('connection',(socket)=>{

    socket.on('sendMessage',(msg,callback)=>{
        const user=getUser(socket.id)
        const filter =new Filter()
        if(filter.isProfane(msg)){
            callback("It is not allowed")
        }
        io.to(user.room).emit('message',generateMessage(user.username,msg))
        callback()
    })

    socket.on('join',({username,room},callback)=>{
        const { error, user}=addUser({id:socket.id,username,room})
        if(error){
            callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage(user.username,'Welcome'))
        socket.broadcast.to(user.room).emit('message',generateMessage(user.username,`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        
    })

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage(user.username,`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })
    socket.on('sendLocation',(location,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('LocationMessage',generateLocationMessage(user.username,`https://google.com/maps/?q=${location.lat},${location.long}`))
        callback()
    })
    console.log("New Connection Found")
})

// app.get('/',(req,res)=>{
//     res.render('index')
// })
server.listen(3000,()=>{
    console.log('Server Started')
})