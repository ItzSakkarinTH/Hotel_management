'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { IUtilityBill } from '@/types';

interface UtilityBillWithDetails extends IUtilityBill {
  roomId: any;
}

export default function UtilitiesPage() {
  const [bills, setBills] = useState<UtilityBillWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/utilities', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBills(response.data.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">ค่าน้ำค่าไฟ</h1>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            ทั้งหมด ({bills.length})
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'unpaid'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            ยังไม่ชำระ ({bills.filter(b => !b.paid).length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'paid'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            ชำระแล้ว ({bills.filter(b => b.paid).length})
          </button>
        </div>

        {/* Bills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBills.map((bill) => (
            <div
              key={bill._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {getMonthName(bill.month)}
                  </h3>
                  <p className="text-sm text-gray-600">ห้อง {bill.roomId?.roomNumber}</p>
                </div>
                {bill.paid ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    ชำระแล้ว
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                    ยังไม่ชำระ
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-4">
                {/* Water */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-blue-900 font-medium">💧 ค่าน้ำ</span>
                    <span className="text-sm text-blue-600">
                      {bill.waterUsage} หน่วย
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-900">
                      {bill.waterCost.toLocaleString()} ฿
                    </span>
                  </div>
                </div>

                {/* Electricity */}
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-yellow-900 font-medium">⚡ ค่าไฟ</span>
                    <span className="text-sm text-yellow-600">
                      {bill.electricityUsage} หน่วย
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-yellow-900">
                      {bill.electricityCost.toLocaleString()} ฿
                    </span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">รวมทั้งสิ้น</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {bill.totalCost.toLocaleString()} ฿
                  </span>
                </div>
              </div>

              {bill.paid && bill.paidAt && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 text-center">
                  ชำระเมื่อ: {new Date(bill.paidAt).toLocaleDateString('th-TH')}
                </div>
              )}

              {!bill.paid && (
                <button className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                  ชำระเงิน
                </button>
              )}
            </div>
          ))}
        </div>

        {filteredBills.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">ไม่พบข้อมูลค่าน้ำค่าไฟ</p>
          </div>
        )}

        {/* Summary */}
        {bills.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">สรุปยอดรวม</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">ยอดรวมทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bills.reduce((sum, bill) => sum + bill.totalCost, 0).toLocaleString()} ฿
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600 mb-1">ยอดค้างชำระ</p>
                <p className="text-2xl font-bold text-red-900">
                  {bills
                    .filter(b => !b.paid)
                    .reduce((sum, bill) => sum + bill.totalCost, 0)
                    .toLocaleString()} ฿
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 mb-1">ชำระแล้ว</p>
                <p className="text-2xl font-bold text-green-900">
                  {bills
                    .filter(b => b.paid)
                    .reduce((sum, bill) => sum + bill.totalCost, 0)
                    .toLocaleString()} ฿
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
