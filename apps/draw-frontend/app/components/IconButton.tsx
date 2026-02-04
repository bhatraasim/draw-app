import { ReactNode } from "react";
import { StudioTooltip } from "./StudioTooltip";

interface IconButtonProps {
  icon: ReactNode;
  onclick: () => void;
  activated?: boolean;
  tooltip: string;
  shortcut?: string;
}

export function IconButton({
  icon,
  onclick,
  activated,
  tooltip,
  shortcut,
}: IconButtonProps) {
  return (
    <StudioTooltip content={tooltip} shortcut={shortcut}>
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
