import Mailgen from 'mailgen';

const emailVerificationMailgenContent = (userName, verificationUrl) => {
    return {
        body: {
            name: userName,
            intro: 'Welcome to Project Management! We\'re very excited to have you on board.',
            action: {
                instructions: 'To verify your email address, please click the button below:',
                button: {
                    color: '#22BC66',
                    text: 'Verify Email Address',
                    link: verificationUrl
                },
            } ,
            outro: 'If you did not create an account, no further action is required.'
        }
    }
}


const forgotPasswordMailgenContent = (userName, PasswordReserUrl) => {
    return {
        body: {
            name: userName,
            intro: 'You have received this email because a password reset request for your account was received.',
            action: {
                instructions: 'To reset your password, please click the button below:',
                button: {
                    color: '#22BC66',
                    text: 'Reset Password',
                    link: PasswordReserUrl
                },
            } ,
            outro: 'If you did not create an account, no further action is required.'
        }
    }
}

export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent
}