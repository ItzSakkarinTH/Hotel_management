'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';

interface NavbarProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
}

export default function Navbar({ isLoggedIn = false, isAdmin = false }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🏨</span>
          <span className={styles.logoText}>Hotel Management</span>
        </Link>

        {/* Desktop Menu */}
        <div className={styles.desktopMenu}>
          {!isLoggedIn ? (
            <>
              <Link href="/" className={styles.navLink}>
                หน้าแรก
              </Link>
              <Link href="/login" className={styles.navLink}>
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className={styles.btnRegister}>
                สมัครสมาชิก
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className={styles.navLink}>
                แดชบอร์ด
              </Link>
              {isAdmin && (
                <>
                  <Link href="/admin/rooms-management" className={styles.navLink}>
                    จัดการห้อง
                  </Link>
                  <Link href="/admin/bookings" className={styles.navLink}>
                    จัดการการจอง
                  </Link>
                  <Link href="/admin/announcements" className={styles.navLink}>
                    จัดการการประกาศ
                  </Link>
                </>
              )}
              {!isAdmin && (
                <>
                  <Link href="/rooms" className={styles.navLink}>
                    ห้องพัก
                  </Link>
                  <Link href="/my-bookings" className={styles.navLink}>
                    การจองของฉัน
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className={styles.btnLogout}>
                ออกจากระบบ
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <span className={styles.menuIcon}>✕</span>
          ) : (
            <span className={styles.menuIcon}>☰</span>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {!isLoggedIn ? (
            <>
              <Link href="/" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                หน้าแรก
              </Link>
              <Link href="/login" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                สมัครสมาชิก
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                แดชบอร์ด
              </Link>
              {isAdmin && (
                <>
                  <Link href="/admin/rooms-management" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                    จัดการห้อง
                  </Link>
                  <Link href="/admin/bookings" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                    จัดการการจอง
                  </Link>
                  <Link href="/admin/announcements" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                    จัดการการประกาศ
                  </Link>
                </>
              )}
              {!isAdmin && (
                <>
                  <Link href="/rooms" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                    ห้องพัก
                  </Link>
                  <Link href="/my-bookings" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                    การจองของฉัน
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className={styles.mobileNavLink}>
                ออกจากระบบ
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}