"use client";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import {
  ALargeSmall,
  Circle,
  Hand,
  Pencil,
  Redo,
  Square,
  Undo,
  ArrowLeft,
  SquareDashedIcon,
  Wand2,
} from "lucide-react";
import { Game } from "../draw/Game";
import { ColorButton, Red, Blue, White } from "./ColorIconBox";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

export type Tool = "circle" | "pencil" | "rect" | "line" | "text" | "drag" | "selection";
export type Color = "red" | "white" | "blue";

export default function CCanvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("rect");
  const [selectedColor, setSelectedColor] = useState<Color>("white");
  const [game, setGame] = useState<Game>();
  const router = useRouter();

  useEffect(() => {
    game?.setTool(selectedTool);
    game?.setColor(selectedColor);
  }, [selectedTool, game, selectedColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      game?.clearCanvas();
    };

    resizeCanvas();
    const g = new Game(canvas, roomId, socket);
    setGame(g);

    window.addEventListener("resize", resizeCanvas);
    return () => {
      g.destroy();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [roomId, socket]);

  const handleAIGenerate = () => {

    const image = game?.getSelectedImage()

    //sending the req to the backend 
    console.log("Send canvas to AI");
    console.log("here is the base64 image : ", image);
    
    game?.clearSelection()
    
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#1a1a1a]">
      <canvas ref={canvasRef} className="block touch-none" />

      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/dashboard")}
        className="fixed top-6 left-6 z-20 flex items-center gap-2 bg-[#2a2a2a]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-white hover:bg-[#333] transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Dashboard</span>
      </motion.button>

      <Topbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
      />

      <UndoRedo onUndo={() => game?.undo()} onRedo={() => game?.redo()} />

      <AIGenerate onGenerate={handleAIGenerate} />
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
  selectedColor,
  setSelectedColor,
}: {
  selectedTool: Tool;
  selectedColor: Color;
  setSelectedTool: (s: Tool) => void;
  setSelectedColor: (s: Color) => void;
}) {
  return (
    <div className="fixed top-1/2 -translate-y-1/2 left-6 flex flex-col gap-2 z-10 bg-[#2a2a2a] p-2 rounded-xl border border-white/10">
      <IconButton
        activated={selectedTool === "drag"}
        icon={<Hand className="w-5 h-5" />}
        onclick={() => setSelectedTool("drag")}
        tooltip="Pan (D)"
        shortcut="D"
      />

      <IconButton
        activated={selectedTool === "selection"}
        icon={<SquareDashedIcon className="w-5 h-5" />}
        onclick={() => setSelectedTool("selection")}
        tooltip="Selection"
        shortcut="S"
      />

      <IconButton
        activated={selectedTool === "pencil"}
        icon={<Pencil className="w-5 h-5" />}
        onclick={() => setSelectedTool("pencil")}
        tooltip="Pencil (P)"
        shortcut="P"
      />

      <IconButton
        activated={selectedTool === "rect"}
        icon={<Square className="w-5 h-5" />}
        onclick={() => setSelectedTool("rect")}
        tooltip="Rectangle (R)"
        shortcut="R"
      />

      <IconButton
        activated={selectedTool === "circle"}
        icon={<Circle className="w-5 h-5" />}
        onclick={() => setSelectedTool("circle")}
        tooltip="Circle (C)"
        shortcut="C"
      />

      <IconButton
        activated={selectedTool === "text"}
        icon={<ALargeSmall className="w-5 h-5" />}
        onclick={() => setSelectedTool("text")}
        tooltip="Text (T)"
        shortcut="T"
      />

      <ColorButton
        activated={selectedColor === "white"}
        icon={<White />}
        onclick={() => setSelectedColor("white")}
        colortip="Color (White)"
        shortcut="O"
      />

      <ColorButton
        activated={selectedColor === "red"}
        icon={<Red />}
        onclick={() => setSelectedColor("red")}
        colortip="Color (Red)"
        shortcut="O"
      />

      <ColorButton
        activated={selectedColor === "blue"}
        icon={<Blue />}
        onclick={() => setSelectedColor("blue")}
        colortip="Color (Blue)"
        shortcut="O"
      />
    </div>
  );
}

function UndoRedo({
  onUndo,
  onRedo,
}: {
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

function AIGenerate({
  onGenerate,
}: {
  onGenerate: () => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onGenerate}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-lg transition border border-white/10"
      >
        <Wand2 className="w-5 h-5" />
        <span className="text-sm font-medium">Spark</span>
      </motion.button>
    </div>
  );
}