const app = require("express");
const router = app.Router();
const UserModel = require("../model/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).send({
      status: 200,
      error: false,
      message: "All users fetched",
      users,
    });
  } catch (error) {
    res
      .status(500)
      .send({ status: 500, error: true, message: "Internal server error" });
  }
});

// Get a single user
router.get("/:id", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      let error = Error("User not found");
      error.code = 404;
      throw error;
    }
    res
      .status(200)
      .send({ status: 200, error: false, message: "User found", user });
  } catch (error) {
    res.status(error.code || 500).send({
      status: error.code || 500,
      error: true,
      message: error.message || "Internal server error",
    });
  }
});

// Get a single user by email
router.get("/findByEmail/:email", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.params.email });
    if (!user) {
      let error = Error("User not found");
      error.code = 404;
      throw error;
    }
    res.status(200).send({
      status: 200,
      error: false,
      message: `User found with email ${req.params.email}`,
      user,
    });
  } catch (error) {
    res.status(error.code || 500).send({
      status: error.code || 500,
      error: true,
      message: error.message || "Internal server error",
    });
  }
});

//Create a user
router.post("/", async (req, res) => {
  try {
    const userCheck = await UserModel.findOne({ email: req.body.email });
    if (userCheck) {
      let error = Error("Email already in use");
      error.code = 403;
      throw error;
    }
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hash;

    const user = await UserModel.create({ ...req.body });
    user.password = undefined;
    res
      .status(201)
      .send({ status: 201, error: false, message: "User created", user });
  } catch (error) {
    res.status(error.code || 500).send({
      status: error.code || 500,
      error: true,
      message: error.message || "Internal server error",
    });
  }
});

//Authenticate and login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      let error = Error("This email doesn't Exist");
      error.code = 404;
      throw error;
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      let error = Error("Password is not valid");
      error.code = 400;
      throw error;
    }
    user.password = undefined;

    // generate token
    const token = jwt.sign({ data: user }, process.env.jwtSecret);

    res.status(200).send({
      status: 200,
      error: false,
      message: "User is logged in",
      user,
      token,
    });
  } catch (error) {
    res.status(error.code || 500).send({
      status: error.code || 500,
      error: true,
      message: error.message || "Internal server error",
    });
  }
});

//Delete a user
router.delete("/:id", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      let error = Error("User Not Found");
      error.code = 404;
      throw error;
    }
    await UserModel.deleteOne({ _id: req.params.id });
    res
      .status(200)
      .send({ status: 200, error: false, message: "User deleted" });
  } catch (error) {
    res.status(error.code || 500).send({
      status: error.code || 500,
      error: true,
      message: error.message || "Internal server error",
    });
  }
});

//Update a user
router.put("/:id", async (req, res) => {
  req.body.password = undefined;
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!user) {
      let error = Error("User Not Found");
      error.code = 404;
      throw error;
    }
    res
      .status(201)
      .send({ status: 201, error: false, message: "User Updated", user });
  } catch (error) {
    res.status(error.code || 500).send({
      status: error.code || 500,
      error: true,
      message: error.message || "Internal server error",
    });
  }
});

module.exports = router;
