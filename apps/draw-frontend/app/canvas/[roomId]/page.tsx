'use client'
import { initdraw } from "@/app/draw";
import { useEffect, useRef } from "react";



export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    
    useEffect(() => {
        if (canvasRef.current) {
            
            initdraw(canvasRef.current)
        }
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={1392}
            height={720}
            style={{ border: '1px solid black' }}
        />
    );
}