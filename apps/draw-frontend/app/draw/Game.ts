// import { getExistingShape } from "./http";
// import { Tool } from "../components/CCanvas";

// export type Shape =
//   | {
//       type: "rect";
//       x: number;
//       y: number;
//       width: number;
//       height: number;
//     }
//   | {
//       type: "circle";
//       centerX: number;
//       centerY: number;
//       radius: number;
//     }
//   | {
//       type: "path";
//       points: { x: number; y: number }[];
//     };

// export class Game {
//   private canvas: HTMLCanvasElement;
//   private ctx: CanvasRenderingContext2D;
//   private existingShape: Shape[];
//   private roomId: string;
//   private socket: WebSocket;
//   private clicked: boolean;
//   private startX: number = 0;
//   private startY: number = 0;
//   private selectedTool: Tool = "rect";
//   private isDrawing: boolean = false;
//   private currentPath: { x: number; y: number }[] = [];

//   private readonly MIN_POINT_DIST = 3;

//   constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
//     this.canvas = canvas;
//     this.ctx = canvas.getContext("2d")!;
//     this.existingShape = [];
//     this.roomId = roomId;
//     this.socket = socket;
//     this.clicked = false;
//     this.startX = 0;

//     this.init();
//     this.initHandlers();
//     this.initMouseHandlers();
//   }

//   destroy() {
//     this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
//     this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
//     this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
//   }

//   setTool(tool: Tool) {
//     this.selectedTool = tool;
//     this.isDrawing = false;
//     this.currentPath = [];
//   }

//   async init() {
//     this.existingShape = await getExistingShape(this.roomId);
//     this.clearCanvas();
//   }

//   initHandlers() {
//     this.socket.onmessage = (event) => {
//       const message = JSON.parse(event.data);

//       if (message.type === "chat") {
//         const parsedShape = JSON.parse(message.message);

//         if (
//           parsedShape.type &&
//           (parsedShape.type === "rect" ||
//             parsedShape.type === "circle" ||
//             parsedShape.type === "path")
//         ) {
//           this.existingShape.push(parsedShape);
//           this.clearCanvas();
//         }
//       }
//     };
//   }

//   clearCanvas() {
//     this.ctx.fillStyle = "black";
//     this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

//     this.ctx.strokeStyle = "white";
//     this.ctx.lineWidth = 2;
//     this.ctx.lineCap = "round";
//     this.ctx.lineJoin = "round";
//     this.existingShape.forEach((shape) => {
//       if (shape.type === "rect") {
//         const x = shape.width < 0 ? shape.x + shape.width : shape.x;
//         const y = shape.height < 0 ? shape.y + shape.height : shape.y;
//         const width = Math.abs(shape.width);
//         const height = Math.abs(shape.height);

//         if (width > 0 && height > 0) {
//           this.ctx.strokeRect(x, y, width, height);
//         }
//       } else if (shape.type === "circle") {
//         this.ctx.beginPath();
//         this.ctx.arc(
//           shape.centerX,
//           shape.centerY,
//           shape.radius,
//           0,
//           Math.PI * 2,
//         );
//         this.ctx.stroke();
//         this.ctx.closePath();
//       } else if (shape.type === "path") {
//         this.ctx.beginPath();
//         shape.points.forEach((point, index) => {
//           if (index === 0) {
//             this.ctx.moveTo(point.x, point.y);
//           } else {
//             this.ctx.lineTo(point.x, point.y);
//           }
//         });
//         this.ctx.stroke();
//         this.ctx.closePath();
//       }
//     });
//   }

//   mouseDownHandler = (e: MouseEvent) => {
//     const getCanvasCoords = (e: MouseEvent) => {
//       const rect = this.canvas.getBoundingClientRect();
//       return {
//         x: e.clientX - rect.left,
//         y: e.clientY - rect.top,
//       };
//     };

//     const coords = getCanvasCoords(e);
//     this.clicked = true;
//     this.startX = coords.x;
//     this.startY = coords.y;

//     if (this.selectedTool === "pencil") {
//       this.isDrawing = true;
//       this.currentPath = [{ x: coords.x, y: coords.y }];
//     }
//   };

//   mouseUpHandler = (e: MouseEvent) => {
//     const getCanvasCoords = (e: MouseEvent) => {
//       const rect = this.canvas.getBoundingClientRect();
//       return {
//         x: e.clientX - rect.left,
//         y: e.clientY - rect.top,
//       };
//     };

//     this.clicked = false;

//     if (
//       this.selectedTool === "pencil" &&
//       this.isDrawing &&
//       this.currentPath.length > 1
//     ) {
//       const shape: Shape = {
//         type: "path",
//         points: this.currentPath,
//       };

//       this.existingShape.push(shape);
//       this.socket.send(
//         JSON.stringify({
//           type: "chat",
//           message: JSON.stringify(shape),
//           roomId: this.roomId,
//         }),
//       );
//       this.currentPath = [];
//       this.isDrawing = false;
//     } else {
//       const coords = getCanvasCoords(e);
//       let width = coords.x - this.startX;
//       let height = coords.y - this.startY;

//       const x = width < 0 ? coords.x : this.startX;
//       const y = height < 0 ? coords.y : this.startY;
//       width = Math.abs(width);
//       height = Math.abs(height);

//       if (width < 5 || height < 5) {
//         return;
//       }

//       const selectedTool = this.selectedTool;
//       let shape: Shape | null = null;

//       if (selectedTool === "rect") {
//         shape = {
//           type: "rect",
//           x,
//           y,
//           width,
//           height,
//         };
//       } else if (selectedTool === "circle") {
//         const radius = Math.max(width, height) / 2;
//         shape = {
//           type: "circle",
//           radius,
//           centerX: this.startX + width / 2,
//           centerY: this.startY + height / 2,
//         };
//       }

//       if (shape) {
//         this.existingShape.push(shape);
//         this.socket.send(
//           JSON.stringify({
//             type: "chat",
//             message: JSON.stringify(shape),
//             roomId: this.roomId,
//           }),
//         );
//       }
//     }

//     this.clearCanvas();
//   };

//   mouseMoveHandler = (e: MouseEvent) => {
//     const getCanvasCoords = (e: MouseEvent) => {
//       const rect = this.canvas.getBoundingClientRect();
//       return {
//         x: e.clientX - rect.left,
//         y: e.clientY - rect.top,
//       };
//     };

//     if (this.clicked) {
//       const coords = getCanvasCoords(e);

//       if (this.selectedTool === "pencil" && this.isDrawing) {
//         const lastPoint = this.currentPath[this.currentPath.length - 1];
//         if (!lastPoint) {
//           this.currentPath.push(coords);
//         } else {
//           const dx = coords.x - lastPoint.x;
//           const dy = coords.y - lastPoint.y;
//           const distSq = dx * dx + dy * dy;

//           if (distSq >= this.MIN_POINT_DIST * this.MIN_POINT_DIST) {
//             this.currentPath.push(coords);
//           }
//         }
//         this.clearCanvas();

//         this.ctx.strokeStyle = "white";
//         this.ctx.lineWidth = 2;
//         this.ctx.lineCap = "round";
//         this.ctx.lineJoin = "round";
//         this.ctx.beginPath();
//         this.currentPath.forEach((point, index) => {
//           if (index === 0) {
//             this.ctx.moveTo(point.x, point.y);
//           } else {
//             this.ctx.lineTo(point.x, point.y);
//           }
//         });
//         this.ctx.stroke();
//         this.ctx.closePath();
//       } else {
//         let width = coords.x - this.startX;
//         let height = coords.y - this.startY;

//         this.clearCanvas();

//         const x = width < 0 ? coords.x : this.startX;
//         const y = height < 0 ? coords.y : this.startY;
//         width = Math.abs(width);
//         height = Math.abs(height);

//         this.ctx.strokeStyle = "white";

//         const selectedTool = this.selectedTool;
//         if (selectedTool === "rect") {
//           this.ctx.strokeRect(x, y, width, height);
//         } else if (selectedTool === "circle") {
//           const centerX = this.startX + width / 2;
//           const centerY = this.startY + height / 2;
//           const radius = Math.max(width, height) / 2;
//           this.ctx.beginPath();
//           this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
//           this.ctx.stroke();
//           this.ctx.closePath();
//         }
//       }
//     }
//   };

//   initMouseHandlers() {
//     this.canvas.addEventListener("mousedown", this.mouseDownHandler);
//     this.canvas.addEventListener("mouseup", this.mouseUpHandler);
//     this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
//   }
// }



import { getExistingShape } from "./http";
import { Tool } from "../components/CCanvas";

export type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; centerX: number; centerY: number; radius: number }
  | { type: "path"; points: { x: number; y: number }[] }
  | { type: "text"; x: number; y: number; text: string; fontSize: number };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShape: Shape[];
  private roomId: string;
  private socket: WebSocket;
  private clicked: boolean;
  
  // Camera State
  private offsetX: number = 0;
  private offsetY: number = 0;
  private startX: number = 0;
  private startY: number = 0;

  private selectedTool: Tool = "rect";
  private isDrawing: boolean = false;
  private currentPath: { x: number; y: number }[] = [];
  private textInput: HTMLInputElement | null = null;
  private isTextInputActive: boolean = false;

  private readonly MIN_POINT_DIST = 3;
  private readonly DEFAULT_FONT_SIZE = 24;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShape = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;

    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  // Helper to convert screen clicks to "World" coordinates
  private getEventCoords(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left - this.offsetX,
      y: e.clientY - rect.top - this.offsetY,
    };
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.removeTextInput();
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
    this.isDrawing = false;
    if (tool !== "text") this.removeTextInput();
  }

  async init() {
    this.existingShape = await getExistingShape(this.roomId);
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShape.push(parsedShape);
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to clear full screen
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.translate(this.offsetX, this.offsetY); // Apply Camera Pan

    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    this.existingShape.forEach((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
        this.ctx.stroke();
      } else if (shape.type === "path") {
        this.ctx.beginPath();
        shape.points.forEach((p, i) => i === 0 ? this.ctx.moveTo(p.x, p.y) : this.ctx.lineTo(p.x, p.y));
        this.ctx.stroke();
      } else if (shape.type === "text") {
        this.ctx.font = `${shape.fontSize}px Arial`;
        this.ctx.fillText(shape.text, shape.x, shape.y);
      }
    });
  }

  mouseDownHandler = (e: MouseEvent) => {
    if (this.isTextInputActive) return;

    this.clicked = true;
    const coords = this.getEventCoords(e);
    
    // For panning, we need raw screen coords to calculate delta
    this.startX = e.clientX; 
    this.startY = e.clientY;

    if (this.selectedTool === "drag") return;

    if (this.selectedTool === "text") {
      this.createTextInput(coords.x, coords.y);
      return;
    }

    // Capture starting world coordinates for drawing
    this.startX = coords.x;
    this.startY = coords.y;

    if (this.selectedTool === "pencil") {
      this.isDrawing = true;
      this.currentPath = [{ x: coords.x, y: coords.y }];
    }
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;

    if (this.selectedTool === "drag") {
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;
      this.offsetX += dx;
      this.offsetY += dy;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.clearCanvas();
      return;
    }

    const coords = this.getEventCoords(e);
    this.clearCanvas();

    if (this.selectedTool === "pencil" && this.isDrawing) {
      this.currentPath.push(coords);
      this.ctx.beginPath();
      this.currentPath.forEach((p, i) => i === 0 ? this.ctx.moveTo(p.x, p.y) : this.ctx.lineTo(p.x, p.y));
      this.ctx.stroke();
    } else if (this.selectedTool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, coords.x - this.startX, coords.y - this.startY);
    } else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(Math.pow(coords.x - this.startX, 2) + Math.pow(coords.y - this.startY, 2));
      this.ctx.beginPath();
      this.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    if (!this.clicked || this.selectedTool === "drag") {
      this.clicked = false;
      return;
    }

    const coords = this.getEventCoords(e);
    let shape: Shape | null = null;

    if (this.selectedTool === "pencil") {
      shape = { type: "path", points: this.currentPath };
    } else if (this.selectedTool === "rect") {
      shape = { type: "rect", x: this.startX, y: this.startY, width: coords.x - this.startX, height: coords.y - this.startY };
    } else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(Math.pow(coords.x - this.startX, 2) + Math.pow(coords.y - this.startY, 2));
      shape = { type: "circle", centerX: this.startX, centerY: this.startY, radius };
    }

    if (shape) {
      this.existingShape.push(shape);
      this.socket.send(JSON.stringify({ type: "chat", message: JSON.stringify(shape), roomId: this.roomId }));
    }

    this.clicked = false;
    this.isDrawing = false;
    this.currentPath = [];
    this.clearCanvas();
  };

  // ... (Keep existing text input methods but update input.style.left/top using this.offsetX/Y)
  createTextInput(x: number, y: number) {
    this.removeTextInput();
    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "fixed";
    // Convert World coords back to Screen coords for the DOM input position
    input.style.left = `${this.canvas.getBoundingClientRect().left + x + this.offsetX}px`;
    input.style.top = `${this.canvas.getBoundingClientRect().top + y + this.offsetY}px`;
    input.style.font = `${this.DEFAULT_FONT_SIZE}px Arial`;
    input.style.background = "rgba(0, 0, 0, 0.9)";
    input.style.color = "white";
    input.style.zIndex = "1000";
    
    this.textInput = input;
    this.isTextInputActive = true;

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const shape: Shape = { type: "text", x, y, text: input.value, fontSize: this.DEFAULT_FONT_SIZE };
        this.existingShape.push(shape);
        this.socket.send(JSON.stringify({ type: "chat", message: JSON.stringify(shape), roomId: this.roomId }));
        this.removeTextInput();
        this.clearCanvas();
      }
    });
    document.body.appendChild(input);
    setTimeout(() => input.focus(), 0);
  }

  private removeTextInput() {
    if (this.textInput) {
      this.textInput.remove();
      this.textInput = null;
      this.isTextInputActive = false;
    }
  }

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}