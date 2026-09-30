import React from 'react';
import type { BrandBrief } from '../generation/types';

interface Props { value: BrandBrief; onChange: (value: BrandBrief) => void; onReference?: (value: { dataUrl: string; mimeType: string } | undefined) => void }
const fields: Array<[keyof BrandBrief, string, string]> = [
  ['brandName', 'Nombre de marca', 'Ej: Sabrosura del Mar, NovaTech, Arc...'],
  ['industry', 'Sector / Industria', 'Ej: Gastronomía, Infraestructura, Fintech...'],
  ['valueProposition', 'Propuesta de valor', 'Qué beneficio único y concreto ofreces al usuario'],
  ['targetAudience', 'Público objetivo', 'A quién va dirigida la landing'],
  ['brandPersonality', 'Personalidad', 'Ej: Cálida, técnica, sobria, audaz...'],
  ['toneOfVoice', 'Tono de voz', 'Ej: Directo, cercano, editorial, persuasivo...'],
  ['primaryAction', 'Acción principal (CTA)', 'Ej: Ver la carta, Solicitar demo, Empezar gratis...']
];

export const BrandBriefForm: React.FC<Props> = ({ value, onChange, onReference }) => {
  const update = (key: keyof BrandBrief, next: string) => onChange({ ...value, [key]: next });
  const readReference = (file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) return;
    const reader = new FileReader(); reader.onload = () => onReference?.({ dataUrl: String(reader.result), mimeType: file.type }); reader.readAsDataURL(file);
  };
  return <section className="bg-[#141414] p-6 flex flex-col gap-5">
    <div><p className="mono text-[11px] uppercase tracking-widest text-[#737373]">BRIEF DE MARCA</p><h2 className="text-xl font-medium text-[#F3F3F3]">Dale contexto a la landing</h2></div>
    <div className="grid gap-3 md:grid-cols-2">{fields.map(([key, label, placeholder]) => <label key={key} className="flex flex-col gap-2 text-xs text-[#A1A1A1]">{label}<input aria-label={label} value={String(value[key] || '')} placeholder={placeholder} onChange={event => update(key, event.target.value)} className="h-10 bg-[#1F1F1F] px-3 text-[#F3F3F3] placeholder:text-[#737373] focus:bg-[#282828] focus:outline-none" /></label>)}</div>
    <label className="flex flex-col gap-2 text-xs text-[#A1A1A1]">Referencia visual<input aria-label="Referencia visual" type="file" accept="image/png,image/jpeg,image/webp" onChange={event => readReference(event.target.files?.[0])} className="text-xs text-[#A1A1A1] file:mr-3 file:border-0 file:bg-[#282828] file:px-3 file:py-2 file:text-xs file:text-[#F3F3F3]" /></label>
  </section>;
};
