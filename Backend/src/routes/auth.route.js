import { Router } from 'express';
import { registerUser} from '../controllers/auth.controllers.js';
import { validate } from '../middlewares/validator.middleware.js';
import { userResgistrationValidator } from '../validators/index.js';

const router = Router();   




router.route("/register").post(userResgistrationValidator(),validate, registerUser);

export default router;