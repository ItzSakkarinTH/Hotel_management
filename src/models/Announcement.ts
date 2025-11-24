import mongoose, { Schema } from 'mongoose';
import { IAnnouncement } from '@/types';

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'กรุณากรอกหัวข้อประกาศ'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'กรุณากรอกเนื้อหาประกาศ'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    publishedBy: {
      type: String,
      required: true,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
announcementSchema.index({ isActive: 1 });
announcementSchema.index({ priority: 1 });
announcementSchema.index({ createdAt: -1 });

export const Announcement = mongoose.models.Announcement || 
  mongoose.model<IAnnouncement>('Announcement', announcementSchema);