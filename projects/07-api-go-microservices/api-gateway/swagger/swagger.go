package swagger

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/swagger"

	_ "taskflow/api-gateway/docs"
)

func RegisterSwagger(app *fiber.App) {
	app.Get("/api-docs/*", swagger.HandlerDefault)
}
