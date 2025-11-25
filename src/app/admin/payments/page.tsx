'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { IPayment, PaymentStatus, AxiosErrorResponse } from '@/types';
import styles from './AdminPayments.module.css';

interface BookingInfo {
  _id: string;
  roomId: { roomNumber: string };
}

interface UserInfo {
  _id: string;
  firstName: string;
  lastName: string;
}

interface PaymentWithDetails extends Omit<IPayment, 'bookingId' | 'userId'> {
  bookingId: BookingInfo;
  userId: UserInfo;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/payments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(response.data.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId: string, status: PaymentStatus) => {
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
      setShowModal(false);
      setSelectedPayment(null);
      setVerifyNotes('');
      fetchPayments();
    } catch (error: unknown) {
      const err = error as AxiosErrorResponse;
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const badgeClasses = {
      [PaymentStatus.PENDING]: styles.badgePending,
      [PaymentStatus.VERIFIED]: styles.badgeVerified,
      [PaymentStatus.REJECTED]: styles.badgeRejected,
    };

    const labels = {
      [PaymentStatus.PENDING]: 'รอตรวจสอบ',
      [PaymentStatus.VERIFIED]: 'อนุมัติแล้ว',
      [PaymentStatus.REJECTED]: 'ปฏิเสธ',
    };

    return (
      <span className={`${styles.badge} ${badgeClasses[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const filteredPayments = filter === 'all'
    ? payments
    : payments.filter(p => p.status === filter);

  if (loading) {
    return <div className={styles.loadingContainer}>กำลังโหลด...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.pageTitle}>ตรวจสอบการชำระเงิน</h1>

        {/* Filters */}
        <div className={styles.filterContainer}>
          <button
            onClick={() => setFilter('all')}
            className={`${styles.filterButton} ${filter === 'all' ? styles.filterButtonActive : styles.filterButtonInactive}`}
          >
            ทั้งหมด ({payments.length})
          </button>
          <button
            onClick={() => setFilter(PaymentStatus.PENDING)}
            className={`${styles.filterButton} ${filter === PaymentStatus.PENDING ? styles.filterButtonPending : styles.filterButtonInactive}`}
          >
            รอตรวจสอบ ({payments.filter(p => p.status === PaymentStatus.PENDING).length})
          </button>
          <button
            onClick={() => setFilter(PaymentStatus.VERIFIED)}
            className={`${styles.filterButton} ${filter === PaymentStatus.VERIFIED ? styles.filterButtonVerified : styles.filterButtonInactive}`}
          >
            อนุมัติแล้ว ({payments.filter(p => p.status === PaymentStatus.VERIFIED).length})
          </button>
          <button
            onClick={() => setFilter(PaymentStatus.REJECTED)}
            className={`${styles.filterButton} ${filter === PaymentStatus.REJECTED ? styles.filterButtonRejected : styles.filterButtonInactive}`}
          >
            ปฏิเสธ ({payments.filter(p => p.status === PaymentStatus.REJECTED).length})
          </button>
        </div>

        {/* Payments Grid */}
        <div className={styles.paymentsGrid}>
          {filteredPayments.map((payment) => (
            <div key={payment._id} className={styles.paymentCard}>
              {/* Slip Image */}
              <div className={styles.slipImageContainer}>
                <Image
                  src={payment.slipImage}
                  alt="สลิปการโอนเงิน"
                  fill
                  className={styles.slipImage}
                />
              </div>

              {/* Payment Details */}
              <div className={styles.paymentDetails}>
                <div className={styles.paymentHeader}>
                  <div>
                    <p className={styles.labelText}>ผู้ชำระเงิน</p>
                    <p className={styles.userName}>
                      {payment.userId?.firstName} {payment.userId?.lastName}
                    </p>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>

                <div className={styles.infoSection}>
                  <div className={styles.infoRow}>
                    <span className={styles.labelText}>จำนวนเงิน:</span>
                    <span className={styles.amountText}>
                      {payment.amount.toLocaleString()} ฿
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.labelText}>ประเภท:</span>
                    <span>{payment.type}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.labelText}>วันที่:</span>
                    <span>{new Date(payment.createdAt).toLocaleDateString('th-TH')}</span>
                  </div>
                </div>

                {payment.ocrData && (
                  <div className={styles.ocrDataBox}>
                    <p className={styles.ocrDataTitle}>ข้อมูลจาก OCR:</p>
                    <pre className={styles.ocrDataContent}>
                      {JSON.stringify(payment.ocrData, null, 2)}
                    </pre>
                  </div>
                )}

                {payment.notes && (
                  <div className={styles.notesBox}>
                    <p className={styles.notesTitle}>หมายเหตุ:</p>
                    <p className={styles.notesContent}>{payment.notes}</p>
                  </div>
                )}

                {payment.status === PaymentStatus.PENDING && (
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setShowModal(true);
                    }}
                    className={styles.verifyButton}
                  >
                    ตรวจสอบ
                  </button>
                )}

                {payment.status === PaymentStatus.VERIFIED && payment.verifiedAt && (
                  <div className={styles.verifiedAtText}>
                    อนุมัติเมื่อ: {new Date(payment.verifiedAt).toLocaleString('th-TH')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>ไม่พบข้อมูลการชำระเงิน</p>
          </div>
        )}

        {/* Verify Modal */}
        {showModal && selectedPayment && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>ตรวจสอบการชำระเงิน</h2>

              <div className={styles.modalBody}>
                <div className={styles.modalImageContainer}>
                  <Image
                    src={selectedPayment.slipImage}
                    alt="สลิปการโอนเงิน"
                    fill
                    className={styles.modalImage}
                  />
                </div>

                <div className={styles.modalInfoSection}>
                  <p><strong>ผู้ชำระเงิน:</strong> {selectedPayment.userId?.firstName} {selectedPayment.userId?.lastName}</p>
                  <p><strong>จำนวนเงิน:</strong> {selectedPayment.amount.toLocaleString()} บาท</p>
                  <p><strong>ประเภท:</strong> {selectedPayment.type}</p>
                  <p><strong>วันที่:</strong> {new Date(selectedPayment.createdAt).toLocaleString('th-TH')}</p>
                </div>

                {selectedPayment.ocrData && (
                  <div className={styles.modalOcrBox}>
                    <p className={styles.modalOcrTitle}>ข้อมูลจาก OCR:</p>
                    <pre className={styles.modalOcrContent}>
                      {JSON.stringify(selectedPayment.ocrData, null, 2)}
                    </pre>
                  </div>
                )}

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

              <div className={styles.modalActions}>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPayment(null);
                    setVerifyNotes('');
                  }}
                  className={styles.cancelButton}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => handleVerify(selectedPayment._id, PaymentStatus.REJECTED)}
                  className={styles.rejectButton}
                >
                  ปฏิเสธ
                </button>
                <button
                  onClick={() => handleVerify(selectedPayment._id, PaymentStatus.VERIFIED)}
                  className={styles.approveButton}
                >
                  อนุมัติ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
