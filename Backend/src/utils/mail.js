import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

const sendEmail = async (options) =>{
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
    port: process.env.MAILTRAP_SMTP_PORT,
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
    
    try{
        await transporter.sendMail(mail);
    }
    catch(error){
        console.error("Error sending email:", error);
    }
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