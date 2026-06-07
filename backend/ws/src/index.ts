import { WebSocketServer } from "ws";
import { UserManager } from "./UserManager";

const wss = new WebSocketServer({port:8081});
wss.on("connection",(socket)=>{
    UserManager.getInstance().addUser(socket);
})
