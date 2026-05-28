import { Router } from "express";
export const tradeRouter =Router();
tradeRouter.get("/",(req,res)=>{
  console.log("trades sent");  
})