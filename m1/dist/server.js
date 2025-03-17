"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes/routes"));
const kafka_service_1 = require("./kafka.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "1000mb" }));
app.use(express_1.default.urlencoded({ limit: "1000mb", extended: true }));
const PORT = process.env.PORT;
app.use("/api", routes_1.default);
kafka_service_1.kafkaService.initialize().then(() => {
    kafka_service_1.kafkaService.subscribeToTopic("user-action", (data) => {
        console.log("Mensaje recibido:", data);
    });
});
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    yield kafka_service_1.kafkaService.shutdown();
    process.exit(0);
}));
app.use((err, req, res, next) => {
    console.error("Internal Server Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});
app.listen(PORT, () => {
    console.log(`Server running at PORT: ${PORT} and accessible on the network`);
});
