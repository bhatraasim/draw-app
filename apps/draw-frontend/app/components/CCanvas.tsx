"use client";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { ALargeSmall, Circle, Hand, Pencil, Redo, Square, Undo } from "lucide-react";
import { Game } from "../draw/Game";
import { ColorButton, Red, Blue, White } from "./ColorIconBox";

export type Tool = "circle" | "pencil" | "rect" | "line" | "text" | "drag";
export type Color = | "red" | "white" | "blue";

export default function CCanvas({ roomId, socket }: { roomId: string; socket: WebSocket }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("rect");
  const [selectedColor, setSelectedColor] = useState<Color>("white");
  const [game, setGame] = useState<Game>();

  useEffect(() => {
    game?.setTool(selectedTool);
    game?.setColor(selectedColor)
  }, [selectedTool, game , selectedColor] );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      game?.clearCanvas(); // Redraw on resize to prevent flickering
    };

    resizeCanvas();
    const g = new Game(canvas, roomId, socket);
    setGame(g);

    window.addEventListener("resize", resizeCanvas);
    return () => {
      g.destroy();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [roomId, socket ]);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#1a1a1a] ">
      <canvas ref={canvasRef} className="block touch-none " />
      <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool}  selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
      <UndoRedo  game={game} onUndo={() => game?.undo()} onRedo={() => game?.redo()}/>
    </div>
  );
}

function Topbar({ selectedTool, setSelectedTool  , selectedColor , setSelectedColor }: { selectedTool: Tool; selectedColor :Color ; setSelectedTool: (s: Tool) => void ,  setSelectedColor: (s: Color) => void  }) {
  return (
     
      <div className="fixed top-1/3 -translate-y-1/2 left-6 flex flex-col gap-2 z-10 bg-[#2a2a2a] p-2 rounded-xl border border-white/10">
        <IconButton activated={selectedTool === "drag"} icon={<Hand className="w-5 h-5 " />} onclick={() => setSelectedTool("drag")} tooltip="Pan (D)" shortcut="D" />
        <IconButton activated={selectedTool === "pencil"} icon={<Pencil className="w-5 h-5" />} onclick={() => setSelectedTool("pencil")} tooltip="Pencil (P)" shortcut="P" />
        <IconButton activated={selectedTool === "rect"} icon={<Square className="w-5 h-5" />} onclick={() => setSelectedTool("rect")} tooltip="Rectangle (R)" shortcut="R" />
        <IconButton activated={selectedTool === "circle"} icon={<Circle className="w-5 h-5" />} onclick={() => setSelectedTool("circle")} tooltip="Circle (C)" shortcut="C" />
        <IconButton activated={selectedTool === "text"} icon={<ALargeSmall className="w-5 h-5" />} onclick={() => setSelectedTool("text")} tooltip="Text (T)" shortcut="T" />
        <ColorButton activated={selectedColor === "white"} icon={<White />} onclick={() => setSelectedColor("white")} colortip="Color (white)" shortcut="O" />
        <ColorButton activated={selectedColor === "red"} icon={<Red />} onclick={() => setSelectedColor("red")} colortip="Color (Orange)" shortcut="O" />
        <ColorButton activated={selectedColor === "blue"} icon={<Blue />} onclick={() => setSelectedColor("blue")} colortip="Color (Purple)" shortcut="O" />   
      
    </div>
  );
}



function UndoRedo({ 
  game, 
  onUndo, 
  onRedo 
}: { 
  game: Game | undefined; 
  onUndo: () => void; 
  onRedo: () => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 flex gap-2 z-10">
      <IconButton 
        icon={<Undo className="w-5 h-5" />} 
        onclick={onUndo} 
        tooltip="Undo (Ctrl+Z)" 
        shortcut="Ctrl+Z"
      />
      <IconButton 
        icon={<Redo className="w-5 h-5" />} 
        onclick={onRedo} 
        tooltip="Redo (Ctrl+Y)" 
        shortcut="Ctrl+Y"
        
      />
    </div>
  );
}
