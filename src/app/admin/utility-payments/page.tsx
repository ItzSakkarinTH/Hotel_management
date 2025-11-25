'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import styles from './UtilityPayments.module.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';

interface Payment {
    _id: string;
    utilityBillId: {
        _id: string;
        month: string;
        roomId: {
            roomNumber: string;
        };
        waterUsage: number;
        electricityUsage: number;
        totalCost: number;
    };
    userId: {
        firstName: string;
        lastName: string;
    };
    amount: number;
    status: string;
    slipImage: string;
    createdAt: string;
}

export default function UtilityPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/payments', {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Filter only utility payments
            const utilityPayments = response.data.data.filter(
                (p: Payment) => p.utilityBillId
            );

            setPayments(utilityPayments);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (paymentId: string, status: 'approved' | 'rejected') => {
        if (!confirm(`ยืนยันการ${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}สลิปนี้?`)) return;

        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `/api/payments/${paymentId}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(`${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}สลิปสำเร็จ`);
            setShowModal(false);
            fetchPayments();
        } catch (error) {
            const err = error as { response?: { data?: { error?: string } } };
            alert(err.response?.data?.error || 'เกิดข้อผิดพลาด');
        } finally {
            setUpdating(false);
        }
    };

    const getMonthName = (monthStr: string) => {
        if (!monthStr) return 'ไม่ระบุ';
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });
    };

    const filteredPayments = payments.filter(payment => {
        if (filter === 'all') return true;
        return payment.status === filter;
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
            <Navbar isLoggedIn={true} isAdmin={true} />
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>ตรวจสอบสลิปค่าน้ำค่าไฟ</h1>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <BackButton />
                    </div>

                    {/* Filter */}
                    <div className={styles.filterContainer}>
                        <button
                            onClick={() => setFilter('all')}
                            className={`${styles.filterButton} ${filter === 'all' ? styles.filterActive : ''}`}
                        >
                            ทั้งหมด ({payments.length})
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`${styles.filterButton} ${filter === 'pending' ? styles.filterActivePending : ''}`}
                        >
                            รอตรวจสอบ ({payments.filter(p => p.status === 'pending').length})
                        </button>
                        <button
                            onClick={() => setFilter('approved')}
                            className={`${styles.filterButton} ${filter === 'approved' ? styles.filterActiveApproved : ''}`}
                        >
                            อนุมัติแล้ว ({payments.filter(p => p.status === 'approved').length})
                        </button>
                        <button
                            onClick={() => setFilter('rejected')}
                            className={`${styles.filterButton} ${filter === 'rejected' ? styles.filterActiveRejected : ''}`}
                        >
                            ปฏิเสธ ({payments.filter(p => p.status === 'rejected').length})
                        </button>
                    </div>

                    {/* Payments Table */}
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>วันที่ส่งสลิป</th>
                                    <th>เดือน</th>
                                    <th>ห้อง</th>
                                    <th>ผู้เช่า</th>
                                    <th>จำนวนเงิน</th>
                                    <th>สถานะ</th>
                                    <th>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map((payment) => (
                                    <tr key={payment._id}>
                                        <td>
                                            {new Date(payment.createdAt).toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td>{getMonthName(payment.utilityBillId?.month || '')}</td>
                                        <td className={styles.roomNumber}>
                                            {payment.utilityBillId?.roomId?.roomNumber || 'N/A'}
                                        </td>
                                        <td>
                                            {payment.userId?.firstName || ''} {payment.userId?.lastName || ''}
                                        </td>
                                        <td className={styles.amount}>
                                            {payment.amount.toLocaleString()} ฿
                                        </td>
                                        <td>
                                            {payment.status === 'pending' && (
                                                <span className={styles.badgePending}>รอตรวจสอบ</span>
                                            )}
                                            {payment.status === 'approved' && (
                                                <span className={styles.badgeApproved}>อนุมัติแล้ว</span>
                                            )}
                                            {payment.status === 'rejected' && (
                                                <span className={styles.badgeRejected}>ปฏิเสธ</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => {
                                                    setSelectedPayment(payment);
                                                    setShowModal(true);
                                                }}
                                                className={styles.viewButton}
                                            >
                                                ดูสลิป
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredPayments.length === 0 && (
                            <div className={styles.emptyState}>
                                <p>ไม่มีข้อมูลสลิป</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && selectedPayment && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>ตรวจสอบสลิปการโอนเงิน</h2>

                        <div className={styles.modalInfo}>
                            <p><strong>ผู้เช่า:</strong> {selectedPayment.userId?.firstName || ''} {selectedPayment.userId?.lastName || ''}</p>
                            <p><strong>ห้อง:</strong> {selectedPayment.utilityBillId?.roomId?.roomNumber || 'N/A'}</p>
                            <p><strong>เดือน:</strong> {getMonthName(selectedPayment.utilityBillId?.month || '')}</p>
                            <p><strong>จำนวนเงิน:</strong> {selectedPayment.amount.toLocaleString()} ฿</p>
                            <p><strong>วันที่ส่งสลิป:</strong> {new Date(selectedPayment.createdAt).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}</p>
                        </div>

                        <div className={styles.slipImageContainer}>
                            <Image
                                src={selectedPayment.slipImage}
                                alt="สลิปการโอนเงิน"
                                width={400}
                                height={600}
                                className={styles.slipImage}
                            />
                        </div>

                        {selectedPayment.status === 'pending' && (
                            <div className={styles.modalActions}>
                                <button
                                    onClick={() => handleUpdateStatus(selectedPayment._id, 'rejected')}
                                    disabled={updating}
                                    className={styles.rejectButton}
                                >
                                    {updating ? 'กำลังดำเนินการ...' : 'ปฏิเสธ'}
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedPayment._id, 'approved')}
                                    disabled={updating}
                                    className={styles.approveButton}
                                >
                                    {updating ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
                                </button>
                            </div>
                        )}

                        {selectedPayment.status !== 'pending' && (
                            <div className={styles.statusInfo}>
                                สถานะ: {selectedPayment.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'}
                            </div>
                        )}

                        <button
                            onClick={() => setShowModal(false)}
                            className={styles.closeButton}
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}
