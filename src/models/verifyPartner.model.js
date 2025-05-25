import mongoose,{Schema} from "mongoose";

const verifyPartnerSchema = new Schema({
    partnerId:{
        type:Object,
        required:true
    },
    verified:{
        type:Boolean,
        default:false
    },
    document:[{
        type:String,
        required:[true,"Document is required for the verification"]
    }],
    proofOFWork:[{
        type:String,
    }],
    webSiteLink:[{
        type:String
    }],
    partner:{
        type: Schema.Types.ObjectId,
            ref: "Partner"
    }
},{timestamps:true})

export const VerificationPartner = mongoose.model("VerificationPartner",verifyPartnerSchema)