'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IAnnouncement } from '@/types';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
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
    <>
      <Navbar isLoggedIn={false} />
      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                ยินดีต้อนรับสู่ระบบจัดการหอพัก
              </h1>
              <p className={styles.heroSubtitle}>
                จองห้องพัก จ่ายค่าน้ำค่าไฟ และติดตามข่าวสารหอพักได้ง่ายๆ
                <br />
                เข้าถึงระบบได้ทุกที่ทุกเวลา พร้อมบริการที่สะดวกสบาย
              </p>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {/* Stats Cards */}
          <div className={styles.statsSection}>
            <h2 className={styles.statsTitle}>ข้อมูลหอพักของเรา</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <div className={styles.statIconCircle}>
                    <span className={styles.statIconLarge}>🏢</span>
                  </div>
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>ห้องพักทั้งหมด</p>
                  <p className={styles.statValue}>{stats.totalRooms}</p>
                  <p className={styles.statUnit}>ห้อง</p>
                  <p className={styles.statSubtext}>คุณภาพมาตรฐาน</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <div className={`${styles.statIconCircle} ${styles.statIconGreen}`}>
                    <span className={styles.statIconLarge}>✓</span>
                  </div>
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>ห้องว่าง</p>
                  <p className={`${styles.statValue} ${styles.statValueGreen}`}>
                    {stats.availableRooms}
                  </p>
                  <p className={styles.statUnit}>ห้อง</p>
                  <p className={styles.statSubtext}>พร้อมเข้าพักได้ทันที</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <div className={`${styles.statIconCircle} ${styles.statIconIndigo}`}>
                    <span className={styles.statIconLarge}>💰</span>
                  </div>
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>ราคาเริ่มต้น</p>
                  <p className={`${styles.statValue} ${styles.statValueIndigo}`}>
                    {stats.startingPrice.toLocaleString()}
                  </p>
                  <p className={styles.statUnit}>บาท/เดือน</p>
                  <p className={styles.statSubtext}>รวมค่าสาธารณูปโภค</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>คุณสมบัติของระบบ</h2>
              <p className={styles.sectionSubtitle}>
                ระบบจัดการหอพักครบวงจร ใช้งานง่าย สะดวก รวดเร็ว
              </p>
            </div>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper}>
                  <span className={styles.featureIcon}>🏨</span>
                </div>
                <h3 className={styles.featureTitle}>จองห้องออนไลน์</h3>
                <p className={styles.featureText}>
                  เลือกและจองห้องพักได้ง่ายๆ ผ่านระบบออนไลน์ตลอด 24 ชั่วโมง
                  ตรวจสอบสถานะห้องว่างแบบเรียลไทม์
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper}>
                  <span className={styles.featureIcon}>💡</span>
                </div>
                <h3 className={styles.featureTitle}>ค่าน้ำค่าไฟ</h3>
                <p className={styles.featureText}>
                  ตรวจสอบและชำระค่าน้ำค่าไฟรายเดือนได้สะดวก
                  ไม่พลาดกำหนดชำระ พร้อมประวัติการชำระ
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper}>
                  <span className={styles.featureIcon}>📢</span>
                </div>
                <h3 className={styles.featureTitle}>รับข่าวสาร</h3>
                <p className={styles.featureText}>
                  อัพเดตข่าวสารและประกาศต่างๆ จากผู้ดูแลหอพัก
                  ไม่พลาดทุกข้อมูลสำคัญ
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper}>
                  <span className={styles.featureIcon}>📱</span>
                </div>
                <h3 className={styles.featureTitle}>ใช้งานง่าย</h3>
                <p className={styles.featureText}>
                  ออกแบบให้ใช้งานง่าย รองรับทั้งมือถือและคอมพิวเตอร์
                  ใช้งานได้ทุกที่ทุกเวลา
                </p>
              </div>
            </div>
          </div>

          {/* Announcements */}
          {stats.announcements.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>ประกาศล่าสุด</h2>
                <p className={styles.sectionSubtitle}>
                  ข่าวสารและประกาศสำคัญจากหอพัก
                </p>
              </div>
              <div className={styles.announcementsGrid}>
                {stats.announcements.map((announcement) => (
                  <div key={announcement._id} className={styles.announcementCard}>
                    <div className={styles.announcementHeader}>
                      <span className={styles.announcementBadge}>📢 ประกาศ</span>
                      <span className={styles.announcementDate}>
                        {new Date(announcement.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <h3 className={styles.announcementTitle}>
                      {announcement.title}
                    </h3>
                    <p className={styles.announcementContent}>
                      {announcement.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
