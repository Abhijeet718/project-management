import { User } from "../models/user.model.js";
import { ProjectMember } from "../models/projectMember.model.js";
import { Task } from "../models/task.model.js";
import { Subtask } from "../models/subtask.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordTokenExpiry",
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }
});

export const validateProjectPermission = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(400, "project id is missing");
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, "Invalid project ID");
    }

    const project = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id),
    });

    if (!project) {
      throw new ApiError(400, "project not found");
    }

    const givenRole = project?.role;

    req.user.role = givenRole;

    if (!roles.includes(givenRole)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action",
      );
    }

    next();
  });
};

export const validateTaskProjectScope = asyncHandler(async (req, res, next) => {
  const { projectId, taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID");
  }

  const task = await Task.findOne({ _id: taskId, project: projectId }).select("_id");
  if (!task) {
    throw new ApiError(404, "Task not found in this project");
  }

  next();
});

export const validateSubtaskTaskScope = asyncHandler(async (req, res, next) => {
  const { taskId, subTaskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(subTaskId)) {
    throw new ApiError(400, "Invalid subtask ID");
  }

  const subtask = await Subtask.findOne({ _id: subTaskId, task: taskId }).select("_id");
  if (!subtask) {
    throw new ApiError(404, "Subtask not found in this task");
  }

  next();
});
