'use client';

import styles from "../app/Dashboard.module.css";
import Link from "next/link";

export default function Footer() {
  return (
    <>
{/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h3 className={styles.footerTitle}>Hotel Management System</h3>
              <p className={styles.footerText}>
                ระบบจัดการหอพักที่ทันสมัย ใช้งานง่าย สะดวก รวดเร็ว
              </p>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerSubtitle}>เมนูหลัก</h4>
              <div className={styles.footerLinks}>
                <Link href="/" className={styles.footerLink}>หน้าแรก</Link>
                <Link href="/login" className={styles.footerLink}>เข้าสู่ระบบ</Link>
                <Link href="/register" className={styles.footerLink}>สมัครสมาชิก</Link>
              </div>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerSubtitle}>ติดต่อเรา</h4>
              <div className={styles.footerContact}>
                <p>📧 ItzSakkarinthyt@gmail.com</p>
                <p>📞 02-XXX-XXXX</p>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2025 Hotel Management System. All rights reserved.</p>
          </div>
        </footer>
    </>
  );
}