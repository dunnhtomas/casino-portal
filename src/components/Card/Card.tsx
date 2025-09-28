import React, { type ReactNode } from 'react';

export default function Card({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4">
      {children}
    </div>
  );
}