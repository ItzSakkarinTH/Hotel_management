import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { UtilityBill } from '@/models/UtilityBill';
import { Room } from '@/models/Room';
import { ApiResponse } from '@/types';
import { verifyToken } from '@/lib/jwt';

// PUT/PATCH update utility bill
export async function PUT(
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

        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'owner')) {
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
        const { waterUsage, electricityUsage, month } = body;

        const bill = await UtilityBill.findById(id);

        if (!bill) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'ไม่พบข้อมูลบิล',
                },
                { status: 404 }
            );
        }

        // Get room rates
        const room = await Room.findById(bill.roomId);
        if (!room) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'ไม่พบข้อมูลห้องพัก',
                },
                { status: 404 }
            );
        }

        // Update bill
        if (month !== undefined) bill.month = month;
        if (waterUsage !== undefined) {
            bill.waterUsage = waterUsage;
            bill.waterCost = waterUsage * room.waterRate;
        }
        if (electricityUsage !== undefined) {
            bill.electricityUsage = electricityUsage;
            bill.electricityCost = electricityUsage * room.electricityRate;
        }

        // Recalculate total cost
        bill.totalCost = bill.waterCost + bill.electricityCost;

        await bill.save();

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: bill,
                message: 'แก้ไขบิลค่าน้ำค่าไฟสำเร็จ',
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Update utility bill error:', err);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: err.message || 'เกิดข้อผิดพลาดในการแก้ไขบิล',
            },
            { status: 500 }
        );
    }
}

// PATCH update utility bill (same as PUT for flexibility)
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    return PUT(request, context);
}

// DELETE utility bill
export async function DELETE(
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

        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'owner')) {
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

        const bill = await UtilityBill.findById(id);

        if (!bill) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'ไม่พบข้อมูลบิล',
                },
                { status: 404 }
            );
        }

        // Check if bill is already paid
        if (bill.paid) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'ไม่สามารถลบบิลที่ชำระเงินแล้ว',
                },
                { status: 400 }
            );
        }

        await UtilityBill.findByIdAndDelete(id);

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                message: 'ลบบิลค่าน้ำค่าไฟสำเร็จ',
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Delete utility bill error:', err);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: err.message || 'เกิดข้อผิดพลาดในการลบบิล',
            },
            { status: 500 }
        );
    }
}
