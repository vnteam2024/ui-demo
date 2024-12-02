package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize the Gin router
	router := gin.Default()

	// Serve static files from the "files" directory
	router.StaticFS("/", http.Dir("./"))

	// Define a route to serve individual files by name
	//router.GET("/file/:name", func(c *gin.Context) {
	//	// Get the file name from the URL parameter
	//	fileName := c.Param("name")
	//
	//	// Serve the file using the static file server
	//	c.File("./" + fileName)
	//})

	// Run the server on port 8080
	router.Run(":3050")
}
