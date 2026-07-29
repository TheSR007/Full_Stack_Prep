package handlers

import (
	"sync"

	"github.com/gofiber/websocket/v2"
)

type WebSocketHub struct {
	clients   map[*websocket.Conn]bool
	broadcast chan interface{}
	mu        sync.Mutex
}

func NewWebSocketHub() *WebSocketHub {
	hub := &WebSocketHub{
		clients:   make(map[*websocket.Conn]bool),
		broadcast: make(chan interface{}, 256),
	}
	go hub.run()
	return hub
}

func (h *WebSocketHub) run() {
	for msg := range h.broadcast {
		h.mu.Lock()
		for client := range h.clients {
			if err := client.WriteJSON(msg); err != nil {
				client.Close()
				delete(h.clients, client)
			}
		}
		h.mu.Unlock()
	}
}

func (h *WebSocketHub) Broadcast(msg interface{}) {
	h.broadcast <- msg
}

func (h *WebSocketHub) HandleWS(c *websocket.Conn) {
	h.mu.Lock()
	h.clients[c] = true
	h.mu.Unlock()

	defer func() {
		h.mu.Lock()
		delete(h.clients, c)
		h.mu.Unlock()
		c.Close()
	}()

	for {
		var msg map[string]interface{}
		if err := c.ReadJSON(&msg); err != nil {
			break
		}
	}
}