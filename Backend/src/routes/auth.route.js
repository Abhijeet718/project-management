import { Router } from 'express';
import { registerUser,login} from '../controllers/auth.controllers.js';
import { validate } from '../middlewares/validator.middleware.js';
import { userResgistrationValidator } from '../validators/index.js';
import { userLoginValidator } from '../validators/index.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { logoutUser } from '../controllers/auth.controllers.js';

const router = Router();   




router.route("/register").post(userResgistrationValidator(),validate, registerUser);
router.route("/login").post(userLoginValidator(),validate, login);
router.route("/logout").post(verifyJWT, logoutUser);



export default router;