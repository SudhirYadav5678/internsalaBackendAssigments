import mongoose, {Schema} from "mongoose";


const clientServiceSchema = new Schema(
    {
        clientId: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        partnerId: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true
        },
        category:{
            type:String,
            required:true
        },
        Date:{
            type:Date,
            required:true
        },
        location: {
            type: String,
            required: true,
            lowecase: true,
            trim: true, 
        },
        budget: {
            type: String,
            required: true,
            trim: true, 
        },
        phone:{
            type:String,
            required:true,
            trim: true,
        },
        city:{
            type:String,
            required:true
        },
        imagesRef:[{
            type:String,
        }],
        status:{
            type:String,
            default:"new"
        }
    },
    {
        timestamps: true
    }
)


export const ClientService = mongoose.model("clientService", clientServiceSchema)