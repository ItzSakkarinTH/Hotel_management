import mongoose, { Schema } from 'mongoose';
import { IUtilityBill } from '@/types';

const utilityBillSchema = new Schema<IUtilityBill>(
  {
    bookingId: {
      type: String,
      required: true,
      ref: 'Booking',
    },
    roomId: {
      type: String,
      required: true,
      ref: 'Room',
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    month: {
      type: String,
      required: [true, 'กรุณากรอกเดือน'],
      match: [/^\d{4}-\d{2}$/, 'รูปแบบเดือนไม่ถูกต้อง (YYYY-MM)'],
    },
    waterUsage: {
      type: Number,
      required: [true, 'กรุณากรอกค่าน้ำ'],
      min: [0, 'ค่าน้ำต้องมากกว่าหรือเท่ากับ 0'],
    },
    waterCost: {
      type: Number,
      required: true,
      min: [0, 'ค่าน้ำต้องมากกว่าหรือเท่ากับ 0'],
    },
    electricityUsage: {
      type: Number,
      required: [true, 'กรุณากรอกค่าไฟ'],
      min: [0, 'ค่าไฟต้องมากกว่าหรือเท่ากับ 0'],
    },
    electricityCost: {
      type: Number,
      required: true,
      min: [0, 'ค่าไฟต้องมากกว่าหรือเท่ากับ 0'],
    },
    totalCost: {
      type: Number,
      required: true,
      min: [0, 'ยอดรวมต้องมากกว่าหรือเท่ากับ 0'],
    },
    paid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
utilityBillSchema.index({ bookingId: 1 });
utilityBillSchema.index({ roomId: 1 });
utilityBillSchema.index({ userId: 1 });
utilityBillSchema.index({ month: 1 });
utilityBillSchema.index({ paid: 1 });

// Compound index for unique month per booking
utilityBillSchema.index({ bookingId: 1, month: 1 }, { unique: true });

export const UtilityBill = mongoose.models.UtilityBill || 
  mongoose.model<IUtilityBill>('UtilityBill', utilityBillSchema);