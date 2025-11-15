"use client";

import { useTheme } from "../hooks/useTheme";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 🔹 Evita errores o parpadeos al montar
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

 return (
  <button
    onClick={toggleTheme}
    className="flex items-center justify-center p-2 rounded-full 
           bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800
           transition-all duration-300"
    title={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
  >
    {theme === "light" ? (
      <Moon className="w-5 h-5" />
    ) : (
      <Sun className="w-5 h-5" />
    )}
  </button>
)}