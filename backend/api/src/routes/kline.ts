import { Router } from "express";
export const klineRouter =Router();
klineRouter.get("/",(req,res)=>{
  console.log("chart sent");  
})