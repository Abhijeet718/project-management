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

const login = ansyncHandler(async (req, res) => {
    const {email, password ,username} = req.body;

    if(!email){
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    if(!user){
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry");


    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

     

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {user: loggedInUser, accessToken, refreshToken}, "User logged in successfully"))
})


export {registerUser, generateAccessAndRefreshToken};