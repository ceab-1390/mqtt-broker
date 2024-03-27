require('dotenv').config()
const aedes = require('aedes')();
const mqtt_server = require('net').createServer(aedes.handle);
const {Users,Control,Device} = require('./model/models');
const {v4} = require('uuid');
const {socket,clients,sendComand} = require('./controllers/ws/ws');
const Bcrypt = require('bcryptjs');
const port = 1883;


mqtt_server.listen(port, ()=>{
    console.log('listen on: '+port);
})
let pass = false;
//auth
aedes.authenticate = async (client, username, password, callback)=>{
    const usuario = await Users.findOne(username);
    if (usuario){
        pass = Bcrypt.compareSync(String(password),usuario.password);
    }else{
        pass = false;
    }
    if (!usuario || !pass ){
        console.log('Usuario o clave invalida');
        return callback(null,false)
    }else{
        client.id = usuario.id +'_'+ v4()
        //console.log( 'Nuevo cliente conectado : '+client.id)
        return callback(null,true)
    }
    
}


aedes.on('subscribe', (payload,client)=>{
    console.log('=========================================================')
    console.log('Subscriptor: '+ client.id +' On topic: ' +payload[0].topic)
})

aedes.on('client',(client,a,b,c)=>{
    //console.log(client.id)
});

aedes.on('publish',async (packet,client)=>{
    if (!packet.topic.startsWith('$SYS')){
        
        if (packet.topic == 'config'){
            let config = {};
            config = JSON.parse(packet.payload.toString())
            if (config.topic == 'config'){
                let dataDevice = config.data
                let userId = await Users.findOne(dataDevice.user);
                userId = userId.id;
                dataDevice.userId = userId;
                //console.log(dataDevice)
                let device = await Device.createOne(dataDevice);
                if (device){
                    console.log("Se registro un nuevo dispositivo: "+dataDevice.name)
                }
            }
        }else if (packet.topic == 'command' && packet.payload != ''){
            console.log('Comando')
        }else if(packet.payload != ''){
        temp = packet.payload.toString()
        Object.values(clients).forEach(client => {
            client.send(temp);
        });
        }
    }

});

aedes.on('disconnect', (client) => {
    //console.log('Cliente desconectado: ' + client.id);
});

sendComand.on('command', async (command)=>{
    await aedes.publish({topic:'command',payload: command.comand});
})

function run_action(packet,the_action){
    aedes.publish({topic: packet.topic, payload : the_action});
}


