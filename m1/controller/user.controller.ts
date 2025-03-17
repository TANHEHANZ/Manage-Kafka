import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { kafkaService } from "../kafka.service";

const prisma = new PrismaClient();

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Error interno al obtener usuario(s)" });
  }
};
export const postUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, rol } = req.body;
    if (rol !== "ADMIN" && rol !== "USER") {
      res.status(400).json({ error: "El 'rol' debe ser 'ADMIN' o 'USER'" });
      return;
    }
    const newUser = await prisma.user.create({
      data: { name, rol },
    });
    await kafkaService.sendMessage("user-created", newUser);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Error interno al crear usuario" });
  }
};

export const putUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, rol } = req.body;
    if (rol && rol !== "ADMIN" && rol !== "USER") {
      res.status(400).json({ error: "El 'rol' debe ser 'ADMIN' o 'USER'" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, rol },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Error interno al actualizar usuario" });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedUser = await prisma.user.delete({
      where: { id },
    });
    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(500).json({ error: "Error interno al eliminar usuario" });
  }
};
