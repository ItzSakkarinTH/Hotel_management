'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    currentBooking: null as any,
    unpaidBills: 0,
    totalUnpaid: 0,
    announcements: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [bookingsRes, utilitiesRes, announcementsRes] = await Promise.all([
        axios.get('/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/utilities', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/announcements?active=true', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const bookings = bookingsRes.data.data;
      const utilities = utilitiesRes.data.data;
      const announcements = announcementsRes.data.data;

      // Get current booking (confirmed or pending)
      const currentBooking = bookings.find(
        (b: any) => b.status === 'confirmed' || b.status === 'pending'
      );

      // Count unpaid bills
      const unpaidBills = utilities.filter((u: any) => !u.paid);
      const totalUnpaid = unpaidBills.reduce(
        (sum: number, bill: any) => sum + bill.totalCost,
        0
      );

      setStats({
        currentBooking,
        unpaidBills: unpaidBills.length,
        totalUnpaid,
        announcements: announcements.slice(0, 3),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                สวัสดี, {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-600 mt-1">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">สถานะการเข้าพัก</p>
                {stats.currentBooking ? (
                  <>
                    <p className="text-2xl font-bold text-green-600">กำลังเข้าพัก</p>
                    <p className="text-sm text-gray-500 mt-1">
                      ห้อง {stats.currentBooking.roomId?.roomNumber}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-gray-400">ยังไม่ได้เข้าพัก</p>
                )}
              </div>
              <div className="text-4xl">🏠</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">บิลค้างชำระ</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.unpaidBills} รายการ
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.totalUnpaid.toLocaleString()} บาท
                </p>
              </div>
              <div className="text-4xl">💳</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ประกาศใหม่</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.announcements.length} รายการ
                </p>
              </div>
              <div className="text-4xl">📢</div>
            </div>
          </div>
        </div>

        {/* Current Booking */}
        {stats.currentBooking && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ห้องพักปัจจุบัน</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">เลขห้อง</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.currentBooking.roomId?.roomNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ค่าห้อง/เดือน</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.currentBooking.roomId?.price?.toLocaleString()} บาท
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">วันเข้าพัก</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(stats.currentBooking.checkInDate).toLocaleDateString('th-TH')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">สถานะ</p>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  stats.currentBooking.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {stats.currentBooking.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอดำเนินการ'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">เมนูด่วน</h2>
            <div className="space-y-3">
              <Link
                href="/rooms"
                className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🏨</span>
                  <span className="font-medium text-indigo-900">ดูห้องพักว่าง</span>
                </div>
                <span className="text-indigo-600">→</span>
              </Link>

              <Link
                href="/utilities"
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💡</span>
                  <span className="font-medium text-blue-900">ค่าน้ำค่าไฟ</span>
                </div>
                {stats.unpaidBills > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {stats.unpaidBills}
                  </span>
                )}
              </Link>

              {stats.currentBooking && (
                <Link
                  href="/booking-history"
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📋</span>
                    <span className="font-medium text-green-900">ประวัติการจอง</span>
                  </div>
                  <span className="text-green-600">→</span>
                </Link>
              )}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ประกาศล่าสุด</h2>
            <div className="space-y-4">
              {stats.announcements.length > 0 ? (
                stats.announcements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className="border-l-4 border-indigo-500 pl-4 py-2"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(announcement.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">ไม่มีประกาศในขณะนี้</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
