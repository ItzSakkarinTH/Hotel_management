'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2 } from 'lucide-react';
import { IUtilityBill, IRoom } from '@/types';
import styles from './AdminUtilities.module.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface RoomInfo {
    _id: string;
    roomNumber: string;
    waterRate: number;
    electricityRate: number;
}

interface UserInfo {
    _id: string;
    firstName: string;
    lastName: string;
}

interface UtilityBillWithDetails extends Omit<IUtilityBill, 'roomId' | 'userId'> {
    roomId: RoomInfo;
    userId: UserInfo;
}

export default function AdminUtilitiesPage() {
    const [bills, setBills] = useState<UtilityBillWithDetails[]>([]);
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
    const [editingBill, setEditingBill] = useState<UtilityBillWithDetails | null>(null);
    const [formData, setFormData] = useState({
        roomId: '',
        month: '',
        waterUsage: '',
        electricityUsage: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');

            const [billsRes, roomsRes] = await Promise.all([
                axios.get('/api/utilities', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get('/api/rooms', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            setBills(billsRes.data.data);
            setRooms(roomsRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const selectedRoom = rooms.find(r => r._id === formData.roomId);

            if (!selectedRoom) {
                alert('กรุณาเลือกห้อง');
                return;
            }

            // Get active booking for this room
            const bookingsRes = await axios.get('/api/bookings', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const activeBooking = bookingsRes.data.data.find(
                (b: { roomId: { _id?: string } | string; status: string; _id: string; userId: { _id?: string } | string }) => {
                    const roomIdStr = typeof b.roomId === 'string' ? b.roomId : b.roomId?._id;
                    return roomIdStr === formData.roomId &&
                        (b.status === 'confirmed' || b.status === 'pending');
                }
            );

            if (!activeBooking) {
                alert('ไม่พบข้อมูลการจองสำหรับห้องนี้');
                return;
            }

            const waterUsage = Number(formData.waterUsage);
            const electricityUsage = Number(formData.electricityUsage);

            const data = {
                bookingId: activeBooking._id,
                roomId: formData.roomId,
                userId: typeof activeBooking.userId === 'string'
                    ? activeBooking.userId
                    : activeBooking.userId._id,
                month: formData.month,
                waterUsage,
                electricityUsage,
                waterCost: waterUsage * selectedRoom.waterRate,
                electricityCost: electricityUsage * selectedRoom.electricityRate,
            };

            if (editingBill) {
                // Update existing bill
                await axios.put(`/api/utilities/${editingBill._id}`, data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('แก้ไขค่าน้ำค่าไฟสำเร็จ');
            } else {
                // Create new bill
                await axios.post('/api/utilities', data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('บันทึกค่าน้ำค่าไฟสำเร็จ');
            }

            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            alert(err.response?.data?.error || 'เกิดข้อผิดพลาด');
        }
    };

    const handleEdit = (bill: UtilityBillWithDetails) => {
        setEditingBill(bill);
        setFormData({
            roomId: typeof bill.roomId === 'string' ? bill.roomId : bill.roomId._id,
            month: bill.month,
            waterUsage: bill.waterUsage.toString(),
            electricityUsage: bill.electricityUsage.toString(),
        });
        setShowModal(true);
    };

    const handleDelete = async (billId: string) => {
        if (!confirm('คุณแน่ใจที่จะลบบิลนี้?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/utilities/${billId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('ลบบิลสำเร็จ');
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            alert(err.response?.data?.error || 'เกิดข้อผิดพลาด');
        }
    };

    const resetForm = () => {
        setEditingBill(null);
        setFormData({
            roomId: '',
            month: '',
            waterUsage: '',
            electricityUsage: '',
        });
    };

    const getMonthName = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });
    };

    const filteredBills = bills.filter(bill => {
        if (filter === 'paid') return bill.paid;
        if (filter === 'unpaid') return !bill.paid;
        return true;
    });

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
                    <div className={styles.header}>
                        <h1 className={styles.title}>จัดการค่าน้ำค่าไฟ</h1>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className={styles.addButton}
                        >
                            + เพิ่มบิลใหม่
                        </button>
                    </div>

                    {/* Filter */}
                    <div className={styles.filterContainer}>
                        <button
                            onClick={() => setFilter('all')}
                            className={`${styles.filterButton} ${filter === 'all' ? styles.filterActive : ''}`}
                        >
                            ทั้งหมด ({bills.length})
                        </button>
                        <button
                            onClick={() => setFilter('unpaid')}
                            className={`${styles.filterButton} ${filter === 'unpaid' ? styles.filterActiveUnpaid : ''}`}
                        >
                            ยังไม่ชำระ ({bills.filter(b => !b.paid).length})
                        </button>
                        <button
                            onClick={() => setFilter('paid')}
                            className={`${styles.filterButton} ${filter === 'paid' ? styles.filterActivePaid : ''}`}
                        >
                            ชำระแล้ว ({bills.filter(b => b.paid).length})
                        </button>
                    </div>

                    {/* Bills Table */}
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>เดือน</th>
                                    <th>ห้อง</th>
                                    <th>ผู้เช่า</th>
                                    <th>น้ำ (หน่วย)</th>
                                    <th>ไฟ (หน่วย)</th>
                                    <th>ค่าน้ำ</th>
                                    <th>ค่าไฟ</th>
                                    <th>รวม</th>
                                    <th>สถานะ</th>
                                    <th>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBills.map((bill) => (
                                    <tr key={bill._id}>
                                        <td>{getMonthName(bill.month)}</td>
                                        <td className={styles.roomNumber}>{bill.roomId?.roomNumber}</td>
                                        <td>
                                            {bill.userId?.firstName} {bill.userId?.lastName}
                                        </td>
                                        <td>{bill.waterUsage}</td>
                                        <td>{bill.electricityUsage}</td>
                                        <td>{bill.waterCost.toLocaleString()} ฿</td>
                                        <td>{bill.electricityCost.toLocaleString()} ฿</td>
                                        <td className={styles.totalCost}>
                                            {bill.totalCost.toLocaleString()} ฿
                                        </td>
                                        <td>
                                            {bill.paid ? (
                                                <span className={styles.badgePaid}>ชำระแล้ว</span>
                                            ) : (
                                                <span className={styles.badgeUnpaid}>ยังไม่ชำระ</span>
                                            )}
                                        </td>
                                        <td className={styles.actionCell}>
                                            <button
                                                onClick={() => handleEdit(bill)}
                                                className={styles.iconButton}
                                                title="แก้ไข"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bill._id)}
                                                className={styles.deleteIconButton}
                                                title="ลบ"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredBills.length === 0 && (
                            <div className={styles.emptyState}>
                                <p>ไม่มีข้อมูลบิล</p>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    {bills.length > 0 && (
                        <div className={styles.summaryCard}>
                            <h2 className={styles.summaryTitle}>สรุปยอดรวม</h2>
                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryItem}>
                                    <p className={styles.summaryLabel}>ยอดรวมทั้งหมด</p>
                                    <p className={styles.summaryValue}>
                                        {bills.reduce((sum, bill) => sum + bill.totalCost, 0).toLocaleString()} ฿
                                    </p>
                                </div>
                                <div className={styles.summaryItem}>
                                    <p className={styles.summaryLabel}>ยอดค้างชำระ</p>
                                    <p className={styles.summaryValueUnpaid}>
                                        {bills
                                            .filter(b => !b.paid)
                                            .reduce((sum, bill) => sum + bill.totalCost, 0)
                                            .toLocaleString()} ฿
                                    </p>
                                </div>
                                <div className={styles.summaryItem}>
                                    <p className={styles.summaryLabel}>ชำระแล้ว</p>
                                    <p className={styles.summaryValuePaid}>
                                        {bills
                                            .filter(b => b.paid)
                                            .reduce((sum, bill) => sum + bill.totalCost, 0)
                                            .toLocaleString()} ฿
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal */}
                    {showModal && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modal}>
                                <h2 className={styles.modalTitle}>
                                    {editingBill ? 'แก้ไขบิลค่าน้ำค่าไฟ' : 'เพิ่มบิลค่าน้ำค่าไฟ'}
                                </h2>

                                <form onSubmit={handleSubmit} className={styles.form}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>เลือกห้อง *</label>
                                        <select
                                            required
                                            value={formData.roomId}
                                            onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                                            className={styles.select}
                                            disabled={!!editingBill}
                                        >
                                            <option value="">-- เลือกห้อง --</option>
                                            {rooms
                                                .filter(r => r.status === 'occupied')
                                                .map((room) => (
                                                    <option key={room._id} value={room._id}>
                                                        ห้อง {room.roomNumber} (น้ำ: {room.waterRate} ฿/หน่วย, ไฟ: {room.electricityRate} ฿/หน่วย)
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>เดือน *</label>
                                        <input
                                            type="month"
                                            required
                                            value={formData.month}
                                            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>จำนวนหน่วยน้ำ *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.waterUsage}
                                            onChange={(e) => setFormData({ ...formData, waterUsage: e.target.value })}
                                            className={styles.input}
                                            placeholder="เช่น 10"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>จำนวนหน่วยไฟ *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.electricityUsage}
                                            onChange={(e) => setFormData({ ...formData, electricityUsage: e.target.value })}
                                            className={styles.input}
                                            placeholder="เช่น 150"
                                        />
                                    </div>

                                    {formData.roomId && formData.waterUsage && formData.electricityUsage && (
                                        <div className={styles.previewBox}>
                                            <p className={styles.previewTitle}>ตัวอย่างการคำนวณ:</p>
                                            {(() => {
                                                const room = rooms.find(r => r._id === formData.roomId);
                                                if (!room) return null;
                                                const waterCost = Number(formData.waterUsage) * room.waterRate;
                                                const electricityCost = Number(formData.electricityUsage) * room.electricityRate;
                                                const total = waterCost + electricityCost;
                                                return (
                                                    <>
                                                        <p>ค่าน้ำ: {waterCost.toLocaleString()} ฿</p>
                                                        <p>ค่าไฟ: {electricityCost.toLocaleString()} ฿</p>
                                                        <p className={styles.previewTotal}>รวม: {total.toLocaleString()} ฿</p>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}

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
                                        <button type="submit" className={styles.submitButton}>
                                            {editingBill ? 'บันทึกการแก้ไข' : 'บันทึก'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
