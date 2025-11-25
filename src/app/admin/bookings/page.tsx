'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PaymentStatus } from '@/types';
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

interface IPayment {
  _id: string;
  bookingId: string | { _id?: string };
  amount: number;
  slipImage: string;
  ocrData?: Record<string, unknown>;
  status: string;
  notes?: string;
  createdAt: string;
  verifiedAt?: string;
}

interface IBooking {
  _id: string;
  userId: IUser | null;
  roomId: IRoom | null;
  checkInDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  payment?: IPayment;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [verifyNotes, setVerifyNotes] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch bookings
      const bookingsResponse = await axios.get('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (bookingsResponse.data.success) {
        const bookingsData: IBooking[] = bookingsResponse.data.data;

        // Fetch payments for all bookings
        const paymentsResponse = await axios.get('/api/payments', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (paymentsResponse.data.success) {
          const payments: IPayment[] = paymentsResponse.data.data;

          // Map payments to bookings
          const bookingsWithPayments = bookingsData.map(booking => {
            const payment = payments.find(p => {
              const bookingIdStr = typeof p.bookingId === 'string'
                ? p.bookingId
                : p.bookingId?._id;
              return bookingIdStr === booking._id;
            });

            return {
              ...booking,
              payment: payment || undefined
            };
          });

          setBookings(bookingsWithPayments);
        } else {
          setBookings(bookingsData);
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusChange = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `/api/bookings/${bookingId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        fetchBookings(); // Refresh data
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  const handleVerifyPayment = async (paymentId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/payments/${paymentId}/verify`,
        {
          status,
          notes: verifyNotes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(status === PaymentStatus.VERIFIED ? 'อนุมัติการชำระเงินสำเร็จ' : 'ปฏิเสธการชำระเงินสำเร็จ');
      setShowPaymentModal(false);
      setSelectedBooking(null);
      setVerifyNotes('');
      fetchBookings(); // Refresh data
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

  const getPaymentStatusBadge = (status: string) => {
    const badges = {
      pending: styles.paymentPending,
      verified: styles.paymentVerified,
      rejected: styles.paymentRejected,
    };
    const labels = {
      pending: 'รอตรวจสอบ',
      verified: 'อนุมัติแล้ว',
      rejected: 'ปฏิเสธ',
    };

    const badgeClass = badges[status as keyof typeof badges] || '';
    const label = labels[status as keyof typeof labels] || status;

    return (
      <span className={`${styles.paymentBadge} ${badgeClass}`}>
        {label}
      </span>
    );
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
        <h1 className={styles.title}>จัดการการจองและชำระเงิน</h1>
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
                <th>รหัส</th>
                <th>ผู้จอง</th>
                <th>เบอร์โทร</th>
                <th>ห้อง</th>
                <th>ราคา</th>
                <th>วันเข้าพัก</th>
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
                  <td>
                    <div className={styles.statusCell}>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                      {booking.payment && (
                        <div className={styles.paymentStatusSmall}>
                          {getPaymentStatusBadge(booking.payment.status)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      {/* ถ้ามี payment และรอตรวจสอบ แสดงปุ่มดูสลิป */}
                      {booking.payment && booking.payment.status === 'pending' ? (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowPaymentModal(true);
                          }}
                          className={styles.viewSlipBtn}
                          title="ดูสลิปและอนุมัติ"
                        >
                          ดูสลิป
                        </button>
                      ) : booking.status === 'pending' && !booking.payment ? (
                        /* ถ้า pending และยังไม่มี payment แสดงปุ่มอนุมัติ/ยกเลิก */
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
                      ) : (
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

      {/* Payment Verification Modal */}
      {showPaymentModal && selectedBooking?.payment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>ตรวจสอบสลิปการช ำระเงิน</h2>

            <div className={styles.modalBody}>
              {/* Slip Image */}
              <div className={styles.slipImageContainer}>
                <Image
                  src={selectedBooking.payment.slipImage}
                  alt="สลิปการโอนเงิน"
                  fill
                  className={styles.slipImage}
                />
              </div>

              {/* Booking Details */}
              <div className={styles.modalInfoSection}>
                <p><strong>ผู้จอง:</strong> {selectedBooking.userId?.firstName} {selectedBooking.userId?.lastName}</p>
                <p><strong>ห้อง:</strong> {selectedBooking.roomId?.roomNumber}</p>
                <p><strong>จำนวนเงิน:</strong> {selectedBooking.payment.amount.toLocaleString()} บาท</p>
                <p><strong>วันที่ส่งสลิป:</strong> {new Date(selectedBooking.payment.createdAt).toLocaleString('th-TH')}</p>
              </div>

              {/* OCR Data */}
              {selectedBooking.payment.ocrData && (
                <div className={styles.ocrDataBox}>
                  <p className={styles.ocrDataTitle}>ข้อมูลจาก OCR/QR:</p>
                  <pre className={styles.ocrDataContent}>
                    {JSON.stringify(selectedBooking.payment.ocrData, null, 2)}
                  </pre>
                </div>
              )}

              {/* Notes Input */}
              <div className={styles.notesInputSection}>
                <label className={styles.notesInputLabel}>
                  หมายเหตุ (ถ้ามี)
                </label>
                <textarea
                  rows={3}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="เช่น ตรวจสอบแล้วถูกต้อง, จำนวนเงินไม่ตรงกัน..."
                  className={styles.notesTextarea}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className={styles.modalActions}>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedBooking(null);
                  setVerifyNotes('');
                }}
                className={styles.cancelButton}
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleVerifyPayment(selectedBooking.payment!._id, PaymentStatus.REJECTED)}
                className={styles.rejectButton}
              >
                ปฏิเสธ
              </button>
              <button
                onClick={() => handleVerifyPayment(selectedBooking.payment!._id, PaymentStatus.VERIFIED)}
                className={styles.approveButton}
              >
                อนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
