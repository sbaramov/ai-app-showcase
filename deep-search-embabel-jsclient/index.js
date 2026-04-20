const { Client } = require("@stomp/stompjs");
const WebSocket = require("ws");

Object.assign(global, { WebSocket });

const client = new Client({
  brokerURL: "ws://localhost:8081/ws-research/websocket",
  onConnect: () => {
    console.log("Connected");

    client.subscribe("/topic/research/progress", (msg) => {
      console.log("[progress]", msg.body);
    });

    client.subscribe("/topic/research/result", (msg) => {
      console.log("[result]", msg.body);
      client.deactivate();
    });

    client.publish({
      destination: "/app/research",
      body: JSON.stringify({ researchTopic: "What are the latest Java AI application frameworks" }),
    });
  },
  onStompError: (frame) => console.error("STOMP error", frame.headers["message"]),
  onDisconnect: () => console.log("Disconnected"),
});

client.activate();
