import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Partner } from "../models/partner.model.js";
import { VerificationPartner } from "../models/verifyPartner.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponce.js";


const generateAccessAndRefereshTokens = async (partnerId) => {
    try {
        const partner = await Partner.findById(partnerId)
        const accessToken = partner.generateAccessToken()
        const refreshToken = partner.generateRefreshToken()

        partner.refreshToken = refreshToken
        await partner.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerPartner = asyncHandler(async (req, res) => {
    try {
        const { fullName, email, partnername, password, phone, location, city } = req.body
        console.log("email: ", email, fullName);

        if (
            [fullName, email, partnername, password, phone, location, city].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required")
        }

        const existedPartner = await Partner.findOne({
            $or: [{ partnername }, { email }]
        })

        if (existedPartner) {
            throw new ApiError(409, "User with email or username already exists")
        }


        let avatarLocalPath;
        if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
            avatarLocalPath = req.files.avatar[0].path
        }
        console.log("avatarLocalPath", avatarLocalPath);

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("avatar", avatar);


        const partner = await Partner.create({
            fullName,
            avatar: avatar?.url || "",
            email,
            phone,
            location,
            city,
            password,
            partnername: partnername.toLowerCase()
        })

        const createdPartner = await Partner.findById(partner._id).select(
            "-password -refreshToken"
        )

        if (!createdPartner) {
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        return res.status(201).json(
            new ApiResponse(200, createdPartner, "Partner registered Successfully")
        )
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message, "Partner registered Failed")
        )
    }

})

const loginPartner = asyncHandler(async (req, res) => {
    try {
        const { email, partnername, password } = req.body
        console.log(email);

        if (!partnername && !email) {
            throw new ApiError(400, "username or email is required")
        }

        const partner = await Partner.findOne({
            $or: [{ partnername }, { email }]
        })

        if (!partner) {
            throw new ApiError(404, "User does not exist")
        }

        const isPasswordValid = await partner.isCorrectPassword(password)

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(partner._id)

        const loggedInPartner = await Partner.findById(partner._id).select("-password -refreshToken")

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
                        partner: loggedInPartner, accessToken, refreshToken
                    },
                    "Partner logged In Successfully"
                )
            )
    } catch (error) {
        return res
            .status(500)
            .json(
                new ApiResponse(
                    500,
                    error.message,
                    "Partner logged In Failed!!!"
                )
            )
    }
})

const verifyPartner = asyncHandler(async (req, res) => {
    try {
        const partner = await Partner.findById(req.partner._id)
        //console.log("partner", partner);
        if (!partner) {
            throw new ApiError(409, "Partner does not find.")
        }
        const { webSiteLink } = req.body;
        //console.log("webSiteLink", webSiteLink);

        const documentLocalPath = req.files?.document?.[0]?.path;
        //console.log("documentLocalPath", documentLocalPath);

        let proofOFWorkLocalPath;
        if (req.files?.proofOFWork?.length > 0) {
            proofOFWorkLocalPath = req.files.proofOFWork[0].path;
        }
        //console.log("proofOFWorkLocalPath", proofOFWorkLocalPath);

        if (!documentLocalPath) {
            throw new ApiError(400, "Document file is required");
        }
        const document = await uploadOnCloudinary(documentLocalPath)
        const proofOFWork = await uploadOnCloudinary(proofOFWorkLocalPath)
        if (!document) {
            throw new ApiError(400, "Document file is required rom cloudinary");
        }

        const verificationPartner = await VerificationPartner.create({
            partnerId: partner,
            webSiteLink: webSiteLink || "",
            document: document.url,
            proofOFWork: proofOFWork?.url || ""
        })

        return res.
            status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        verificationPartner: verificationPartner
                    },
                    "Partner verification In Successfully"
                )
            )
    } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json(
            new ApiResponse(
                500,
                null,
                error.message || "Partner verification failed"
            )
        );
    }
})

const logoutPartner = asyncHandler(async (req, res) => {
    try {
        await Partner.findByIdAndUpdate(
            req.partner._id,
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
            .json(new ApiResponse(200, {}, "Partner logged Out"))
    } catch (error) {
        return res
            .status(500)
            .json(new ApiResponse(500, error.message, "Partner logged Out failed!!!"))
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body
        const partner = await Partner.findById(req.partner?._id)
        const isPasswordCorrect = await user.isCorrectPassword(oldPassword)

        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid old password")
        }

        partner.password = newPassword
        await partner.save({ validateBeforeSave: false })

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Password changed successfully"))
    } catch (error) {
        return res
            .status(500)
            .json(new ApiResponse(500, error.message, "Password changed successfully"))
    }
})

const updateVerifyDocument = asyncHandler(async (req, res) => {
    const documentLocalPath = req.file?.path

    if (!documentLocalPath) {
        throw new ApiError(400, "Doucment file is missing")
    }


    const document = await uploadOnCloudinary(documentLocalPath)

    if (!document.url) {
        throw new ApiError(400, "Error while uploading on document")

    }
    //delete old image

    const partner = await VerificationPartner.findByIdAndUpdate(
        req.partner?._id,
        {
            $set: {
                document: document.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Document image updated successfully")
        )
})


export {
    registerPartner,
    loginPartner,
    verifyPartner,
    logoutPartner,
    changeCurrentPassword,
    updateVerifyDocument,
}