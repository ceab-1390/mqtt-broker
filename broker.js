require('dotenv').config()
const aedes = require('aedes')();
const mqtt_server = require('net').createServer(aedes.handle);
const {Users} = require('./model/models');
const {v4} = require('uuid');
const {socket,clients} = require('./controllers/ws/ws');
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

aedes.on('publish', (packet,client)=>{
    if (!packet.topic.startsWith('$SYS')){
  
        temp = packet.payload.toString()
        Object.values(clients).forEach(client => {
            client.send(temp);
        });
        /*if (temp.startsWith('act')){
            console.log('Se envio la accion: '+temp);
        }else if (!isNaN(Number(temp))){
            const message = temp.toString().trim(); // Elimina los saltos de línea
            Object.values(clients).forEach(client => {
                client.send(message);
            });
            /*if (temp >= 50){
                console.log('Alta temperatura');
                the_action = 'act_1'
                run_action(packet,the_action);
            }*/


        //}
    }

});

aedes.on('disconnect', (client) => {
    //console.log('Cliente desconectado: ' + client.id);
});

function run_action(packet,the_action){
    aedes.publish({topic: packet.topic, payload : the_action})
    
}