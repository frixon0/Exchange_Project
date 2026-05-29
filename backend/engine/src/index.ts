import { RedisClientType } from "@redis/client";
import { createClient } from "redis";

async function main(){
const engine = "engine";
const client:RedisClientType = createClient();
await client.connect();
while(true)
{
    const res = client.rPop("messages" as string);
    if(!res)
    {

    }
    else
    {
        //push to engine
    }
}
}
main();