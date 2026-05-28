import { createClient,RedisClientType } from "redis";
import { MsgToEngine } from "./types/to";
import { MessageFromOrderbook } from "./types";
export class RedisManager {
    private client:RedisClientType
    private publisher:RedisClientType
    private static instance: RedisManager 
    private constructor() {
        this.client = createClient();
        this.client.connect();
        this.publisher = createClient(); 
        this.publisher.connect();
    }
    public static getInstance(): RedisManager {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager();
        }     return RedisManager.instance;
    }
    public sendAndAwait(message: MsgToEngine){
        return new Promise<MessageFromOrderbook>((resolve)=>{
            const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            this.client.subscribe(id, (message) => {
                resolve(JSON.parse(message));
            });
            this.publisher.publish("requests", JSON.stringify({ id, message }));
        });
    }
}
