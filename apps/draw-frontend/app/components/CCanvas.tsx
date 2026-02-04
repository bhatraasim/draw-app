"use client";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { ALargeSmall, Circle, Pencil, Square } from "lucide-react";
import { Game } from "../draw/Game";

export type Tool = "circle" | "pencil" | "rect" | "line" | "text";

export default function CCanvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("rect");
  const [game, setGame] = useState<Game>();

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initial size
    resizeCanvas();

    const g = new Game(canvas, roomId, socket);
    setGame(g);

    // Handle window resize
    window.addEventListener("resize", resizeCanvas);

    return () => {
      g.destroy();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [roomId, socket, canvasRef]);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#1a1a1a]">
      <canvas ref={canvasRef} className="block" />
      <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
}) {
  return (
    <div className="fixed top-6 left-6 flex flex-col gap-2 z-10">
      <IconButton
        activated={selectedTool === "pencil"}
        icon={<Pencil className="w-5 h-5" />}
        onclick={() => setSelectedTool("pencil")}
        tooltip="Pencil"
        shortcut="P"
      />
      <IconButton
        activated={selectedTool === "rect"}
        icon={<Square className="w-5 h-5" />}
        onclick={() => setSelectedTool("rect")}
        tooltip="Rectangle"
        shortcut="R"
      />
      <IconButton
        activated={selectedTool === "circle"}
        icon={<Circle className="w-5 h-5" />}
        onclick={() => setSelectedTool("circle")}
        tooltip="Circle"
        shortcut="C"
      />
      <IconButton
        activated={selectedTool === "text"}
        icon={<ALargeSmall className="w-5 h-5" />}
        onclick={() => setSelectedTool("text")}
        tooltip="Text"
        shortcut="T"
      />
    </div>
  );
}
