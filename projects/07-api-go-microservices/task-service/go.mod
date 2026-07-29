module taskflow/task-service

go 1.22

require (
	github.com/google/uuid v1.6.0
	gorm.io/driver/sqlite v1.5.6
	gorm.io/gorm v1.25.11
	taskflow/shared v0.0.0
)

require (
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/mattn/go-sqlite3 v1.14.22 // indirect
	golang.org/x/text v0.16.0 // indirect
)

replace taskflow/shared => ../shared
