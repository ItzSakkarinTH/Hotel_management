'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { IUtilityBill, IRoom, SlipData, OCRData } from '@/types';
import styles from './Utilities.module.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import SlipReaderIntegrated from '@/components/SlipReader';

interface UtilityBillWithDetails extends Omit<IUtilityBill, 'roomId'> {
    roomId: IRoom;
    payment?: {
        _id: string;
        status: string;
        slipImage: string;
        createdAt: string;
    };
}

export default function UtilitiesPage() {
    const [bills, setBills] = useState<UtilityBillWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

    // Payment modal states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState<UtilityBillWithDetails | null>(null);
    const [slipImage, setSlipImage] = useState<string>('');
    const [ocrData, setOcrData] = useState<OCRData | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch bills
            const billsRes = await axios.get('/api/utilities', {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Fetch payments
            const paymentsRes = await axios.get('/api/payments', {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Map payments to bills
            const billsWithPayments = billsRes.data.data.map((bill: UtilityBillWithDetails) => {
                const payment = paymentsRes.data.data.find(
                    (p: { utilityBillId?: string }) => p.utilityBillId === bill._id
                );
                return {
                    ...bill,
                    payment: payment || null,
                };
            });

            setBills(billsWithPayments);
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = (bill: UtilityBillWithDetails) => {
        setSelectedBill(bill);
        setShowPaymentModal(true);
        setSlipImage('');
        setOcrData(null);
        setError('');
    };

    const handlePaymentSubmit = async () => {
        if (!slipImage || !selectedBill) {
            setError('กรุณาอัพโหลดสลิปการโอนเงิน');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                '/api/payments',
                {
                    utilityBillId: selectedBill._id,
                    amount: selectedBill.totalCost,
                    slipImage,
                    ocrData,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.success) {
                alert('ส่งสลิปการโอนเงินสำเร็จ! รอการตรวจสอบจากผู้ดูแลระบบ');
                setShowPaymentModal(false);
                fetchBills();
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการส่งสลิป');
        } finally {
            setSubmitting(false);
        }
    };

    const getMonthName = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });
    };

    const filteredBills = bills.filter(bill => {
        if (filter === 'paid') return bill.paid;
        if (filter === 'unpaid') return !bill.paid;
        return true;
    });

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingText}>กำลังโหลด...</div>
            </div>
        );
    }

    return (
        <>
            <Navbar isLoggedIn={true} />
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>ค่าน้ำค่าไฟ</h1>
                    <div style={{ marginBottom: '1rem' }}>
                        <BackButton />
                    </div>
                    {/* Filters */}
                    <div className={styles.filterContainer}>
                        <button
                            onClick={() => setFilter('all')}
                            className={`${styles.filterButton} ${filter === 'all'
                                ? styles.activeFilter
                                : styles.inactiveFilter
                                }`}
                        >
                            ทั้งหมด ({bills.length})
                        </button>
                        <button
                            onClick={() => setFilter('unpaid')}
                            className={`${styles.filterButton} ${filter === 'unpaid'
                                ? styles.activeFilterUnpaid
                                : styles.inactiveFilter
                                }`}
                        >
                            ยังไม่ชำระ ({bills.filter(b => !b.paid).length})
                        </button>
                        <button
                            onClick={() => setFilter('paid')}
                            className={`${styles.filterButton} ${filter === 'paid'
                                ? styles.activeFilterPaid
                                : styles.inactiveFilter
                                }`}
                        >
                            ชำระแล้ว ({bills.filter(b => b.paid).length})
                        </button>
                    </div>

                    {/* Bills Grid */}
                    <div className={styles.grid}>
                        {filteredBills.map((bill) => (
                            <div
                                key={bill._id}
                                className={styles.card}
                            >
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.monthTitle}>
                                            {getMonthName(bill.month)}
                                        </h3>
                                        <p className={styles.roomText}>ห้อง {bill.roomId?.roomNumber}</p>
                                    </div>
                                    {bill.paid ? (
                                        <span className={styles.badgePaid}>
                                            ชำระแล้ว
                                        </span>
                                    ) : (
                                        <span className={styles.badgeUnpaid}>
                                            ยังไม่ชำระ
                                        </span>
                                    )}
                                </div>

                                <div className={styles.detailsContainer}>
                                    {/* Water */}
                                    <div className={styles.waterSection}>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabelWater}>💧 ค่าน้ำ</span>
                                            <span className={styles.detailValueWater}>
                                                {bill.waterUsage} หน่วย
                                            </span>
                                        </div>
                                        <div className={styles.costWater}>
                                            {bill.waterCost.toLocaleString()} ฿
                                        </div>
                                    </div>

                                    {/* Electricity */}
                                    <div className={styles.electricSection}>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabelElectric}>⚡ ค่าไฟ</span>
                                            <span className={styles.detailValueElectric}>
                                                {bill.electricityUsage} หน่วย
                                            </span>
                                        </div>
                                        <div className={styles.costElectric}>
                                            {bill.electricityCost.toLocaleString()} ฿
                                        </div>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className={styles.totalSection}>
                                    <div className={styles.totalRow}>
                                        <span className={styles.totalLabel}>รวมทั้งสิ้น</span>
                                        <span className={styles.totalValue}>
                                            {bill.totalCost.toLocaleString()} ฿
                                        </span>
                                    </div>
                                </div>

                                {bill.paid && bill.paidAt && (
                                    <div className={styles.paidDate}>
                                        ชำระเมื่อ: {new Date(bill.paidAt).toLocaleDateString('th-TH')}
                                    </div>
                                )}

                                {/* Payment Status */}
                                {bill.payment && (
                                    <div className={styles.paymentInfo}>
                                        <div className={styles.paymentStatus}>
                                            {bill.payment.status === 'pending' && (
                                                <span className={styles.statusPending}>
                                                    ⏳ รอตรวจสอบสลิป
                                                </span>
                                            )}
                                            {bill.payment.status === 'approved' && (
                                                <span className={styles.statusApproved}>
                                                    ✓ อนุมัติแล้ว
                                                </span>
                                            )}
                                            {bill.payment.status === 'rejected' && (
                                                <span className={styles.statusRejected}>
                                                    ✗ ปฏิเสธ
                                                </span>
                                            )}
                                        </div>
                                        <div className={styles.paymentDate}>
                                            ส่งสลิปเมื่อ: {new Date(bill.payment.createdAt).toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </div>
                                )}

                                {!bill.paid && !bill.payment && (
                                    <button
                                        className={styles.payButton}
                                        onClick={() => handlePayment(bill)}
                                    >
                                        ชำระเงิน
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {filteredBills.length === 0 && (
                        <div className={styles.emptyState}>
                            <p>ไม่พบข้อมูลค่าน้ำค่าไฟ</p>
                        </div>
                    )}

                    {/* Summary */}
                    {bills.length > 0 && (
                        <div className={styles.summaryCard}>
                            <h2 className={styles.title} style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>สรุปยอดรวม</h2>
                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryItem}>
                                    <p className={styles.summaryLabel}>ยอดรวมทั้งหมด</p>
                                    <p className={styles.summaryValue}>
                                        {bills.reduce((sum, bill) => sum + bill.totalCost, 0).toLocaleString()} ฿
                                    </p>
                                </div>
                                <div className={styles.summaryItemUnpaid}>
                                    <p className={styles.summaryLabel} style={{ color: '#dc2626' }}>ยอดค้างชำระ</p>
                                    <p className={styles.summaryValueUnpaid}>
                                        {bills
                                            .filter(b => !b.paid)
                                            .reduce((sum, bill) => sum + bill.totalCost, 0)
                                            .toLocaleString()} ฿
                                    </p>
                                </div>
                                <div className={styles.summaryItemPaid}>
                                    <p className={styles.summaryLabel} style={{ color: '#059669' }}>ชำระแล้ว</p>
                                    <p className={styles.summaryValuePaid}>
                                        {bills
                                            .filter(b => b.paid)
                                            .reduce((sum, bill) => sum + bill.totalCost, 0)
                                            .toLocaleString()} ฿
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedBill && (
                <div className={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>ชำระค่าน้ำค่าไฟ</h2>

                        <div className={styles.modalInfo}>
                            <p><strong>เดือน:</strong> {getMonthName(selectedBill.month)}</p>
                            <p><strong>ห้อง:</strong> {selectedBill.roomId?.roomNumber}</p>
                            <p><strong>จำนวนเงิน:</strong> {selectedBill.totalCost.toLocaleString()} ฿</p>
                        </div>

                        {error && (
                            <div className={styles.errorBanner}>
                                {error}
                            </div>
                        )}

                        <div className={styles.uploadContainer}>
                            <SlipReaderIntegrated
                                expectedAmount={selectedBill.totalCost}
                                onSlipVerified={(data: SlipData) => {
                                    setSlipImage(data.slipImage);
                                    setOcrData(data.ocrData);
                                    setError('');
                                }}
                                onError={(err: string) => setError(err)}
                            />
                        </div>

                        {ocrData && (
                            <div className={styles.ocrInfo}>
                                <h3>ข้อมูลจากสลิป (OCR)</h3>
                                <pre>{JSON.stringify(ocrData, null, 2)}</pre>
                            </div>
                        )}

                        <div className={styles.modalActions}>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                disabled={submitting}
                                className={styles.cancelButton}
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handlePaymentSubmit}
                                disabled={!slipImage || submitting}
                                className={styles.submitButton}
                            >
                                {submitting ? 'กำลังส่ง...' : 'ส่งสลิป'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}
