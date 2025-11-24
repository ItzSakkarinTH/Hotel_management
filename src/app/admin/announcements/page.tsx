'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { IAnnouncement } from '@/types';
import styles from './AdminAnnouncements.module.css';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<IAnnouncement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    isActive: true,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/announcements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(response.data.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');

      if (editingAnnouncement) {
        await axios.put(
          `/api/announcements/${editingAnnouncement._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('แก้ไขประกาศสำเร็จ');
      } else {
        await axios.post('/api/announcements', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('สร้างประกาศสำเร็จ');
      }

      setShowModal(false);
      resetForm();
      fetchAnnouncements();
    } catch (error: any) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  const handleEdit = (announcement: IAnnouncement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      isActive: announcement.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจที่จะลบประกาศนี้?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('ลบประกาศสำเร็จ');
      fetchAnnouncements();
    } catch (error: any) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/announcements/${id}`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAnnouncements();
    } catch (error: any) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  const resetForm = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      priority: 'medium',
      isActive: true,
    });
  };

  const getPriorityBadge = (priority: string) => {
    const badgeClasses = {
      low: styles.badgeLow,
      medium: styles.badgeMedium,
      high: styles.badgeHigh,
    };
    const labels = {
      low: 'ปกติ',
      medium: 'ปานกลาง',
      high: 'สำคัญ',
    };
    return (
      <span className={`${styles.badge} ${badgeClasses[priority as keyof typeof badgeClasses]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return <div className={styles.loading}>กำลังโหลด...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>จัดการประกาศข่าวสาร</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className={styles.createButton}
          >
            + สร้างประกาศใหม่
          </button>
        </div>

        {/* Announcements List */}
        <div className={styles.announcementsList}>
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className={`${styles.announcementCard} ${
                !announcement.isActive ? styles.inactive : ''
              }`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitleRow}>
                    <h3 className={styles.cardTitle}>
                      {announcement.title}
                    </h3>
                    {getPriorityBadge(announcement.priority)}
                    {!announcement.isActive && (
                      <span className={`${styles.badge} ${styles.badgeInactive}`}>
                        ปิดการแสดงผล
                      </span>
                    )}
                  </div>
                  <p className={styles.cardText}>{announcement.content}</p>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.cardDate}>
                  สร้างเมื่อ: {new Date(announcement.createdAt).toLocaleDateString('th-TH')}
                </div>
                <div className={styles.cardActions}>
                  <button
                    onClick={() => toggleActive(announcement._id, announcement.isActive)}
                    className={`${styles.actionButton} ${
                      announcement.isActive
                        ? styles.toggleButton
                        : styles.toggleButtonActive
                    }`}
                  >
                    {announcement.isActive ? 'ซ่อน' : 'แสดง'}
                  </button>
                  <button
                    onClick={() => handleEdit(announcement)}
                    className={`${styles.actionButton} ${styles.editButton}`}
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(announcement._id)}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>ยังไม่มีประกาศ</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>
                {editingAnnouncement ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่'}
              </h2>
              
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    หัวข้อ *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={styles.input}
                    placeholder="เช่น แจ้งปิดน้ำประปา วันที่ 25 ธ.ค. 2567"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    เนื้อหา *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className={styles.textarea}
                    placeholder="รายละเอียดของประกาศ..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    ระดับความสำคัญ
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className={styles.select}
                  >
                    <option value="low">ปกติ</option>
                    <option value="medium">ปานกลาง</option>
                    <option value="high">สำคัญ</option>
                  </select>
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className={styles.checkbox}
                  />
                  <label htmlFor="isActive" className={styles.checkboxLabel}>
                    แสดงประกาศ
                  </label>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className={styles.cancelButton}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                  >
                    บันทึก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
