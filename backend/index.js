const express = require("express");
const app = express();
const http = require("http");
const { Server: SocketIoServer } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 8000;
const cookieParser = require('cookie-parser');
const questionRoute = require("./routes/questionRoute");

connectDB();
const corsOption = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  credentials: true,
  allowedHeaders: "Content-Type,Authorization",
  optionsSuccessStatus: 204
}
 
app.options('*', cors(corsOption));
// Enable CORS with specific options
app.use(cors(corsOption)); 
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello World !");
});

//admin route
app.use("/api", questionRoute);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
