import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { ApiResponse } from '@/types';
import { requireAuth, AuthRequest, RouteContext } from '@/middleware/auth';

// GET single booking by ID
export const GET = requireAuth(async (request: NextRequest, context?: RouteContext) => {
    try {
        await connectDB();

        const user = (request as AuthRequest).user;

        // Next.js 15: params is now a Promise
        const params = await context?.params;
        const id = params?.id as string;

        if (!id) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'ไม่พบรหัสการจอง',
                },
                { status: 400 }
            );
        }

        const booking = await Booking.findById(id)
            .populate('roomId')
            .populate('userId', 'firstName lastName email phoneNumber');

        if (!booking) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'ไม่พบการจองนี้',
                },
                { status: 404 }
            );
        }

        // Users can only view their own bookings (unless admin)
        if (user?.role === 'user' && booking.userId._id.toString() !== user.userId) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
                },
                { status: 403 }
            );
        }

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: booking,
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Get booking error:', err);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง',
            },
            { status: 500 }
        );
    }
});

// PATCH update booking (for status changes, etc.)
export const PATCH = requireAuth(async (request: NextRequest, context?: RouteContext) => {
    try {
        await connectDB();

        const user = (request as AuthRequest).user;

        // Next.js 15: params is now a Promise
        const params = await context?.params;
        const id = params?.id as string;

        const body = await request.json();
        const { status } = body;

        if (!id) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'ไม่พบรหัสการจอง',
                },
                { status: 400 }
            );
        }

        const booking = await Booking.findById(id);

        if (!booking) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'ไม่พบการจองนี้',
                },
                { status: 404 }
            );
        }

        // Users can only cancel their own pending bookings
        if (user?.role === 'user') {
            if (booking.userId.toString() !== user.userId) {
                return NextResponse.json<ApiResponse>(
                    {
                        success: false,
                        error: 'คุณไม่มีสิทธิ์แก้ไขการจองนี้',
                    },
                    { status: 403 }
                );
            }

            // Users can only cancel pending bookings
            if (status !== 'cancelled' || booking.status !== 'pending') {
                return NextResponse.json<ApiResponse>(
                    {
                        success: false,
                        error: 'ไม่สามารถยกเลิกการจองนี้ได้',
                    },
                    { status: 400 }
                );
            }
        }

        // Update booking
        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('roomId').populate('userId', 'firstName lastName email phoneNumber');

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: updatedBooking,
                message: 'อัพเดทสถานะการจองสำเร็จ',
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Update booking error:', err);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: err.message || 'เกิดข้อผิดพลาดในการอัพเดทการจอง',
            },
            { status: 500 }
        );
    }
});
