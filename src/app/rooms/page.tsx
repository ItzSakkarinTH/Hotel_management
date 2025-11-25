'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { IRoom, RoomStatus } from '@/types';
import Image from 'next/image';
import styles from './rooms.module.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RoomStatus | 'all'>('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    fetchRooms();
  }, [filter]);

  const fetchRooms = async () => {
    try {
      const url = filter === 'all'
        ? '/api/rooms'
        : `/api/rooms?status=${filter}`;

      const response = await axios.get(url);
      setRooms(response.data.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: RoomStatus) => {
    const statusClasses = {
      [RoomStatus.AVAILABLE]: styles.statusAvailable,
      [RoomStatus.OCCUPIED]: styles.statusOccupied,
      [RoomStatus.RESERVED]: styles.statusReserved,
      [RoomStatus.MAINTENANCE]: styles.statusMaintenance,
    };

    const labels = {
      [RoomStatus.AVAILABLE]: 'ว่าง',
      [RoomStatus.OCCUPIED]: 'เต็ม',
      [RoomStatus.RESERVED]: 'จองแล้ว',
      [RoomStatus.MAINTENANCE]: 'ปิดปรับปรุง',
    };

    return (
      <span className={`${styles.statusBadge} ${statusClasses[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleBookRoom = (roomId: string, status: RoomStatus) => {
    if (status === RoomStatus.AVAILABLE) {
      router.push(`/booking/${roomId}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div style={{ marginBottom: '1rem' }}>
            <BackButton />
          </div>
          <div className={styles.header}>
            <h1 className={styles.title}>รายการห้องพัก</h1>

            {/* Filter */}
            <div className={styles.filterContainer}>
              <button
                onClick={() => setFilter('all')}
                className={`${styles.filterButton} ${filter === 'all'
                    ? styles.filterButtonAllActive
                    : styles.filterButtonAll
                  }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setFilter(RoomStatus.AVAILABLE)}
                className={`${styles.filterButton} ${filter === RoomStatus.AVAILABLE
                    ? styles.filterButtonAvailableActive
                    : styles.filterButtonAvailable
                  }`}
              >
                ห้องว่าง
              </button>
              <button
                onClick={() => setFilter(RoomStatus.OCCUPIED)}
                className={`${styles.filterButton} ${filter === RoomStatus.OCCUPIED
                    ? styles.filterButtonOccupiedActive
                    : styles.filterButtonOccupied
                  }`}
              >
                ห้องเต็ม
              </button>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className={styles.roomsGrid}>
            {rooms.map((room) => (
              <div key={room._id} className={styles.roomCard}>
                {/* Room Image */}
                <div className={styles.roomImageContainer}>
                  {room.images && room.images.length > 0 ? (
                    <Image
                      src={room.images[0]}
                      alt={`ห้อง ${room.roomNumber}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className={styles.roomImagePlaceholder}>
                      ไม่มีรูปภาพแสดง
                    </div>
                  )}
                  <div className={styles.statusBadgeContainer}>
                    {getStatusBadge(room.status)}
                  </div>
                </div>

                {/* Room Details */}
                <div className={styles.roomDetails}>
                  <h3 className={styles.roomTitle}>
                    ห้อง {room.roomNumber}
                  </h3>

                  <div className={styles.detailsContainer}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>ราคา:</span>
                      <span className={`${styles.detailValue} ${styles.priceValue}`}>
                        {room.price.toLocaleString()} บาท/เดือน
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>เงินประกัน:</span>
                      <span className={styles.detailValue}>
                        {room.deposit.toLocaleString()} บาท
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>ค่าน้ำ:</span>
                      <span>{room.waterRate} บาท/หน่วย</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>ค่าไฟ:</span>
                      <span>{room.electricityRate} บาท/หน่วย</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>ขนาด:</span>
                      <span>{room.size} ตร.ม.</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>ชั้น:</span>
                      <span>ชั้น {room.floor}</span>
                    </div>
                  </div>

                  {room.facilities && room.facilities.length > 0 && (
                    <div className={styles.facilitiesSection}>
                      <p className={styles.facilitiesLabel}>สิ่งอำนวยความสะดวก:</p>
                      <div className={styles.facilitiesContainer}>
                        {room.facilities.map((facility, index) => (
                          <span
                            key={index}
                            className={styles.facilityTag}
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleBookRoom(room._id, room.status)}
                    disabled={room.status !== RoomStatus.AVAILABLE}
                    className={`${styles.bookButton} ${room.status === RoomStatus.AVAILABLE
                        ? styles.bookButtonAvailable
                        : styles.bookButtonDisabled
                      }`}
                  >
                    {room.status === RoomStatus.AVAILABLE ? 'จองห้อง' : 'ไม่ว่าง'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {rooms.length === 0 && (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>ไม่พบห้องพัก</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
