'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { IRoom, RoomStatus } from '@/types';
import Image from 'next/image';

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RoomStatus | 'all'>('all');

  useEffect(() => {
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
    const badges = {
      [RoomStatus.AVAILABLE]: 'bg-green-100 text-green-800',
      [RoomStatus.OCCUPIED]: 'bg-red-100 text-red-800',
      [RoomStatus.RESERVED]: 'bg-yellow-100 text-yellow-800',
      [RoomStatus.MAINTENANCE]: 'bg-gray-100 text-gray-800',
    };
    
    const labels = {
      [RoomStatus.AVAILABLE]: 'ว่าง',
      [RoomStatus.OCCUPIED]: 'เต็ม',
      [RoomStatus.RESERVED]: 'จองแล้ว',
      [RoomStatus.MAINTENANCE]: 'ปิดปรับปรุง',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">รายการห้องพัก</h1>
          
          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilter(RoomStatus.AVAILABLE)}
              className={`px-4 py-2 rounded-lg ${
                filter === RoomStatus.AVAILABLE 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              ห้องว่าง
            </button>
            <button
              onClick={() => setFilter(RoomStatus.OCCUPIED)}
              className={`px-4 py-2 rounded-lg ${
                filter === RoomStatus.OCCUPIED 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              ห้องเต็ม
            </button>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              {/* Room Image */}
              <div className="relative h-48 bg-gray-200">
                {room.images && room.images.length > 0 ? (
                  <Image
                    src={room.images[0]}
                    alt={`ห้อง ${room.roomNumber}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    ไม่มีรูปภาพ
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(room.status)}
                </div>
              </div>

              {/* Room Details */}
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ห้อง {room.roomNumber}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>ราคา:</span>
                    <span className="font-semibold text-indigo-600">
                      {room.price.toLocaleString()} บาท/เดือน
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>เงินประกัน:</span>
                    <span className="font-semibold">
                      {room.deposit.toLocaleString()} บาท
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าน้ำ:</span>
                    <span>{room.waterRate} บาท/หน่วย</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าไฟ:</span>
                    <span>{room.electricityRate} บาท/หน่วย</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ขนาด:</span>
                    <span>{room.size} ตร.ม.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ชั้น:</span>
                    <span>ชั้น {room.floor}</span>
                  </div>
                </div>

                {room.facilities && room.facilities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">สิ่งอำนวยความสะดวก:</p>
                    <div className="flex flex-wrap gap-1">
                      {room.facilities.map((facility, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
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
                  className={`w-full py-2 px-4 rounded-lg font-medium ${
                    room.status === RoomStatus.AVAILABLE
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {room.status === RoomStatus.AVAILABLE ? 'จองห้อง' : 'ไม่ว่าง'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">ไม่พบห้องพัก</p>
          </div>
        )}
      </div>
    </div>
  );
}
