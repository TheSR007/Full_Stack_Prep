from typing import Generic, TypeVar, Optional, List
from pydantic import BaseModel, Field, EmailStr, ConfigDict

T = TypeVar("T")


# --- Response Envelope Schemas ---

class PaginatedMeta(BaseModel):
    page: int
    limit: int
    total: int
    totalPages: int


class SuccessResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T


class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    data: List[T]
    meta: PaginatedMeta


class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str


class ErrorEnvelopeBody(BaseModel):
    code: str
    message: str
    details: Optional[List[ErrorDetail]] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorEnvelopeBody


# --- Auth Schemas ---

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    createdAt: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AuthData(BaseModel):
    user: UserResponse
    accessToken: str


class TokenRefreshData(BaseModel):
    accessToken: str


class MessageData(BaseModel):
    message: str


# --- Subtask & History Schemas ---

class SubtaskCreate(BaseModel):
    title: str = Field(min_length=1)


class SubtaskUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None


class SubtaskResponse(BaseModel):
    id: str
    taskId: Optional[str] = None
    title: str
    completed: bool
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TaskHistoryResponse(BaseModel):
    id: str
    text: str
    timestamp: str

    model_config = ConfigDict(from_attributes=True)


class TaskAttachmentResponse(BaseModel):
    id: str
    filename: str
    fileSize: int
    contentType: str
    uploadedAt: str

    model_config = ConfigDict(from_attributes=True)


# --- Task Schemas ---

class TaskCreate(BaseModel):
    title: str = Field(min_length=1)
    description: Optional[str] = ""
    status: Optional[str] = "todo"
    priority: Optional[str] = "medium"
    category: Optional[str] = "General"
    tags: Optional[List[str]] = Field(default_factory=list)
    dueDate: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    dueDate: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    status: str
    priority: str
    category: str
    tags: List[str]
    dueDate: Optional[str] = None
    createdAt: str
    updatedAt: str
    subtasks: List[SubtaskResponse] = Field(default_factory=list)
    history: List[TaskHistoryResponse] = Field(default_factory=list)
    attachments: List[TaskAttachmentResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class BulkDeleteRequest(BaseModel):
    taskIds: List[str]


class BulkDeleteData(BaseModel):
    count: int
    message: str


class BulkStatusUpdateRequest(BaseModel):
    taskIds: List[str]
    status: str


class BulkStatusUpdateData(BaseModel):
    count: int
    message: str


# --- Analytics Schemas ---

class VelocityMetrics(BaseModel):
    completedThisWeek: int
    trend: str


class PriorityDistribution(BaseModel):
    low: int
    medium: int
    high: int
    urgent: int


class AnalyticsData(BaseModel):
    totalTasks: int
    completedTasks: int
    inProgressTasks: int
    urgentTasks: int
    completionRate: float
    velocity: VelocityMetrics
    priorityDistribution: PriorityDistribution