import { User } from "../models/user.model.js";
import {ApiResponse} from "../utils/apiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import { authCookieOptions } from "../utils/authCookie.js";
import {sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent, validateMailConfiguration} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";


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


const registerUser = asyncHandler(async (req, res) => {
    const {username, email, password} = req.body;
    validateMailConfiguration();

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
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});

    await sendEmail({
        to: user?.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailgenContent(user?.username, `${process.env.SERVER_URL.replace(/\/+$/, "")}/api/v1/auth/verify-email/${unHashedToken}`),
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordTokenExpiry");

    if(!createdUser){
        throw new ApiError(500, "Error creating user");
    }

    return res.status(201).json(new ApiResponse(201, {user: createdUser}, "User registered successfully"))
})

const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    if(!email){
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if(!user){
        throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordTokenExpiry");


    const options = authCookieOptions();

     

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {user: loggedInUser, accessToken}, "User logged in successfully"))
})


const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId,
       { $set: {refreshToken: null} },
       { new: true }
    );

    const options = authCookieOptions(0);

    return res
        .status(200)
        .clearCookie("accessToken", "", options)
        .clearCookie("refreshToken", "", options)
        .json(new ApiResponse(200, null, "User logged out successfully"))



})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, {user: req.user}, "Current user fetched successfully"))

})

const verifyEmail = asyncHandler(async (req, res) => {
    const {verificationToken} = req.params;

    if(!verificationToken){
        throw new ApiError(400, "Verification token is required");
    }

    let hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: {$gt: Date.now()}
    })

    if(!user){
        throw new ApiError(400, "Token is invalid or expired");
    }

    user.emailVerificationToken = undefined
    user.emailVerificationExpiry = undefined

    user.isEmailVerified = true
    await user.save({validateBeforeSave: false})

    return res
        .status(200)
        .json(new ApiResponse(200,{isEmailVerified: true},"Email is verified"))
})


const resendEmailVerification = asyncHandler(async (req , res) => {
    const user = await User.findById(req.user?._id)
    if(!user){
        throw new ApiError(404, "User not found");
    }
    if(user.isEmailVerified){
        throw new ApiError(400, "Email is already verified");
    }

    validateMailConfiguration();

    const {unHashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});

    await sendEmail({
        to: user?.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailgenContent(user?.username, `${process.env.SERVER_URL.replace(/\/+$/, "")}/api/v1/auth/verify-email/${unHashedToken}`),
    })

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Email verification link sent successfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorized: Refresh token is required");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Unauthorized: Invalid refresh token");
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized: Refresh token is expired or used");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        const options = authCookieOptions();

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken }, "Access token refreshed successfully"));
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, "Unauthorized: Refresh token expired");
        }

        if (error instanceof jwt.JsonWebTokenError) {
            throw new ApiError(401, "Unauthorized: Invalid refresh token");
        }

        throw error;
    }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const email = req.body?.email?.trim().toLowerCase();

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    validateMailConfiguration(true);
    const user = await User.findOne({ email });

    if (user) {
        const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

        user.forgotPasswordToken = hashedToken;
        user.forgotPasswordTokenExpiry = tokenExpiry;
        await user.save({ validateBeforeSave: false });

        await sendEmail({
            to: user.email,
            subject: "Password Reset",
            mailgenContent: forgotPasswordMailgenContent(
                user.username,
                `${process.env.FORGET_PASSWORD_REDIRECT_URL.replace(/\/+$/, "")}/${unHashedToken}`
            )
        });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "If an account exists for this email, a password reset link has been sent"));
})

const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    if (!resetToken) {
        throw new ApiError(400, "Password reset token is required");
    }

    if (typeof password !== "string" || password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long");
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Password reset token is invalid or expired");
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    user.refreshToken = undefined;
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Password has been reset successfully"));
})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (typeof currentPassword !== "string" || !currentPassword) {
        throw new ApiError(400, "Current password is required");
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
        throw new ApiError(400, "New password must be at least 8 characters long");
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isCurrentPasswordValid = await user.isPasswordCorrect(currentPassword);
    if (!isCurrentPasswordValid) {
        throw new ApiError(401, "Current password is incorrect");
    }

    if (currentPassword === newPassword) {
        throw new ApiError(400, "New password must be different from the current password");
    }

    user.password = newPassword;
    user.refreshToken = undefined;
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Password changed successfully"));
});

export {
    registerUser,
    generateAccessAndRefreshToken,
    login,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    forgotPasswordRequest,
    resetForgotPassword,
    changeCurrentPassword
};
