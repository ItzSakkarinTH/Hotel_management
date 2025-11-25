'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { AxiosErrorResponse } from '@/types';
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    studentId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await axios.post('/api/auth/register', registerData);

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        alert('ลงทะเบียนสำเร็จ!');
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as AxiosErrorResponse;
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            ลงทะเบียนสมาชิก
          </h2>
          <p className={styles.subtitle}>
            สมัครสมาชิกหอพักนักศึกษา
          </p>
        </div>

        <div className={styles.formContainer}>
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.errorBox}>
                {error}
              </div>
            )}

            <div className={styles.inputGroup}>
              <div className={styles.gridRow}>
                <div className={styles.fieldWrapper}>
                  <label htmlFor="firstName" className={styles.label}>
                    ชื่อ *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className={styles.input}
                    placeholder="ชื่อจริง"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>

                <div className={styles.fieldWrapper}>
                  <label htmlFor="lastName" className={styles.label}>
                    นามสกุล *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className={styles.input}
                    placeholder="นามสกุล"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.fieldWrapper}>
                <label htmlFor="email" className={styles.label}>
                  อีเมล *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={styles.input}
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className={styles.fieldWrapper}>
                <label htmlFor="phoneNumber" className={styles.label}>
                  เบอร์โทรศัพท์ *
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  className={styles.input}
                  placeholder="0812345678"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              <div className={styles.fieldWrapper}>
                <label htmlFor="studentId" className={styles.label}>
                  รหัสนักศึกษา (ถ้ามี)
                </label>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  className={styles.input}
                  placeholder="6312345678"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                />
              </div>

              <div className={styles.fieldWrapper}>
                <label htmlFor="password" className={styles.label}>
                  รหัสผ่าน *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={styles.input}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <p className={styles.helperText}>รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</p>
              </div>

              <div className={styles.fieldWrapper}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  ยืนยันรหัสผ่าน *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className={styles.input}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
              </button>
            </div>

            <div className={styles.linkContainer}>
              <Link href="/login" className={styles.link}>
                มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
