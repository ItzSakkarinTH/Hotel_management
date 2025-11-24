'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Dashboard.module.css';

interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  startingPrice: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 50,
    availableRooms: 12,
    occupiedRooms: 38,
    startingPrice: 2500
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const dormImages = [
    '/images/dorm1.jpg',
    '/images/dorm2.jpg',
    '/images/dorm3.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % dormImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: '🏠', title: 'ห้องพักสะดวกสบาย', desc: 'ห้องพักครบครันพร้อมอยู่' },
    { icon: '🅿️', title: 'ที่จอดรถ', desc: 'ที่จอดรถกว้างขวางปลอดภัย' },
    { icon: '📶', title: 'Wi-Fi ความเร็วสูง', desc: 'อินเทอร์เน็ตเร็วแรงทุกห้อง' },
    { icon: '🔒', title: 'ระบบรักษาความปลอดภัย', desc: 'กล้องวงจรปิด 24 ชั่วโมง' },
    { icon: '🧺', title: 'ห้องซักรีด', desc: 'เครื่องซักผ้าอบผ้าพร้อมใช้' },
    { icon: '🏪', title: 'ร้านสะดวกซื้อใกล้เคียง', desc: 'ร้านค้าอยู่ใกล้หอพัก' }
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <h1>🏢 Student Dorm</h1>
          </div>
          <nav className={styles.nav}>
            <Link href="/rooms" className={styles.navLink}>ห้องพัก</Link>
            <Link href="/about" className={styles.navLink}>เกี่ยวกับเรา</Link>
            <Link href="/contact" className={styles.navLink}>ติดต่อ</Link>
            <Link href="/login" className={styles.loginBtn}>เข้าสู่ระบบ</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>หอพักนักศึกษา</h2>
          <p className={styles.heroSubtitle}>
            ที่พักสะดวกสบาย ปลอดภัย ใกล้มหาวิทยาลัย
          </p>
          <div className={styles.heroButtons}>
            <Link href="/rooms" className={styles.primaryBtn}>
              ดูห้องพักทั้งหมด
            </Link>
            <Link href="/register" className={styles.secondaryBtn}>
              สมัครสมาชิก
            </Link>
          </div>
        </div>
        <div className={styles.heroImageSlider}>
          <div 
            className={styles.imageSlide} 
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {dormImages.map((img, idx) => (
              <div key={idx} className={styles.slideImage}>
                <div className={styles.imagePlaceholder}>
                  รูปภาพหอพัก {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏠</div>
            <div className={styles.statNumber}>{stats.totalRooms}</div>
            <div className={styles.statLabel}>ห้องพักทั้งหมด</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statNumber}>{stats.availableRooms}</div>
            <div className={styles.statLabel}>ห้องว่าง</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🔴</div>
            <div className={styles.statNumber}>{stats.occupiedRooms}</div>
            <div className={styles.statLabel}>ห้องเต็ม</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statNumber}>
              {stats.startingPrice.toLocaleString()}฿
            </div>
            <div className={styles.statLabel}>เริ่มต้น/เดือน</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h3>สิ่งอำนวยความสะดวก</h3>
          <p>ครบครันทุกสิ่งที่คุณต้องการ</p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h4 className={styles.featureTitle}>{feature.title}</h4>
              <p className={styles.featureDesc}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h3>พร้อมเข้าพักกับเราหรือยัง?</h3>
          <p>จองห้องพักได้แล้ววันนี้ ด้วยขั้นตอนง่ายๆ</p>
          <Link href="/rooms" className={styles.ctaBtn}>
            เลือกห้องพักเลย
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>Student Dorm</h4>
            <p>หอพักนักศึกษาคุณภาพ ใจกลางเมือง</p>
          </div>
          <div className={styles.footerSection}>
            <h4>ติดต่อเรา</h4>
            <p>📞 02-XXX-XXXX</p>
            <p>📧 info@studentdorm.com</p>
            <p>📍 123 ถนนXXX กรุงเทพฯ</p>
          </div>
          <div className={styles.footerSection}>
            <h4>เวลาทำการ</h4>
            <p>จันทร์ - ศุกร์: 08:00 - 20:00</p>
            <p>เสาร์ - อาทิตย์: 09:00 - 18:00</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2024 Student Dorm. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;