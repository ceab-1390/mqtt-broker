require('dotenv').config()
const { stdin } = require('process');
const {WebSocket} = require('ws'); 
const {v4: uuidv4} = require('uuid');

const socket = new WebSocket.Server({port: process.env.WS_PORT},()=>{
    console.log('WebSocket start on '+process.env.WS_PORT)
})

const clients = {};

socket.on('connection', (ws,req) =>{
    const clientId = uuidv4();
    clients[clientId] = ws;
    console.log('Nueva conexion '+ clientId);
    ws.on('close', ()=>{
        delete clients[clientId]
        console.log('Conexion del cliente ' +clientId+' cerrada');
    });
    ws.on('message', data =>{
        console.log('Mensaje del cliente ID: '+clientId+ ': '+data );
        console.log('Respuesta: ')
    });
    ws.onerror = function (){
        console.log('Error ws')
    }
});   



module.exports = {socket,clients}