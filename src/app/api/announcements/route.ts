import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Announcement } from '@/models/Announcement';
import { ApiResponse } from '@/types';
import { requireAdmin, AuthRequest } from '@/middleware/auth';

// GET all announcements
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const query = activeOnly ? { isActive: true } : {};
    
    let announcements = await Announcement.find(query)
      .sort({ createdAt: -1 });

    try {
      announcements = await Announcement.populate(announcements, {
        path: 'publishedBy',
        select: 'firstName lastName',
      });
    } catch (e) {
      console.warn('Populate publishedBy failed, returning userId only');
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: announcements },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get announcements error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลประกาศ' },
      { status: 500 }
    );
  }
}

// POST create new announcement
export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    const user = (request as AuthRequest).user;
    const body = await request.json();
    const { title, content, priority, isActive } = body;

    if (!title || !content) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || 'medium',
      isActive: isActive !== undefined ? isActive : true,
      publishedBy: user?.userId,
    });

    // Populate publishedBy หลัง create
    try {
      await announcement.populate('publishedBy', 'firstName lastName');
    } catch (e) {
      console.warn('Populate publishedBy failed after create');
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: announcement, message: 'สร้างประกาศสำเร็จ' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create announcement error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการสร้างประกาศ' },
      { status: 500 }
    );
  }
});
