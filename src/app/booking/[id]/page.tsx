'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { IRoom } from '@/types';

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<IRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState('');
  const [slipImage, setSlipImage] = useState<string>('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [ocrData, setOcrData] = useState<any>(null);
  const [step, setStep] = useState(1); // 1: ข้อมูลห้อง, 2: ยืนยันการจอง, 3: อัพโหลดสลิป
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
        setStep(3); // ไปหน้าอัพโหลดสลิป
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการจอง');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSlipFile(file);

    // Convert to base64
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการส่งสลิป');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">กำลังโหลด...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">ไม่พบข้อมูลห้องพัก</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="ml-2 font-medium">ข้อมูลห้อง</span>
            </div>
            <div className={`w-20 h-1 mx-4 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-medium">ยืนยันการจอง</span>
            </div>
            <div className={`w-20 h-1 mx-4 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>
                3
              </div>
              <span className="ml-2 font-medium">ชำระเงิน</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Step 1 & 2: Room Info */}
          {step <= 2 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                จองห้อง {room.roomNumber}
              </h1>

              {/* Room Image */}
              {room.images && room.images.length > 0 && (
                <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={room.images[0]}
                    alt={`ห้อง ${room.roomNumber}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Room Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">ราคา/เดือน</p>
                  <p className="text-xl font-bold text-indigo-600">
                    {room.price.toLocaleString()} บาท
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">เงินประกัน</p>
                  <p className="text-xl font-bold">
                    {room.deposit.toLocaleString()} บาท
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ค่าน้ำ</p>
                  <p className="text-lg">{room.waterRate} บาท/หน่วย</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ค่าไฟ</p>
                  <p className="text-lg">{room.electricityRate} บาท/หน่วย</p>
                </div>
              </div>

              {/* Check-in Date */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่เข้าพัก
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-gray-900 mb-2">สรุปการชำระเงิน</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>ค่าห้องเดือนแรก</span>
                    <span>{room.price.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>เงินประกัน</span>
                    <span>{room.deposit.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>รวมทั้งสิ้น</span>
                    <span className="text-indigo-600">
                      {(room.price + room.deposit).toLocaleString()} บาท
                    </span>
                  </div>
                </div>
              </div>

              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  ต่อไป
                </button>
              )}

              {step === 2 && (
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    onClick={handleBooking}
                    disabled={submitting}
                    className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
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
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                อัพโหลดสลิปการโอนเงิน
              </h1>

              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
                <p className="font-medium">กรุณาโอนเงินมายังบัญชี:</p>
                <p className="mt-2">ธนาคาร: ธนาคารกสิกรไทย</p>
                <p>เลขที่บัญชี: 123-4-56789-0</p>
                <p>ชื่อบัญชี: หอพักนักศึกษา ABC</p>
                <p className="mt-2 font-bold text-lg">
                  จำนวนเงิน: {(room.price + room.deposit).toLocaleString()} บาท
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อัพโหลดสลิปการโอนเงิน
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="slip-upload"
                  />
                  <label
                    htmlFor="slip-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {slipImage ? (
                      <div className="relative w-full h-64">
                        <Image
                          src={slipImage}
                          alt="สลิปการโอนเงิน"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <>
                        <svg
                          className="w-12 h-12 text-gray-400 mb-2"
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
                        <span className="text-gray-600">คลิกเพื่ือเลือกไฟล์</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {ocrData && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                  <h3 className="font-bold text-green-900 mb-2">
                    ข้อมูลจากสลิป (OCR)
                  </h3>
                  <pre className="text-sm text-green-800">
                    {JSON.stringify(ocrData, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={!slipImage || submitting}
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
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