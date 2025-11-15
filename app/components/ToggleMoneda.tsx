"use client";

import Image from "next/image";

interface ToggleMonedaProps {
  currency: "USD" | "ARS";
  onToggle: () => void;
}

export default function ToggleMoneda({ currency, onToggle }: ToggleMonedaProps) {
  return (
    <button
      onClick={onToggle}
      className="h-10 w-10 flex items-center justify-center rounded-full 
                 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 
                 transition-colors"
    >
      <Image
        src={currency === "USD" ? "/flags/us.png" : "/flags/ar.png"}
        alt="flag"
        width={24}
        height={24}
        className="rounded-full"
      />
    </button>
  );
}
