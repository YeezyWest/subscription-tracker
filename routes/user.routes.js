import { Router } from "express";

const userRouter = Router();

userRouter.get("/", (req, res) => {
  res.send({ title: "GET all users" });
});
userRouter.get("/:id", (req, res) => {
  res.send({ title: "GET user by id" });
});
userRouter.post("/", (req, res) => {
  res.send({ title: "POST create user" });
});
userRouter.put("/:id", (req, res) => {
  res.send({ title: "PUT update user" });
});
userRouter.delete("/:id", (req, res) => {
  res.send({ title: "DELETE user" });
});

export default userRouter;
