// User Types
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  OWNER = 'owner'
}

export interface IUser {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  studentId?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Room Types
export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved'
}

export interface IRoom {
  _id: string;
  roomNumber: string;
  images: string[];
  status: RoomStatus;
  price: number;
  deposit: number;
  waterRate: number;
  electricityRate: number;
  facilities: string[];
  floor: number;
  size: number; // ตารางเมตร
  maxOccupants: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Booking Types
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface IBooking {
  _id: string;
  userId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate?: Date;
  totalAmount: number;
  depositPaid: boolean;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export enum PaymentType {
  DEPOSIT = 'deposit',
  RENT = 'rent',
  UTILITIES = 'utilities'
}

export enum PaymentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export interface IPayment {
  _id: string;
  bookingId: string;
  userId: string;
  amount: number;
  type: PaymentType;
  slipImage: string;
  ocrData?: any;
  status: PaymentStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Utility Bill Types
export interface IUtilityBill {
  _id: string;
  bookingId: string;
  roomId: string;
  userId: string;
  month: string; // YYYY-MM
  waterUsage: number;
  waterCost: number;
  electricityUsage: number;
  electricityCost: number;
  totalCost: number;
  paid: boolean;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Announcement Types
export interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  publishedBy: string | Partial<IUser>; 
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
