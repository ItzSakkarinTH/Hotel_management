import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { UserRole, JWTPayload } from '@/types';

// Type for Next.js 15 API Route context (params is now a Promise)
export interface RouteContext {
  params: Promise<Record<string, string | string[]>>;
}

export interface AuthRequest extends NextRequest {
  user?: JWTPayload;
}

export const authenticate = async (request: NextRequest): Promise<JWTPayload | null> => {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('token')?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    return null;
  }
};

export const requireAuth = (handler: (req: NextRequest, ctx?: RouteContext) => Promise<NextResponse>) => {
  return async (request: NextRequest, context?: RouteContext) => {
    const user = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // Attach user to request
    (request as AuthRequest).user = user;

    return handler(request, context);
  };
};

export const requireRole = (roles: UserRole[]) => {
  return (handler: (req: NextRequest, ctx?: RouteContext) => Promise<NextResponse>) => {
    return requireAuth(async (request: NextRequest, context?: RouteContext) => {
      const user = (request as AuthRequest).user;

      if (!user || !roles.includes(user.role)) {
        return NextResponse.json(
          { success: false, error: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้' },
          { status: 403 }
        );
      }

      return handler(request, context);
    });
  };
};

export const requireAdmin = requireRole([UserRole.ADMIN, UserRole.OWNER]);
export const requireOwner = requireRole([UserRole.OWNER]);
