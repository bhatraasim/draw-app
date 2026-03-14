import { getExistingShape } from "./http";
import { Color, Tool } from "../components/CCanvas";
import UndoStack from "../utils/UndoRedo";

export type Shape =
  | {
      id: string;
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      color?: string;
    }
  | {
      id: string;
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
      color?: string;
    }
  | {
      id: string;
      type: "path";
      points: { x: number; y: number }[];
      color?: string;
    }
  | {
      id: string;
      type: "text";
      x: number;
      y: number;
      text: string;
      fontSize: number;
      color?: string;
    };

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
  private selectedColor: Color = "blue";
  private isDrawing: boolean = false;
  private currentPath: { x: number; y: number }[] = [];
  private textInput: HTMLInputElement | null = null;
  private isTextInputActive: boolean = false;
  private selectedShpae: Shape | null = null;

  private readonly MIN_POINT_DIST = 3;
  private readonly DEFAULT_FONT_SIZE = 24;

  private undoRedo = new UndoStack(); // made a class for the undo redo

  private selectionBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null = null;

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
    this.initKeyboardHandlers();
    this.makeId();
  }

  // Helper to convert screen clicks to "World" coordinates
  private getEventCoords(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left - this.offsetX,
      y: e.clientY - rect.top - this.offsetY,
    };
  }

  // Helper to convert touch events to coordinates
  private getTouchCoords(e: TouchEvent) {
    // Use changedTouches for touchend (finger lifted), touches for others
    const touch = e.touches[0] || e.changedTouches[0];
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left - this.offsetX,
      y: touch.clientY - rect.top - this.offsetY,
      clientX: touch.clientX,
      clientY: touch.clientY,
    };
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("touchstart", this.touchStartHandler);
    this.canvas.removeEventListener("touchend", this.touchEndHandler);
    this.canvas.removeEventListener("touchmove", this.touchMoveHandler);
    this.removeTextInput();
  }

  makeId() {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
    // not crypto-secure, but fine for “temp shape id”
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
    this.isDrawing = false;
    if (tool !== "text") this.removeTextInput();
  }

  setColor(color: Color) {
    this.selectedColor = color;
    this.isDrawing = false;
  }

  async init() {
    this.existingShape = await getExistingShape(this.roomId);
    this.clearCanvas();
  }

  isPointInShape(x: number, y: number, shape: Shape): boolean {
    if (shape.type === "rect") {
      return (
        x >= shape.x &&
        x <= shape.x + shape.width &&
        y >= shape.y &&
        y <= shape.y + shape.height
      );
    } else if (shape.type === "circle") {
      const dx = x - shape.centerX;
      const dy = y - shape.centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= shape.radius;
    } else if (shape.type === "path") {
      return shape.points.some((point, i) => {
        if (i == 0) return false;

        const prev = shape.points[i - 1];
        const dist = this.distanceToLineSegment(
          x,
          y,
          prev.x,
          prev.y,
          point.x,
          point.y,
        );
        return dist < 10;
      });
    } else if (shape.type === "text") {
      const width = shape.text.length * (shape.fontSize * 0.6);
      const height = shape.fontSize;

      return (
        x >= shape.x &&
        x <= shape.x + width &&
        y >= shape.y - height &&
        y <= shape.y
      );
    }
    return false;
  }

  undo() {
    const shape = this.undoRedo.undo();

    if (shape) {
      const index = this.existingShape.findIndex((s) => s.id === shape.id);
      if (index !== -1) {
        this.existingShape.splice(index, 1);
      }
    }
    if (!shape) return;

    this.socket.send(
      JSON.stringify({
        type: "delete",
        shapeId: shape.id,
        roomId: this.roomId,
      }),
    );

    this.selectedShpae = null;
    this.clearCanvas();
  }

  redo() {
    const shape = this.undoRedo.redo();
    if (shape) {
      this.existingShape.push(shape);

      this.socket.send(
        JSON.stringify({
          type: "chat",
          tempId: shape.id,
          message: JSON.stringify(shape),
          roomId: this.roomId,
        }),
      );

      this.clearCanvas();
    }
  }

  getSelectedImage() {
  if (!this.selectionBox) return null;

  const { x, y, width, height } = this.selectionBox;
  
  // Use absolute values for dimensions
  const absWidth = Math.abs(width);
  const absHeight = Math.abs(height);
  const startX = width < 0 ? x + width : x;
  const startY = height < 0 ? y + height : y;

  // Get the pixel data directly from the context
  // This automatically handles the canvas transform!
  const imageData = this.ctx.getImageData(startX, startY, absWidth, absHeight);
  
  // Create temp canvas
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = absWidth;
  tempCanvas.height = absHeight;
  const tempCtx = tempCanvas.getContext("2d")!;
  
  // Put the image data
  tempCtx.putImageData(imageData, 0, 0);
  
  return tempCanvas.toDataURL("image/png");
}

  clearSelection() {
    this.selectionBox = null;
    this.clearCanvas();
  }

  initKeyboardHandlers() {
    window.addEventListener("keydown", (e) => {
      if (this.isTextInputActive) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        this.deleteSelectedShape();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        console.log("undo triggred");
        this.undo();
      }

      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "z"))
      ) {
        e.preventDefault();
        this.redo();
      }

      if (e.key == "Escape") {
        e.preventDefault();
        this.selectedShpae = null;
        this.clearCanvas();
      }
    });
  }
  distanceToLineSegment(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq === 0) {
      // Line segment is a point
      return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));

    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
  }

  deleteSelectedShape() {
    if (!this.selectedShpae) return;

    //find the index of the seleted shape

    const index = this.existingShape.indexOf(this.selectedShpae);
    if (index == -1) return;

    this.existingShape.splice(index, 1);

    const shapeIdToDelete = this.selectedShpae.id;

    this.socket.send(
      JSON.stringify({
        type: "delete",
        shapeId: shapeIdToDelete,
        roomId: this.roomId,
      }),
    );

    this.selectedShpae = null;
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);

        if (typeof message.tempId === "string") {
          const idx = this.existingShape.findIndex(
            (s) => s.id === message.tempId,
          );
          if (idx !== -1) {
            const oldId = message.tempId;
            this.existingShape[idx].id = parsedShape.id; // mongo id string updated
            this.undoRedo.updateId(oldId, parsedShape.id);
          } else {
            this.existingShape.push(parsedShape);
          }
        } else {
          this.existingShape.push(parsedShape);
        }

        this.clearCanvas();
      } else if (message.type === "delete") {
        const index = this.existingShape.findIndex(
          (s) => s.id === message.shapeId,
        );

        if (index !== -1) {
          // Deselect if this was selected
          if (this.selectedShpae?.id === message.shapeId) {
            this.selectedShpae = null;
          }

          this.existingShape.splice(index, 1);
          this.clearCanvas();
        }
      }
    };
  }

  clearCanvas() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.strokeStyle = this.selectedColor; //added
    this.ctx.fillStyle = "white";
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    this.existingShape.forEach((shape) => {
      const isSelected = this.selectedShpae === shape;

      if (isSelected) {
        this.ctx.strokeStyle = this.selectedColor; //added
        this.ctx.lineWidth = 3;
      } else {
        this.ctx.strokeStyle = this.selectedColor; //added
        this.ctx.lineWidth = 2;
      }
      if (shape.type === "rect") {
        this.ctx.strokeStyle = shape.color || "white"; //added
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.strokeStyle = shape.color || "white"; //added
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          shape.radius,
          0,
          Math.PI * 2,
        );
        this.ctx.stroke();
      } else if (shape.type === "path") {
        this.ctx.beginPath();
        this.ctx.strokeStyle = shape.color || "white"; //added
        shape.points.forEach((p, i) =>
          i === 0 ? this.ctx.moveTo(p.x, p.y) : this.ctx.lineTo(p.x, p.y),
        );
        this.ctx.stroke();
      } else if (shape.type === "text") {
        this.ctx.strokeStyle = shape.color || "white"; //added
        this.ctx.font = `${shape.fontSize}px Arial`;
        this.ctx.fillText(shape.text, shape.x, shape.y);
      }

      if (this.selectionBox) {
        this.ctx.save();
        this.ctx.strokeStyle = "grey";
        this.ctx.setLineDash([5, 3]);
        this.ctx.strokeRect(
          this.selectionBox.x,
          this.selectionBox.y,
          this.selectionBox.width,
          this.selectionBox.height,
        );
        this.ctx.restore();
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

    if (this.selectedTool === "drag" || this.selectedTool === null) {
      let shapeFound = false;
      for (let i = this.existingShape.length - 1; i >= 0; i--) {
        if (this.isPointInShape(coords.x, coords.y, this.existingShape[i])) {
          this.selectedShpae = this.existingShape[i];
          shapeFound = true;

          this.clearCanvas();
          return;
        }
      }

      if (!shapeFound) {
        this.selectedShpae = null;
        this.clearCanvas();
      }

      return;
    }

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
      this.currentPath.forEach((p, i) =>
        i === 0 ? this.ctx.moveTo(p.x, p.y) : this.ctx.lineTo(p.x, p.y),
      );
      this.ctx.stroke();
    } else if (this.selectedTool === "selection") {
      this.selectionBox = {
        x: this.startX,
        y: this.startY,
        width: coords.x - this.startX,
        height: coords.y - this.startY,
      };

      this.ctx.save();
      this.ctx.strokeStyle = "grey";
      this.ctx.setLineDash([5, 3]);
      this.ctx.strokeRect(
        this.selectionBox.x,
        this.selectionBox.y,
        this.selectionBox.width,
        this.selectionBox.height,
      );
      this.ctx.restore();
    } else if (this.selectedTool === "rect") {
      this.ctx.strokeStyle = this.selectedColor; //added
      this.ctx.strokeRect(
        this.startX,
        this.startY,
        coords.x - this.startX,
        coords.y - this.startY,
      );
    } else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(
        Math.pow(coords.x - this.startX, 2) +
          Math.pow(coords.y - this.startY, 2),
      );
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
      shape = {
        id: this.makeId(),
        type: "path",
        points: this.currentPath,
        color: this.selectedColor,
      };
    }
    if (this.selectedTool === "selection") {
      this.selectionBox = {
        x: this.startX,
        y: this.startY,
        width: coords.x - this.startX,
        height: coords.y - this.startY,
      };

      this.clicked = false;
      this.clearCanvas();
      return;
    } else if (this.selectedTool === "rect") {
      shape = {
        id: this.makeId(),
        type: "rect",
        x: this.startX,
        y: this.startY,
        width: coords.x - this.startX,
        height: coords.y - this.startY,
        color: this.selectedColor,
      };
    } else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(
        Math.pow(coords.x - this.startX, 2) +
          Math.pow(coords.y - this.startY, 2),
      );
      shape = {
        id: this.makeId(),
        type: "circle",
        centerX: this.startX,
        centerY: this.startY,
        radius,
        color: this.selectedColor,
      };
    }

    if (shape) {
      this.existingShape.push(shape);
      this.undoRedo.push(shape); // added to the stack
      this.socket.send(
        JSON.stringify({
          type: "chat",
          tempId: shape.id,
          message: JSON.stringify(shape),
          roomId: this.roomId,
        }),
      );
    }

    this.clicked = false;
    this.isDrawing = false;
    this.currentPath = [];
    this.clearCanvas();
  };

  // Touch event handlers - map to mouse handlers
  touchStartHandler = (e: TouchEvent) => {
    e.preventDefault();
    if (this.isTextInputActive) return;

    this.clicked = true;
    const coords = this.getTouchCoords(e);

    // For panning, we need raw screen coords
    this.startX = coords.clientX;
    this.startY = coords.clientY;

    if (this.selectedTool === "drag" || this.selectedTool === null) {
      let shapeFound = false;
      for (let i = this.existingShape.length - 1; i >= 0; i--) {
        if (this.isPointInShape(coords.x, coords.y, this.existingShape[i])) {
          this.selectedShpae = this.existingShape[i];
          shapeFound = true;
          this.clearCanvas();
          return;
        }
      }

      if (!shapeFound) {
        this.selectedShpae = null;
        this.clearCanvas();
      }
      return;
    }

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

  touchMoveHandler = (e: TouchEvent) => {
    e.preventDefault();
    if (!this.clicked) return;

    const coords = this.getTouchCoords(e);

    if (this.selectedTool === "drag") {
      const dx = coords.clientX - this.startX;
      const dy = coords.clientY - this.startY;
      this.offsetX += dx;
      this.offsetY += dy;
      this.startX = coords.clientX;
      this.startY = coords.clientY;
      this.clearCanvas();
      return;
    }

    this.clearCanvas();

    if (this.selectedTool === "pencil" && this.isDrawing) {
      this.currentPath.push(coords);
      this.ctx.beginPath();
      this.currentPath.forEach((p, i) =>
        i === 0 ? this.ctx.moveTo(p.x, p.y) : this.ctx.lineTo(p.x, p.y),
      );
      this.ctx.stroke();
    } else if (this.selectedTool === "rect") {
      this.ctx.strokeStyle = this.selectedColor;
      this.ctx.strokeRect(
        this.startX,
        this.startY,
        coords.x - this.startX,
        coords.y - this.startY,
      );
    } else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(
        Math.pow(coords.x - this.startX, 2) +
          Math.pow(coords.y - this.startY, 2),
      );
      this.ctx.beginPath();
      this.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  };

  touchEndHandler = (e: TouchEvent) => {
    e.preventDefault();
    if (!this.clicked || this.selectedTool === "drag") {
      this.clicked = false;
      return;
    }

    // Use the last known coordinates from touch
    const coords = this.getTouchCoords(e);
    let shape: Shape | null = null;

    if (this.selectedTool === "pencil") {
      shape = {
        id: this.makeId(),
        type: "path",
        points: this.currentPath,
        color: this.selectedColor,
      };
    } else if (this.selectedTool === "rect") {
      shape = {
        id: this.makeId(),
        type: "rect",
        x: this.startX,
        y: this.startY,
        width: coords.x - this.startX,
        height: coords.y - this.startY,
        color: this.selectedColor,
      };
    } else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(
        Math.pow(coords.x - this.startX, 2) +
          Math.pow(coords.y - this.startY, 2),
      );
      shape = {
        id: this.makeId(),
        type: "circle",
        centerX: this.startX,
        centerY: this.startY,
        radius,
        color: this.selectedColor,
      };
    }

    if (shape) {
      this.existingShape.push(shape);
      this.undoRedo.push(shape);
      this.socket.send(
        JSON.stringify({
          type: "chat",
          tempId: shape.id,
          message: JSON.stringify(shape),
          roomId: this.roomId,
        }),
      );
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
        const shape: Shape = {
          id: crypto.randomUUID(),
          type: "text",
          x,
          y,
          text: input.value,
          fontSize: this.DEFAULT_FONT_SIZE,
        };
        this.existingShape.push(shape);
        this.socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify(shape),
            tempId: shape.id,
            roomId: this.roomId,
          }),
        );
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

    // Touch events for mobile support
    this.canvas.addEventListener("touchstart", this.touchStartHandler, {
      passive: false,
    });
    this.canvas.addEventListener("touchend", this.touchEndHandler, {
      passive: false,
    });
    this.canvas.addEventListener("touchmove", this.touchMoveHandler, {
      passive: false,
    });
  }
}
