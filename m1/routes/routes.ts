import { Router } from "express";
import {
  deleteUser,
  getUser,
  postUser,
  putUser,
} from "../controller/user.controller";
const router = Router();

router.get("/users", getUser);

router.post("/users", postUser);

router.put("/users/:id", putUser);

router.delete("/users/:id", deleteUser);

export default router;
