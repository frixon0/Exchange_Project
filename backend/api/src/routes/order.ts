import { Router } from "express";
import { RedisManager } from "../reddisManager";
import { CANCEL_ORDER, CREATE_ORDER, GET_OPEN_ORDERS } from "../types";
export const orderRouter =Router();
orderRouter.post("/",async(req,res)=>{
    const {market,side,price,quantity,userId} = req.body;
    const response  = await RedisManager.getInstance().sendAndAwait({
        type:CREATE_ORDER,
        data:{
            market,
            side,
            price,
            quantity,
            userId
        }
    })
    res.json(response.payload);
})
orderRouter.delete("/",async(req,res)=>{
    const {orderId, userId }= req.body();
    const response =  await RedisManager.getInstance().sendAndAwait({
        type:CANCEL_ORDER,
        data:{
            orderId,
            userId
        }
    })
    res.json(response.payload);

})
orderRouter.get("/open",async(req,res)=>{
    const response = await RedisManager.getInstance().sendAndAwait({
        type:GET_OPEN_ORDERS,
        data:{
            userId: req.query.userId as string, 
            market: req.query.market as string
        }
    })
    res.json(response.payload);
})
