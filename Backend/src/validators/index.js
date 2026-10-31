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

export {
    userResgistrationValidator
}