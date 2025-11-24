import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Payment } from '@/models/Payment';
import { Booking } from '@/models/Booking';
import { Room } from '@/models/Room';
import { ApiResponse, PaymentType, PaymentStatus, BookingStatus, RoomStatus } from '@/types';
import { requireAuth, AuthRequest } from '@/middleware/auth';

// GET all payments
export const GET = requireAuth(async (request: NextRequest) => {
  try {
    await connectDB();

    const user = (request as AuthRequest).user;
    
    let query: any = {};
    
    // Users can only see their own payments
    if (user?.role === 'user') {
      query.userId = user.userId;
    }

    const payments = await Payment.find(query)
      .populate('bookingId')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: payments,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get payments error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน',
      },
      { status: 500 }
    );
  }
});

// POST create payment (upload slip)
export const POST = requireAuth(async (request: NextRequest) => {
  try {
    await connectDB();

    const user = (request as AuthRequest).user;
    const body = await request.json();
    const { bookingId, slipImage, ocrData } = body;

    // Validate required fields
    if (!bookingId || !slipImage) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'กรุณาอัพโหลดสลิปการโอนเงิน',
        },
        { status: 400 }
      );
    }

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'ไม่พบข้อมูลการจอง',
        },
        { status: 404 }
      );
    }

    // Verify booking belongs to user
    if (booking.userId !== user?.userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'คุณไม่มีสิทธิ์ดำเนินการนี้',
        },
        { status: 403 }
      );
    }

    // Create payment
    const payment = await Payment.create({
      bookingId,
      userId: user?.userId,
      amount: booking.totalAmount,
      type: PaymentType.DEPOSIT,
      slipImage,
      ocrData: ocrData || null,
      status: PaymentStatus.PENDING,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: payment,
        message: 'ส่งสลิปการโอนเงินสำเร็จ รอการตรวจสอบ',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create payment error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการส่งสลิป',
      },
      { status: 500 }
    );
  }
});
