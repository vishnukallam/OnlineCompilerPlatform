const { io } = require("socket.io-client");
const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected");
  socket.emit("run-code", {
    language: "python",
    code: `
import matplotlib.pyplot as plt
x = [1, 2, 3]
y = [1, 4, 9]
plt.plot(x, y)
plt.show()
`
  });
});

socket.on("stdout", (data) => console.log("STDOUT:", JSON.stringify(data)));
socket.on("stderr", (data) => console.log("STDERR:", data));
socket.on("status", (data) => console.log("STATUS:", data));
socket.on("disconnect", () => console.log("Disconnected"));
