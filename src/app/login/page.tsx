// Server component wrapper — exports `dynamic` so Next.js marks this route
// as server-rendered (ƒ). The `dynamic` config is ignored in "use client"
// files, so the form lives in LoginForm.tsx.
export const dynamic = "force-dynamic";

export { default } from "./LoginForm";
