'use client';

import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h1>404 - Page Not Found</h1>
      <p>ขออภัย หน้านี้ไม่พบ</p>
      <Link href="/">กลับไปยังหน้าหลัก</Link>
    </div>
  );
}
