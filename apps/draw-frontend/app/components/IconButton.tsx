import { ReactNode } from "react";

export function IconButton({ icon, onclick, activated }: { icon: ReactNode, onclick: () => void, activated?: boolean }) {
    return (
        <div 
            /* Changed 'pointer' to 'cursor-pointer' and ensured z-index */
            className={`cursor-pointer rounded-full  p-2 transition-colors bg-white${ 
                activated ? " text-orange-500" : ""
            }`} 
            onClick={onclick}
        > 
            {icon}
        </div>
    );
}