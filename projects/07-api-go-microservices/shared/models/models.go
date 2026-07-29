package models

import (
	"time"
)

type User struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	Email     string    `json:"email" gorm:"uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"not null"`
	Name      string    `json:"name" gorm:"not null"`
	Role      string    `json:"role" gorm:"default:USER"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type RefreshToken struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	UserID    string    `json:"userId" gorm:"index;not null"`
	Token     string    `json:"token" gorm:"uniqueIndex;not null"`
	ExpiresAt time.Time `json:"expiresAt" gorm:"not null"`
	Revoked   bool      `json:"revoked" gorm:"default:false"`
	CreatedAt time.Time `json:"createdAt"`
}

type Task struct {
	ID          string         `json:"id" gorm:"primaryKey"`
	UserID      string         `json:"userId" gorm:"index;not null"`
	Title       string         `json:"title" gorm:"not null"`
	Description string         `json:"description"`
	Status      string         `json:"status" gorm:"default:todo"`
	Priority    string         `json:"priority" gorm:"default:medium"`
	Category    string         `json:"category" gorm:"default:General"`
	Tags        []string       `json:"tags" gorm:"serializer:json"`
	DueDate     string         `json:"dueDate"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	Subtasks    []Subtask      `json:"subtasks" gorm:"foreignKey:TaskID;constraint:OnDelete:CASCADE"`
	History     []TaskHistory  `json:"history" gorm:"foreignKey:TaskID;constraint:OnDelete:CASCADE"`
	Attachments []FileResource `json:"attachments" gorm:"foreignKey:TaskID;constraint:OnDelete:CASCADE"`
}

type Subtask struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	TaskID    string    `json:"taskId" gorm:"index;not null"`
	Title     string    `json:"title" gorm:"not null"`
	Completed bool      `json:"completed" gorm:"default:false"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type TaskHistory struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	TaskID    string    `json:"taskId" gorm:"index;not null"`
	Text      string    `json:"text" gorm:"not null"`
	Timestamp time.Time `json:"timestamp"`
}

type FileResource struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	TaskID      string    `json:"taskId" gorm:"index"`
	Filename    string    `json:"filename" gorm:"not null"`
	ContentType string    `json:"contentType"`
	SizeBytes   int64     `json:"sizeBytes"`
	FilePath    string    `json:"-"`
	CreatedAt   time.Time `json:"createdAt"`
}

type AnalyticsData struct {
	TotalTasks           int                  `json:"totalTasks"`
	CompletedTasks       int                  `json:"completedTasks"`
	InProgressTasks      int                  `json:"inProgressTasks"`
	UrgentTasks          int                  `json:"urgentTasks"`
	CompletionRate       float64              `json:"completionRate"`
	Velocity             VelocityData         `json:"velocity"`
	PriorityDistribution PriorityDistribution `json:"priorityDistribution"`
}

type VelocityData struct {
	CompletedThisWeek int    `json:"completedThisWeek"`
	Trend             string `json:"trend"`
}

type PriorityDistribution struct {
	Low    int `json:"low"`
	Medium int `json:"medium"`
	High   int `json:"high"`
	Urgent int `json:"urgent"`
}