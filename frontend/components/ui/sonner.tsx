"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        style: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'rgb(255, 255, 255)',
          fontWeight: '500',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        },
        className: 'glass-toast',
      }}
      {...props}
    />
  )
}

export { Toaster }
