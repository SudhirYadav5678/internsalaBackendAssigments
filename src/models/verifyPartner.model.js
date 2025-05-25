import mongoose,{Schema} from "mongoose";

const verifyPartnerSchema = new Schema({
  partnerId: {
    type: Schema.Types.ObjectId,
    ref: "Partner",
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  rejected: {
    type: Boolean,
    default: false,
  },
  document: [{
    type: String,
    required: [true, "Document is required for verification"],
  }],
  proofOfWork: [{
    type: String,
  }],
  webSiteLink: [{
    type: String,
  }],
  adminComment: {
    type: String,
  },
}, { timestamps: true });


export const VerificationPartner = mongoose.model("VerificationPartner",verifyPartnerSchema)