import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Client } from "../models/client.model.js"
import { ApiResponse } from "../utils/apiResponce.js";
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async (clientId) => {
    try {
        const client = await Client.findById(clientId)
        const accessToken = client.generateAccessToken()
        const refreshToken = client.generateRefreshToken()

        client.refreshToken = refreshToken
        await client.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerClient = asyncHandler(async (req, res) => {
    try {
        const { fullName, email, clientname, password, phone} = req.body
        //console.log("email: ", email);

        if (
            [fullName, email, clientname, password, , phone].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required")
        }

        const existedClient = await Client.findOne({
            $or: [{ clientname }, { email }]
        })

        if (existedClient) {
            throw new ApiError(409, "User with email or username already exists")
        }


        const client = await Client.create({
            fullName,
            email,
            phone,
            password,
            clientname: clientname.toLowerCase()
        })

        const createdClient = await Client.findById(client._id).select(
            "-password -refreshToken"
        )

        if (!createdClient) {
            throw new ApiError(500, "Something went wrong while registering the client")
        }

        return res.status(201).json(
            new ApiResponse(200, createdClient, "Client registered Successfully")
        )
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message, "Client registered failed")
        )
    }

})

const loginClient = asyncHandler(async (req, res) => {
    try {
        const { email, clientname, password } = req.body
        //console.log(email);

        if (!clientname && !email) {
            throw new ApiError(400, "clientname or email is required")
        }


        const client = await Client.findOne({
            $or: [{ clientname }, { email }]
        })

        if (!client) {
            throw new ApiError(404, "User does not exist")
        }

        const isPasswordValid = await client.isCorrectPassword(password)

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(client._id)

        const loggedInClient = await Client.findById(client._id).select("-password -refreshToken")

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
                        client: loggedInClient, accessToken, refreshToken
                    },
                    "Client logged In Successfully"
                )
            )
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message, "Client login failed")
        )
    }

})

const logoutClient = asyncHandler(async (req, res) => {
    try {
        await Client.findByIdAndUpdate(
            req.client._id,
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
            .json(new ApiResponse(200, {}, "User logged Out"))
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message, "Client logout failed")
        )
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body



        const client = await Client.findById(req.client?._id)
        const isPasswordCorrect = await client.isPasswordCorrect(oldPassword)

        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid old password")
        }

        user.password = newPassword
        await user.save({ validateBeforeSave: false })

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Password changed successfully"))
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message, "Client password changed  failed")
        )
    }
})


export {
    registerClient,
    loginClient,
    logoutClient,
    changeCurrentPassword,
}