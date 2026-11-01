import {body} from 'express-validator';


const userResgistrationValidator = () => {
    return [
        body('username')
            .trim()
            .notEmpty().withMessage('Username is required') 
            .isLowercase().withMessage('Username must be in lowercase')
            .isLength({min: 3}).withMessage('Username must be at least 3 characters long'),
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format'),
        body('password')
            .trim()
            .notEmpty().withMessage('Password is required')
            .isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
        body('fullName')
            .optional()
            .trim()
            .notEmpty().withMessage('Full name is required')
    ]
}

const userLoginValidator = () => {
    return [
        body('email')
            .optional() 
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format'),
        body('password')
            .trim()
            .notEmpty().withMessage('Password is required')
            .isLength({min: 6}).withMessage('Password must be at least 6 characters long')
    ]
}

const forgotPasswordRequestValidator = () => {
    return [
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format')
    ]
}

const resetForgotPasswordValidator = () => {
    return [
        body('password')
            .isString().withMessage('Password must be a string')
            .isLength({min: 8}).withMessage('Password must be at least 8 characters long')
    ]
}

const changeCurrentPasswordValidator = () => {
    return [
        body('currentPassword')
            .isString().withMessage('Current password must be a string')
            .notEmpty().withMessage('Current password is required'),
        body('newPassword')
            .isString().withMessage('New password must be a string')
            .isLength({min: 8}).withMessage('New password must be at least 8 characters long')
    ]
}

export {
    userResgistrationValidator,
    userLoginValidator,
    forgotPasswordRequestValidator,
    resetForgotPasswordValidator,
    changeCurrentPasswordValidator
}