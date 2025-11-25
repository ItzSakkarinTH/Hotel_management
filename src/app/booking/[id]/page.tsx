'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { IRoom, OCRData, AxiosErrorResponse } from '@/types';
import styles from './Booking.module.css';

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<IRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState('');
  const [slipImage, setSlipImage] = useState<string>('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [ocrData, setOcrData] = useState<OCRData | null>(null);
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState<string>('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const response = await axios.get(`/api/rooms/${roomId}`);
      setRoom(response.data.data);
    } catch (error) {
      setError('ไม่พบข้อมูลห้องพัก');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!checkInDate) {
      setError('กรุณาเลือกวันเข้าพัก');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/bookings',
        {
          roomId,
          checkInDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setBookingId(response.data.data._id);
        setStep(3);
      }
    } catch (error: unknown) {
      const err = error as AxiosErrorResponse;
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการจอง');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSlipFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setSlipImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: เรียก OCR API ของคุณที่นี่
    // const ocrResult = await callOCRApi(file);
    // setOcrData(ocrResult);
  };

  const handlePaymentSubmit = async () => {
    if (!slipImage) {
      setError('กรุณาอัพโหลดสลิปการโอนเงิน');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/payments',
        {
          bookingId,
          slipImage,
          ocrData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert('ส่งสลิปการโอนเงินสำเร็จ! รอการตรวจสอบจากผู้ดูแลระบบ');
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as AxiosErrorResponse;
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการส่งสลิป');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>กำลังโหลด...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.errorText}>ไม่พบข้อมูลห้องพัก</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.maxWidth}>
        {/* Progress Steps */}
        <div className={styles.progressContainer}>
          <div className={styles.progressSteps}>
            <div className={`${styles.stepItem} ${step >= 1 ? styles.stepItemActive : styles.stepItemInactive}`}>
              <div className={`${styles.stepCircle} ${step >= 1 ? styles.stepCircleActive : styles.stepCircleInactive}`}>
                1
              </div>
              <span className={styles.stepLabel}>ข้อมูลห้อง</span>
            </div>
            <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineActive : styles.stepLineInactive}`}></div>
            <div className={`${styles.stepItem} ${step >= 2 ? styles.stepItemActive : styles.stepItemInactive}`}>
              <div className={`${styles.stepCircle} ${step >= 2 ? styles.stepCircleActive : styles.stepCircleInactive}`}>
                2
              </div>
              <span className={styles.stepLabel}>ยืนยันการจอง</span>
            </div>
            <div className={`${styles.stepLine} ${step >= 3 ? styles.stepLineActive : styles.stepLineInactive}`}></div>
            <div className={`${styles.stepItem} ${step >= 3 ? styles.stepItemActive : styles.stepItemInactive}`}>
              <div className={`${styles.stepCircle} ${step >= 3 ? styles.stepCircleActive : styles.stepCircleInactive}`}>
                3
              </div>
              <span className={styles.stepLabel}>ชำระเงิน</span>
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            {error}
          </div>
        )}

        <div className={styles.card}>
          {/* Step 1 & 2: Room Info */}
          {step <= 2 && (
            <>
              <h1 className={styles.title}>
                จองห้อง {room.roomNumber}
              </h1>

              {/* Room Image */}
              {room.images && room.images.length > 0 && (
                <div className={styles.roomImageContainer}>
                  <Image
                    src={room.images[0]}
                    alt={`ห้อง ${room.roomNumber}`}
                    fill
                    className={styles.roomImage}
                  />
                </div>
              )}

              {/* Room Details */}
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <p className={styles.detailLabel}>ราคา/เดือน</p>
                  <p className={styles.detailPrice}>
                    {room.price.toLocaleString()} บาท
                  </p>
                </div>
                <div className={styles.detailItem}>
                  <p className={styles.detailLabel}>เงินประกัน</p>
                  <p className={styles.detailValue}>
                    {room.deposit.toLocaleString()} บาท
                  </p>
                </div>
                <div className={styles.detailItem}>
                  <p className={styles.detailLabel}>ค่าน้ำ</p>
                  <p className={styles.detailValueRegular}>{room.waterRate} บาท/หน่วย</p>
                </div>
                <div className={styles.detailItem}>
                  <p className={styles.detailLabel}>ค่าไฟ</p>
                  <p className={styles.detailValueRegular}>{room.electricityRate} บาท/หน่วย</p>
                </div>
              </div>

              {/* Check-in Date */}
              <div className={styles.dateContainer}>
                <label className={styles.label}>
                  วันที่เข้าพัก
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={styles.dateInput}
                />
              </div>

              {/* Summary */}
              <div className={styles.summary}>
                <h3 className={styles.summaryTitle}>สรุปการชำระเงิน</h3>
                <div className={styles.summaryItems}>
                  <div className={styles.summaryRow}>
                    <span>ค่าห้องเดือนแรก</span>
                    <span>{room.price.toLocaleString()} บาท</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>เงินประกัน</span>
                    <span>{room.deposit.toLocaleString()} บาท</span>
                  </div>
                  <div className={styles.summaryTotal}>
                    <span>รวมทั้งสิ้น</span>
                    <span className={styles.summaryTotalAmount}>
                      {(room.price + room.deposit).toLocaleString()} บาท
                    </span>
                  </div>
                </div>
              </div>

              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  ต่อไป
                </button>
              )}

              {step === 2 && (
                <div className={styles.buttonGroup}>
                  <button
                    onClick={() => setStep(1)}
                    className={`${styles.buttonFlex} ${styles.buttonSecondary}`}
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    onClick={handleBooking}
                    disabled={submitting}
                    className={`${styles.buttonFlex} ${styles.buttonPrimary}`}
                  >
                    {submitting ? 'กำลังจอง...' : 'ยืนยันการจอง'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Step 3: Upload Slip */}
          {step === 3 && (
            <>
              <h1 className={styles.title}>
                อัพโหลดสลิปการโอนเงิน
              </h1>

              <div className={styles.infoBanner}>
                <p>กรุณาโอนเงินมายังบัญชี:</p>
                <p>ธนาคาร: ธนาคารกสิกรไทย</p>
                <p>เลขที่บัญชี: 123-4-56789-0</p>
                <p>ชื่อบัญชี: หอพักนักศึกษา ABC</p>
                <p className={styles.infoAmount}>
                  จำนวนเงิน: {(room.price + room.deposit).toLocaleString()} บาท
                </p>
              </div>

              <div className={styles.uploadContainer}>
                <label className={styles.label}>
                  อัพโหลดสลิปการโอนเงิน
                </label>
                <div className={styles.uploadBox}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.uploadInput}
                    id="slip-upload"
                  />
                  <label
                    htmlFor="slip-upload"
                    className={styles.uploadLabel}
                  >
                    {slipImage ? (
                      <div className={styles.uploadImageContainer}>
                        <Image
                          src={slipImage}
                          alt="สลิปการโอนเงิน"
                          fill
                          className={styles.uploadImage}
                        />
                      </div>
                    ) : (
                      <>
                        <svg
                          className={styles.uploadIcon}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span className={styles.uploadText}>คลิกเพื่ออัพโหลดไฟล์</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {ocrData && (
                <div className={styles.ocrBanner}>
                  <h3 className={styles.ocrTitle}>
                    ข้อมูลจากสลิป (OCR)
                  </h3>
                  <pre className={styles.ocrData}>
                    {JSON.stringify(ocrData, null, 2)}
                  </pre>
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button
                  onClick={() => setStep(2)}
                  disabled={submitting}
                  className={`${styles.buttonFlex} ${styles.buttonSecondary}`}
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={!slipImage || submitting}
                  className={`${styles.buttonFlex} ${styles.buttonPrimary}`}
                >
                  {submitting ? 'กำลังส่ง...' : 'ส่งสลิป'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
