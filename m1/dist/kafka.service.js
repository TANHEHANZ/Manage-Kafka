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
Object.defineProperty(exports, "__esModule", { value: true });
exports.kafkaService = void 0;
const kafkajs_1 = require("kafkajs");
class KafkaService {
    constructor() {
        this.kafka = new kafkajs_1.Kafka({
            clientId: "m1-service",
            brokers: ["localhost:9092"],
        });
        this.producer = this.kafka.producer();
        this.consumers = new Map();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.producer.connect();
        });
    }
    sendMessage(topic, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.producer.send({
                    topic,
                    messages: [{ value: JSON.stringify(message) }],
                });
            }
            catch (error) {
                console.error("Error sending message:", error);
                throw error;
            }
        });
    }
    subscribeToTopic(topic, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.consumers.has(topic)) {
                const consumer = this.kafka.consumer({ groupId: `m1-${topic}-group` });
                yield consumer.connect();
                yield consumer.subscribe({ topic, fromBeginning: true });
                yield consumer.run({
                    eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ message }) {
                        if (message.value === null) {
                            console.warn("Received message with null value");
                            return;
                        }
                        const data = JSON.parse(message.value.toString());
                        messageHandler(data);
                    }),
                });
                this.consumers.set(topic, consumer);
            }
        });
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.producer.disconnect();
            for (const consumer of this.consumers.values()) {
                yield consumer.disconnect();
            }
        });
    }
}
exports.kafkaService = new KafkaService();
