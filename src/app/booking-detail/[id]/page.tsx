'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { AxiosErrorResponse } from '@/types';
import styles from './BookingDetail.module.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';

interface IRoom {
    _id: string;
    roomNumber: string;
    price: number;
    deposit: number;
    waterRate: number;
    electricityRate: number;
    images?: string[];
}

interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

interface IPayment {
    _id: string;
    amount: number;
    status: string;
    slipImage?: string;
    createdAt: string;
}

interface IBookingDetail {
    _id: string;
    userId: IUser | string;
    roomId: IRoom | string;
    checkInDate: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export default function BookingDetailPage() {
    const router = useRouter();
    const params = useParams();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<IBookingDetail | null>(null);
    const [payment, setPayment] = useState<IPayment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (bookingId) {
            fetchBookingDetail();
        }
    }, [bookingId]);

    const fetchBookingDetail = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch booking details
            const bookingResponse = await axios.get(`/api/bookings/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (bookingResponse.data.success) {
                setBooking(bookingResponse.data.data);

                // Try to fetch payment info
                try {
                    const paymentResponse = await axios.get(`/api/payments?bookingId=${bookingId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (paymentResponse.data.success && paymentResponse.data.data.length > 0) {
                        setPayment(paymentResponse.data.data[0]);
                    }
                } catch (paymentError) {
                    // Payment might not exist yet, it's okay
                    console.log('No payment found for this booking');
                }
            }
        } catch (error: unknown) {
            const err = error as AxiosErrorResponse;
            setError(err.response?.data?.error || 'ไม่สามารถโหลดข้อมูลการจองได้');
        } finally {
            setLoading(false);
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
        switch (status) {
            case 'pending':
                return styles.statusPending;
            case 'confirmed':
                return styles.statusConfirmed;
            case 'cancelled':
            case 'rejected':
                return styles.statusCancelled;
            default:
                return '';
        }
    };

    const getPaymentStatusText = (status: string) => {
        const statusMap: { [key: string]: string } = {
            pending: 'รอตรวจสอบ',
            approved: 'อนุมัติแล้ว',
            rejected: 'ปฏิเสธ',
        };
        return statusMap[status] || status;
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingText}>กำลังโหลด...</div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorText}>{error || 'ไม่พบข้อมูลการจอง'}</div>
                <button onClick={() => router.push('/booking-history')} className={styles.backButton}>
                    กลับไปหน้าประวัติการจอง
                </button>
            </div>
        );
    }

    const roomData = typeof booking.roomId === 'string' ? null : booking.roomId;
    const userData = typeof booking.userId === 'string' ? null : booking.userId;

    return (
        <>
            <Navbar isLoggedIn={true} />
            <div className={styles.container}>
                <div className={styles.maxWidth}>
                    <div style={{ marginBottom: '1rem' }}>
                        <BackButton />
                    </div>
                    {/* Header */}
                    <div className={styles.header}>
                        <h1 className={styles.title}>รายละเอียดการจอง</h1>
                    </div>

                    {/* Booking Status */}
                    <div className={styles.statusCard}>
                        <div className={styles.statusHeader}>
                            <span className={styles.bookingId}>รหัสการจอง: {booking._id.slice(-8).toUpperCase()}</span>
                            <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                                {getStatusText(booking.status)}
                            </span>
                        </div>
                        <p className={styles.bookingDate}>
                            จองเมื่อ: {new Date(booking.createdAt).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>

                    <div className={styles.contentGrid}>
                        {/* Room Information */}
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>ข้อมูลห้องพัก</h2>

                            {roomData?.images && roomData.images.length > 0 && (
                                <div className={styles.roomImageContainer}>
                                    <Image
                                        src={roomData.images[0]}
                                        alt={`ห้อง ${roomData.roomNumber}`}
                                        fill
                                        className={styles.roomImage}
                                    />
                                </div>
                            )}

                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>หมายเลขห้อง</span>
                                    <span className={styles.infoValue}>{roomData?.roomNumber || 'N/A'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>ราคา/เดือน</span>
                                    <span className={styles.infoValue}>{roomData?.price.toLocaleString() || 'N/A'} บาท</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>เงินประกัน</span>
                                    <span className={styles.infoValue}>{roomData?.deposit.toLocaleString() || 'N/A'} บาท</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>ค่าน้ำ</span>
                                    <span className={styles.infoValue}>{roomData?.waterRate || 'N/A'} บาท/หน่วย</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>ค่าไฟ</span>
                                    <span className={styles.infoValue}>{roomData?.electricityRate || 'N/A'} บาท/หน่วย</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>วันที่เข้าพัก</span>
                                    <span className={styles.infoValue}>
                                        {new Date(booking.checkInDate).toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.totalAmount}>
                                <span>ยอดรวมที่ต้องชำระ</span>
                                <span className={styles.totalValue}>
                                    {roomData
                                        ? ((roomData.price || 0) + (roomData.deposit || 0)).toLocaleString()
                                        : 'N/A'} บาท
                                </span>
                            </div>
                        </div>

                        {/* User Information */}
                        {userData && (
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>ข้อมูลผู้จอง</h2>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>ชื่อ-นามสกุล</span>
                                        <span className={styles.infoValue}>{userData.firstName} {userData.lastName}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>อีเมล</span>
                                        <span className={styles.infoValue}>{userData.email}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>เบอร์โทร</span>
                                        <span className={styles.infoValue}>{userData.phoneNumber}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Information */}
                        {payment && (
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>ข้อมูลการชำระเงิน</h2>

                                {payment.slipImage && (
                                    <div className={styles.slipImageContainer}>
                                        <Image
                                            src={payment.slipImage}
                                            alt="สลิปการโอนเงิน"
                                            fill
                                            className={styles.slipImage}
                                        />
                                    </div>
                                )}

                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>จำนวนเงิน</span>
                                        <span className={styles.infoValue}>{payment.amount.toLocaleString()} บาท</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>สถานะ</span>
                                        <span className={`${styles.statusBadge} ${getStatusClass(payment.status)}`}>
                                            {getPaymentStatusText(payment.status)}
                                        </span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>วันที่ชำระ</span>
                                        <span className={styles.infoValue}>
                                            {new Date(payment.createdAt).toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!payment && booking.status === 'pending' && (
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>การชำระเงิน</h2>
                                <p className={styles.noPayment}>ยังไม่มีข้อมูลการชำระเงิน</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
