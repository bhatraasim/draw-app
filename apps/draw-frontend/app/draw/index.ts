import axios from "axios";
import { BACKEND_URL } from "../conif";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    };

export async function initdraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    let existingShape: Shape[] = await getExistingShape(roomId);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    socket.onmessage = ((event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === "chat") {
            
                const parsedShape = JSON.parse(message.message);
                
                // Check if it's a valid shape
                if (parsedShape.type && (parsedShape.type === "rect" || parsedShape.type === "circle")) {
                    existingShape.push(parsedShape);
                    clearCanvas(existingShape, canvas, ctx);
                }
            
        }
    });

    clearCanvas(existingShape, canvas, ctx);

    let clicked = false;
    let startX = 0;
    let startY = 0;

    const getCanvasCoords = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    canvas.addEventListener("mousedown", (e) => {
        const coords = getCanvasCoords(e);
        startX = coords.x;
        startY = coords.y;
        clicked = true;
    });

    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
        
        const coords = getCanvasCoords(e);
        let width = coords.x - startX;
        let height = coords.y - startY;
        
        // Fix negative dimensions and ensure minimum size
        const x = width < 0 ? coords.x : startX;
        const y = height < 0 ? coords.y : startY;
        width = Math.abs(width);
        height = Math.abs(height);
        
        // Only create shape if it has meaningful size (at least 5x5 pixels)
        if (width < 5 || height < 5) {
            return;
        }
        
        const shape: Shape = {
            type: "rect",
            x: x,
            y: y,
            width,
            height
        };

        existingShape.push(shape);

        socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify(shape),  
            roomId: roomId
        }));
        
        clearCanvas(existingShape, canvas, ctx);
    });

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const coords = getCanvasCoords(e);
            let width = coords.x - startX;
            let height = coords.y - startY;

            clearCanvas(existingShape, canvas, ctx);
            
            // Handle negative dimensions for preview
            const x = width < 0 ? coords.x : startX;
            const y = height < 0 ? coords.y : startY;
            width = Math.abs(width);
            height = Math.abs(height);
            
            ctx.strokeStyle = "white";
            ctx.strokeRect(x, y, width, height);
        }
    });
}

function clearCanvas(existingShape: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";
    existingShape.forEach((shape) => {
        if (shape.type === "rect") {
            // Handle negative dimensions properly
            const x = shape.width < 0 ? shape.x + shape.width : shape.x;
            const y = shape.height < 0 ? shape.y + shape.height : shape.y;
            const width = Math.abs(shape.width);
            const height = Math.abs(shape.height);
            
            // Only draw if shape has meaningful size
            if (width > 0 && height > 0) {
                ctx.strokeRect(x, y, width, height);
            }
        }
    });
}

async function getExistingShape(roomId: string) {
    try {
        const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
        const data = res.data.messages;

        const shapes: Shape[] = [];
        
        data.forEach((x: { message: string }) => {
           
                const messageData = JSON.parse(x.message);
                
                if (messageData.type && (messageData.type === "rect" || messageData.type === "circle")) {
                    shapes.push(messageData);
                }
            
        });

        return shapes;
    } catch (error) {
        console.error("Error fetching shapes:", error);
        return [];
    }
}
