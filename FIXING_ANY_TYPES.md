# คู่มือแก้ไข TypeScript "any" Type Error ทั้งโปรเจค

## ✅ แก้ไขเรียบร้อยแล้ว

1. **src/types/index.ts** - เพิ่ม type definitions สำหรับ:
   - `QRData` - ข้อมูล QR Code
   - `OCRData` - ข้อมูล OCR จากสลิป
   - `SlipData` - ข้อมูลสลิปรวม
   - `ApiResponse<T = unknown>` - เปลี่ยนจาก `any` เป็น `unknown`

2. **src/components/SlipReader.tsx** - import types แทนการประกาศซ้ำ

3. **src/app/admin/bookings/page.tsx** - ใช้ `SlipData` type

4. **src/middleware/auth.ts** - ใช้ `RouteContext` แทน `any`

---

## 📋 ที่ต้องแก้ไขต่อ

### แนวทางการแก้ไข Error Types

**ใน catch blocks ทั้งหมด** เปลี่ยนจาก:
```typescript
catch (error: any) {
```

เป็น:
```typescript
catch (error: unknown) {
  const err = error as Error;
  // ใช้ err.message แทน
}
```

หรือถ้าจับ axios error:
```typescript
catch (error: unknown) {
  const err = error as { response?: { data?: { error?: string } } };
  // ใช้ err.response?.data?.error
}
```

---

## 📁 ไฟล์และบรรทัดที่ต้องแก้ไข

### API Routes

#### `src/app/api/utilities/route.ts`
- **บรรทัด 18**: `let query: any = {};`
  ```typescript
  // แก้เป็น
  interface UtilityQuery {
    bookingId?: string;
    userId?: string;
    paid?: boolean;
  }
  let query: UtilityQuery = {};
  ```

- **บรรทัด 44, 133**: `catch (error: any)`
  ```typescript
  catch (error: unknown) {
    const err = error as Error;
    console.error('Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
  ```

#### `src/app/api/rooms/route.ts`
- **บรรทัด 19**: `const query: any = {};`
  ```typescript
  interface RoomQuery {
    status?: string;
  }
  const query: RoomQuery = {};
  ```

- **บรรทัด 37, 117**: แก้ catch block เหมือนด้านบน

#### `src/app/api/rooms/[id]/route.ts`
- **บรรทัด 35, 79, 117**: แก้ catch blocks

#### `src/app/api/payments/route.ts`
- **บรรทัด 16**: `let query: any = {};`
  ```typescript
  interface PaymentQuery {
    bookingId?: string;
    userId?: string;
    status?: string;
  }
  let query: PaymentQuery = {};
  ```

- **บรรทัด 35, 109**: แก้ catch blocks

#### `src/app/api/payments/[id]/verify/route.ts`
- **บรรทัด 86**: แก้ catch block

#### `src/app/api/bookings/route.ts`
- **บรรทัด 15**: `let query: any = {};`
  ```typescript
  interface BookingQuery {
    userId?: string;
    roomId?: string;
    status?: string;
  }
  let query: BookingQuery = {};
  ```

- **บรรทัด 34, 128**: แก้ catch blocks

#### `src/app/api/auth/register/route.ts`
- **บรรทัด 83**: แก้ catch block

#### `src/app/api/auth/login/route.ts`
- **บรรทัด 85**: แก้ catch block

#### `src/app/api/announcements/route.ts`
- **บรรทัด 33, 77**: แก้ catch blocks

#### `src/app/api/announcements/[id]/route.ts`
- **บรรทัด 36, 60**: แก้ catch blocks

---

### Client Pages

#### `src/app/dashboard/page.tsx`
- **บรรทัด 49, 52, 54**: แก้ไข filter callbacks
  ```typescript
  // เพิ่ม interface ที่ด้านบน
  interface BookingWithStatus {
    status: string;
    // เพิ่ม properties อื่นๆ ที่จำเป็น
  }

  interface UtilityBill {
    paid: boolean;
    totalCost: number;
  }

  // แล้วใช้
  const activeBooking = bookings.filter(
    (b: BookingWithStatus) => b.status === 'confirmed' || b.status === 'pending'
  );

  const unpaidBills = utilities.filter((u: UtilityBill) => !u.paid);

  unpaidBills.reduce(
    (sum: number, bill: UtilityBill) => sum + bill.totalCost,
    0
  );
  ```

#### `src/app/booking/[id]/page.tsx`
- **บรรทัด 69, 120**: `catch (err: any)`
  ```typescript
  catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } } };
    alert(err.response?.data?.error || 'เกิดข้อผิดพลาด');
  }
  ```

#### `src/app/register/page.tsx`
- **บรรทัด 53**: แก้ catch block

#### `src/app/login/page.tsx`
- **บรรทัด 39**: แก้ catch block

#### `src/app/admin/rooms-management/page.tsx`
- **บรรทัด 80, 113**: แก้ catch blocks

#### `src/app/admin/rooms-management/new/page.tsx`
- **บรรทัด 80, 113**: แก้ catch blocks

#### `src/app/admin/payments/page.tsx`
- **บรรทัด 9-10**: `bookingId: any; userId: any;`
  ```typescript
  // เพิ่ม interface ที่ด้านบน
  interface PaymentWithRelations {
    _id: string;
    bookingId: {
      _id: string;
      roomId: { roomNumber: string };
    };
    userId: {
      firstName: string;
      lastName: string;
    };
    amount: number;
    status: string;
    slipImage: string;
    createdAt: string;
    // เพิ่ม properties อื่นๆ ตามต้องการ
  }
  
  // แล้วใช้งาน
  const [payments, setPayments] = useState<PaymentWithRelations[]>([]);
  ```

- **บรรทัด 58**: แก้ catch block

#### `src/app/admin/dashboard/page.tsx`
- **บรรทัด 63-69**: แก้ไข filter/reduce callbacks
  ```typescript
  // เพิ่ม interfaces
  interface RoomWithStatus {
    status: string;
  }

  interface PaymentWithAmount {
    status: string;
    amount: number;
  }

  interface BookingWithStatus {
    status: string;
  }

  // แล้วใช้
  availableRooms: rooms.filter((r: RoomWithStatus) => r.status === 'available').length,
  occupiedRooms: rooms.filter((r: RoomWithStatus) => r.status === 'occupied').length,
  pendingPayments: payments.filter((p: PaymentWithAmount) => p.status === 'pending').length,
  revenue: payments
    .filter((p: PaymentWithAmount) => p.status === 'verified')
    .reduce((sum: number, p: PaymentWithAmount) => sum + p.amount, 0),
  activeBookings: bookings.filter((b: BookingWithStatus) => 
    b.status === 'confirmed' || b.status === 'pending'
  ).length,
  ```

#### `src/app/utilities/pages.tsx`
- **บรรทัด 8**: `roomId: any;`
  ```typescript
  interface UtilityWithRoom {
    _id: string;
    roomId: {
      roomNumber: string;
    };
    month: string;
    waterUsage: number;
    waterCost: number;
    electricityUsage: number;
    electricityCost: number;
    totalCost: number;
    paid: boolean;
    // เพิ่ม properties อื่นๆ
  }
  ```

---

## 🚀 วิธีใช้งาน

### 1. ใช้ Find & Replace
ใน VS Code กด `Ctrl+Shift+H` แล้วค้นหา:
- `catch (error: any)` แทนด้วย `catch (error: unknown)`
- `catch (err: any)` แทนด้วย `catch (error: unknown)`

### 2. แก้ไขทีละไฟล์
ทำตามรายการด้านบนทีละไฟล์

### 3. ตรวจสอบ
```bash
npm run lint
```

---

## 💡 Tips

1. **ใช้ Interface แทน Type Inline**: สร้าง interface ที่ชัดเจนแทนการใช้ `any`

2. **ใช้ Type Guards**: เมื่อต้องการตรวจสอบ type
   ```typescript
   function isError(error: unknown): error is Error {
     return error instanceof Error;
   }
   ```

3. **ใช้ Generic Types**: สำหรับ API responses
   ```typescript
   const response = await axios.get<ApiResponse<IRoom[]>>('/api/rooms');
   ```

4. **Type Assertion อย่างระมัดระวัง**: ใช้ `as` เฉพาะเมื่อแน่ใจว่า type ถูกต้อง

---

## ✨ สรุป

การแก้ไข `any` types ทำให้:

✅ โค้ดปลอดภัยขึ้น (Type-safe)  
✅ IDE แสดง autocomplete ได้ดีขึ้น  
✅ จับ bugs ได้ตอน compile time  
✅ เข้าใจโค้ดง่ายขึ้น  
✅ Refactor ได้ง่ายและปลอดภัยขึ้น  

ขอให้โชคดีในการแก้ไขครับ! 🎉
