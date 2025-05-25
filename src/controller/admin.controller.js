import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import { VerificationPartner } from "../models/verifyPartner.model.js";
import { ApiResponse } from "../utils/apiResponce.js";
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async (adminId) => {
    try {
        const admin = await Admin.findById(adminId)
        //console.log("admin",admin);

        const accessToken = admin.generateAccessToken()
        const refreshToken = admin.generateRefreshToken()

        admin.refreshToken = refreshToken
        await admin.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerAdmin = asyncHandler(async (req, res) => {
    try {
        const { fullName, email, adminId, password } = req.body
        console.log("email: ", email, fullName);

        if (
            [fullName, email, adminId, password].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required")
        }

        const existedAdmin = await Admin.findOne({
            $or: [{ adminId }, { email }]
        })

        if (existedAdmin) {
            throw new ApiError(409, "Admin with email or adminId already exists")
        }

        const admin = await Admin.create({
            adminId,
            fullName,
            email,
            password,
        })

        const createdAdmin = await Admin.findById(admin._id).select(
            "-password -refreshToken"
        )

        if (!createdAdmin) {
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        return res.status(201).json(
            new ApiResponse(200, createdAdmin, "Admin registered Successfully")
        )
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message, "Admin registered Failed")
        )
    }

})

const loginAdmin = asyncHandler(async (req, res) => {
    try {
        const { email, adminId, password } = req.body
        //console.log(email);

        if (!adminId && !email) {
            throw new ApiError(400, "adminId or email is required")
        }

        const admin = await Admin.findOne({
            $or: [{ adminId }, { email }]
        })

        if (!admin) {
            throw new ApiError(404, "Admin does not exist")
        }

        const isPasswordValid = await admin.isCorrectPassword(password)

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid Admin credentials")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(admin._id)

        const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken")

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        admin: loggedInAdmin, accessToken, refreshToken
                    },
                    "Admin logged In Successfully"
                )
            )
    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json(
            new ApiResponse(
                500,
                null,
                error.message || "Admin Login failed"
            )
        );
    }
})

const logoutAdmin = asyncHandler(async (req, res) => {
    try {
        await Admin.findByIdAndUpdate(
            req.admin._id,
            {
                $unset: {
                    refreshToken: 1 // this removes the field from document
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "Admin logged Out"))
    } catch (error) {
        return res
            .status(500)
            .json(new ApiResponse(500, error.message, "Admin logged Out failed!!!"))
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body
        const admin = await Admin.findById(req.admin?._id)
        const isPasswordCorrect = await admin.isCorrectPassword(oldPassword)

        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid old password")
        }

        admin.password = newPassword
        await admin.save({ validateBeforeSave: false })

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Password changed successfully"))
    } catch (error) {
        return res
            .status(500)
            .json(new ApiResponse(500, error.message, "Password changed successfully"))
    }
})
//verified partner
const verificationPendingPartner = asyncHandler(async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin?._id);
        console.log("admin", admin);
        if (!admin) {
            throw new ApiError(409, "Admin not found");
        }
        const verifyPendingPartnerList = await VerificationPartner.find({ verified: false });
        console.log("verifyPartnerList", verifyPendingPartnerList);
        if (!verifyPendingPartnerList || verifyPendingPartnerList.length === 0) {
            throw new ApiError(409, "No unverified partners found");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, verifyPendingPartnerList, "Partners verified Pending fetch successfully"));
    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error",
        });
    }

})

const verifyOrRejectPartner = asyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin?._id);
    console.log("admin", admin);
    if (!admin) {
      throw new ApiError(409, "Admin not found");
    }

    const { partnerId, action, comment } = req.body;

    if (!partnerId || !["verify", "reject"].includes(action)) {
      throw new ApiError(400, "Invalid request data");
    }

    const partnerVerification = await VerificationPartner.findOne({
            "partnerId._id": new mongoose.Types.ObjectId(partnerId),
            verified: "false"
        });
    console.log("partnerVerification",partnerVerification);
    
    if (!partnerVerification) {
      throw new ApiError(404, "Partner verification record not found");
    }

    if (action === "verify") {
      if (partnerVerification.verified) {
        return res.status(400).json({ message: "Partner is already verified" });
      }
      partnerVerification.verified = true;
      partnerVerification.rejected = false;
      partnerVerification.adminComment = comment || "Verified by admin";
    } else if (action === "reject") {
      if (partnerVerification.rejected) {
        return res.status(400).json({ message: "Partner is already rejected" });
      }
      partnerVerification.verified = false;
      partnerVerification.rejected = true;
      partnerVerification.adminComment = comment || "Rejected by admin";
    }

    await partnerVerification.save();

    return res.status(200).json(
      new ApiResponse(200, partnerVerification, `Partner has been ${action}d successfully`)
    );

  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error",
    });
  }
});

export {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    changeCurrentPassword,
    verificationPendingPartner,
    verifyOrRejectPartner
}