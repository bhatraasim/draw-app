
import { ReactNode } from "react";
import { StudioTooltip } from "./StudioTooltip";

interface IconButtonProps {
  icon: ReactNode;
  onclick: () => void;
  activated?: boolean;
  colortip: string;
  shortcut?: string;
}

export function ColorButton({
  icon,
  onclick,
  activated,
  colortip,
  shortcut,
}: IconButtonProps) {
  return (
    <StudioTooltip content={colortip} shortcut={shortcut}>
      <div
        className={`cursor-pointer rounded-xl p-3 transition-all duration-200 ${
          activated
            ? "bg-accent text-white shadow-lg shadow-accent/25"
            : "bg-ink/80 text-white/70 hover:bg-ink hover:text-white hover:shadow-lg"
        }`}
        onClick={onclick}
      >
        {icon}
      </div>
    </StudioTooltip>
  );
}

export function Red(){
    return (
        <div className="bg-orange-600 w-5 h-5 rounded-xl" > 
        </div>
    )
}


export function Blue(){
    return (
        <div className="bg-indigo-600 w-5 h-5 rounded-xl" > 
        </div>
    )
}

export function White(){
    return (
        <div className="bg-white w-5 h-5 rounded-xl" > 
        </div>
    )
}