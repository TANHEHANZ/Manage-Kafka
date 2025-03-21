"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controller/user.controller");
const router = (0, express_1.Router)();
router.get("/users", user_controller_1.getUser);
router.post("/users", user_controller_1.postUser);
router.put("/users/:id", user_controller_1.putUser);
router.delete("/users/:id", user_controller_1.deleteUser);
exports.default = router;
