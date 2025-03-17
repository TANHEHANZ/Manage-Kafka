import { Kafka, Producer, Consumer } from "kafkajs";

class KafkaService {
  private producer: Producer;
  private consumers: Map<string, Consumer>;
  private kafka: Kafka;

  constructor() {
    this.kafka = new Kafka({
      clientId: "m1-service",
      brokers: ["localhost:9092"],
    });
    this.producer = this.kafka.producer();
    this.consumers = new Map();
  }

  async initialize() {
    await this.producer.connect();
  }

  async sendMessage(topic: string, message: any) {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async subscribeToTopic(
    topic: string,
    messageHandler: (message: any) => void
  ) {
    if (!this.consumers.has(topic)) {
      const consumer = this.kafka.consumer({ groupId: `m1-${topic}-group` });
      await consumer.connect();
      await consumer.subscribe({ topic, fromBeginning: true });
      await consumer.run({
        eachMessage: async ({ message }) => {
          if (message.value === null) {
            console.warn("Received message with null value");
            return;
          }
          const data = JSON.parse(message.value.toString());
          messageHandler(data);
        },
      });
      this.consumers.set(topic, consumer);
    }
  }

  async shutdown() {
    await this.producer.disconnect();
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
  }
}

export const kafkaService = new KafkaService();
