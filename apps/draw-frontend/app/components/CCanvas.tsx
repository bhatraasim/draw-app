"use client"
import { useEffect, useRef } from "react";
import { initdraw } from "../draw";

export default function CCanvas({ roomId, socket }: { roomId: string, socket: WebSocket }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

        // Initialize drawing after setting size
        initdraw(canvas, roomId, socket);

        // Handle window resize
        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [roomId, socket]);

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden">
            <canvas
                ref={canvasRef}
                className="block"
                
            />
        </div>
    );
}