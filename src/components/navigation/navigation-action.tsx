"use client";

import { Plus } from "lucide-react";
import { ActionTooltip } from "@/components/action-tooltip";

export const NavigationAction = async () => {
  return (
    <div>
      <ActionTooltip side="right" align="center" label="Add a sever">
        <button className="group flex-items-center">
          <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-blue-500">
            <Plus
              className="group-hover:text-white transition text-blue-600 "
              size={25}
            />
          </div>
        </button>
      </ActionTooltip>
    </div>
  );
};
