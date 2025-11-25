import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room } from '@/models/Room';
import { ApiResponse } from '@/types';

// GET single room
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const room = await Room.findById(id);

    if (!room) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'ไม่พบห้องพักนี้',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: room,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Get room error:', err);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลห้อง',
      },
      { status: 500 }
    );
  }
}

// PUT update room (Admin/Owner only)
import { requireAdmin, RouteContext } from '@/middleware/auth';

// PUT update room (Admin/Owner only)
export const PUT = requireAdmin(
  async (request: NextRequest, context?: RouteContext) => {
    try {
      await connectDB();

      const body = await request.json();
      const { id } = (await context?.params) as { id: string };

      const room = await Room.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true, runValidators: true }
      );

      if (!room) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'ไม่พบห้องพักนี้',
          },
          { status: 404 }
        );
      }

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: room,
          message: 'อัพเดทข้อมูลห้องพักสำเร็จ',
        },
        { status: 200 }
      );
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Update room error:', err);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: err.message || 'เกิดข้อผิดพลาดในการอัพเดทห้องพัก',
        },
        { status: 500 }
      );
    }
  }
);

// DELETE room (Admin/Owner only)
// DELETE room (Admin/Owner only)
export const DELETE = requireAdmin(
  async (request: NextRequest, context?: RouteContext) => {
    try {
      await connectDB();
      const { id } = (await context?.params) as { id: string };

      const room = await Room.findByIdAndDelete(id);

      if (!room) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'ไม่พบห้องพักนี้',
          },
          { status: 404 }
        );
      }

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          message: 'ลบห้องพักสำเร็จ',
        },
        { status: 200 }
      );
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Delete room error:', err);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: err.message || 'เกิดข้อผิดพลาดในการลบห้องพัก',
        },
        { status: 500 }
      );
    }
  }
);
