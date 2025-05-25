import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true,
}))

app.use(express.json({limit:"5000kb"}))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(express.static("public"))


//import router
import clientRouter from "./routes/client.router.js";
import partnerRouter from "./routes/partner.router.js";
import adminRouter from"./routes/admin.router.js";

// route declartion 
app.use("/api/v1/client",clientRouter)
app.use("/api/v1/partner",partnerRouter)
app.use("/api/v1/admin",adminRouter)

export {app}