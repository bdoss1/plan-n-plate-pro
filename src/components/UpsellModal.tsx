import React from 'react';

export function UpsellModal({ open, onClose, title, body, ctaHref="/pricing", ctaText="Upgrade Now" }:{
  open: boolean; onClose: ()=>void; title: string; body: string; ctaHref?: string; ctaText?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-gray-600 whitespace-pre-line">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="border px-4 py-2 rounded-md">Not now</button>
          <a href={ctaHref} className="bg-green-600 text-white px-4 py-2 rounded-md">{ctaText}</a>
        </div>
      </div>
    </div>
  );
}
