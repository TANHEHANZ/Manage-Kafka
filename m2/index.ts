import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { Kafka } from "kafkajs";

const app = express();
app.use(bodyParser.json());

const kafka = new Kafka({
  clientId: "ms2",
  brokers: ["localhost:9092"],
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "ms2-group" });

//  forma sincrona de manejar servicios 

app.get("/usuarios", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:3001/api/users");
    res.json(response.data);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

//  forma asincrona de manejo de servicios , utilizamos kafka para la mensajeria entre servicios
app.post("/enviar-solicitud", async (req, res) => {
  try {
    const solicitud = { accion: "procesar-solicitud", data: req.body };

    await producer.connect();
    await producer.send({
      topic: "user-action",
      messages: [{ value: JSON.stringify(solicitud) }],
    });
    await producer.disconnect();

    res.json({
      mensaje: "Solicitud enviada correctamente a m1 a través de Kafka",
    });
  } catch (error) {
    console.error("Error al enviar solicitud a m1:", error);
    res.status(500).json({ error: "Error al enviar solicitud a m1" });
  }
});

app.post("/crear-usuario", async (req, res) => {
  try {
    const { name, rol } = req.body;

    await producer.connect();
    await producer.send({
      topic: "user-created",
      messages: [
        {
          value: JSON.stringify({
            action: "CREATE_USER",
            data: { name, rol },
          }),
        },
      ],
    });
    await producer.disconnect();

    res.json({
      mensaje: "Solicitud de creación de usuario enviada correctamente",
      userData: { name, rol },
    });
  } catch (error) {
    console.error("Error al enviar solicitud de creación:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});
const runConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({
      topic: "user-creation-result",
      fromBeginning: true,
    });
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const data = JSON.parse(message.value.toString());
        console.log("Resultado de creación de usuario:", data);
      },
    });
  } catch (error) {
    console.error("Error en el consumidor:", error);
  }
};

runConsumer();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Microservicio 2 corriendo en el puerto ${PORT}`);
});
