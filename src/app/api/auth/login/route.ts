import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import { generateToken } from '@/lib/jwt';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'กรุณากรอกอีเมลและรหัสผ่าน',
        },
        { status: 400 }
      );
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Return user data without password
    const userData = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      studentId: user.studentId,
      role: user.role,
    };

    const response = NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { user: userData, token },
        message: 'เข้าสู่ระบบสำเร็จ',
      },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Login error:', err);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
      },
      { status: 500 }
    );
  }
}
