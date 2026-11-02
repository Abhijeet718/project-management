import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';
import { ApiError } from './apiError.js';

export const validateMailConfiguration = (needsPasswordResetRedirect = false) => {
    const requiredVariables = [
        'MAILTRAP_SMTP_HOST',
        'MAILTRAP_SMTP_PORT',
        'MAILTRAP_SMTP_USER',
        'MAILTRAP_SMTP_PASS',
        'MAILTRAP_FROM_EMAIL',
    ];
    if (needsPasswordResetRedirect) {
        requiredVariables.push('FORGET_PASSWORD_REDIRECT_URL');
    }

    const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());
    if (missingVariables.length) {
        throw new ApiError(
            503,
            `Email delivery is not configured. Set: ${missingVariables.join(', ')}`,
        );
    }

    const port = Number(process.env.MAILTRAP_SMTP_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new ApiError(503, 'MAILTRAP_SMTP_PORT must be a valid port number');
    }
};

const sendEmail = async (options) =>{
    validateMailConfiguration();
    const mailGenerator =  new Mailgen({
        theme: 'default',
        product: {
            name: 'Task Manager',
            link: 'https://taskmanagelink.com'
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

    const emailHtml = mailGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: Number(process.env.MAILTRAP_SMTP_PORT),
    secure: Number(process.env.MAILTRAP_SMTP_PORT) === 465,
    auth: {
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS
    }
});


    const mail = {
        from: process.env.MAILTRAP_FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }
    
    await transporter.sendMail(mail);
}



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


const forgotPasswordMailgenContent = (userName, PasswordResetUrl) => {
    return {
        body: {
            name: userName,
            intro: 'You have received this email because a password reset request for your account was received.',
            action: {
                instructions: 'To reset your password, please click the button below:',
                button: {
                    color: '#22BC66',
                    text: 'Reset Password',
                    link: PasswordResetUrl
                },
            } ,
            outro: 'If you did not create an account, no further action is required.'
        }
    }
}

export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail
}
