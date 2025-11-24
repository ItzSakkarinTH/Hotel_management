import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { UtilityBill } from '@/models/UtilityBill1';
import { Room } from '@/models/Room1';
import { ApiResponse } from '@/types';
import { requireAuth, requireAdmin, AuthRequest } from '@/middleware/auth';

// GET utility bills
export const GET = requireAuth(async (request: NextRequest) => {
  try {
    await connectDB();

    const user = (request as AuthRequest).user;
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const userId = searchParams.get('userId');

    let query: any = {};

    // Users can only see their own bills
    if (user?.role === 'user') {
      query.userId = user.userId;
    } else if (userId) {
      query.userId = userId;
    }

    if (month) {
      query.month = month;
    }

    const bills = await UtilityBill.find(query)
      .populate('roomId', 'roomNumber')
      .populate('userId', 'firstName lastName email')
      .populate('bookingId')
      .sort({ month: -1 });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: bills,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get utility bills error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลค่าน้ำค่าไฟ',
      },
      { status: 500 }
    );
  }
});

// POST create utility bill (Admin/Owner only)
export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    const body = await request.json();
    const {
      bookingId,
      roomId,
      userId,
      month,
      waterUsage,
      electricityUsage,
    } = body;

    // Validate required fields
    if (!bookingId || !roomId || !userId || !month || waterUsage === undefined || electricityUsage === undefined) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        },
        { status: 400 }
      );
    }

    // Get room rates
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'ไม่พบข้อมูลห้องพัก',
        },
        { status: 404 }
      );
    }

    // Calculate costs
    const waterCost = waterUsage * room.waterRate;
    const electricityCost = electricityUsage * room.electricityRate;
    const totalCost = waterCost + electricityCost;

    // Check if bill already exists for this month
    const existingBill = await UtilityBill.findOne({ bookingId, month });
    if (existingBill) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'มีบิลค่าน้ำค่าไฟสำหรับเดือนนี้แล้ว',
        },
        { status: 400 }
      );
    }

    // Create utility bill
    const bill = await UtilityBill.create({
      bookingId,
      roomId,
      userId,
      month,
      waterUsage,
      waterCost,
      electricityUsage,
      electricityCost,
      totalCost,
      paid: false,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: bill,
        message: 'สร้างบิลค่าน้ำค่าไฟสำเร็จ',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create utility bill error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการสร้างบิลค่าน้ำค่าไฟ',
      },
      { status: 500 }
    );
  }
});
