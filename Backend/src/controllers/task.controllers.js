import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { Subtask } from "../models/subtask.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createAttachmentUrl, removeTaskAttachmentFiles } from "../utils/fileStorage.js";
import mongoose from "mongoose";

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId),
  }).populate("assignedTo", "avatar username fullName");

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});
const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const files = req.files || [];

  const attachments = files.map((file) => {
    return {
      url: createAttachmentUrl(file.filename),
      mimetype: file.mimetype,
      size: file.size,
    };
  });

  const task = await Task.create({
    title,
    description,
    project: new mongoose.Types.ObjectId(projectId),
    assignedTo: assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : undefined,
    status,
    assignedBy: new mongoose.Types.ObjectId(req.user._id),
    attachments,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});
const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              createdBy: {
                $arrayElemAt: ["$createdBy", 0],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0],
        },
      },
    },
  ]);

  if (!task || task.length === 0) {
    throw new ApiError(404, "Task not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, task[0], "Task fetched successfully"));
});
const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const { title, description, assignedTo, status } = req.body;
  const hasUpdates =
    title !== undefined ||
    description !== undefined ||
    assignedTo !== undefined ||
    status !== undefined ||
    (req.files?.length ?? 0) > 0;

  if (!hasUpdates) {
    throw new ApiError(400, "At least one task field or attachment is required");
  }

  if (title !== undefined) {
    task.title = title;
  }

  if (description !== undefined) {
    task.description = description;
  }

  if (assignedTo !== undefined) {
    if (assignedTo === null || assignedTo === "") {
      task.assignedTo = undefined;
    } else {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        throw new ApiError(400, "Invalid assigned user ID");
      }
      task.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }
  }

  if (status !== undefined) {
    task.status = status;
  }

  const attachments = (req.files || []).map((file) => ({
    url: createAttachmentUrl(file.filename),
    mimetype: file.mimetype,
    size: file.size,
  }));
  task.attachments.push(...attachments);

  await task.save();
  await task.populate("assignedTo", "avatar username fullName");

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task updated successfully"));
});
const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID");
  }

  const task = await Task.findByIdAndDelete(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  await Subtask.deleteMany({ task: task._id });
  await removeTaskAttachmentFiles(task.attachments);

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task deleted successfully"));
});
const createSubTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const title = req.body?.title?.trim();

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID");
  }

  if (!title) {
    throw new ApiError(400, "Subtask title is required");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subtask = await Subtask.create({
    title,
    task: task._id,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, subtask, "Subtask created successfully"));
});
const updateSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(subTaskId)) {
    throw new ApiError(400, "Invalid subtask ID");
  }

  const subtask = await Subtask.findById(subTaskId);
  if (!subtask) {
    throw new ApiError(404, "Subtask not found");
  }

  const { title, isCompleted } = req.body;
  if (title === undefined && isCompleted === undefined) {
    throw new ApiError(400, "At least one subtask field is required");
  }

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      throw new ApiError(400, "Subtask title cannot be empty");
    }
    subtask.title = title.trim();
  }

  if (isCompleted !== undefined) {
    if (typeof isCompleted !== "boolean") {
      throw new ApiError(400, "isCompleted must be a boolean");
    }
    subtask.isCompleted = isCompleted;
  }

  await subtask.save();

  return res
    .status(200)
    .json(new ApiResponse(200, subtask, "Subtask updated successfully"));
});
const deleteSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(subTaskId)) {
    throw new ApiError(400, "Invalid subtask ID");
  }

  const subtask = await Subtask.findByIdAndDelete(subTaskId);
  if (!subtask) {
    throw new ApiError(404, "Subtask not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subtask, "Subtask deleted successfully"));
});

export {
  createSubTask,
  createTask,
  deleteTask,
  deleteSubTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
};
