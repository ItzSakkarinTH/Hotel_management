'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  pendingPayments: number;
  totalRevenue: number;
  activeBookings: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    activeBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [roomsRes, bookingsRes, paymentsRes] = await Promise.all([
        axios.get('/api/rooms', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/payments', {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      const rooms = roomsRes.data.data;
      const bookings = bookingsRes.data.data;
      const payments = paymentsRes.data.data;

      setStats({
        totalRooms: rooms.length,
        availableRooms: rooms.filter((r: any) => r.status === 'available').length,
        occupiedRooms: rooms.filter((r: any) => r.status === 'occupied').length,
        pendingPayments: payments.filter((p: any) => p.status === 'pending').length,
        totalRevenue: payments
          .filter((p: any) => p.status === 'verified')
          .reduce((sum: number, p: any) => sum + p.amount, 0),
        activeBookings: bookings.filter((b: any) => 
          ['pending', 'confirmed'].includes(b.status)
        ).length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, color, link }: any) => (
    <Link href={link}>
      <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 ${color}`}>
        <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ดผู้ดูแลระบบ</h1>
            <div className="flex gap-4">
              <Link
                href="/admin/rooms-management"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                จัดการห้องพัก
              </Link>
              <button
                onClick={() => {
                  localStorage.clear();
                  router.push('/login');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="ห้องพักทั้งหมด"
            value={stats.totalRooms}
            color="border-blue-500"
            link="/admin/rooms-management"
          />
          <StatCard
            title="ห้องว่าง"
            value={stats.availableRooms}
            color="border-green-500"
            link="/admin/rooms-management?status=available"
          />
          <StatCard
            title="ห้องเต็ม"
            value={stats.occupiedRooms}
            color="border-red-500"
            link="/admin/rooms-management?status=occupied"
          />
          <StatCard
            title="การจองที่รอดำเนินการ"
            value={stats.activeBookings}
            color="border-yellow-500"
            link="/admin/bookings"
          />
          <StatCard
            title="สลิปรอตรวจสอบ"
            value={stats.pendingPayments}
            color="border-purple-500"
            link="/admin/payments"
          />
          <StatCard
            title="รายได้รวม"
            value={`${stats.totalRevenue.toLocaleString()} ฿`}
            color="border-emerald-500"
            link="/admin/payments"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">เมนูด่วน</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/rooms-management/new"
              className="flex items-center justify-center p-4 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <span className="font-medium">+ เพิ่มห้องพักใหม่</span>
            </Link>
            <Link
              href="/admin/bookings"
              className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="font-medium">จัดการการจอง</span>
            </Link>
            <Link
              href="/admin/payments"
              className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="font-medium">ตรวจสอบสลิป</span>
            </Link>
            <Link
              href="/admin/announcements"
              className="flex items-center justify-center p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <span className="font-medium">ประกาศข่าวสาร</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
