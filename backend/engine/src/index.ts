import { RedisClientType } from "@redis/client";
import { createClient } from "redis";
import { Engine } from "./trade/Engine";

async function main(){
const engine = new Engine();
const client:RedisClientType = createClient();
await client.connect();
while(true)
{
    const res = await client.rPop("messages" as string);
    if(!res)
    {

    }
    else
    {
        const {clientId, message} = JSON.parse(res);
        engine.process({message, clientId});

        //push to engine
    }
}
}
main();