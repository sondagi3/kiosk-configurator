// src/components/AdminPanel.jsx
import React, { useState } from "react";
import { Settings, Plus, Trash2, Save, RefreshCcw, Upload, Download, X } from "lucide-react";

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-gray-900">{title}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
      {children}
      {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
    </label>
  );
}

function Text({ value, onChange, type = "text", placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
    />
  );
}

function ArrayEditor({ label, items, onChange, placeholder = "Add item", hint }) {
  const [val, setVal] = useState("");
  const add = () => {
    const v = val.trim();
    if (!v) return;
    if (items.includes(v)) return;
    onChange([...items, v]);
    setVal("");
  };
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <Field label={label} hint={hint}>
        <div className="flex gap-2">
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2"
          />
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </Field>
      <div className="flex flex-wrap gap-2">
        {items.map((t, i) => (
          <span key={`${t}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs">
            {t}
            <button type="button" onClick={() => remove(i)} className="text-gray-500 hover:text-gray-700">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminPanel({
  defaultAdmin,
  initialAdmin,
  onSave,              // (adminDraft) => void
  onApplyDefaults,     // (adminDraft) => void
  onClose,
}) {
  const [tab, setTab] = useState("org");
  const [admin, setAdmin] = useState(initialAdmin);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(admin, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brand-m3dia-admin-spec.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async () => {
    const raw = prompt("Paste admin JSON to import:");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setAdmin(parsed);
      alert("Imported. Review and Save.");
    } catch {
      alert("Invalid JSON");
    }
  };

  return (
    <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Admin Panel</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdmin(defaultAdmin)}
            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm hover:bg-gray-50"
            title="Restore Defaults"
          >
            <RefreshCcw className="h-4 w-4" /> Defaults
          </button>
          <button
            onClick={exportJSON}
            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm hover:bg-gray-50"
          >
            <Download className="h-4 w-4" /> Export
          </button>
          <button
            onClick={importJSON}
            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" /> Import
          </button>
          <button
            onClick={() => onApplyDefaults(admin)}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-sm text-blue-800 hover:bg-blue-100"
            title="Apply defaults to current order/spec"
          >
            Apply to Order
          </button>
          <button
            onClick={() => { onSave(admin); }}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Save className="h-4 w-4" /> Save
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm hover:bg-gray-50"
          >
            <X className="h-4 w-4" /> Close
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b p-3 text-sm">
        {[
          ["org", "Org"],
          ["display", "Display"],
          ["pc", "PC/OS"],
          ["touch", "Touch"],
          ["peripherals", "Peripherals"],
          ["docs", "Docs/QA"],
          ["warranty", "Warranty"],
          ["custom", "Custom Fields"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-3 py-1.5 ${
              tab === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="space-y-4 p-4">
        {tab === "org" && (
          <Section title="Organization">
            <Field label="Organization Name">
              <Text value={admin.orgName} onChange={(v) => setAdmin({ ...admin, orgName: v })} />
            </Field>
          </Section>
        )}

        {tab === "display" && (
          <>
            <Section title="Display Constraints">
              <ArrayEditor
                label="Allowed Brands"
                items={admin.display.allowedBrands}
                onChange={(arr) => setAdmin({ ...admin, display: { ...admin.display, allowedBrands: arr } })}
                hint="Brands CEO can select (enforced)."
              />
              <ArrayEditor
                label="Size Options"
                items={admin.display.sizeOptions}
                onChange={(arr) => setAdmin({ ...admin, display: { ...admin.display, sizeOptions: arr } })}
              />
              <ArrayEditor
                label="Resolution Options"
                items={admin.display.resolutionOptions}
                onChange={(arr) => setAdmin({ ...admin, display: { ...admin.display, resolutionOptions: arr } })}
              />
              <Field label="Minimum Brightness (nits)">
                <Text
                  type="number"
                  value={admin.display.minBrightness}
                  onChange={(v) =>
                    setAdmin({ ...admin, display: { ...admin.display, minBrightness: Number(v) || 0 } })
                  }
                />
              </Field>
              <Field label="Minimum Contrast">
                <Text
                  type="number"
                  value={admin.display.minContrast}
                  onChange={(v) =>
                    setAdmin({ ...admin, display: { ...admin.display, minContrast: Number(v) || 0 } })
                  }
                />
              </Field>
            </Section>
          </>
        )}

        {tab === "pc" && (
          <Section title="Compute & OS">
            <ArrayEditor
              label="CPU/RAM/Storage Options"
              items={admin.pc.cpuOptions}
              onChange={(arr) => setAdmin({ ...admin, pc: { ...admin.pc, cpuOptions: arr } })}
            />
            <ArrayEditor
              label="OS Options"
              items={admin.pc.osOptions}
              onChange={(arr) => setAdmin({ ...admin, pc: { ...admin.pc, osOptions: arr } })}
            />
          </Section>
        )}

        {tab === "touch" && (
          <Section title="Touch">
            <ArrayEditor
              label="Touch Types"
              items={admin.touch.types}
              onChange={(arr) => setAdmin({ ...admin, touch: { ...admin.touch, types: arr } })}
            />
          </Section>
        )}

        {tab === "peripherals" && (
          <Section title="Peripherals">
            <ArrayEditor
              label="Cameras"
              items={admin.peripherals.cameras}
              onChange={(arr) => setAdmin({ ...admin, peripherals: { ...admin.peripherals, cameras: arr } })}
            />
            <ArrayEditor
              label="Microphones"
              items={admin.peripherals.mics}
              onChange={(arr) => setAdmin({ ...admin, peripherals: { ...admin.peripherals, mics: arr } })}
            />
            <ArrayEditor
              label="Speakers"
              items={admin.peripherals.speakers}
              onChange={(arr) => setAdmin({ ...admin, peripherals: { ...admin.peripherals, speakers: arr } })}
            />
            <ArrayEditor
              label="QR Scanners"
              items={admin.peripherals.qrScanners}
              onChange={(arr) => setAdmin({ ...admin, peripherals: { ...admin.peripherals, qrScanners: arr } })}
            />
            <ArrayEditor
              label="Badge Printers"
              items={admin.peripherals.badgePrinters}
              onChange={(arr) => setAdmin({ ...admin, peripherals: { ...admin.peripherals, badgePrinters: arr } })}
            />
            <ArrayEditor
              label="Wall Mounts"
              items={admin.peripherals.wallMounts}
              onChange={(arr) => setAdmin({ ...admin, peripherals: { ...admin.peripherals, wallMounts: arr } })}
            />
          </Section>
        )}

        {tab === "docs" && (
          <Section title="Documentation & QA">
            <Field label="Labels Provided (Yes/No)">
              <Text
                value={admin.docs.labels ? "Yes" : "No"}
                onChange={(v) => setAdmin({ ...admin, docs: { ...admin.docs, labels: /^y/i.test(v) } })}
                placeholder="Yes or No"
              />
            </Field>
            <Field label="Manual Provided (Yes/No)">
              <Text
                value={admin.docs.manual ? "Yes" : "No"}
                onChange={(v) => setAdmin({ ...admin, docs: { ...admin.docs, manual: /^y/i.test(v) } })}
              />
            </Field>
            <Field label="Proof Before Ship (Yes/No)">
              <Text
                value={admin.docs.proofBeforeShip ? "Yes" : "No"}
                onChange={(v) =>
                  setAdmin({ ...admin, docs: { ...admin.docs, proofBeforeShip: /^y/i.test(v) } })
                }
              />
            </Field>
            <Field label="Visual Proof (Yes/No)">
              <Text
                value={admin.docs.visualProof ? "Yes" : "No"}
                onChange={(v) => setAdmin({ ...admin, docs: { ...admin.docs, visualProof: /^y/i.test(v) } })}
              />
            </Field>
            <ArrayEditor
              label="Packaging Options"
              items={admin.docs.packagingOptions}
              onChange={(arr) => setAdmin({ ...admin, docs: { ...admin.docs, packagingOptions: arr } })}
            />
            <ArrayEditor
              label="Certifications"
              items={admin.docs.certifications}
              onChange={(arr) => setAdmin({ ...admin, docs: { ...admin.docs, certifications: arr } })}
            />
            <Field label="Require Canadian Wiring Colors (Yes/No)">
              <Text
                value={admin.docs.requireCanadianWiringColors ? "Yes" : "No"}
                onChange={(v) =>
                  setAdmin({
                    ...admin,
                    docs: { ...admin.docs, requireCanadianWiringColors: /^y/i.test(v) },
                  })
                }
              />
            </Field>
          </Section>
        )}

        {tab === "warranty" && (
          <Section title="Warranty">
            <Field label="No Substitutions Without Consent (Yes/No)">
              <Text
                value={admin.warranty.noSubstitutions ? "Yes" : "No"}
                onChange={(v) =>
                  setAdmin({ ...admin, warranty: { ...admin.warranty, noSubstitutions: /^y/i.test(v) } })
                }
              />
            </Field>
            <Field label="Warranty Years">
              <Text
                type="number"
                value={admin.warranty.years}
                onChange={(v) =>
                  setAdmin({ ...admin, warranty: { ...admin.warranty, years: Number(v) || 0 } })
                }
              />
            </Field>
          </Section>
        )}

        {tab === "custom" && (
          <Section title="Custom Fields (show on CEO form)">
            <ArrayEditor
              label="Add text field key (creates a text input on CEO form)"
              items={(admin.customFields || []).map((x) => x.key)}
              onChange={(arr) =>
                setAdmin({
                  ...admin,
                  customFields: arr.map((k) => ({ key: k, type: "text", defaultValue: "" })),
                })
              }
              hint='Example: "SiteCode" or "CostCenter".'
            />
          </Section>
        )}
      </div>
    </div>
  );
}
