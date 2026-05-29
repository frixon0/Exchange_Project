import { createClient, RedisClientType } from "redis";
import { MessageToAPI } from "./types/to";
export class RedisManager{
private client:RedisClientType
private static instance: RedisManager
private constructor()
{
    this.client = createClient();
     this.client.connect()
}
public static getInstance(){
    if(!this.instance)
    {
        this.instance = new RedisManager();
    }
    return this.instance;
}
public sendtoAPI(clientID:string,message:MessageToAPI)
{
    this.client.publish(clientID,message);
}
}