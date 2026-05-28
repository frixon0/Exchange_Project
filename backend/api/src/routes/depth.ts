import { Router } from "express";
import { RedisManager } from "../reddisManager";
import { GET_DEPTH } from "../types";
export const depthRouter =Router();
depthRouter.get("/depth",async(req,res)=>{
    const response  = await RedisManager.getInstance().sendAndAwait({
        type:GET_DEPTH,
        data:{
            market: req.query.market as string
        }
    })
    res.json(response.payload)
   
})