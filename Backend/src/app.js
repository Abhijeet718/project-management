import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { publicDirectory } from "./utils/fileStorage.js";
import { getAllowedOrigins } from "./utils/environment.js";

const app = express();
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDirectory));

app.use(cors({
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

import healthCheckRouter from './routes/healthcheck.routes.js';
import authRouter from './routes/auth.route.js';
import projectRouter from './routes/project.route.js';
import taskRouter from './routes/task.route.js';
import { errorHandler } from './middlewares/error.middleware.js';

app.use('/api/v1/healthcheck', healthCheckRouter);
app.use('/api/v1/auth', authRouter); 
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/projects/:projectId/tasks', taskRouter);


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use(errorHandler);

export default app;
