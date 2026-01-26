export function initdraw (canvas : HTMLCanvasElement){

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.fillStyle = "rgba(0,0,0)";
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let clicked = false;
            let startX = 0;
            let startY = 0;

            // Helper function to get correct coordinates
            const getCanvasCoords = (e: MouseEvent) => {
                const rect = canvas.getBoundingClientRect();
                return {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
            };

            canvas.addEventListener("mousedown", (e) => {
                const coords = getCanvasCoords(e);
                startX = coords.x;
                startY = coords.y;
                clicked = true;
            });

            canvas.addEventListener("mouseup", (e) => {
                clicked = false;
                const coords = getCanvasCoords(e);
                console.log("Mouse up at ", coords.x, coords.y);
                console.log("Rectangle from ", startX, startY, " to ", coords.x, coords.y);
            });

            canvas.addEventListener("mousemove", (e) => {
                if (clicked) {
                    const coords = getCanvasCoords(e);
                    const width = coords.x - startX;
                    const height = coords.y - startY;

                    // Redraw black background
                    ctx.fillStyle = "black";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw white rectangle
                    ctx.strokeStyle = "white";
                    ctx.strokeRect(startX, startY, width, height);
                }
            });
}