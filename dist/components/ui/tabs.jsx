"use client";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
function Tabs(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-2", className)} {...props}/>);
}
function TabsList(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<TabsPrimitive.List data-slot="tabs-list" className={cn("bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]", className)} {...props}/>);
}
function TabsTrigger(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<TabsPrimitive.Trigger data-slot="tabs-trigger" className={cn("data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props}/>);
}
function TabsContent(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props}/>);
}
export { Tabs, TabsList, TabsTrigger, TabsContent };
