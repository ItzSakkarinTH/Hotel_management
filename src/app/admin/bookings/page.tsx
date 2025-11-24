'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { IBooking, BookingStatus } from '@/types';
import styles from './AdminBookingsPage.module.css';

interface BookingWithDetails extends IBooking {
  roomId: any;
  userId: any;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const statusStyles = {
      [BookingStatus.PENDING]: styles.statusPending,
      [BookingStatus.CONFIRMED]: styles.statusConfirmed,
      [BookingStatus.CANCELLED]: styles.statusCancelled,
      [BookingStatus.COMPLETED]: styles.statusCompleted,
    };
    
    const labels = {
      [BookingStatus.PENDING]: 'รอดำเนินการ',
      [BookingStatus.CONFIRMED]: 'ยืนยันแล้ว',
      [BookingStatus.CANCELLED]: 'ยกเลิก',
      [BookingStatus.COMPLETED]: 'เสร็จสิ้น',
    };

    return (
      <span className={`${styles.statusBadge} ${statusStyles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  if (loading) {
    return <div className={styles.loadingContainer}>กำลังโหลด...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.pageTitle}>จัดการการจอง</h1>

        {/* Filters */}
        <div className={styles.filterContainer}>
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? styles.filterButtonActive : styles.filterButton}
          >
            ทั้งหมด ({bookings.length})
          </button>
          <button
            onClick={() => setFilter(BookingStatus.PENDING)}
            className={filter === BookingStatus.PENDING ? styles.filterButtonPending : styles.filterButton}
          >
            รอดำเนินการ ({bookings.filter(b => b.status === BookingStatus.PENDING).length})
          </button>
          <button
            onClick={() => setFilter(BookingStatus.CONFIRMED)}
            className={filter === BookingStatus.CONFIRMED ? styles.filterButtonConfirmed : styles.filterButton}
          >
            ยืนยันแล้ว ({bookings.filter(b => b.status === BookingStatus.CONFIRMED).length})
          </button>
        </div>

        {/* Bookings Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeader}>ผู้จอง</th>
                  <th className={styles.tableHeader}>ห้อง</th>
                  <th className={styles.tableHeader}>วันเข้าพัก</th>
                  <th className={styles.tableHeader}>ยอดเงิน</th>
                  <th className={styles.tableHeader}>ชำระมัดจำ</th>
                  <th className={styles.tableHeader}>สถานะ</th>
                  <th className={styles.tableHeader}>วันที่จอง</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.userName}>
                        {booking.userId?.firstName} {booking.userId?.lastName}
                      </div>
                      <div className={styles.userEmail}>{booking.userId?.email}</div>
                      <div className={styles.userPhone}>{booking.userId?.phoneNumber}</div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.roomNumber}>
                        ห้อง {booking.roomId?.roomNumber}
                      </div>
                      <div className={styles.roomPrice}>
                        {booking.roomId?.price?.toLocaleString()} ฿/เดือน
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.dateText}>
                        {new Date(booking.checkInDate).toLocaleDateString('th-TH')}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.amountText}>
                        {booking.totalAmount.toLocaleString()} ฿
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      {booking.depositPaid ? (
                        <span className={`${styles.depositBadge} ${styles.depositPaid}`}>
                          ชำระแล้ว
                        </span>
                      ) : (
                        <span className={`${styles.depositBadge} ${styles.depositUnpaid}`}>
                          ยังไม่ชำระ
                        </span>
                      )}
                    </td>
                    <td className={styles.tableCell}>
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.dateCell}`}>
                      {new Date(booking.createdAt).toLocaleDateString('th-TH')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredBookings.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>ไม่พบข้อมูลการจอง</p>
          </div>
        )}
      </div>
    </div>
  );
}
