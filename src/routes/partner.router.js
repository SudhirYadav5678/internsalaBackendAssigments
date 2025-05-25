import { Router } from "express";
import { changeCurrentPassword, loginPartner, registerPartner, updateVerifyDocument, verifyPartner } from '../controller/partner.controller.js';
import { verifyJWT } from "../middlewares/partner.auth.js"
import { upload } from "../middlewares/multer.middleware.js";


const router = Router()
router.route("/registerPartner").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }
]), registerPartner)
router.route("/loginPartner").post(loginPartner)
router.route("/logoutPartner").post(verifyJWT, loginPartner)
router.post(
    "/verifyPartner",
    verifyJWT,
    upload.fields([
        {
            name: "document",
            maxCount: 1
        }, 
        {
            name: "proofOFWork",
            maxCount: 1
        }
    ]),
    verifyPartner
);
router.route("/changeCurrentPassword").post(verifyJWT, changeCurrentPassword)
router.route("/updateVerifyDocument").post(verifyJWT, updateVerifyDocument)

export default router;