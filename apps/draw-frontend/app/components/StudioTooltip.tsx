"use client";

import { ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

interface StudioTooltipProps {
  children: ReactNode;
  content: string;
  shortcut?: string;
}

export function StudioTooltip({
  children,
  content,
  shortcut,
}: StudioTooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className="bg-ink/90 text-white px-3 py-2 rounded-lg text-sm font-ui flex items-center gap-2 z-50"
            sideOffset={5}
          >
            <span>{content}</span>
            {shortcut && (
              <span className="font-mono text-xs bg-white/20 px-1.5 py-0.5 rounded">
                {shortcut}
              </span>
            )}
            <TooltipPrimitive.Arrow className="fill-ink/90" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
