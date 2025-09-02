import React, { useState } from "react";
import { Monitor, HelpCircle } from "lucide-react";

const touchOptions = [
  { value: "Capacitive", description: "Glass surface, multi-touch capable." },
  { value: "Infrared", description: "IR sensors, works with any pointer." },
  { value: "Resistive", description: "Pressure-based, single-touch." },
];

export default function App() {
  const [environment, setEnvironment] = useState("Outdoor");
  const [brand, setBrand] = useState("LG");
  const [touchType, setTouchType] = useState("Capacitive");

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Monitor className="h-6 w-6" />
        Display Panel Requirements
      </h1>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block font-medium" htmlFor="environment">
            Environment
          </label>
          <select
            id="environment"
            className="w-full rounded border p-2"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
          >
            <option>Outdoor</option>
            <option>Indoor</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium" htmlFor="brand">
            Brand
          </label>
          <select
            id="brand"
            className="w-full rounded border p-2"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option>LG</option>
            <option>Samsung</option>
            <option>BOE</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium" htmlFor="touchType">
            <span className="flex items-center gap-1">
              Touch Technology
              <HelpCircle
                className="h-4 w-4 text-gray-500"
                title="Capacitive: glass multi-touch. Infrared: IR sensors. Resistive: pressure-based."
              />
            </span>
          </label>
          <select
            id="touchType"
            className="w-full rounded border p-2"
            value={touchType}
            onChange={(e) => setTouchType(e.target.value)}
          >
            {touchOptions.map((opt) => (
              <option key={opt.value} value={opt.value} title={opt.description}>
                {opt.value}
              </option>
            ))}
          </select>
        </div>
      </div>
    </main>
  );
}
