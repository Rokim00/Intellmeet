import { prop, getModelForClass, pre, DocumentType, modelOptions, Severity } from '@typegoose/typegoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserRole } from '../types/index.js';

@pre<UserClass>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
})
@modelOptions({
  schemaOptions: { timestamps: true },
  options: { allowMixed: Severity.ALLOW }
})
export class UserClass {
  @prop({
    type: () => String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  })
  public name!: string;

  @prop({
    type: () => String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  })
  public email!: string;

  @prop({
    type: () => String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  })
  public password!: string;

  @prop({
    type: () => String,
    enum: ['Admin', 'Member'],
    default: 'Member'
  })
  public role!: UserRole;

  @prop({ type: () => String, default: '' })
  public avatarUrl?: string;

  @prop({ type: () => String, select: false })
  public refreshToken?: string;

  public async comparePassword(this: DocumentType<UserClass>, candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  public generateAccessToken(this: DocumentType<UserClass>): string {
    return jwt.sign(
      {
        id: this._id.toString(),
        email: this.email,
        role: this.role
      },
      env.JWT_ACCESS_SECRET,
      {
        expiresIn: env.JWT_ACCESS_EXPIRY
      } as jwt.SignOptions
    );
  }

  public generateRefreshToken(this: DocumentType<UserClass>): string {
    return jwt.sign(
      {
        id: this._id.toString()
      },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: env.JWT_REFRESH_EXPIRY
      } as jwt.SignOptions
    );
  }
}

export type UserDocument = DocumentType<UserClass>;
export const User = getModelForClass(UserClass);
