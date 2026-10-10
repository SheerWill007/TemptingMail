'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'rgba(20, 22, 30, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'rgb(255, 255, 255)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        },
      }}
      {...props}
    />
  )
}
