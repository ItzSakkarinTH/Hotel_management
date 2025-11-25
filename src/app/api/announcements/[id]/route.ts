import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Announcement } from '@/models/Announcement';
import { requireAdmin, RouteContext } from '@/middleware/auth';
import { ApiResponse } from '@/types';

// PUT update announcement
export const PUT = requireAdmin(async (
  request: NextRequest,
  context?: RouteContext
) => {
  try {
    await connectDB();

    // ✅ unwrap params
    const { id } = (await context?.params) as { id: string };
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: 'ไม่พบ ID ประกาศ' }, { status: 400 });

    const body = await request.json();
    const updated = await Announcement.findByIdAndUpdate(id, body, { new: true });

    // safe populate
    try {
      if (updated) await updated.populate('publishedBy', 'firstName lastName');
    } catch (e) {
      console.warn('Populate publishedBy failed after update');
    }

    if (!updated) return NextResponse.json<ApiResponse>({ success: false, error: 'ไม่พบประกาศ' }, { status: 404 });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updated,
      message: 'แก้ไขประกาศสำเร็จ',
    }, { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Update announcement error:', err);
    return NextResponse.json<ApiResponse>({ success: false, error: err.message || 'เกิดข้อผิดพลาดในการแก้ไขประกาศ' }, { status: 500 });
  }
});

// DELETE announcement
export const DELETE = requireAdmin(async (
  request: NextRequest,
  context?: RouteContext
) => {
  try {
    await connectDB();

    const { id } = (await context?.params) as { id: string };
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: 'ไม่พบ ID ประกาศ' }, { status: 400 });

    const deleted = await Announcement.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json<ApiResponse>({ success: false, error: 'ไม่พบประกาศ' }, { status: 404 });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'ลบประกาศสำเร็จ',
    }, { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Delete announcement error:', err);
    return NextResponse.json<ApiResponse>({ success: false, error: err.message || 'เกิดข้อผิดพลาดในการลบประกาศ' }, { status: 500 });
  }
});
