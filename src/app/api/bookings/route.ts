import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { Room } from '@/models/Room';
import { ApiResponse, BookingStatus, RoomStatus } from '@/types';
import { requireAuth, AuthRequest } from '@/middleware/auth';

// GET all bookings (user gets their own, admin gets all)
export const GET = requireAuth(async (request: NextRequest) => {
  try {
    await connectDB();

    const user = (request as AuthRequest).user;
    
    let query: any = {};
    
    // Users can only see their own bookings
    if (user?.role === 'user') {
      query.userId = user.userId;
    }

    const bookings = await Booking.find(query)
      .populate('roomId')
      .populate('userId', 'firstName lastName email phoneNumber')
      .sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: bookings,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get bookings error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง',
      },
      { status: 500 }
    );
  }
});

// POST create new booking
export const POST = requireAuth(async (request: NextRequest) => {
  try {
    await connectDB();

    const user = (request as AuthRequest).user;
    const body = await request.json();
    const { roomId, checkInDate } = body;

    // Validate required fields
    if (!roomId || !checkInDate) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        },
        { status: 400 }
      );
    }

    // Check if room exists and is available
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'ไม่พบห้องพักนี้',
        },
        { status: 404 }
      );
    }

    if (room.status !== RoomStatus.AVAILABLE) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'ห้องพักนี้ไม่ว่าง',
        },
        { status: 400 }
      );
    }

    // Check if user already has an active booking
    const existingBooking = await Booking.findOne({
      userId: user?.userId,
      status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
    });

    if (existingBooking) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'คุณมีการจองห้องพักที่ยังไม่เสร็จสิ้นอยู่',
        },
        { status: 400 }
      );
    }

    // Calculate total amount (first month + deposit)
    const totalAmount = room.price + room.deposit;

    // Create booking
    const booking = await Booking.create({
      userId: user?.userId,
      roomId,
      checkInDate: new Date(checkInDate),
      totalAmount,
      depositPaid: false,
      status: BookingStatus.PENDING,
    });

    // Update room status to reserved
    await Room.findByIdAndUpdate(roomId, { status: RoomStatus.RESERVED });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: booking,
        message: 'จองห้องพักสำเร็จ กรุณาชำระเงิน',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create booking error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการจองห้องพัก',
      },
      { status: 500 }
    );
  }
});