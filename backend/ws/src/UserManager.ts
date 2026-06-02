import { WebSocket } from "ws";
import { User } from "./User";
import { SubManager } from "./SubManager";
export class UserManager {
    private Users : Map<string,User> = new Map()
    
    private static instance:UserManager;
    private constructor()
    {
        
    }
    public static getInstance(){
        if(this.instance)
        {
            return this.instance
        }
        else
        {
            this.instance = new UserManager();
            return this.instance;
        }
    }
    public addUser(ws:WebSocket){
        const id = getrandomId();
        const user  = new User(ws,id);
        this.Users.set(id,user);
        this.registerOnclose(ws,id);
        return user;
    }
    registerOnclose(socket:WebSocket,id:string){
        socket.on('close',()=>{
            this.Users.delete(id);
            // unsubcribe logic
            SubManager.getInstance().leftuser(id);
        })
    }
    public getUser(id: string) {
        return this.Users.get(id);
    }

}
function getrandomId():string
{  
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}