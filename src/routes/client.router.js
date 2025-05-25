import {Router} from "express";
import {registerClient,loginClient,logoutClient,changeCurrentPassword} from  '../controller/client.controller.js';
import {verifyJWT} from "../middlewares/client.auth.js"


const router= Router()
router.route("/registerClient").post(registerClient)
router.route("/loginClient").post(loginClient)
router.route("/logoutClient").post(verifyJWT,logoutClient)
router.route("/client/change-password").post(verifyJWT, changeCurrentPassword)
export default router;