import express from "express";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { middleware } from "./middleware";
import { JWT_SECERT } from "@repo/backend-common";
import cors from "cors";
import {
  CreateUserSchema,
  CreateSigninSchema,
  CreateRoomSchema,
} from "@repo/common/types";
import { connectDB, User, Room, Chat } from "@repo/db";
import bcrypt from "bcrypt";

import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

// Load environment variables
config();




declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000", // your frontend URL
  credentials: true,
}));

app.post("/signup", async (req, res) => {
  const data = CreateUserSchema.safeParse(req.body);
  if (!data.success) {
    console.log(data.error);
    res.json({
      message: "incorrect inputs",
    });
    return;
  }
  const { email, password, name, photo } = data.data;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      photo: photo || "",
    });

    res.json({
      message: "user created successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.log("❌ Database error during user creation:");
    console.log("Error code:", (error as any).code);
    console.log("Error message:", (error as any).message);
    console.log("Full error:", error);
    res.status(500).json({
      message: "Internal server error: error occurred while creating the user",
    });
  }
});

app.post("/signin", async (req, res) => {
  const data = CreateSigninSchema.safeParse(req.body);
  if (!data.success) {
    res.json({
      message: "incorrect inputs",
    });
    return;
  }

  const { email, password } = data.data;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECERT,
      {
        expiresIn: "7d",
      },
    );

    return res.json({
      message: "Signin successful",
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error: error occurred while signing the user",
    });
  }
});

app.post("/room", middleware, async (req, res) => {
  const data = CreateRoomSchema.safeParse(req.body);
  if (!data.success) {
    res.json({
      message: "incorrect inputs",
    });
    return;
  }

  const { slug } = data.data;

  const adminId = req.userId;

  if (!adminId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const room = await Room.create({
      slug,
      adminId,
    });

    res.json({
      message: "Room created successfully",
      room: {
        id: room._id,
        slug: room.slug,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error: error occurred while creating a room",
    });
  }
});

app.get("/chats/:roomId", async (req, res) => {
  try {
    const roomId = req.params.roomId; // keep it string
    console.log(req.params.roomId)

    const messages = await Chat.find({ roomId })
      .sort({ createdAt: 1 }) // newest first
      .limit(50);

    res.json({
      messages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// app.get("/room/:slug", async (req, res) => {
//   try {
//     const slug = req.params.slug; // keep it string

//     const room = await Room.find({ slug })

//     if (!room) {
//       return res.status(404).json({ message: "Room not found" });
//     }

//     res.json({
//       room
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch messages" });
//   }
// });

app.get("/room/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;

    const room = await Room.findOne({ slug }); // ✅ single room

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({
      id: room._id,   // ✅ what frontend wants
      slug: room.slug
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

app.listen(3001, async () => {
  console.log("HTTP server running on 3001");
  
  try {
    await connectDB();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.log("❌ Database connection failed:", error);
  }
});