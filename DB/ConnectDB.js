import mongoose from "mongoose";

// mongoose connect
export const ConnectDB = async () =>{
    try {
        console.log(process.env.MONGO_URL);
         
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB Connected Success: ${conn.connection.host}`.bgGreen.yellow);
        
    } catch (error) {
        console.log(`MongoDB Connected Filed: ${error.message}`.bgRed.white);
        
    }
}