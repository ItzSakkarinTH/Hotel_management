import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole } from '@/types';

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: [true, 'กรุณากรอกอีเมล'],
      unique: true,
      lowercase: true,
      trim: true,
      // ลบ index: true ออก เพราะเรามี schema.index() อยู่แล้ว
    },
    password: {
      type: String,
      required: [true, 'กรุณากรอกรหัสผ่าน'],
      minlength: [6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'กรุณากรอกชื่อ'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'กรุณากรอกนามสกุล'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'กรุณากรอกเบอร์โทรศัพท์'],
    },
    studentId: {
      type: String,
      sparse: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving - ไม่ต้องใช้ next() แล้ว
userSchema.pre('save', async function () {
  // ถ้า password ไม่ได้ถูกแก้ไข ก็ return ออกไปเลย
  if (!this.isModified('password')) return;
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ป้องกัน OverwriteModelError ใน development mode
export const User = (mongoose.models.User as UserModel) || 
  mongoose.model<IUser, UserModel>('User', userSchema);
  