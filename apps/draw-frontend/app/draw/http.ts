import axios from "axios";

import { BACKEND_URL } from "../conif";
import { Shape } from "./Game";

export async function getExistingShape(roomId: string) {
  try {
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    const data = res.data.messages;

    const shapes: Shape[] = [];

    data.forEach((x: { message: string }) => {
      const messageData = JSON.parse(x.message);

      if (
        messageData.type &&
        (messageData.type === "rect" ||
          messageData.type === "circle" ||
          messageData.type === "path" ||
          messageData.type == "text")
      ) {
        shapes.push(messageData);
      }
    });

    return shapes;
  } catch (error) {
    console.error("Error fetching shapes:", error);
    return [];
  }
}
