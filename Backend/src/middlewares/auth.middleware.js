import { user as User } from '../models/user.model.js';
import { ansyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import jwt from 'jsonwebtoken';



export const verifyJWT = ansyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if(!token){
        throw new ApiError(401, "Unauthorized, No token provided");
    }   

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires");
        if(!user){
            throw new ApiError(401, "Unauthorized, User not found");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Unauthorized, Invalid token");
    }
})