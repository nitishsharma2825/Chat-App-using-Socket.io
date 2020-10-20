var socket=io()
const inputMessage=document.querySelector('#message')
const inputButton=document.querySelector('#inputbutton')
const locationButton=document.querySelector('#sendLocation')
const messages=document.querySelector("#msg")

// templates
const messageTemplate=document.querySelector("#msg-template").innerHTML
const locationTemplate=document.querySelector("#location-template").innerHTML
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})


const autoscroll=()=>{
    // new message
    const newMessage=messages.lastElementChild

    //height of the new message
    const newMessageStyles=getComputedStyle(newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=newMessage.offsetHeight+newMessageMargin

    // height of container
    const containerHeight=messages.scrollHeight
    // visible height
    const visibleHeight=messages.offsetHeight
    // How far i have scrolled
    const scrollOffset=messages.scrollTop+visibleHeight
    console.log(scrollOffset)
    if(containerHeight-newMessageHeight<=scrollOffset){
        messages.scrollTop=messages.scrollHeight
    }
}

socket.on('message',(msg)=>{
    const html=Mustache.render(messageTemplate,{
        username:msg.username,
        msg:msg.text,
        createdAt:moment(msg.createdAt).format('HH:mm:ss A')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

document.querySelector("#form").addEventListener('submit',(e)=>{
    inputButton.setAttribute('disabled','disabled')
    e.preventDefault()
    const msg=document.querySelector("#message").value
    console.log(msg)
    socket.emit('sendMessage',msg,(error)=>{
        console.log("Here")
        inputButton.removeAttribute('disabled')
        inputMessage.value=''
        inputMessage.focus()
        if(error){
            console.log(error)
        }
    })
})

socket.on('LocationMessage',(location)=>{
    console.log(location)
    const html=Mustache.render(locationTemplate,{username:location.username,location:location.url,createdAt:moment(location.createdAt).format('HH:mm:ss A')})
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

document.querySelector('#sendLocation').addEventListener('click',()=>{
    locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{lat:position.coords.latitude,long: position.coords.longitude},()=>{
            locationButton.removeAttribute('disabled')
            console.log('Location Sent')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})

socket.on('roomData',({users, room})=>{
const html=Mustache.render(sidebarTemplate,{users,room})
document.querySelector("#sidebar").innerHTML=html
console.log(users)
console.log(room)
})