import { Router } from 'express';
import { registerUser,login,forgotPasswordRequest,resetForgotPassword,changeCurrentPassword,verifyEmail, refreshAccessToken, getCurrentUser , resendEmailVerification} from '../controllers/auth.controllers.js';
import { validate } from '../middlewares/validator.middleware.js';
import { userRegistrationValidator, userLoginValidator, forgotPasswordRequestValidator, resetForgotPasswordValidator, changeCurrentPasswordValidator } from '../validators/index.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { logoutUser } from '../controllers/auth.controllers.js';

const router = Router();   




router.route("/register").post(userRegistrationValidator(),validate, registerUser);
router.route("/login").post(userLoginValidator(),validate, login);
router.route("/forgot-password").post(forgotPasswordRequestValidator(), validate, forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(resetForgotPasswordValidator(), validate, resetForgotPassword);
router.route("/change-password").post(verifyJWT, changeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").post(verifyJWT,getCurrentUser);
router.route("/resend-verification-email").post(verifyJWT,resendEmailVerification);



export default router;
