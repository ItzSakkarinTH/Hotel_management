'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { IPayment, PaymentStatus } from '@/types';

interface PaymentWithDetails extends IPayment {
  bookingId: any;
  userId: any;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/payments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(response.data.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId: string, status: PaymentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/payments/${paymentId}/verify`,
        {
          status,
          notes: verifyNotes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      alert(status === PaymentStatus.VERIFIED ? 'อนุมัติการชำระเงินสำเร็จ' : 'ปฏิเสธการชำระเงินสำเร็จ');
      setShowModal(false);
      setSelectedPayment(null);
      setVerifyNotes('');
      fetchPayments();
    } catch (error: any) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const badges = {
      [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [PaymentStatus.VERIFIED]: 'bg-green-100 text-green-800',
      [PaymentStatus.REJECTED]: 'bg-red-100 text-red-800',
    };
    
    const labels = {
      [PaymentStatus.PENDING]: 'รอตรวจสอบ',
      [PaymentStatus.VERIFIED]: 'อนุมัติแล้ว',
      [PaymentStatus.REJECTED]: 'ปฏิเสธ',
    };

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.status === filter);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">กำลังโหลด...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">ตรวจสอบการชำระเงิน</h1>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            ทั้งหมด ({payments.length})
          </button>
          <button
            onClick={() => setFilter(PaymentStatus.PENDING)}
            className={`px-4 py-2 rounded-lg ${
              filter === PaymentStatus.PENDING 
                ? 'bg-yellow-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            รอตรวจสอบ ({payments.filter(p => p.status === PaymentStatus.PENDING).length})
          </button>
          <button
            onClick={() => setFilter(PaymentStatus.VERIFIED)}
            className={`px-4 py-2 rounded-lg ${
              filter === PaymentStatus.VERIFIED 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            อนุมัติแล้ว ({payments.filter(p => p.status === PaymentStatus.VERIFIED).length})
          </button>
          <button
            onClick={() => setFilter(PaymentStatus.REJECTED)}
            className={`px-4 py-2 rounded-lg ${
              filter === PaymentStatus.REJECTED 
                ? 'bg-red-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            ปฏิเสธ ({payments.filter(p => p.status === PaymentStatus.REJECTED).length})
          </button>
        </div>

        {/* Payments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPayments.map((payment) => (
            <div key={payment._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Slip Image */}
              <div className="relative h-64 bg-gray-200">
                <Image
                  src={payment.slipImage}
                  alt="สลิปการโอนเงิน"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Payment Details */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-600">ผู้ชำระเงิน</p>
                    <p className="font-medium text-gray-900">
                      {payment.userId?.firstName} {payment.userId?.lastName}
                    </p>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">จำนวนเงิน:</span>
                    <span className="font-semibold text-indigo-600">
                      {payment.amount.toLocaleString()} ฿
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ประเภท:</span>
                    <span>{payment.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">วันที่:</span>
                    <span>{new Date(payment.createdAt).toLocaleDateString('th-TH')}</span>
                  </div>
                </div>

                {payment.ocrData && (
                  <div className="mb-4 p-3 bg-blue-50 rounded text-xs">
                    <p className="font-medium text-blue-900 mb-1">ข้อมูลจาก OCR:</p>
                    <pre className="text-blue-800 overflow-x-auto">
                      {JSON.stringify(payment.ocrData, null, 2)}
                    </pre>
                  </div>
                )}

                {payment.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                    <p className="font-medium text-gray-900 mb-1">หมายเหตุ:</p>
                    <p className="text-gray-700">{payment.notes}</p>
                  </div>
                )}

                {payment.status === PaymentStatus.PENDING && (
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setShowModal(true);
                    }}
                    className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    ตรวจสอบ
                  </button>
                )}

                {payment.status === PaymentStatus.VERIFIED && payment.verifiedAt && (
                  <div className="text-xs text-gray-500 text-center">
                    อนุมัติเมื่อ: {new Date(payment.verifiedAt).toLocaleString('th-TH')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">ไม่พบข้อมูลการชำระเงิน</p>
          </div>
        )}

        {/* Verify Modal */}
        {showModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4">ตรวจสอบการชำระเงิน</h2>

              <div className="mb-6">
                <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={selectedPayment.slipImage}
                    alt="สลิปการโอนเงิน"
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="space-y-2 mb-4">
                  <p><strong>ผู้ชำระเงิน:</strong> {selectedPayment.userId?.firstName} {selectedPayment.userId?.lastName}</p>
                  <p><strong>จำนวนเงิน:</strong> {selectedPayment.amount.toLocaleString()} บาท</p>
                  <p><strong>ประเภท:</strong> {selectedPayment.type}</p>
                  <p><strong>วันที่:</strong> {new Date(selectedPayment.createdAt).toLocaleString('th-TH')}</p>
                </div>

                {selectedPayment.ocrData && (
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <p className="font-medium text-blue-900 mb-2">ข้อมูลจาก OCR:</p>
                    <pre className="text-sm text-blue-800 overflow-x-auto">
                      {JSON.stringify(selectedPayment.ocrData, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หมายเหตุ (ถ้ามี)
                  </label>
                  <textarea
                    rows={3}
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    placeholder="เช่น ตรวจสอบแล้วถูกต้อง, จำนวนเงินไม่ตรงกัน..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPayment(null);
                    setVerifyNotes('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => handleVerify(selectedPayment._id, PaymentStatus.REJECTED)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  ปฏิเสธ
                </button>
                <button
                  onClick={() => handleVerify(selectedPayment._id, PaymentStatus.VERIFIED)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  อนุมัติ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
