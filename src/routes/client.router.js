import {Router} from "express";
import {registerClient,loginClient,logoutClient,changeCurrentPassword} from  '../controller/client.controller.js';
import {verifyJWT} from "../middlewares/client.auth.js"
import { clientServiceBooking } from "../controller/clientService.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router= Router()
router.route("/registerClient").post(registerClient)
router.route("/loginClient").post(loginClient)
router.route("/logoutClient").post(verifyJWT,logoutClient)
router.route("/client/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/service-create").post(verifyJWT,upload.fields([
        {
            name: "imagesRef",
            maxCount: 1
        }
    ]),clientServiceBooking)
export default router;