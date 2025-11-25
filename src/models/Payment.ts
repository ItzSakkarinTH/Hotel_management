import mongoose, { Schema } from 'mongoose';
import { IPayment, PaymentType, PaymentStatus } from '@/types';

const paymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: String,
      required: false,
      ref: 'Booking',
    },
    utilityBillId: {
      type: String,
      required: false,
      ref: 'UtilityBill',
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: [true, 'กรุณากรอกยอดเงิน'],
      min: [0, 'ยอดเงินต้องมากกว่า 0'],
    },
    type: {
      type: String,
      enum: Object.values(PaymentType),
      required: true,
    },
    slipImage: {
      type: String,
      required: [true, 'กรุณาอัพโหลดสลิปการโอนเงิน'],
    },
    ocrData: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    verifiedBy: {
      type: String,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ utilityBillId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });

// Delete the model if it exists to ensure schema updates are applied
if (mongoose.models.Payment) {
  delete mongoose.models.Payment;
}

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
