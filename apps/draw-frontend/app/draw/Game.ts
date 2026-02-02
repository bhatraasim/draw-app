
import { getExistingShape } from "./http";
import { Tool } from "../components/CCanvas";

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

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShape: Shape[];
  private roomId: string;
  private socket: WebSocket;
  private clicked: boolean;
  private startX: number = 0;
  private startY: number = 0;
  private selectedTool : Tool = "rect"

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


  destroy(){
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);

    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);

    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);

  }

  setTool(tool : Tool){
    this.selectedTool = tool
  }

  async init() {
    this.existingShape = await getExistingShape(this.roomId);
    this.clearCanvas()
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);

        // Check if it's a valid shape
        if (
          parsedShape.type &&
          (parsedShape.type === "rect" || parsedShape.type === "circle")
        ) {
          this.existingShape.push(parsedShape);
          this.clearCanvas();
        }
      }
    };
  }

  clearCanvas() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = "white";
    this.existingShape.forEach((shape) => {
      if (shape.type === "rect") {
        // Handle negative dimensions properly
        const x = shape.width < 0 ? shape.x + shape.width : shape.x;
        const y = shape.height < 0 ? shape.y + shape.height : shape.y;
        const width = Math.abs(shape.width);
        const height = Math.abs(shape.height);

        // Only draw if shape has meaningful size
        if (width > 0 && height > 0) {
          this.ctx.strokeRect(x, y, width, height);
        }
      } else if (shape.type == "circle") {
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
      }
    });
  }


  mouseDownHandler = (e:MouseEvent) =>{

    const getCanvasCoords = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const coords = getCanvasCoords(e);
      this.clicked = true;
      this.startX = coords.x;
      this.startY = coords.y;
  }

  mouseUpHandler = (e:MouseEvent) =>{

    const getCanvasCoords = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    this.clicked = false;

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
          x: x,
          y: y,
          width,
          height,
        };
      } else if (selectedTool === "circle") {
        const radius = Math.max(width, height) / 2;
        shape = {
          type: "circle",
          radius: radius,
          centerX: this.startX + width / 2,
          centerY: this.startY + height / 2,
        };
      }

      if (!shape) {
        return;
      }

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

  mouseMoveHandler = (e:MouseEvent) => {

    const getCanvasCoords = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    
        if (this.clicked) {
            const coords = getCanvasCoords(e);
            let width = coords.x - this.startX;
            let height = coords.y - this.startY;

            this.clearCanvas();
            
            // Handle negative dimensions for preview
            const x = width < 0 ? coords.x : this.startX;
            const y = height < 0 ? coords.y : this.startY;
            width = Math.abs(width);
            height = Math.abs(height);
            
            this.ctx.strokeStyle = "white";
            
            const  selectedTool =  this.selectedTool 
            if( selectedTool  === "rect"){
                this.ctx.strokeRect(x, y, width, height);
            } else if (selectedTool  === "circle" ){
                const centerX =  this.startX + width/2
                const centerY = this.startY + height/2
                const radius = Math.max( width , height) / 2
                this.ctx.beginPath()
                this.ctx.arc(centerX , centerY , radius , 0 , Math.PI * 2 )
                this.ctx.stroke()
                this.ctx.closePath()
            }
           
        }
    
  }

  initMouseHandlers() {
    

    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    
  }


}
