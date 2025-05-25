import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const partnerSchema = new Schema(
    {
        partnername: {
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
        avatar: {
            type: String, // cloudinary url
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
        },
        phone:{
            type:String,
            required:true,
            trim: true,
        },
        location:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        // document:{
        //     type: Schema.Types.ObjectId,
        //     ref: "VerificationPartner"
        // },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)


partnerSchema.pre( 'save', async function (next) {
    if (this.isModified("password")){ 
        this.password = await bcrypt.hash(this.password, 8); 
        next();}
})

partnerSchema.methods.isCorrectPassword = async function (password) {
    return await bcrypt.compare(password, this.password)} 


partnerSchema.methods.generateAccessToken=function(){
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


partnerSchema.methods.generateRefreshToken=function(){return jwt.sign({
    _id:this._id,
},
process.env.REFRESH_TOKEN_SECRET,
{
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY 
})}


export const Partner = mongoose.model("Partner", partnerSchema)