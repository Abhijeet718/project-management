import { Router } from 'express';
import { registerUser,login,forgotPasswordRequest,resetForgotPassword,changeCurrentPassword} from '../controllers/auth.controllers.js';
import { validate } from '../middlewares/validator.middleware.js';
import { userResgistrationValidator } from '../validators/index.js';
import { userLoginValidator, forgotPasswordRequestValidator, resetForgotPasswordValidator, changeCurrentPasswordValidator } from '../validators/index.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { logoutUser } from '../controllers/auth.controllers.js';

const router = Router();   




router.route("/register").post(userResgistrationValidator(),validate, registerUser);
router.route("/login").post(userLoginValidator(),validate, login);
router.route("/forgot-password").post(forgotPasswordRequestValidator(), validate, forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(resetForgotPasswordValidator(), validate, resetForgotPassword);
router.route("/change-password").post(verifyJWT, changeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/logout").post(verifyJWT, logoutUser);



export default router;