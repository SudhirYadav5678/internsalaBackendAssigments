import dotenv from "dotenv";
import connectDB from "./config/dbConnection.js";
import {app} from './app.js'
dotenv.config({path: './src/.env'});



connectDB()
.then(()=>{
    app.listen(`${process.env.PORT ||  8000}`, () =>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
    app.on("error",(error)=>{console.log("error in app listen",error)});
    
})
.catch((error)=>{
    console.log("connection error in MongoDb and Postgres", error);
})
