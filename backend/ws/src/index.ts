import { WebSocketServer } from "ws";

const wss = new WebSocketServer({port:8081});
wss.on("connection",(socket)=>{
    //Usermanager.getInstance().addUser(socket);
})