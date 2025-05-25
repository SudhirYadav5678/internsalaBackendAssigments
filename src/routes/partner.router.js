import {Router} from "express";
import {loginPartner, registerPartner} from  '../controller/partner.controller.js';
import {verifyJWT} from "../middlewares/partner.auth.js"
import { upload } from "../middlewares/multer.middleware.js";


const router= Router()
router.route("/registerPartner").post( upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "document",
            maxCount: 1
        }
    ]),registerPartner)
router.route("/loginPartner").post(loginPartner)

export default router;