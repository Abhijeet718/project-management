import multer from "multer";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { ApiError } from "../utils/apiError.js";
import { uploadDirectory } from "../utils/fileStorage.js";

const allowedMimeTypesByExtension = {
    ".csv": ["text/csv", "application/csv", "application/vnd.ms-excel"],
    ".doc": ["application/msword"],
    ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    ".gif": ["image/gif"],
    ".jpeg": ["image/jpeg"],
    ".jpg": ["image/jpeg"],
    ".pdf": ["application/pdf"],
    ".png": ["image/png"],
    ".ppt": ["application/vnd.ms-powerpoint"],
    ".pptx": ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
    ".txt": ["text/plain"],
    ".webp": ["image/webp"],
    ".xls": ["application/vnd.ms-excel"],
    ".xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
};

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        fs.mkdir(uploadDirectory, { recursive: true })
            .then(() => cb(null, uploadDirectory))
            .catch(cb);
    },
    filename: function (_req, file, cb) {
        cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
    }
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 5,
    },
    fileFilter: (_req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const allowedMimeTypes = allowedMimeTypesByExtension[extension];
        if (!allowedMimeTypes?.includes(file.mimetype.toLowerCase())) {
            return cb(new ApiError(400, "Unsupported attachment file type"));
        }
        cb(null, true);
    },
});
