'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { IBooking, AxiosErrorResponse } from '@/types';
import styles from './BookingHistory.module.css';

export default function BookingHistoryPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error: unknown) {
      const err = error as AxiosErrorResponse;
      setError(err.response?.data?.error || 'ไม่สามารถโหลดประวัติการจองได้');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('คุณต้องการยกเลิกการจองนี้หรือไม่?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/bookings/${bookingId}`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('ยกเลิกการจองสำเร็จ');
      fetchBookings();
    } catch (error: unknown) {
      const err = error as AxiosErrorResponse;
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'รอตรวจสอบ',
      confirmed: 'ยืนยันแล้ว',
      cancelled: 'ยกเลิก',
      rejected: 'ปฏิเสธ',
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    return `status${status.charAt(0).toUpperCase() + status.slice(1)}`;
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.maxWidth}>
        <div className={styles.header}>
          <h1 className={styles.title}>ประวัติการจอง</h1>
          <button
            onClick={() => router.push('/rooms')}
            className={styles.backButton}
          >
            กลับไปหน้าห้องพัก
          </button>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            {error}
          </div>
        )}

        <div className={styles.filterContainer}>
          <button
            onClick={() => setFilter('all')}
            className={`${styles.filterButton} ${filter === 'all' ? styles.filterActive : ''}`}
          >
            ทั้งหมด ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`${styles.filterButton} ${filter === 'pending' ? styles.filterActive : ''}`}
          >
            รอตรวจสอบ ({bookings.filter(b => b.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`${styles.filterButton} ${filter === 'confirmed' ? styles.filterActive : ''}`}
          >
            ยืนยันแล้ว ({bookings.filter(b => b.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`${styles.filterButton} ${filter === 'cancelled' ? styles.filterActive : ''}`}
          >
            ยกเลิก ({bookings.filter(b => b.status === 'cancelled').length})
          </button>
        </div>

        {filteredBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <p>ไม่พบประวัติการจอง</p>
          </div>
        ) : (
          <div className={styles.bookingsList}>
            {filteredBookings.map((booking) => (
              <div key={booking._id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <div className={styles.bookingInfo}>
                    <h3 className={styles.roomNumber}>
                      ห้อง {booking.room?.roomNumber || 'N/A'}
                    </h3>
                    <span className={`${styles.statusBadge} ${styles[getStatusClass(booking.status)]}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                  <p className={styles.bookingDate}>
                    จองเมื่อ: {new Date(booking.createdAt).toLocaleDateString('th-TH')}
                  </p>
                </div>

                {booking.room?.images && booking.room.images.length > 0 && (
                  <div className={styles.roomImageContainer}>
                    <Image
                      src={booking.room.images[0]}
                      alt={`ห้อง ${booking.room.roomNumber}`}
                      fill
                      className={styles.roomImage}
                    />
                  </div>
                )}

                <div className={styles.bookingDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>วันที่เข้าพัก:</span>
                    <span className={styles.detailValue}>
                      {new Date(booking.checkInDate).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>ค่าห้อง:</span>
                    <span className={styles.detailValue}>
                      {booking.room?.price.toLocaleString()} บาท
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>เงินประกัน:</span>
                    <span className={styles.detailValue}>
                      {booking.room?.deposit.toLocaleString()} บาท
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>ยอดรวม:</span>
                    <span className={styles.detailValueTotal}>
                      {((booking.room?.price || 0) + (booking.room?.deposit || 0)).toLocaleString()} บาท
                    </span>
                  </div>
                </div>

                <div className={styles.bookingActions}>
                  <button
                    onClick={() => router.push(`/booking/${booking._id}`)}
                    className={styles.viewButton}
                  >
                    ดูรายละเอียด
                  </button>
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className={styles.cancelButton}
                    >
                      ยกเลิกการจอง
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
