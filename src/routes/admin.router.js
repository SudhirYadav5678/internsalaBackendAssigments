import {Router} from "express";
import {verifyJWT} from "../middlewares/admin.auth.js"
import { changeCurrentPassword, loginAdmin, logoutAdmin, registerAdmin, verificationPendingPartner, verifyOrRejectPartner} from "../controller/admin.controller.js";


const router= Router();
router.route("/registerAdmin").post(registerAdmin);
router.route("/loginAdmin").post(loginAdmin);
router.route("/logoutAdmin").post(verifyJWT,logoutAdmin);
router.route("/admin/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/verifiyPendingPartner").get(verifyJWT,verificationPendingPartner);
router.route("/verifyOrRejectPartner").post(verifyJWT,verifyOrRejectPartner);
export default router;