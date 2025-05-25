import {Router} from "express";
import {verifyJWT} from "../middlewares/admin.auth.js"
import { changeCurrentPassword, loginAdmin, logoutAdmin, registerAdmin } from "../controller/auth.controller.js";


const router= Router()
router.route("/registerAdmin").post(registerAdmin)
router.route("/loginAdmin").post(loginAdmin)
router.route("/logoutAdmin").post(verifyJWT,logoutAdmin)
router.route("/admin/change-password").post(verifyJWT, changeCurrentPassword)
export default router;