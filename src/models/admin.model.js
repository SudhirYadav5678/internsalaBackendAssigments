import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const adminSchema = new Schema(
    {
        adminId: {
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
        role:{
            type:String,
            default:"Admin"
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)


adminSchema.pre( 'save', async function (next) {
    if (this.isModified("password")){ 
        this.password = await bcrypt.hash(this.password, 8); 
        next();}
})

adminSchema.methods.isCorrectPassword = async function (password) {
    return await bcrypt.compare(password, this.password)} 


adminSchema.methods.generateAccessToken=function(){
     return jwt.sign({// payload 
        _id:this._id,
        email:this.email,
        adminId:this.adminId,
        fullName:this.fullName, 
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY 
    })
}


adminSchema.methods.generateRefreshToken=function(){return jwt.sign({
    _id:this._id,
},
process.env.REFRESH_TOKEN_SECRET,
{
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY 
})}


export const Admin = mongoose.model("Admin", adminSchema)