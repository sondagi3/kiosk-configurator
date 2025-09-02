// src/components/SpecForm.jsx
import React from "react";
import { Monitor } from "lucide-react";
import { Section, Field, Text, Select } from "./Inputs.jsx";
import { nowISO } from "../lib/utils.js";

export default function SpecForm({ order, setOrder, admin }) {
  return (
    <Section title="Specification" icon={<Monitor className="h-6 w-6 text-gray-800" />}>
      <Field label="Brand">
        <Select value={order.spec.displayBrand}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, displayBrand: v }, updatedAt: nowISO() }))}
          options={admin.display.allowedBrands} />
      </Field>
      <Field label="Size">
        <Select value={order.spec.size}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, size: v }, updatedAt: nowISO() }))}
          options={admin.display.sizeOptions} />
      </Field>
      <Field label="Resolution">
        <Select value={order.spec.resolution}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, resolution: v }, updatedAt: nowISO() }))}
          options={admin.display.resolutionOptions} />
      </Field>
      <Field label="Brightness (nits)">
        <Text type="number" value={order.spec.brightness}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, brightness: v }, updatedAt: nowISO() }))} />
      </Field>
      <Field label="Contrast">
        <Text type="number" value={order.spec.contrast}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, contrast: v }, updatedAt: nowISO() }))} />
      </Field>
      <Field label="Compute Spec">
        <Select value={order.spec.cpuRam}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, cpuRam: v }, updatedAt: nowISO() }))}
          options={admin.pc.cpuOptions} />
      </Field>
      <Field label="Operating System">
        <Select value={order.spec.os}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, os: v }, updatedAt: nowISO() }))}
          options={admin.pc.osOptions} />
      </Field>
      <Field label="Has Touch">
        <Select value={order.spec.hasTouch}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, hasTouch: v }, updatedAt: nowISO() }))}
          options={["Yes", "No"]} />
      </Field>
      {order.spec.hasTouch === "Yes" && (
        <Field label="Touch Type">
          <Select value={order.spec.touchType}
            onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, touchType: v }, updatedAt: nowISO() }))}
            options={admin.touch.types} />
        </Field>
      )}

      <Field label="Enclosure Type">
        <Text value={order.spec.enclosureType}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, enclosureType: v }, updatedAt: nowISO() }))} />
      </Field>
      <Field label="Color">
        <Text value={order.spec.color}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, color: v }, updatedAt: nowISO() }))} />
      </Field>
      <Field label="Logo Text">
        <Text value={order.spec.logoText}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, logoText: v }, updatedAt: nowISO() }))} />
      </Field>

      <Field label="Camera Model">
        <Select value={order.spec.cameraModel}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, cameraModel: v }, updatedAt: nowISO() }))}
          options={admin.peripherals.cameras} />
      </Field>
      <Field label="Microphone Model">
        <Select value={order.spec.micModel}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, micModel: v }, updatedAt: nowISO() }))}
          options={admin.peripherals.mics} />
      </Field>
      <Field label="Speaker Option">
        <Select value={order.spec.speakerModel}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, speakerModel: v }, updatedAt: nowISO() }))}
          options={admin.peripherals.speakers} />
      </Field>
      <Field label="QR Scanner Model">
        <Select value={order.spec.qrModel}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, qrModel: v }, updatedAt: nowISO() }))}
          options={admin.peripherals.qrScanners} />
      </Field>
      <Field label="Badge Printer Model">
        <Select value={order.spec.badgePrinterModel}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, badgePrinterModel: v }, updatedAt: nowISO() }))}
          options={admin.peripherals.badgePrinters} />
      </Field>
      <Field label="Wall Mount">
        <Select value={order.spec.wallMount}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, wallMount: v }, updatedAt: nowISO() }))}
          options={admin.peripherals.wallMounts} />
      </Field>

      <Field label="Grouped Peripherals">
        <div className="flex flex-wrap gap-2">
          {["mic", "speaker", "webcam", "qr"].map((k) => {
            const active = order.spec.peripherals.includes(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() =>
                  setOrder((o) => {
                    const per = o.spec.peripherals;
                    const next = active ? per.filter((x) => x !== k) : [...per, k];
                    return { ...o, spec: { ...o.spec, peripherals: next }, updatedAt: nowISO() };
                  })
                }
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm ${
                  active ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700"
                }`}
              >
                {active ? "✓" : null}
                {k}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Labels Provided">
        <Select value={order.spec.labelsProvided}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, labelsProvided: v }, updatedAt: nowISO() }))}
          options={["Yes", "No"]} />
      </Field>
      <Field label="Manual Provided">
        <Select value={order.spec.manualProvided}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, manualProvided: v }, updatedAt: nowISO() }))}
          options={["Yes", "No"]} />
      </Field>
      <Field label="Proof Before Ship">
        <Select value={order.spec.proofBeforeShip}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, proofBeforeShip: v }, updatedAt: nowISO() }))}
          options={["Yes", "No"]} />
      </Field>
      <Field label="Visual Proof">
        <Select value={order.spec.visualProof}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, visualProof: v }, updatedAt: nowISO() }))}
          options={["Yes", "No"]} />
      </Field>
      <Field label="Packaging">
        <Select value={order.spec.packaging}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, packaging: v }, updatedAt: nowISO() }))}
          options={admin.docs.packagingOptions} />
      </Field>
      <Field label="Certifications (comma-separated)">
        <Text value={order.spec.certifications}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, certifications: v }, updatedAt: nowISO() }))} />
      </Field>
      <Field label="Origin Country">
        <Text value={order.spec.originCountry}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, originCountry: v }, updatedAt: nowISO() }))} />
      </Field>
      <Field label="Canadian Wiring Colors">
        <Select value={order.spec.canadIanWireColors}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, canadIanWireColors: v }, updatedAt: nowISO() }))}
          options={["Yes", "No"]} />
      </Field>
      <Field label="No Substitutions">
        <Select value={order.spec.noSubstitutions}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, noSubstitutions: v }, updatedAt: nowISO() }))}
          options={["Yes", "No"]} />
      </Field>
      <Field label="Warranty Years">
        <Text type="number" value={order.spec.warrantyYears}
          onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, warrantyYears: v }, updatedAt: nowISO() }))} />
      </Field>
    </Section>
  );
}
