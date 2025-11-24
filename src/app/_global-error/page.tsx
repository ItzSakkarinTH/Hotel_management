'use client';

export default function GlobalError({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <button onClick={reset}>ลองใหม่อีกครั้ง</button>
    </div>
  );
}
