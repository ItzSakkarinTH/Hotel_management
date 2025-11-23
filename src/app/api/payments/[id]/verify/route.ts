import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Payment } from '@/models/Payment';
import { Booking } from '@/models/Booking';
import { Room } from '@/models/Room';
import { ApiResponse, PaymentStatus, BookingStatus, RoomStatus } from '@/types';
import { requireAdmin, AuthRequest } from '@/middleware/auth';

// POST verify payment (Admin/Owner only)
export const POST = requireAdmin(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      await connectDB();

      const user = (request as AuthRequest).user;
      const body = await request.json();
      const { status, notes } = body;

      // Validate status
      if (!status || ![PaymentStatus.VERIFIED, PaymentStatus.REJECTED].includes(status)) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'สถานะไม่ถูกต้อง',
          },
          { status: 400 }
        );
      }

      // Find payment
      const payment = await Payment.findById(params.id);
      if (!payment) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'ไม่พบข้อมูลการชำระเงิน',
          },
          { status: 404 }
        );
      }

      // Update payment
      payment.status = status;
      payment.verifiedBy = user?.userId;
      payment.verifiedAt = new Date();
      payment.notes = notes || '';
      await payment.save();

      // If verified, update booking and room
      if (status === PaymentStatus.VERIFIED) {
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
          booking.depositPaid = true;
          booking.status = BookingStatus.CONFIRMED;
          await booking.save();

          // Update room status
          await Room.findByIdAndUpdate(booking.roomId, {
            status: RoomStatus.OCCUPIED,
          });
        }
      } else if (status === PaymentStatus.REJECTED) {
        // If rejected, revert booking and room status
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
          booking.status = BookingStatus.CANCELLED;
          await booking.save();

          // Make room available again
          await Room.findByIdAndUpdate(booking.roomId, {
            status: RoomStatus.AVAILABLE,
          });
        }
      }

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: payment,
          message: status === PaymentStatus.VERIFIED 
            ? 'ยืนยันการชำระเงินสำเร็จ' 
            : 'ปฏิเสธการชำระเงิน',
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Verify payment error:', error);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message || 'เกิดข้อผิดพลาดในการตรวจสอบการชำระเงิน',
        },
        { status: 500 }
      );
    }
  }
);
