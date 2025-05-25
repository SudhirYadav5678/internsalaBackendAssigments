import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const clientSchema = new Schema(
    {
        clientname: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
        },
        phoneNo:{
            type:String,
            required:true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        location:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)


clientSchema.pre( 'save', async function (next) {
    if (this.isModified("password")){ 
        this.password = await bcrypt.hash(this.password, 8); 
        next();}
})

clientSchema.methods.isCorrectPassword = async function (password) {
    return await bcrypt.compare(password, this.password)} 


clientSchema.methods.generateAccessToken=function(){
     return jwt.sign({// payload 
        _id:this._id,
        email:this.email,
        clientname:this.clientname,
        fullName:this.fullName, 
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY 
    })
}


clientSchema.methods.generateRefreshToken=function(){return jwt.sign({
    _id:this._id,
},
process.env.REFRESH_TOKEN_SECRET,
{
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY 
})}


export const Client = mongoose.model("Client", clientSchema)