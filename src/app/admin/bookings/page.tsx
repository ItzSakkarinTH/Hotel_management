'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import styles from './AdminBookingsPage.module.css';

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface IRoom {
  _id: string;
  roomNumber: string;
  price: number;
  deposit: number;
}

interface IBooking {
  _id: string;
  userId: IUser | null;
  roomId: IRoom | null;
  checkInDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `/api/bookings/${bookingId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state
        setBookings(bookings.map(booking =>
          booking._id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        ));
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  const filteredBookings = bookings.filter(booking =>
    filter === 'all' ? true : booking.status === filter
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'confirmed':
        return styles.statusConfirmed;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอการยืนยัน';
      case 'confirmed':
        return 'ยืนยันแล้ว';
      case 'cancelled':
        return 'ยกเลิกแล้ว';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>จัดการการจอง</h1>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <button
          onClick={() => setFilter('all')}
          className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
        >
          ทั้งหมด ({bookings.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`${styles.filterTab} ${filter === 'pending' ? styles.filterTabActive : ''}`}
        >
          รอการยืนยัน ({bookings.filter(b => b.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`${styles.filterTab} ${filter === 'confirmed' ? styles.filterTabActive : ''}`}
        >
          ยืนยันแล้ว ({bookings.filter(b => b.status === 'confirmed').length})
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`${styles.filterTab} ${filter === 'cancelled' ? styles.filterTabActive : ''}`}
        >
          ยกเลิกแล้ว ({bookings.filter(b => b.status === 'cancelled').length})
        </button>
      </div>

      {/* Bookings Table */}
      <div className={styles.tableContainer}>
        {filteredBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <p>ไม่มีข้อมูลการจอง</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>รหัสการจอง</th>
                <th>ผู้จอง</th>
                <th>เบอร์โทร</th>
                <th>ห้อง</th>
                <th>ราคา</th>
                <th>วันเข้าพัก</th>
                <th>วันที่จอง</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td className={styles.bookingId}>{booking._id.slice(-8)}</td>
                  <td>
                    {booking.userId ? (
                      <>
                        <div className={styles.userName}>
                          {booking.userId.firstName} {booking.userId.lastName}
                        </div>
                        <div className={styles.userEmail}>{booking.userId.email}</div>
                      </>
                    ) : (
                      <span>N/A</span>
                    )}
                  </td>
                  <td>{booking.userId?.phoneNumber || 'N/A'}</td>
                  <td className={styles.roomNumber}>{booking.roomId?.roomNumber || 'N/A'}</td>
                  <td className={styles.price}>
                    {booking.roomId
                      ? ((booking.roomId.price + booking.roomId.deposit).toLocaleString() + ' ฿')
                      : 'N/A'}
                  </td>
                  <td>{new Date(booking.checkInDate).toLocaleDateString('th-TH')}</td>
                  <td>{new Date(booking.createdAt).toLocaleDateString('th-TH')}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(booking._id, 'confirmed')}
                            className={`${styles.actionBtn} ${styles.confirmBtn}`}
                            title="อนุมัติ"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking._id, 'cancelled')}
                            className={`${styles.actionBtn} ${styles.cancelBtn}`}
                            title="ยกเลิก"
                          >
                            ✗
                          </button>
                        </>
                      )}
                      {booking.status !== 'pending' && (
                        <span className={styles.noAction}>-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
