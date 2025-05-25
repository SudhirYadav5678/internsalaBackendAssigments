import { ClientService } from "../models/clientService.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { Client } from "../models/client.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const clientServiceBooking = asyncHandler(async (req, res) => {
    try {
        // const client = req.client;
        // console.log("client",client);

        const clientId = await Client.findById(req.client?._id);
        console.log("clientID", clientId);


        if (!clientId) {
            throw new ApiError(409, "Client with email or clientId does  not exists");
        }
        const { category, Date, location, budget, phone, city } = req.body;
        if (
            [category, Date, location, budget, phone, city].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required")
        }
        let imagesRefLocalPath;
        if (req.files?.imagesRef?.length > 0) {
            imagesRefLocalPath = req.files.imagesRef[0].path;
        }
        console.log("imagesRefLocalPath", imagesRefLocalPath);
        const imagesRef = await uploadOnCloudinary(imagesRefLocalPath)
        console.log("imagesRef",imagesRef);
        

        const service = await ClientService.create({
            clientId: clientId._id,
            category: category,
            Date: Date,
            location: location,
            budget: budget,
            phone: phone,
            city: city,
            imagesRef: imagesRef?.url
        })
        const serviceCreated = await ClientService.findById(service._id);
        if (!serviceCreated) {
            throw new ApiError(500, "Something went wrong while creating service for client")
        }
        return res.
            status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        serviceCreated: serviceCreated
                    },
                    "Service created  Successfully"
                )
            )
    } catch (error) {
        console.error("service creation error:", error);
        return res.status(500).json(
            new ApiResponse(
                500,
                null,
                error.message || "service creation failed"
            )
        );
    }
})

export {
    clientServiceBooking
}