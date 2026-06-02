import { WebSocket } from "ws"
import { IncomingMessage, SUBSCRIBE, UNSUBSCRIBE } from "./types/in";
import { SubManager } from "./SubManager";
import { OutgoingMessage } from "./types/out";
export class User{
    private ws:WebSocket
    private id:string
    public constructor(socket:WebSocket,id:string)
    {
        this.ws = socket;
        this.id = id;
        this.addListeners();
    }
      emit(message: OutgoingMessage) {
        this.ws.send(JSON.stringify(message));
    }

    addListeners(){
        this.ws.on("message",(message:string)=>{
            const parsedmessage:IncomingMessage = JSON.parse(message);
            if(parsedmessage.method ===SUBSCRIBE)
                {
                    parsedmessage.params.forEach(s=>SubManager.getInstance().subscribe(this.id,s));
                } 
            if(parsedmessage.method===UNSUBSCRIBE)
            {
                parsedmessage.params.forEach(s=>SubManager.getInstance().unsubscribe(this.id,s));
            }
        })
        
    }

}