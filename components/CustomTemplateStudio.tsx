// components/CustomTemplateStudio.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Download,
  Check,
  X,
  Edit2,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  CustomTemplate,
  CustomColumn,
  ColumnDataType,
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  exportCustomTemplateToExcel,
} from "@/lib/custom-template-store";

interface CustomTemplateStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsSchema?: (template: CustomTemplate) => void;
}

export function CustomTemplateStudio({
  isOpen,
  onClose,
  onSelectAsSchema,
}: CustomTemplateStudioProps) {
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<CustomTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState<"Business" | "Personal" | "Industry">("Business");
  const [formCurrency, setFormCurrency] = useState("USD");
  const [columns, setColumns] = useState<CustomColumn[]>([]);

  useEffect(() => {
    if (isOpen) {
      const list = getCustomTemplates();
      setTemplates(list);
      if (list.length > 0 && !activeTemplate) {
        setActiveTemplate(list[0]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateNew = () => {
    setFormName("My Custom Expense Ledger");
    setFormDesc("Tailored spreadsheet structure for our specific operations.");
    setFormCategory("Business");
    setFormCurrency("USD");
    setColumns([
      { id: "c1", name: "Date", dataType: "date", description: "Expense date" },
      { id: "c2", name: "Vendor_Or_Client", dataType: "text", description: "Counterparty" },
      { id: "c3", name: "Invoice_Number", dataType: "text", description: "Invoice reference" },
      { id: "c4", name: "Department_Cost_Center", dataType: "category", description: "Department code" },
      { id: "c5", name: "Gross_Amount", dataType: "currency", description: "Total amount" },
    ]);
    setIsEditing(true);
  };

  const handleEdit = (tmpl: CustomTemplate) => {
    setActiveTemplate(tmpl);
    setFormName(tmpl.name);
    setFormDesc(tmpl.description);
    setFormCategory(tmpl.category);
    setFormCurrency(tmpl.currency);
    setColumns([...tmpl.columns]);
    setIsEditing(true);
  };

  const handleAddColumn = () => {
    const newCol: CustomColumn = {
      id: `col-${Date.now()}`,
      name: `Custom_Column_${columns.length + 1}`,
      dataType: "text",
    };
    setColumns([...columns, newCol]);
  };

  const handleUpdateColumn = (
    id: string,
    field: keyof CustomColumn,
    value: string
  ) => {
    setColumns(
      columns.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveColumn = (id: string) => {
    if (columns.length <= 1) return;
    setColumns(columns.filter((c) => c.id !== id));
  };

  const handleSaveForm = () => {
    if (!formName.trim() || columns.length === 0) return;

    const newTemplate: CustomTemplate = {
      id: activeTemplate && isEditing && templates.some((t) => t.id === activeTemplate.id)
        ? activeTemplate.id
        : `custom-${Date.now()}`,
      name: formName.trim(),
      description: formDesc.trim(),
      category: formCategory,
      currency: formCurrency,
      columns,
      createdAt: activeTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveCustomTemplate(newTemplate);
    const updated = getCustomTemplates();
    setTemplates(updated);
    setActiveTemplate(newTemplate);
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    deleteCustomTemplate(id);
    const updated = getCustomTemplates();
    setTemplates(updated);
    setActiveTemplate(updated[0] || null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col p-6 sm:p-8 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg sm:text-xl">
                  Custom Template Studio
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  NEW
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Design custom spreadsheet schemas with your exact columns, export as .xlsx, and map to AI extraction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto max-h-[65vh] pr-1">
          {/* Left List of Templates (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Custom Templates ({templates.length})
              </span>
              <button
                onClick={handleCreateNew}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            <div className="space-y-2">
              {templates.map((tmpl) => {
                const isSelected = activeTemplate?.id === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setActiveTemplate(tmpl);
                      setIsEditing(false);
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-2 ${
                      isSelected
                        ? "bg-slate-800 border-emerald-500/50 shadow-md"
                        : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-xs text-white">
                        {tmpl.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 font-mono">
                        {tmpl.columns.length} Cols
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {tmpl.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Editor / Preview (8 cols) */}
          <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-5">
            {isEditing ? (
              // EDIT FORM
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="font-bold text-sm text-white">
                    Design Template Columns &amp; Schema
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveForm}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold"
                    >
                      Save Template
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) =>
                        setFormCategory(
                          e.target.value as "Business" | "Personal" | "Industry"
                        )
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    >
                      <option value="Business">Business</option>
                      <option value="Industry">Industry</option>
                      <option value="Personal">Personal</option>
                    </select>
                  </div>
                </div>

                {/* Columns List */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Columns ({columns.length})
                    </label>
                    <button
                      onClick={handleAddColumn}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Column</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                    {columns.map((col, idx) => (
                      <div
                        key={col.id}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2.5"
                      >
                        <span className="font-mono text-slate-500 text-xs w-5">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          value={col.name}
                          onChange={(e) =>
                            handleUpdateColumn(col.id, "name", e.target.value)
                          }
                          placeholder="Column Name (e.g. PO_Number)"
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white flex-1 font-mono outline-none focus:border-emerald-500"
                        />
                        <select
                          value={col.dataType}
                          onChange={(e) =>
                            handleUpdateColumn(
                              col.id,
                              "dataType",
                              e.target.value as ColumnDataType
                            )
                          }
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none"
                        >
                          <option value="text">Text</option>
                          <option value="currency">Currency ($)</option>
                          <option value="date">Date (YYYY-MM-DD)</option>
                          <option value="number">Number</option>
                          <option value="category">Category</option>
                        </select>
                        <button
                          onClick={() => handleRemoveColumn(col.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition"
                          title="Delete column"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeTemplate ? (
              // PREVIEW & EXPORT VIEW
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="font-bold text-base text-white">
                      {activeTemplate.name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {activeTemplate.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(activeTemplate)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Schema</span>
                    </button>

                    <button
                      onClick={() => exportCustomTemplateToExcel(activeTemplate)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export .XLSX</span>
                    </button>
                  </div>
                </div>

                {/* Table Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Live Spreadsheet Preview ({activeTemplate.columns.length} Columns)</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Native .XLSX Schema
                    </span>
                  </div>
                  <div className="border border-emerald-500/40 rounded-xl overflow-x-auto bg-slate-950 shadow-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        {/* Column Letter Indicator */}
                        <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-mono text-slate-500 font-bold">
                          <th className="w-8 px-2 py-1 text-center bg-slate-950 border-r border-slate-800">#</th>
                          {activeTemplate.columns.map((_, cIdx) => (
                            <th
                              key={cIdx}
                              className="px-3.5 py-1 text-center uppercase tracking-widest border-r border-slate-800 text-slate-500 font-mono"
                            >
                              {String.fromCharCode(65 + cIdx)}
                            </th>
                          ))}
                        </tr>

                        {/* Column Naming Header */}
                        <tr className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200">
                          <th className="w-8 px-2 py-2.5 text-center text-[10px] font-mono text-emerald-400/60 border-r border-emerald-500/30">
                            •
                          </th>
                          {activeTemplate.columns.map((c) => (
                            <th key={c.id} className="px-3.5 py-2.5 font-black whitespace-nowrap border-r border-emerald-500/30">
                              <div className="text-white font-extrabold text-xs tracking-wide">{c.name}</div>
                              <span className="text-[10px] text-emerald-400 font-mono font-normal">
                                [{c.dataType.toUpperCase()}]
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {[
                          { num: 1, date: "2026-11-02", val: "1,450.00", cat: "Operational", status: "PAID" },
                          { num: 2, date: "2026-11-05", val: "3,890.50", cat: "Capital Goods", status: "PENDING" },
                          { num: 3, date: "2026-11-08", val: "720.00", cat: "Software/SaaS", status: "PAID" },
                        ].map((sample, rIdx) => (
                          <tr
                            key={rIdx}
                            className={`transition hover:bg-slate-850/60 group ${
                              rIdx % 2 === 1 ? "bg-emerald-950/15" : "bg-slate-950"
                            }`}
                          >
                            <td className="px-2 py-2 text-center font-mono text-[10px] text-slate-600 border-r border-slate-800 bg-slate-950 select-none">
                              {rIdx + 1}
                            </td>
                            {activeTemplate.columns.map((c, cIdx) => (
                              <td
                                key={c.id}
                                className={`px-3.5 py-2.5 whitespace-nowrap border-r border-slate-800/80 ${
                                  c.dataType === "currency" || c.dataType === "number"
                                    ? "text-right font-mono"
                                    : "text-left"
                                }`}
                              >
                                {c.dataType === "currency" ? (
                                  <span className="text-sm font-black font-mono text-emerald-400 tabular-nums">
                                    ${sample.val}
                                  </span>
                                ) : c.dataType === "date" ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-semibold text-amber-300">
                                    {sample.date}
                                  </span>
                                ) : c.dataType === "number" ? (
                                  <span className="text-xs font-bold font-mono text-slate-200 tabular-nums">
                                    {sample.num * 10}
                                  </span>
                                ) : c.dataType === "category" ? (
                                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                                    {sample.cat}
                                  </span>
                                ) : cIdx === 0 ? (
                                  <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                                    Sample {c.name} {sample.num}
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium text-slate-300">
                                    {c.name} #{sample.num}
                                  </span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action: Use as AI Extraction target */}
                {onSelectAsSchema && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-xs text-white">
                        Extract Invoices Directly into this Template
                      </span>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Bind your AI extractor to automatically fill these exact columns from uploaded documents.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onSelectAsSchema(activeTemplate);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs whitespace-nowrap flex items-center gap-1.5 shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Set as Extractor Target</span>
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
