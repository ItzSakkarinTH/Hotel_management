import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Payment } from '@/models/Payment';
import { UtilityBill } from '@/models/UtilityBill';
import { ApiResponse } from '@/types';
import { verifyToken } from '@/lib/jwt';

// PATCH update payment status
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        // Verify authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'ไม่มีสิทธิ์เข้าถึง',
                },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (!decoded) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Token ไม่ถูกต้อง',
                },
                { status: 401 }
            );
        }

        // Only admin or owner can update payment status
        if (decoded.role !== 'admin' && decoded.role !== 'owner') {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'ไม่มีสิทธิ์เข้าถึง',
                },
                { status: 403 }
            );
        }

        const params = await context.params;
        const { id } = params;
        const body = await request.json();
        const { status } = body;

        if (!status || !['verified', 'rejected'].includes(status)) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'สถานะไม่ถูกต้อง',
                },
                { status: 400 }
            );
        }

        const payment = await Payment.findById(id);

        if (!payment) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'ไม่พบข้อมูลการชำระเงิน',
                },
                { status: 404 }
            );
        }

        // Update payment status
        payment.status = status;
        await payment.save();

        // If verified and it's a utility payment, mark the utility bill as paid
        if (status === 'verified' && payment.utilityBillId) {
            await UtilityBill.findByIdAndUpdate(payment.utilityBillId, {
                paid: true,
                paidAt: new Date(),
            });
        }

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: payment,
                message: `${status === 'verified' ? 'อนุมัติ' : 'ปฏิเสธ'}สลิปสำเร็จ`,
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Update payment status error:', err);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: err.message || 'เกิดข้อผิดพลาดในการอัพเดทสถานะ',
            },
            { status: 500 }
        );
    }
}
