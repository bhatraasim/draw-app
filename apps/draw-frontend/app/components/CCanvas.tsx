"use client";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { ALargeSmall, Circle, Hand, Pencil, Square } from "lucide-react";
import { Game } from "../draw/Game";

export type Tool = "circle" | "pencil" | "rect" | "line" | "text" | "drag";

export default function CCanvas({ roomId, socket }: { roomId: string; socket: WebSocket }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("rect");
  const [game, setGame] = useState<Game>();

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

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
      <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool}  />
    </div>
  );
}

function Topbar({ selectedTool, setSelectedTool }: { selectedTool: Tool; setSelectedTool: (s: Tool) => void }) {
  return (
    <div className="fixed top-1/3 -translate-y-1/2 left-6 flex flex-col gap-2 z-10 bg-[#2a2a2a] p-2 rounded-xl border border-white/10">
      <IconButton activated={selectedTool === "drag"} icon={<Hand className="w-5 h-5 " />} onclick={() => setSelectedTool("drag")} tooltip="Pan (D)" shortcut="D" />
      <IconButton activated={selectedTool === "pencil"} icon={<Pencil className="w-5 h-5" />} onclick={() => setSelectedTool("pencil")} tooltip="Pencil (P)" shortcut="P" />
      <IconButton activated={selectedTool === "rect"} icon={<Square className="w-5 h-5" />} onclick={() => setSelectedTool("rect")} tooltip="Rectangle (R)" shortcut="R" />
      <IconButton activated={selectedTool === "circle"} icon={<Circle className="w-5 h-5" />} onclick={() => setSelectedTool("circle")} tooltip="Circle (C)" shortcut="C" />
      <IconButton activated={selectedTool === "text"} icon={<ALargeSmall className="w-5 h-5" />} onclick={() => setSelectedTool("text")} tooltip="Text (T)" shortcut="T" />
    </div>
  );
}