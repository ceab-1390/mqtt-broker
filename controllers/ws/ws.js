require('dotenv').config()
const { stdin } = require('process');
const {WebSocket} = require('ws'); 
const {v4: uuidv4} = require('uuid');
const emisor = require('events');
class emitComand extends emisor {};
const sendComand = new emitComand();

const socket = new WebSocket.Server({port: process.env.WS_PORT},()=>{
    console.log('WebSocket start on '+process.env.WS_PORT)
})

const clients = {};
const comand = {};

socket.on('connection', (ws,req) =>{
    const clientId = uuidv4();
    clients[clientId] = ws;
    console.log('Nueva conexion '+ clientId);
    ws.on('close', ()=>{
        delete clients[clientId]
        console.log('Conexion del cliente ' +clientId+' cerrada');
    });
    ws.on('message', data =>{
        data = JSON.parse(data);
        switch (data.type){
            case 'helo':
                clients[clientId].path = data.path
            break;
            case 'command':
                sendComand.emit('command',data);
            break;
        }
    });
    ws.onerror = function (){
        console.log('Error ws')
    }
});   



module.exports = {socket,clients,sendComand}