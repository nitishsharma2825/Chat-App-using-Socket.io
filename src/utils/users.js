const users=[]

const addUser=({id, username, room})=>{
    //cleaning data
    username=username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validating data
    if(!username||!room){
        return {
            error:'Username and room are required'
        }
    }

    //checking uniqeness
    const existingUser=users.find((user)=>{
        return user.room==room&&user.username==username
    })

    if(existingUser){
        return {
            error:'Username is in use'
        }
    }

    const user={
        id,username,room
    }
    users.push(user)
    return {user}

}
const removeUser=(id)=>{
    const index=users.findIndex((user)=>{
        return user.id === id
    })
    return users.splice(index,1)[0]   //splice returns an array
}

const getUser=(id)=>{
    const index=users.findIndex((user)=>{
        return user.id === id
    })
    if(index==-1){
        return {};
    }
    return users[index]
}

const getUsersInRoom=(room)=>{
    const roomUsers=users.filter((user)=>{
        return user.room===room.trim().toLowerCase()
    }) 
    return roomUsers
}

module.exports = {
    addUser,getUser,getUsersInRoom,removeUser
}
