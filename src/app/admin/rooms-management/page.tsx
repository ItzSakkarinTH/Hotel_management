'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { IRoom, RoomStatus } from '@/types';
import Image from 'next/image';

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

  const getStatusBadge = (status: RoomStatus) => {
    const badges = {
      [RoomStatus.AVAILABLE]: 'bg-green-100 text-green-800',
      [RoomStatus.OCCUPIED]: 'bg-red-100 text-red-800',
      [RoomStatus.RESERVED]: 'bg-yellow-100 text-yellow-800',
      [RoomStatus.MAINTENANCE]: 'bg-gray-100 text-gray-800',
    };
    return badges[status];
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">กำลังโหลด...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">จัดการห้องพัก</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            + เพิ่มห้องพัก
          </button>
        </div>

        {/* Rooms Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ห้อง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ราคา
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชั้น
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ขนาด
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{room.roomNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{room.price.toLocaleString()} ฿</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">ชั้น {room.floor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{room.size} ตร.ม.</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(room.status)}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(room)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(room._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingRoom ? 'แก้ไขห้องพัก' : 'เพิ่มห้องพัก'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เลขห้อง *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      สถานะ
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={RoomStatus.AVAILABLE}>ว่าง</option>
                      <option value={RoomStatus.OCCUPIED}>เต็ม</option>
                      <option value={RoomStatus.RESERVED}>จองแล้ว</option>
                      <option value={RoomStatus.MAINTENANCE}>ปิดปรับปรุง</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ราคา/เดือน (บาท) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เงินประกัน (บาท) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.deposit}
                      onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ค่าน้ำ (บาท/หน่วย)
                    </label>
                    <input
                      type="number"
                      value={formData.waterRate}
                      onChange={(e) => setFormData({ ...formData, waterRate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ค่าไฟ (บาท/หน่วย)
                    </label>
                    <input
                      type="number"
                      value={formData.electricityRate}
                      onChange={(e) => setFormData({ ...formData, electricityRate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชั้น *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ขนาด (ตร.ม.) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    สิ่งอำนวยความสะดวก (คั่นด้วยเครื่องหมายจุลภาค)
                  </label>
                  <input
                    type="text"
                    placeholder="เตียง, ตู้เสื้อผ้า, แอร์"
                    value={formData.facilities}
                    onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รายละเอียดเพิ่มเติม
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
