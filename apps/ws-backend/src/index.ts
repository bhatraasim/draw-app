// import "dotenv/config";
import dotenv, { config } from "dotenv";
import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { connectDB, Chat } from "@repo/db";
import { JWT_SECERT } from "@repo/backend-common";

interface Users {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

dotenv.config({ path: '../../.env' });
config();

const users: Users[] = [];

const wss = new WebSocketServer({ port: 8080 });

connectDB().catch(console.error);

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECERT);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (error) {
    return null;
  }
}

wss.on("connection", async function connection(ws, request) {
  const url = request.url;

  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") ?? "";
  const userId = checkUser(token);
  if (!userId) {
    ws.close(1008, "Invalid token");
    return;
  }
  users.push({
    ws,
    rooms: [],
    userId: userId,
  });
  ws.on("error", console.error);

  ws.on("message", async function message(data) {


    // let paresedata;
    // if( typeof paresedata !== "string" ){
    //   paresedata = JSON.parse(data.toString())
    // }else{
      
    //   paresedata = JSON.parse(data) //
    // }

    let paresedata;
    if (typeof data === "string") {
      paresedata = JSON.parse(data);
    } else if (data instanceof Buffer) {
      paresedata = JSON.parse(data.toString());
    } else if (data instanceof ArrayBuffer) {
      paresedata = JSON.parse(Buffer.from(data).toString());
    } else {
      throw new Error("Unsupported message data type");
    }


    // todo: check it that room existis in the db
    if (paresedata.type == "join_room") {
      const user = users.find((x) => x.ws === ws);
      user?.rooms.push(paresedata.roomId);
    }

    if (paresedata.type == "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user?.rooms.filter((x) => x !== paresedata.roomId);
    }

    if (paresedata.type == "chat") {
      const roomId = paresedata.roomId;
      const message = paresedata.message;

      //store the chat in the db
      try {
        await Chat.create({
          message: message,
          userId: userId,
          roomId: roomId,
        });
      } catch (error) {
        console.error("Error saving chat:", error);
      }

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,  
              roomId,
            }),
          );
        }
      });
    }
  });

  ws.on("close", () => {
    const index = users.findIndex((u) => u.ws === ws);
    if (index !== -1) users.splice(index, 1);
  });
});
