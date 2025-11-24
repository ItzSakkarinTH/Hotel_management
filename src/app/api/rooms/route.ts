import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room } from '@/models/Room';
import { ApiResponse, RoomStatus } from '@/types';
import { requireAdmin } from '@/middleware/auth';

// GET all rooms (with filters)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const floor = searchParams.get('floor');

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (floor) query.floor = Number(floor);

    const rooms = await Room.find(query).sort({ roomNumber: 1 });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: rooms,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get rooms error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลห้อง',
      },
      { status: 500 }
    );
  }
}

// POST create new room (Admin/Owner only)
export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    const body = await request.json();
    const {
      roomNumber,
      images,
      status,
      price,
      deposit,
      waterRate,
      electricityRate,
      facilities,
      floor,
      size,
      maxOccupants,
      description,
    } = body;

    // Validate required fields
    if (!roomNumber || !price || !deposit || !floor || !size) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
        },
        { status: 400 }
      );
    }

    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'เลขห้องนี้มีอยู่ในระบบแล้ว',
        },
        { status: 400 }
      );
    }

    // Create new room
    const room = await Room.create({
      roomNumber,
      images: images || [],
      status: status || RoomStatus.AVAILABLE,
      price,
      deposit,
      waterRate: waterRate || 18,
      electricityRate: electricityRate || 8,
      facilities: facilities || [],
      floor,
      size,
      maxOccupants: maxOccupants || 1,
      description,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: room,
        message: 'เพิ่มห้องพักสำเร็จ',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create room error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการเพิ่มห้องพัก',
      },
      { status: 500 }
    );
  }
});