"use server";

import { revalidatePath } from "next/cache";

export async function updateTaskStatusAction(taskId: string, status: string) {
  // Server-side action simulation
  console.log(`[Next.js Server Action] Task ${taskId} status updated to ${status}`);
  
  // Cache revalidation
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  
  return { success: true, taskId, status, timestamp: new Date().toISOString() };
}

export async function createTaskAction(title: string, priority: string, category: string) {
  console.log(`[Next.js Server Action] Task created: "${title}" (${priority}, ${category})`);
  revalidatePath("/");
  revalidatePath("/tasks");
  return { success: true, title, timestamp: new Date().toISOString() };
}

export async function deleteTaskAction(taskId: string) {
  console.log(`[Next.js Server Action] Task deleted: ${taskId}`);
  revalidatePath("/");
  revalidatePath("/tasks");
  return { success: true, taskId };
}

export async function resetTasksAction() {
  console.log("[Next.js Server Action] Resetting server tasks state");
  revalidatePath("/");
  revalidatePath("/tasks");
  return { success: true };
}
