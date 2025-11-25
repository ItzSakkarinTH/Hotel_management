import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Payment } from '@/models/Payment';
import { Booking } from '@/models/Booking';
import { ApiResponse } from '@/types';
import { requireAuth, AuthRequest } from '@/middleware/auth';

interface PaymentQuery {
  userId?: string;
  bookingId?: string;
  status?: string;
}

// GET all payments
export const GET = requireAuth(async (request: NextRequest) => {
  try {
    await connectDB();

    const user = (request as AuthRequest).user;
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    const query: PaymentQuery = {};

    // Users can only see their own payments
    if (user?.role === 'user') {
      query.userId = user.userId;
    }

    // Filter by bookingId if provided
    if (bookingId) {
      query.bookingId = bookingId;
    }

    const payments = await Payment.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: payments,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Get payments error:', err);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน',
      },
      { status: 500 }
    );
  }
});

// POST create payment
export const POST = requireAuth(async (request: NextRequest) => {
  try {
    await connectDB();

    const user = (request as AuthRequest).user;
    const body = await request.json();
    const { bookingId, utilityBillId, amount, slipImage, ocrData, qrData } = body;

    if (!slipImage) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'กรุณาอัพโหลดสลิปการโอนเงิน',
        },
        { status: 400 }
      );
    }

    // Check if it's a booking payment or utility payment
    if (!bookingId && !utilityBillId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        },
        { status: 400 }
      );
    }

    let paymentAmount = amount;
    let paymentType = 'utilities';

    // If it's a booking payment, get amount from booking
    if (bookingId) {
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

      paymentAmount = booking.totalAmount;
      paymentType = 'deposit';
    }

    // Create payment
    const payment = await Payment.create({
      userId: user?.userId,
      bookingId: bookingId || undefined,
      utilityBillId: utilityBillId || undefined,
      amount: paymentAmount,
      slipImage,
      ocrData: ocrData || qrData,
      status: 'pending',
      type: paymentType,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: payment,
        message: 'ส่งสลิปการชำระเงินสำเร็จ รอการตรวจสอบ',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Create payment error:', err);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: err.message || 'เกิดข้อผิดพลาดในการส่งสลิปการชำระเงิน',
      },
      { status: 500 }
    );
  }
});
