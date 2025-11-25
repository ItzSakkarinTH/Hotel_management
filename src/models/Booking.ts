import mongoose, { Schema } from 'mongoose';
import { IBooking, BookingStatus } from '@/types';
// Import User and Room models to ensure they are registered
import './User';
import './Room';

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    roomId: {
      type: String,
      required: true,
      ref: 'Room',
    },
    checkInDate: {
      type: Date,
      required: [true, 'กรุณาเลือกวันเข้าพัก'],
    },
    checkOutDate: {
      type: Date,
    },
    totalAmount: {
      type: Number,
      required: [true, 'กรุณากรอกยอดเงิน'],
      min: [0, 'ยอดเงินต้องมากกว่า 0'],
    },
    depositPaid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ userId: 1 });
bookingSchema.index({ roomId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ checkInDate: 1 });

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);
