import { Router } from "express";
import { TaskController } from "./task.controller";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  taskQuerySchema,
  bulkDeleteSchema,
  bulkUpdateStatusSchema,
  createSubtaskSchema,
  updateSubtaskSchema,
} from "./task.schema";

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get("/", validate(taskQuerySchema), TaskController.getTasks);
router.get("/categories", TaskController.getCategories);
router.get("/:id", validate(taskIdParamSchema), TaskController.getTaskById);
router.post("/", validate(createTaskSchema), TaskController.createTask);
router.put("/:id", validate(updateTaskSchema), TaskController.updateTask);
router.patch("/:id", validate(updateTaskSchema), TaskController.updateTask);
router.delete("/:id", validate(taskIdParamSchema), TaskController.deleteTask);

router.post("/bulk-delete", validate(bulkDeleteSchema), TaskController.bulkDelete);
router.patch("/bulk-update-status", validate(bulkUpdateStatusSchema), TaskController.bulkUpdateStatus);

// Subtask sub-routes
router.post("/:id/subtasks", validate(createSubtaskSchema), TaskController.createSubtask);
router.patch("/:id/subtasks/:subtaskId", validate(updateSubtaskSchema), TaskController.updateSubtask);
router.delete("/:id/subtasks/:subtaskId", TaskController.deleteSubtask);

export default router;