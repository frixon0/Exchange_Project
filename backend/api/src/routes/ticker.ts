import { Router } from "express";
export const tickerRouter =Router();
tickerRouter.get("/",(req,res)=>{
  console.log("ticker sent");  
})