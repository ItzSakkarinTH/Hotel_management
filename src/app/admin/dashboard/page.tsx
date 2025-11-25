'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import styles from './AdminDashboard.module.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';

interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  pendingPayments: number;
  totalRevenue: number;
  activeBookings: number;
}

// Types for API responses
interface RoomData {
  _id: string;
  status: string;
  roomNumber: string;
  // ... other room properties
}

interface PaymentData {
  _id: string;
  status: string;
  amount: number;
  // ... other payment properties
}

interface BookingData {
  _id: string;
  status: string;
  // ... other booking properties
}

interface StatCardProps {
  title: string;
  value: string | number;
  color: string;
  link: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    activeBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      const [roomsRes, bookingsRes, paymentsRes] = await Promise.all([
        axios.get('/api/rooms', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/payments', {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      const rooms = roomsRes.data.data as RoomData[];
      const bookings = bookingsRes.data.data as BookingData[];
      const payments = paymentsRes.data.data as PaymentData[];

      setStats({
        totalRooms: rooms.length,
        availableRooms: rooms.filter((r: RoomData) => r.status === 'available').length,
        occupiedRooms: rooms.filter((r: RoomData) => r.status === 'occupied').length,
        pendingPayments: payments.filter((p: PaymentData) => p.status === 'pending').length,
        totalRevenue: payments
          .filter((p: PaymentData) => p.status === 'verified')
          .reduce((sum: number, p: PaymentData) => sum + p.amount, 0),
        activeBookings: bookings.filter((b: BookingData) =>
          ['pending', 'confirmed'].includes(b.status)
        ).length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, color, link }: StatCardProps) => (
    <Link href={link} className={styles.statCardLink}>
      <div className={`${styles.statCard} ${styles[color]}`}>
        <h3 className={styles.statTitle}>{title}</h3>
        <p className={styles.statValue}>{value}</p>
      </div>
    </Link>
  );

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
          <div style={{ marginBottom: '1rem' }}>
            <BackButton />
          </div>

          <div className={styles.headerInfo} style={{ marginBottom: '2rem' }}>
            <h1 className={styles.headerTitle}>แดชบอร์ดผู้ดูแลระบบ</h1>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <StatCard
              title="ห้องพักทั้งหมด"
              value={stats.totalRooms}
              color="borderBlue"
              link="/admin/rooms-management"
            />
            <StatCard
              title="ห้องว่าง"
              value={stats.availableRooms}
              color="borderGreen"
              link="/admin/rooms-management?status=available"
            />
            <StatCard
              title="ห้องเต็ม"
              value={stats.occupiedRooms}
              color="borderRed"
              link="/admin/rooms-management?status=occupied"
            />
            <StatCard
              title="การจองที่รอดำเนินการ"
              value={stats.activeBookings}
              color="borderYellow"
              link="/admin/bookings"
            />
            <StatCard
              title="สลิปรอตรวจสอบ"
              value={stats.pendingPayments}
              color="borderPurple"
              link="/admin/payments"
            />
            <StatCard
              title="รายได้รวม"
              value={`${stats.totalRevenue.toLocaleString()} ฿`}
              color="borderEmerald"
              link="/admin/payments"
            />
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActionsCard}>
            <h2 className={styles.quickActionsTitle}>เมนูด่วน</h2>
            <div className={styles.quickActionsGrid}>
              <Link href="/admin/rooms-management/new" className={styles.actionIndigo}>
                <span className={styles.actionText}>+ เพิ่มห้องพักใหม่</span>
              </Link>
              <Link href="/admin/bookings" className={styles.actionGreen}>
                <span className={styles.actionText}>จัดการการจอง</span>
              </Link>
              <Link href="/admin/payments" className={styles.actionPurple}>
                <span className={styles.actionText}>ตรวจสอบสลิป</span>
              </Link>
              <Link href="/admin/announcements" className={styles.actionOrange}>
                <span className={styles.actionText}>ประกาศข่าวสาร</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}