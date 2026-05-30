import { createClient, RedisClientType } from "redis";
import { MessageToAPI } from "./types/to";

type DbMessage = {
    type: string;
    data: unknown;
};

type WsMessage = {
    stream: string;
    data: unknown;
};
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
public pushMessage(message: DbMessage) {
        this.client.lPush("db_processor", JSON.stringify(message));
    }

    public publishMessage(channel: string, message: WsMessage) {
        this.client.publish(channel, JSON.stringify(message));
    }
public sendtoAPI(clientID:string,message:MessageToAPI)
{
    this.client.publish(clientID, JSON.stringify(message));
}
}