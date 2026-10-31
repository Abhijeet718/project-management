import {User} from "../models/user.model.js";
import {ApiResponse} from "../utils/apiResponse.js";
import {ansyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {sendEmail} from "../utils/emailService.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false}); 
    return {
        accessToken,
        refreshToken
    }
    } catch (error) {
        throw new ApiError(500, "Error generating tokens", [error.message], error.stack);
    }
    
}


const registerUser = ansyncHandler(async (req, res) => {
    const {username, email, password,role} = req.body;

    const existedUser = await User.findOne({
        $or: [
            {username},
            {email}
        ]
    })

    if(existedUser){
        throw new ApiError(400, "User with this username or email already exists");
    }

    const user = await User.create({
        username,
        email,
        password,
        isEmailVerified: false,
    })

    const {unHashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});

    await sendEmail({
        email: user?.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailgenContent(user?.username, `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`),
        emailType: "emailVerification",
        userName: user?.username,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${unHashedToken}`
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry");

    if(!createdUser){
        throw new ApiError(500, "Error creating user");
    }

    return res.status(201).json(new ApiResponse(201, {user: createdUser}, "User registered successfully"))
})


export {registerUser, generateAccessAndRefreshToken};