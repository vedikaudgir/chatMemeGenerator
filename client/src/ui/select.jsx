"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "./utils";

export function Select(props) {
    return <SelectPrimitive.Root data-slot="select" {...props} />;
}

export function SelectGroup(props) {
    return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

export function SelectValue(props) {
    return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

export function SelectTrigger({ className, size = "default", children, ...props }) {
    return (
        <SelectPrimitive.Trigger
            data-slot="select-trigger"
            data-size={size}
            className={cn(
                "flex w-full items-center justify-between gap-2 rounded-2xl border border-neutral-200/60 bg-white/50 px-5 py-3 text-sm text-neutral-800 outline-none transition-all hover:bg-white/80 focus:ring-2 focus:ring-blue-500/30",
                className
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDownIcon className="size-4 opacity-40" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
}

export function SelectContent({ className, children, position = "popper", ...props }) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                data-slot="select-content"
                className={cn(
                    "relative z-50 min-w-[8rem] overflow-hidden rounded-[1.5rem] border border-neutral-200/50 bg-white text-neutral-800 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                    className
                )}
                position={position}
                {...props}
            >
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport className="p-2">{children}</SelectPrimitive.Viewport>
                <SelectScrollDownButton />
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
}

export function SelectLabel({ className, ...props }) {
    return (
        <SelectPrimitive.Label
            data-slot="select-label"
            className={cn("px-2 py-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-widest", className)}
            {...props}
        />
    );
}

export function SelectItem({ className, children, ...props }) {
    return (
        <SelectPrimitive.Item
            data-slot="select-item"
            className={cn(
                "relative flex w-full cursor-default items-center gap-2 rounded-xl py-3 pr-8 pl-4 text-sm outline-none select-none transition-colors hover:bg-neutral-50 focus:bg-neutral-50 focus:text-neutral-950 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className
            )}
            {...props}
        >
            <span className="absolute right-4 flex items-center justify-center">
                <SelectPrimitive.ItemIndicator>
                    <CheckIcon className="size-4 text-blue-600" />
                </SelectPrimitive.ItemIndicator>
            </span>

            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
}

export function SelectSeparator({ className, ...props }) {
    return (
        <SelectPrimitive.Separator
            className={cn("pointer-events-none my-1 h-px bg-border", className)}
            {...props}
        />
    );
}

export function SelectScrollUpButton(props) {
    return (
        <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1" {...props}>
            <ChevronUpIcon className="size-4" />
        </SelectPrimitive.ScrollUpButton>
    );
}

export function SelectScrollDownButton(props) {
    return (
        <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1" {...props}>
            <ChevronDownIcon className="size-4" />
        </SelectPrimitive.ScrollDownButton>
    );
}