import { Router } from "express";
import {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
} from "../controllers/task.controllers.js";
import {
  validateProjectPermission,
  validateSubtaskTaskScope,
  validateTaskProjectScope,
  verifyJWT,
} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { AvailableUserRoles } from "../utils/constants.js";

const router = Router({ mergeParams: true });

router.use(verifyJWT, validateProjectPermission(AvailableUserRoles));

router.route("/").get(getTasks).post(upload.array("attachments", 5), createTask);

router
  .route("/:taskId")
  .all(validateTaskProjectScope)
  .get(getTaskById)
  .patch(upload.array("attachments", 5), updateTask)
  .delete(deleteTask);

router
  .route("/:taskId/subtasks")
  .all(validateTaskProjectScope)
  .post(createSubTask);

router
  .route("/:taskId/subtasks/:subTaskId")
  .all(validateTaskProjectScope, validateSubtaskTaskScope)
  .put(updateSubTask)
  .delete(deleteSubTask);

export default router;
