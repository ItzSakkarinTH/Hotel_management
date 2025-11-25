# สรุปการแก้ไข TypeScript "any" Types

## ✅ แก้เรียบร้อยแล้ว (8 ไฟล์)

1. ✅ `src/types/index.ts` - เพิ่ม QRData, OCRData, SlipData, AxiosErrorResponse
2. ✅ `src/components/SlipReader.tsx`
3. ✅ `src/app/admin/bookings/page.tsx`
4. ✅ `src/app/booking/[id]/page.tsx`
5. ✅ `src/app/admin/dashboard/page.tsx`
6. ✅ `src/app/admin/payments/page.tsx`
7. ✅ `src/app/dashboard/page.tsx`
8. ✅ `src/middleware/auth.ts`

## ⚠️ ยังต้องแก้ (รวม ~40 จุด)

### Client Pages (5 ไฟล์)

#### 1. src/app/login/page.tsx
```typescript
// เพิ่ม import
import { AxiosErrorResponse } from '@/types';

// แก้ catch block (บรรทัด 39)
} catch (error: unknown) {
  const err = error as AxiosErrorResponse;
  setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
}
```

#### 2. src/app/register/page.tsx
```typescript
// เพิ่ม import
import { AxiosErrorResponse } from '@/types';

// แก้ catch block (บรรทัด 53)
} catch (error: unknown) {
  const err = error as AxiosErrorResponse;
  setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
}
```

#### 3. src/app/utilities/pages.tsx
```typescript
// แก้ interface (บรรทัด 8)
interface UtilityWithRoom {
  _id: string;
  roomId: {
    _id: string;
    roomNumber: string;
  };
  month: string;
  waterUsage: number;
  electricityUsage: number;
  waterCost: number;
  electricityCost: number;
  totalCost: number;
  paid: boolean;
}
```

#### 4-5. src/app/admin/rooms-management/page.tsx & new/page.tsx
```typescript
// แก้ catch blocks (2 จุดในแต่ละไฟล์)
} catch (error: unknown) {
  const err = error as Error;
  console.error('Error:', err);
  alert(err.message || 'เกิดข้อผิดพลาด');
}
```

### API Routes (11 ไฟล์, ~36 จุด)

**แนวทางเดียวกันทั้งหมด:**

#### แก้ Query Objects:
```typescript
// ก่อน
let query: any = {};

// หลัง
interface QueryFilter {
  userId?: string;
  roomId?: string;
  status?: string;
  paid?: boolean;
  // เพิ่มตาม properties ที่ใช้
}
let query: QueryFilter = {};
```

#### แก้ Catch Blocks:
```typescript
// ก่อน
} catch (error: any) {
  console.error(error);
  return NextResponse.json(
    { success: false, error: error.message },
    { status: 500 }
  );
}

// หลัง
} catch (error: unknown) {
  const err = error as Error;
  console.error('Error:', err);
  return NextResponse.json(
    { success: false, error: err.message || 'เกิดข้อผิดพลาด' },
    { status: 500 }
  );
}
```

### รายการไฟล์ API ที่ต้องแก้:

1. `src/app/api/utilities/route.ts` (3 จุด: 1 query + 2 catch)
2. `src/app/api/rooms/route.ts` (3 จุด)
3. `src/app/api/rooms/[id]/route.ts` (3 catch blocks)
4. `src/app/api/payments/route.ts` (3 จุด)
5. `src/app/api/payments/[id]/verify/route.ts` (1 catch)
6. `src/app/api/bookings/route.ts` (3 จุด)
7. `src/app/api/auth/login/route.ts` (1 catch)
8. `src/app/api/auth/register/route.ts` (1 catch)
9. `src/app/api/announcements/route.ts` (2 catch)
10. `src/app/api/announcements/[id]/route.ts` (2 catch)

## 🚀 วิธีแก้ไขอย่างรวดเร็ว

### Option 1: ใช้ Find & Replace (VS Code)
1. กด `Ctrl+Shift+H`
2. ค้นหา: `catch (error: any)`
3. แทนด้วย: `catch (error: unknown)`
4. จากนั้นเพิ่ม `const err = error as Error;` ในบรรทัดถัดไป

### Option 2: แก้ทีละไฟล์ตามรายการด้านบน

## 💡 Tips

- **Client-side errors**: ใช้ `AxiosErrorResponse`
- **Server-side errors**: ใช้ `Error`
- **Query objects**: สร้าง interface ที่ชัดเจน
- **Type assertions**: ใช้ `as` อย่างระมัดระวัง

## ✨ ประโยชน์ที่ได้

✅ Type-safe code  
✅ Better IDE autocomplete  
✅ Catch bugs at compile time  
✅ Easier to maintain  
✅ No more ESLint errors!  

---
**หมายเหตุ:** ไฟล์ที่มี ✅ แก้เรียบร้อยแล้ว ไม่ต้องแก้อีก
