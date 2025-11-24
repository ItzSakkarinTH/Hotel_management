'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { IRoom, RoomStatus } from '@/types';
import Image from 'next/image';
import styles from './RoomsManagement.module.css';

export default function RoomsManagementPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<IRoom | null>(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    price: '',
    deposit: '',
    waterRate: '18',
    electricityRate: '8',
    floor: '',
    size: '',
    maxOccupants: '1',
    status: RoomStatus.AVAILABLE,
    description: '',
    facilities: '',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const data = {
        ...formData,
        price: Number(formData.price),
        deposit: Number(formData.deposit),
        waterRate: Number(formData.waterRate),
        electricityRate: Number(formData.electricityRate),
        floor: Number(formData.floor),
        size: Number(formData.size),
        maxOccupants: Number(formData.maxOccupants),
        facilities: formData.facilities.split(',').map(f => f.trim()).filter(Boolean),
      };

      if (editingRoom) {
        await axios.put(`/api/rooms/${editingRoom._id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('แก้ไขห้องพักสำเร็จ');
      } else {
        await axios.post('/api/rooms', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('เพิ่มห้องพักสำเร็จ');
      }

      setShowModal(false);
      resetForm();
      fetchRooms();
    } catch (error: any) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  const handleEdit = (room: IRoom) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      price: room.price.toString(),
      deposit: room.deposit.toString(),
      waterRate: room.waterRate.toString(),
      electricityRate: room.electricityRate.toString(),
      floor: room.floor.toString(),
      size: room.size.toString(),
      maxOccupants: room.maxOccupants.toString(),
      status: room.status,
      description: room.description || '',
      facilities: room.facilities.join(', '),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจที่จะลบห้องนี้?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('ลบห้องพักสำเร็จ');
      fetchRooms();
    } catch (error: any) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  const resetForm = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      price: '',
      deposit: '',
      waterRate: '18',
      electricityRate: '8',
      floor: '',
      size: '',
      maxOccupants: '1',
      status: RoomStatus.AVAILABLE,
      description: '',
      facilities: '',
    });
  };

  const getStatusClass = (status: RoomStatus) => {
    const statusMap = {
      [RoomStatus.AVAILABLE]: styles.statusAvailable,
      [RoomStatus.OCCUPIED]: styles.statusOccupied,
      [RoomStatus.RESERVED]: styles.statusReserved,
      [RoomStatus.MAINTENANCE]: styles.statusMaintenance,
    };
    return statusMap[status];
  };

  const getStatusText = (status: RoomStatus) => {
    const textMap = {
      [RoomStatus.AVAILABLE]: 'ว่าง',
      [RoomStatus.OCCUPIED]: 'เต็ม',
      [RoomStatus.RESERVED]: 'จองแล้ว',
      [RoomStatus.MAINTENANCE]: 'ปิดปรับปรุง',
    };
    return textMap[status];
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>จัดการห้องพัก</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className={styles.addButton}
          >
            + เพิ่มห้องพัก
          </button>
        </div>

        {/* Rooms Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ห้อง</th>
                <th>ราคา</th>
                <th>ชั้น</th>
                <th>ขนาด</th>
                <th>สถานะ</th>
                <th className={styles.actionHeader}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id}>
                  <td>
                    <div className={styles.roomNumber}>{room.roomNumber}</div>
                  </td>
                  <td>
                    <div className={styles.price}>{room.price.toLocaleString()} ฿</div>
                  </td>
                  <td>
                    <div className={styles.floor}>ชั้น {room.floor}</div>
                  </td>
                  <td>
                    <div className={styles.size}>{room.size} ตร.ม.</div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(room.status)}`}>
                      {getStatusText(room.status)}
                    </span>
                  </td>
                  <td className={styles.actionCell}>
                    <button
                      onClick={() => handleEdit(room)}
                      className={styles.editButton}
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(room._id)}
                      className={styles.deleteButton}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rooms.length === 0 && (
            <div className={styles.emptyState}>
              <p>ยังไม่มีห้องพักในระบบ</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className={styles.addButtonEmpty}
              >
                เพิ่มห้องพักแรก
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>
                {editingRoom ? 'แก้ไขห้องพัก' : 'เพิ่มห้องพัก'}
              </h2>
              
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>เลขห้อง *</label>
                    <input
                      type="text"
                      required
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>สถานะ</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                      className={styles.select}
                    >
                      <option value={RoomStatus.AVAILABLE}>ว่าง</option>
                      <option value={RoomStatus.OCCUPIED}>เต็ม</option>
                      <option value={RoomStatus.RESERVED}>จองแล้ว</option>
                      <option value={RoomStatus.MAINTENANCE}>ปิดปรับปรุง</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>ราคา/เดือน (บาท) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>เงินประกัน (บาท) *</label>
                    <input
                      type="number"
                      required
                      value={formData.deposit}
                      onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>ค่าน้ำ (บาท/หน่วย)</label>
                    <input
                      type="number"
                      value={formData.waterRate}
                      onChange={(e) => setFormData({ ...formData, waterRate: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>ค่าไฟ (บาท/หน่วย)</label>
                    <input
                      type="number"
                      value={formData.electricityRate}
                      onChange={(e) => setFormData({ ...formData, electricityRate: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>ชั้น *</label>
                    <input
                      type="number"
                      required
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>ขนาด (ตร.ม.) *</label>
                    <input
                      type="number"
                      required
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.label}>
                    สิ่งอำนวยความสะดวก (คั่นด้วยเครื่องหมายจุลภาค)
                  </label>
                  <input
                    type="text"
                    placeholder="เตียง, ตู้เสื้อผ้า, แอร์"
                    value={formData.facilities}
                    onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.label}>รายละเอียดเพิ่มเติม</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={styles.textarea}
                  />
                </div>

                <div className={styles.modalActions}>
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
