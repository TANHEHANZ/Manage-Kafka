import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "ms1",
  brokers: ["localhost:9092"],
});
export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "ms1-group" });
