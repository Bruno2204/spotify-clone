import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position='top-right'
      theme='dark'
      toastOptions={{
        style: {
          background: 'rgb(39 39 42)',
          color: 'white',
          border: '1px solid rgb(63 63 70)',
        },
      }}
      richColors
      closeButton
    />
  );
}
