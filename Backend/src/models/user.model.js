import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
    {
        avatar: {
            type: {
                url: String,
                localPath: String
            },
            default: {
                url: `https://placehold.co/200x200/png`,
                localPath: ""
            }
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 8
        },
        fullName: {
            type: String,
            trim: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        refreshToken: {
            type: String,
        },
        forgotPasswordToken: {
            type: String
        },
        forgotPasswordTokenExpiry: {
            type: Date
        },
        emailVerificationToken: {
            type: String
        },
        emailVerificationExpiry: {
            type: Date
        }
    }, {
        timestamps: true
    }
);
userSchema.pre('save', async function () {
    if(!this.isModified('password'))
        return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            jti: crypto.randomBytes(16).toString('hex')
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
        }
    )
}

userSchema.methods.generateTemporaryToken = function (secret, expiresIn) {
    const unHashedToken = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto
        .createHash('sha256')
        .update(unHashedToken)
        .digest('hex');

    const tokenExpiry = Date.now() + (20 * 60 * 1000);
    return {
        unHashedToken,
        hashedToken,
        tokenExpiry
    }
}

export const User = mongoose.model("User", userSchema)
