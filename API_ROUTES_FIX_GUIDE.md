# สคริปต์แก้ไข ANY Types ใน API Routes

## ✅ แก้เรียบร้อยแล้ว
1. ✅ `api/utilities/route.ts` - เพิ่ม UtilityQuery interface และแก้ catch blocks

## 📝 ไฟล์ที่ต้องแก้ต่อ (แพทเทิร์นเดียวกัน)

### แนวทางการแก้:
1. **Query Objects**: สร้าง interface แทน `any`
2. **Catch Blocks**: เปลี่ยนจาก `catch (error: any)` เป็น `catch (error: unknown)` + type assertion

---

## 1. api/rooms/route.ts

### แก้ Query (บรรทัด 19):
```typescript
// เพิ่ม interface
interface RoomQuery {
  status?: string;
  floor?: number;
}

// เปลี่ยนจาก
const query: any = {};

// เป็น
const query: RoomQuery = {};
```

### แก้ Catch Blocks (2 จุด - บรรทัด 37, 117):
```typescript
// เปลี่ยนจาก
} catch (error: any) {
  console.error('...', error);
  return NextResponse.json<ApiResponse>(
    { success: false, error: error.message || '...' },
    { status: 500 }
  );
}

// เป็น
} catch (error: unknown) {
  const err = error as Error;
  console.error('...', err);
  return NextResponse.json<ApiResponse>(
    { success: false, error: err.message || '...' },
    { status: 500 }
  );
}
```

---

## 2. api/rooms/[id]/route.ts

### แก้ Catch Blocks (3 จุด - บรรทัด 35, 79, 117):
```typescript
} catch (error: unknown) {
  const err = error as Error;
  console.error('...', err);
  return NextResponse.json<ApiResponse>(
    { success: false, error: err.message || '...' },
    { status: 500 }
  );
}
```

---

## 3. api/payments/route.ts

### แก้ Query (บรรทัด 16):
```typescript
// เพิ่ม interface
interface PaymentQuery {
  userId?: string;
  bookingId?: string;
  status?: string;
}

// เปลี่ยนจาก
let query: any = {};

// เป็น
const query: PaymentQuery = {};
```

### แก้ Catch Blocks (2 จุด - บรรทัด 35, 109):
```typescript
} catch (error: unknown) {
  const err = error as Error;
  console.error('...', err);
  return NextResponse.json<ApiResponse>(
    { success: false, error: err.message || '...' },
    { status: 500 }
  );
}
```

---

## 4. api/payments/[id]/verify/route.ts

### แก้ Catch Block (บรรทัด 86):
```typescript
} catch (error: unknown) {
  const err = error as Error;
  console.error('Verify payment error:', err);
  return NextResponse.json<ApiResponse>(
    { success: false, error: err.message || 'เกิดข้อผิดพลาดในการตรวจสอบการชำระเงิน' },
    { status: 500 }
  );
}
```

---

## 5. api/bookings/route.ts

### แก้ Query (บรรทัด 15):
```typescript
// เพิ่ม interface
interface BookingQuery {
  userId?: string;
  roomId?: string;
  status?: string;
}

// เปลี่ยนจาก
let query: any = {};

// เป็น
const query: BookingQuery = {};
```

### แก้ Catch Blocks (2 จุด - บรรทัด 34, 128):
```typescript
} catch (error: unknown) {
  const err = error as Error;
  console.error('...', err);
  return NextResponse.json<ApiResponse>(
    { success: false, error: err.message || '...' },
    { status: 500 }
  );
}
```

---

## 6. api/auth/login/route.ts

### แก้ Catch Block (บรรทัด 85):
```typescript
} catch (error: unknown) {
  const err = error as Error;
  console.error('Login error:', err);
  return NextResponse.json<ApiResponse>(
    { success: false, error: err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
    { status: 500 }
  );
}
```

---

## 7. api/auth/register/route.ts

### แก้ Catch Block (บรรทัด 83):
```typescript
} catch (error: unknown) {
  const err = error as Error;
  console.error('Register error:', err);
  return NextResponse.json<ApiResponse>(
    { success: false, error: err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' },
    { status: 500 }
  );
}
```

---

## 8. api/announcements/route.ts

### แก้ Catch Blocks (2 จุด - บรรทัด 33, 77):
```typescript
} catch (error: unknown) {
  const err = error as Error;
  console.error('...', err);
  return NextResponse.json<ApiResponse>(
    { success: false, error: err.message || '...' },
    { status: 500 }
  );
}
```

---

## 9. api/announcements/[id]/route.ts

### แก้ Catch Blocks (2 จุด - บรรทัด 36, 60):
```typescript
} catch (error: unknown) {
  const err = error as Error;
  console.error('...', err);
  return NextResponse.json<ApiResponse>(
    { success: false, error: err.message || '...' },
    { status: 500 }
  );
}
```

---

## 🚀 วิธีแก้ไขอย่างรวดเร็ว

### Option 1: Find & Replace (แนะนำ)
1. เปิด VS Code
2. กด `Ctrl+Shift+H` (Find in Files)
3. ค้นหา: `} catch (error: any) {`
4. แทนด้วย: `} catch (error: unknown) {`
5. Replace All ในโฟลเดอร์ `src/app/api`
6. จากนั้นเพิ่ม `const err = error as Error;` ในบรรทัดถัดไป
7. แทนที่ `error.message` ด้วย `err.message`

### Option 2: แก้ทีละไฟล์
ใช้ตัวอย่างโค้ดด้านบนแก้ทีละไฟล์

---

## ✨ สรุป

**ไฟล์ที่ต้องแก้:** 9 ไฟล์  
**จุดที่ต้องแก้:** ~23 จุด  
- Query objects: 4 ไฟล์ (utilities, rooms, payments, bookings)
- Catch blocks: ทุกไฟล์

**ประโยชน์:**
- ✅ Type-safe error handling
- ✅ ไม่มี ESLint warnings
- ✅ โค้ดอ่านง่ายและ maintain ง่ายขึ้น
