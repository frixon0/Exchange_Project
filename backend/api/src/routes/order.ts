import { Router } from "express";
import { RedisManager } from "../reddisManager";
import { CANCEL_ORDER, CREATE_ORDER, GET_BALANCE, GET_OPEN_ORDERS, ON_RAMP } from "../types";
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
orderRouter.get("/on_ramp",async(req,res)=>{
    const {userId,amount} =req.body();
    const response = await RedisManager.getInstance().sendAndAwait({
        type:ON_RAMP,
        data:{
            userId: userId,
            amount: amount 
        }
    })
    res.json(response.payload);
})
orderRouter.get("/balance",async(req,res)=>{
    const userId = req.body();
    const currency= req.body();
    const response = await RedisManager.getInstance().sendAndAwait({
        type:GET_BALANCE,
        data:{
            userId:userId,
            Asset:currency
        }
        
    })
    res.json(response.payload)
})
