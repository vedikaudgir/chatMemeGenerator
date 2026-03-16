import * as React from "react";
import { cn } from "./utils";

function Textarea({ className, ...props }) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                "flex min-h-28 w-full rounded-2xl border border-neutral-200/60 bg-white/50 px-5 py-4 text-sm text-neutral-800 transition-all placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
                className
            )}
            {...props}
        />
    );
}

export { Textarea };
