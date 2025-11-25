'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IAnnouncement } from '@/types';
import styles from './Dashboard.module.css';

interface PublicStats {
  totalRooms: number;
  availableRooms: number;
  startingPrice: number;
  announcements: IAnnouncement[];
}

export default function PublicDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<PublicStats>({
    totalRooms: 20,
    availableRooms: 5,
    startingPrice: 3500,
    announcements: [],
  });

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
      return;
    }

    const fetchPublicData = async () => {
      try {
        // Fetch public announcements (no auth required)
        const response = await fetch('/api/announcements?active=true');
        if (response.ok) {
          const data = await response.json();
          setStats(prev => ({
            ...prev,
            announcements: (data.data?.slice(0, 3) || []) as IAnnouncement[],
          }));
        }
      } catch (error) {
        console.error('Error fetching public data:', error);
      }
    };

    fetchPublicData();
  }, [router]);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            ยินดีต้อนรับสู่ระบบจัดการหอพัก
          </h1>
          <p className={styles.heroSubtitle}>
            จองห้องพัก จ่ายค่าน้ำค่าไฟ และติดตามข่าวสารหอพักได้ง่ายๆสามารถเข้ารับบริการของเราได้ทันที
          </p>
          <div className={styles.heroCta}>
            <Link href="/login" className={styles.btnPrimary}>
              เข้าสู่ระบบ
            </Link>
            <Link href="/register" className={styles.btnSecondary}>
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div>
                <p className={styles.statLabel}>ห้องพักทั้งหมด</p>
                <p className={styles.statValue}>{stats.totalRooms} ห้อง</p>
                <p className={styles.statSubtext}>คุณภาพมาตรฐาน</p>
              </div>
              <div className={styles.statIcon}>🏢</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div>
                <p className={styles.statLabel}>ห้องว่าง</p>
                <p className={styles.statValueGreen}>{stats.availableRooms} ห้อง</p>
                <p className={styles.statSubtext}>พร้อมเข้าพักได้ทันที</p>
              </div>
              <div className={styles.statIcon}>✅</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div>
                <p className={styles.statLabel}>ราคาเริ่มต้น</p>
                <p className={styles.statValueIndigo}>
                  {stats.startingPrice.toLocaleString()} ฿
                </p>
                <p className={styles.statSubtext}>ต่อเดือน</p>
              </div>
              <div className={styles.statIcon}>💰</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>คุณสมบัติของระบบ</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🏨</div>
              <h3 className={styles.featureTitle}>จองห้องออนไลน์</h3>
              <p className={styles.featureText}>
                เลือกและจองห้องพักได้ง่ายๆ ผ่านระบบออนไลน์ตลอด 24 ชั่วโมง
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💡</div>
              <h3 className={styles.featureTitle}>ค่าน้ำค่าไฟ</h3>
              <p className={styles.featureText}>
                ตรวจสอบและชำระค่าน้ำค่าไฟรายเดือนได้สะดวก ไม่พลาดกำหนดชำระ
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📢</div>
              <h3 className={styles.featureTitle}>รับข่าวสาร</h3>
              <p className={styles.featureText}>
                อัพเดตข่าวสารและประกาศต่างๆ จากผู้ดูแลหอพักอยู่เสมอ
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📱</div>
              <h3 className={styles.featureTitle}>ใช้งานง่าย</h3>
              <p className={styles.featureText}>
                ออกแบบให้ใช้งานง่าย รองรับทั้งมือถือและคอมพิวเตอร์
              </p>
            </div>
          </div>
        </div>

        {/* Announcements */}
        {stats.announcements.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>ประกาศล่าสุด</h2>
            <div className={styles.announcementsContainer}>
              {stats.announcements.map((announcement) => (
                <div key={announcement._id} className={styles.announcementCard}>
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
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>พร้อมเริ่มต้นแล้วหรือยัง?</h2>
          <p className={styles.ctaText}>
            สมัครสมาชิกวันนี้เพื่อเข้าถึงระบบจัดการหอพักแบบครบวงจร
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/register" className={styles.btnLarge}>
              สมัครสมาชิกฟรี
            </Link>
            <Link href="/login" className={styles.btnOutline}>
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
