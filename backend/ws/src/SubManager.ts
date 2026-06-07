import { createClient, RedisClientType } from "redis"
import { UserManager } from "./UserManager";

export class SubManager{
    private subscriptions : Map<string,string[]> = new Map();
    private redisClient : RedisClientType
    private channeldetail:Map<string,string[]> =new Map();
    private static instance:SubManager;
    private constructor(){
        this.redisClient = createClient();
        this.redisClient.connect();
    }
    public static getInstance(){
        if(!this.instance)
        {
            this.instance = new SubManager();
        }
        return this.instance;
    }
    public subscribe(userId:string,stream:string){
        if(!this.subscriptions.get(userId)?.includes(stream))
        {
            const connec_streams = this.subscriptions.get(userId) || [];
            connec_streams.push(stream);
            this.subscriptions.set(userId,connec_streams);
            const connec_users = this.channeldetail.get(stream) || [];
            connec_users.push(userId);
            this.channeldetail.set(stream,connec_users);
            if(this.channeldetail.get(stream)?.length=== 1)
            {
                this.redisClient.subscribe(stream,(message:string)=>{
                    this.channeldetail.get(stream)?.forEach(s=>UserManager.getInstance().getUser(s)?.emit(JSON.parse(message)));
                })
            }
        }
        else{
            return
        }


    }
    public unsubscribe(userId:string,stream:string)
    {
        const connec_streams = this.subscriptions.get(userId);
        if(connec_streams)
        {
            this.subscriptions.set(userId,connec_streams.filter(x=>x!=stream));
        }
         const connec_users = this.channeldetail.get(stream);
         if(connec_users)
         {
            this.channeldetail.set(stream,connec_users.filter(x=>x!=userId));
            if(this.channeldetail.get(stream)?.length===0)
            {
                this.channeldetail.delete(stream);
                this.redisClient.unsubscribe(stream);
            }
         }

    }
    
    public leftuser(userId:string)
    {
         this.subscriptions.get(userId)?.forEach(s=>this.unsubscribe(userId,s));    
    }


}
