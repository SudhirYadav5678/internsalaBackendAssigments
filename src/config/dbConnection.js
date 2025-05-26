import mongoose from "mongoose";

// database connection
const connectDB= async function(){
    try {
        const connectionInstances=await mongoose.connect(`${process.env.MONGO_URI || 8000}/${process.env.DB_NAME}`);
        console.log(`MongoDB connected at ${connectionInstances.connection.host}`);
    } catch (error) {
        console.log("Error  connecting to database: ", error);
        process.exit(1)
    }
}

export default connectDB

// import mongoose from "mongoose";
// import { Pool } from "pg";

// const connectDB = async function () {
//   try {
//     const pool = new Pool({
//       user: 'sudhir',
//       host: 'localhost',
//       database: 'mydb',
//       password: 'sudhir123',
//       port: 5432,
//     });

//     await pool.connect();
//     console.log("PostgreSQL connected");

//     await mongoose.connect('mongodb://mongoDB:27017/mydb', {
//       user: 'sudhir',
//       pass: 'sudhir123',
//       authSource: 'admin',
//     });

//     console.log("MongoDB connected");
//   } catch (error) {
//     console.error("Database connection error:", error);
//     process.exit(1);
//   }
// }

// export default connectDB;