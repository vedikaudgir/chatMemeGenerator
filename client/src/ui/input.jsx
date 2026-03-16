import * as React from "react";
import { cn } from "./utils";

function Input({ className, type, ...props }) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "flex h-12 w-full min-w-0 rounded-2xl border border-neutral-200/60 bg-white/50 px-5 py-3 text-sm text-neutral-800 transition-all placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                className
            )}
            {...props}
        />
    );
}

export { Input };