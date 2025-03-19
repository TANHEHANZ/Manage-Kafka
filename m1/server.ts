import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/routes";
import { kafkaService } from "./kafka.service";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ limit: "1000mb", extended: true }));
const PORT = process.env.PORT;

app.use("/api", router);
// solo estamos esperando un evento , debemos gestionar mas eventos , buscar la forma correcta
kafkaService.initialize().then(() => {
  kafkaService.subscribeToTopic("user-action", (data) => {
    console.log("Mensaje recibido:", data);
  });
});
process.on("SIGTERM", async () => {
  await kafkaService.shutdown();
  process.exit(0);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Internal Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running at PORT: ${PORT} and accessible on the network`);
});
