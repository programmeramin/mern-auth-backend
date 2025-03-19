import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import cors from "cors"
import { ConnectDB } from "./DB/ConnectDB.js";
import authRouter from "./Routes/auth.route.js";
import cookieParser from "cookie-parser"
import path from "path";

// dotenv config
dotenv.config();
 
const PORT = process.env.PORT || 6060;
// init app
const app = express();
const __dirname = path.resolve();


app.use(cors({
 origin: ["https://mern-auth-frontend-xsgb.vercel.app"],
 method: ["GET", "POST"]
 credentials: true}));
 

//middleware
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser()); // Allow us to parse cookie-parser
     

// routes
app.use("/api/auth", authRouter);

// production build route
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "/frontend/dist"))); 

    app.get("*", (req, res ) =>{
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });

};

       

// start server
app.listen(PORT, () =>{
    ConnectDB();
    console.log(`Server is running on port ${PORT}`.bgBlue.white);
});

console.log(process.env.PORT);
    
