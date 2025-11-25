'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                color: '#d97706',
                border: '1px solid #d97706',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#fffbeb';
                e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <span>←</span>
            <span>ย้อนกลับ</span>
        </button>
    );
}
