'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import styles from './UserDashboard.module.css';
import { IAnnouncement } from '@/types';

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

interface RoomInfo {
  _id: string;
  roomNumber: string;
  price: number;
}

interface BookingData {
  _id: string;
  status: string;
  roomId: RoomInfo;
  checkInDate: string;
}

interface UtilityBill {
  _id: string;
  paid: boolean;
  totalCost: number;
}

interface DashboardStats {
  currentBooking: BookingData | null;
  unpaidBills: number;
  totalUnpaid: number;
  announcements: IAnnouncement[];
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    currentBooking: null,
    unpaidBills: 0,
    totalUnpaid: 0,
    announcements: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData) as UserData;

      // Redirect admin/owner to admin dashboard
      if (parsedUser.role === 'admin' || parsedUser.role === 'owner') {
        router.push('/admin/dashboard');
        return;
      }

      setUser(parsedUser);
    }
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      const [bookingsRes, utilitiesRes, announcementsRes] = await Promise.all([
        axios.get('/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/utilities', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/announcements?active=true', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const bookings = bookingsRes.data.data as BookingData[];
      const utilities = utilitiesRes.data.data as UtilityBill[];
      const announcements = announcementsRes.data.data as IAnnouncement[];

      const currentBooking = bookings.find(
        (b: BookingData) => b.status === 'confirmed' || b.status === 'pending'
      );

      const unpaidBills = utilities.filter((u: UtilityBill) => !u.paid);
      const totalUnpaid = unpaidBills.reduce(
        (sum: number, bill: UtilityBill) => sum + bill.totalCost,
        0
      );

      setStats({
        currentBooking: currentBooking || null,
        unpaidBills: unpaidBills.length,
        totalUnpaid,
        announcements: announcements.slice(0, 3),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
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
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <div>
              <h1 className={styles.headerTitle}>
                สวัสดี, {user?.firstName} {user?.lastName}
              </h1>
              <p className={styles.headerEmail}>{user?.email}</p>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Quick Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div>
                <p className={styles.statLabel}>สถานะการเข้าพัก</p>
                {stats.currentBooking ? (
                  <>
                    <p className={styles.statValueGreen}>กำลังเข้าพัก</p>
                    <p className={styles.statSubtext}>
                      ห้อง {stats.currentBooking.roomId?.roomNumber}
                    </p>
                  </>
                ) : (
                  <p className={styles.statValueGray}>ยังไม่ได้เข้าพัก</p>
                )}
              </div>
              <div className={styles.statIcon}>🏠</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div>
                <p className={styles.statLabel}>บิลค้างชำระ</p>
                <p className={styles.statValueRed}>
                  {stats.unpaidBills} รายการ
                </p>
                <p className={styles.statSubtext}>
                  {stats.totalUnpaid.toLocaleString()} บาท
                </p>
              </div>
              <div className={styles.statIcon}>💳</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div>
                <p className={styles.statLabel}>ประกาศใหม่</p>
                <p className={styles.statValueGold}>
                  {stats.announcements.length} รายการ
                </p>
              </div>
              <div className={styles.statIcon}>📢</div>
            </div>
          </div>
        </div>

        {/* Current Booking */}
        {stats.currentBooking && (
          <div className={styles.bookingCard}>
            <h2 className={styles.cardTitle}>ห้องพักปัจจุบัน</h2>
            <div className={styles.bookingGrid}>
              <div>
                <p className={styles.fieldLabel}>เลขห้อง</p>
                <p className={styles.fieldValue}>
                  {stats.currentBooking.roomId?.roomNumber}
                </p>
              </div>
              <div>
                <p className={styles.fieldLabel}>ค่าห้อง/เดือน</p>
                <p className={styles.fieldValue}>
                  {stats.currentBooking.roomId?.price?.toLocaleString()} บาท
                </p>
              </div>
              <div>
                <p className={styles.fieldLabel}>วันเข้าพัก</p>
                <p className={styles.fieldValue}>
                  {new Date(stats.currentBooking.checkInDate).toLocaleDateString('th-TH')}
                </p>
              </div>
              <div>
                <p className={styles.fieldLabel}>สถานะ</p>
                <span className={
                  stats.currentBooking.status === 'confirmed'
                    ? styles.badgeGreen
                    : styles.badgeYellow
                }>
                  {stats.currentBooking.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอดำเนินการ'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.mainGrid}>
          {/* Quick Actions */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>เมนูด่วน</h2>
            <div className={styles.menuList}>
              <Link href="/rooms" className={styles.menuItemGold}>
                <div className={styles.menuItemContent}>
                  <span className={styles.menuIcon}>🏨</span>
                  <span className={styles.menuText}>ดูห้องพักว่าง</span>
                </div>
                <span className={styles.menuArrow}>→</span>
              </Link>

              <Link href="/utilities" className={styles.menuItemBlue}>
                <div className={styles.menuItemContent}>
                  <span className={styles.menuIcon}>💡</span>
                  <span className={styles.menuText}>ค่าน้ำค่าไฟ</span>
                </div>
                {stats.unpaidBills > 0 && (
                  <span className={styles.badge}>
                    {stats.unpaidBills}
                  </span>
                )}
              </Link>

              {stats.currentBooking && (
                <Link href="/booking-history" className={styles.menuItemGreen}>
                  <div className={styles.menuItemContent}>
                    <span className={styles.menuIcon}>📋</span>
                    <span className={styles.menuText}>ประวัติการจอง</span>
                  </div>
                  <span className={styles.menuArrow}>→</span>
                </Link>
              )}
            </div>
          </div>

          {/* Announcements */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>ประกาศล่าสุด</h2>
            <div className={styles.announcementList}>
              {stats.announcements.length > 0 ? (
                stats.announcements.map((announcement) => (
                  <div key={announcement._id} className={styles.announcementItem}>
                    <h3 className={styles.announcementTitle}>
                      {announcement.title}
                    </h3>
                    <p className={styles.announcementContent}>
                      {announcement.content}
                    </p>
                    <p className={styles.announcementDate}>
                      {new Date(announcement.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                ))
              ) : (
                <p className={styles.emptyState}>ไม่มีประกาศในขณะนี้</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
