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
    }
  | {
      type: "path";
      points: { x: number; y: number }[];
    }
  | {
      type: "text";
      x: number;
      y: number;
      text: string;
      fontSize: number;
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShape: Shape[];
  private roomId: string;
  private socket: WebSocket;
  private clicked: boolean;
  private startX: number = 0;
  private startY: number = 0;
  private selectedTool: Tool = "rect";
  private isDrawing: boolean = false;
  private currentPath: { x: number; y: number }[] = [];
  private textInput: HTMLInputElement | null = null;
  private textX: number = 0;
  private textY: number = 0;
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
    this.startX = 0;

    this.init();
    this.initHandlers();
    this.initMouseHandlers();
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
    this.currentPath = [];
    if (tool !== "text") {
      this.removeTextInput();
    }
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

        if (
          parsedShape.type &&
          (parsedShape.type === "rect" ||
            parsedShape.type === "circle" ||
            parsedShape.type === "path" ||
            parsedShape.type === "text")
        ) {
          this.existingShape.push(parsedShape);
          this.clearCanvas();
        }
      }
    };
  }

  clearCanvas() {
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.existingShape.forEach((shape) => {
      if (shape.type === "rect") {
        const x = shape.width < 0 ? shape.x + shape.width : shape.x;
        const y = shape.height < 0 ? shape.y + shape.height : shape.y;
        const width = Math.abs(shape.width);
        const height = Math.abs(shape.height);

        if (width > 0 && height > 0) {
          this.ctx.strokeRect(x, y, width, height);
        }
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          shape.radius,
          0,
          Math.PI * 2,
        );
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "path") {
        this.ctx.beginPath();
        shape.points.forEach((point, index) => {
          if (index === 0) {
            this.ctx.moveTo(point.x, point.y);
          } else {
            this.ctx.lineTo(point.x, point.y);
          }
        });
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "text") {
        this.ctx.font = `${shape.fontSize}px Arial`;
        this.ctx.fillStyle = "white";
        this.ctx.textBaseline = "top";
        this.ctx.fillText(shape.text, shape.x, shape.y);
      }
    });
  }

  removeTextInput() {
    if (this.textInput && this.textInput.parentNode) {
      this.textInput.parentNode.removeChild(this.textInput);
      this.textInput = null;
    }
    this.isTextInputActive = false;
  }

  createTextInput(x: number, y: number) {
    this.removeTextInput();

    const rect = this.canvas.getBoundingClientRect();
    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "fixed";
    input.style.left = `${rect.left + x}px`;
    input.style.top = `${rect.top + y}px`;
    input.style.font = `${this.DEFAULT_FONT_SIZE}px Arial`;
    input.style.border = "2px solid white";
    input.style.background = "rgba(0, 0, 0, 0.9)";
    input.style.color = "white";
    input.style.outline = "none";
    input.style.padding = "4px 8px";
    input.style.zIndex = "1000";
    input.style.minWidth = "200px";
    input.placeholder = "Type text here...";

    this.textInput = input;
    this.textX = x;
    this.textY = y;
    this.isTextInputActive = true;

    const handleSave = () => {
      if (!this.isTextInputActive) return;

      const text = input.value.trim();
      if (text) {
        const shape: Shape = {
          type: "text",
          x: this.textX,
          y: this.textY,
          text: text,
          fontSize: this.DEFAULT_FONT_SIZE,
        };

        this.existingShape.push(shape);
        this.socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify(shape),
            roomId: this.roomId,
          }),
        );
        this.clearCanvas();
      }
      this.removeTextInput();
    };

    input.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.removeTextInput();
      }
    });

    input.addEventListener("blur", () => {
      // Use a longer timeout and check if still active
      setTimeout(() => {
        if (this.textInput === input && this.isTextInputActive) {
          handleSave();
        }
      }, 200);
    });

    // Prevent mousedown on input from triggering canvas events
    input.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });

    input.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.body.appendChild(input);

    // Use requestAnimationFrame to ensure the input is in the DOM before focusing
    requestAnimationFrame(() => {
      if (this.textInput === input) {
        input.focus();
      }
    });
  }

  mouseDownHandler = (e: MouseEvent) => {
    // Don't process mousedown if we're currently editing text
    if (this.isTextInputActive) {
      return;
    }

    const getCanvasCoords = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const coords = getCanvasCoords(e);

    if (this.selectedTool === "text") {
      this.createTextInput(coords.x, coords.y);
      return;
    }

    this.clicked = true;
    this.startX = coords.x;
    this.startY = coords.y;

    if (this.selectedTool === "pencil") {
      this.isDrawing = true;
      this.currentPath = [{ x: coords.x, y: coords.y }];
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    const getCanvasCoords = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    this.clicked = false;

    if (
      this.selectedTool === "pencil" &&
      this.isDrawing &&
      this.currentPath.length > 1
    ) {
      const shape: Shape = {
        type: "path",
        points: this.currentPath,
      };

      this.existingShape.push(shape);
      this.socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify(shape),
          roomId: this.roomId,
        }),
      );
      this.currentPath = [];
      this.isDrawing = false;
    } else if (this.selectedTool !== "text") {
      const coords = getCanvasCoords(e);
      let width = coords.x - this.startX;
      let height = coords.y - this.startY;

      const x = width < 0 ? coords.x : this.startX;
      const y = height < 0 ? coords.y : this.startY;
      width = Math.abs(width);
      height = Math.abs(height);

      if (width < 5 || height < 5) {
        return;
      }

      const selectedTool = this.selectedTool;
      let shape: Shape | null = null;

      if (selectedTool === "rect") {
        shape = {
          type: "rect",
          x,
          y,
          width,
          height,
        };
      } else if (selectedTool === "circle") {
        const radius = Math.max(width, height) / 2;
        shape = {
          type: "circle",
          radius,
          centerX: this.startX + width / 2,
          centerY: this.startY + height / 2,
        };
      }

      if (shape) {
        this.existingShape.push(shape);
        this.socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify(shape),
            roomId: this.roomId,
          }),
        );
      }
    }

    this.clearCanvas();
  };

  mouseMoveHandler = (e: MouseEvent) => {
    const getCanvasCoords = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    if (this.clicked) {
      const coords = getCanvasCoords(e);

      if (this.selectedTool === "pencil" && this.isDrawing) {
        const lastPoint = this.currentPath[this.currentPath.length - 1];
        if (!lastPoint) {
          this.currentPath.push(coords);
        } else {
          const dx = coords.x - lastPoint.x;
          const dy = coords.y - lastPoint.y;
          const distSq = dx * dx + dy * dy;

          if (distSq >= this.MIN_POINT_DIST * this.MIN_POINT_DIST) {
            this.currentPath.push(coords);
          }
        }
        this.clearCanvas();

        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.beginPath();
        this.currentPath.forEach((point, index) => {
          if (index === 0) {
            this.ctx.moveTo(point.x, point.y);
          } else {
            this.ctx.lineTo(point.x, point.y);
          }
        });
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (this.selectedTool !== "text") {
        let width = coords.x - this.startX;
        let height = coords.y - this.startY;

        this.clearCanvas();

        const x = width < 0 ? coords.x : this.startX;
        const y = height < 0 ? coords.y : this.startY;
        width = Math.abs(width);
        height = Math.abs(height);

        this.ctx.strokeStyle = "white";

        const selectedTool = this.selectedTool;
        if (selectedTool === "rect") {
          this.ctx.strokeRect(x, y, width, height);
        } else if (selectedTool === "circle") {
          const centerX = this.startX + width / 2;
          const centerY = this.startY + height / 2;
          const radius = Math.max(width, height) / 2;
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.closePath();
        }
      }
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
