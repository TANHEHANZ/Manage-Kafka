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
exports.deleteUser = exports.putUser = exports.postUser = exports.getUser = void 0;
const client_1 = require("@prisma/client");
const kafka_service_1 = require("../kafka.service");
const prisma = new client_1.PrismaClient();
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany();
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ error: "Error interno al obtener usuario(s)" });
    }
});
exports.getUser = getUser;
const postUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, rol } = req.body;
        if (rol !== "ADMIN" && rol !== "USER") {
            res.status(400).json({ error: "El 'rol' debe ser 'ADMIN' o 'USER'" });
            return;
        }
        const newUser = yield prisma.user.create({
            data: { name, rol },
        });
        yield kafka_service_1.kafkaService.sendMessage("user-created", newUser);
        res.status(201).json(newUser);
    }
    catch (error) {
        res.status(500).json({ error: "Error interno al crear usuario" });
    }
});
exports.postUser = postUser;
const putUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, rol } = req.body;
        if (rol && rol !== "ADMIN" && rol !== "USER") {
            res.status(400).json({ error: "El 'rol' debe ser 'ADMIN' o 'USER'" });
            return;
        }
        const updatedUser = yield prisma.user.update({
            where: { id },
            data: { name, rol },
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ error: "Error interno al actualizar usuario" });
    }
});
exports.putUser = putUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedUser = yield prisma.user.delete({
            where: { id },
        });
        res.status(200).json(deletedUser);
    }
    catch (error) {
        res.status(500).json({ error: "Error interno al eliminar usuario" });
    }
});
exports.deleteUser = deleteUser;
