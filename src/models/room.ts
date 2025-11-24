import mongoose, { Schema } from 'mongoose';
import { IRoom, RoomStatus } from '@/types';

const roomSchema = new Schema<IRoom>(
  {
    roomNumber: {
      type: String,
      required: [true, 'กรุณากรอกเลขห้อง'],
      unique: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(RoomStatus),
      default: RoomStatus.AVAILABLE,
    },
    price: {
      type: Number,
      required: [true, 'กรุณากรอกราคาห้อง'],
      min: [0, 'ราคาต้องมากกว่า 0'],
    },
    deposit: {
      type: Number,
      required: [true, 'กรุณากรอกเงินประกัน'],
      min: [0, 'เงินประกันต้องมากกว่า 0'],
    },
    waterRate: {
      type: Number,
      required: [true, 'กรุณากรอกค่าน้ำต่อหน่วย'],
      default: 18,
    },
    electricityRate: {
      type: Number,
      required: [true, 'กรุณากรอกค่าไฟต่อหน่วย'],
      default: 8,
    },
    facilities: {
      type: [String],
      default: [],
    },
    floor: {
      type: Number,
      required: [true, 'กรุณากรอกชั้น'],
      min: [1, 'ชั้นต้องมากกว่า 0'],
    },
    size: {
      type: Number,
      required: [true, 'กรุณากรอกขนาดห้อง'],
      min: [1, 'ขนาดห้องต้องมากกว่า 0'],
    },
    maxOccupants: {
      type: Number,
      required: [true, 'กรุณากรอกจำนวนผู้เข้าพักสูงสุด'],
      default: 1,
      min: [1, 'จำนวนผู้เข้าพักต้องมากกว่า 0'],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
roomSchema.index({ roomNumber: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ price: 1 });

export const Room = mongoose.models.Room || mongoose.model<IRoom>('Room', roomSchema);
