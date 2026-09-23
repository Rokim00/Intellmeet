import { prop, getModelForClass, pre, DocumentType, modelOptions, Severity, Ref } from '@typegoose/typegoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserRole } from '../types/index.js';
import { OrganizationClass } from './organization.model.js';

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
  schemaOptions: {
    collection: 'users',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        return {
          userId: (ret._id as { toString(): string })?.toString(),
          userName: ret.user_name as string,
          userEmail: ret.user_email as string,
          userRole: ret.user_role as string,
          isSuperAdmin: Boolean(ret.is_super_admin),
          avatarUrl: (ret.avatar_url ?? '') as string,
          organizationId: ret.organization_id,
          createdAt: ret.created_at,
          updatedAt: ret.updated_at
        };
      }
    },
    toObject: { virtuals: true }
  },
  options: { allowMixed: Severity.ALLOW }
})
export class UserClass {
  @prop({
    type: () => String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    alias: 'userName'
  })
  public user_name!: string;

  public get userName(): string {
    return this.user_name;
  }
  public set userName(val: string) {
    this.user_name = val;
  }

  @prop({
    type: () => String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    alias: 'userEmail'
  })
  public user_email!: string;

  public get userEmail(): string {
    return this.user_email;
  }
  public set userEmail(val: string) {
    this.user_email = val;
  }

  @prop({
    type: () => String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  })
  public password!: string;

  @prop({
    type: () => String,
    enum: ['SuperAdmin', 'Admin', 'Member'],
    default: 'Member',
    alias: 'userRole'
  })
  public user_role!: UserRole;

  public get userRole(): UserRole {
    return this.user_role;
  }
  public set userRole(val: UserRole) {
    this.user_role = val;
  }

  @prop({ type: () => Boolean, default: false, alias: 'isSuperAdmin' })
  public is_super_admin!: boolean;

  public get isSuperAdmin(): boolean {
    return this.is_super_admin;
  }
  public set isSuperAdmin(val: boolean) {
    this.is_super_admin = val;
  }

  @prop({ ref: () => 'OrganizationClass', index: true, alias: 'organizationId' })
  public organization_id?: Ref<OrganizationClass>;

  public get organizationId(): Ref<OrganizationClass> | undefined {
    return this.organization_id;
  }
  public set organizationId(val: Ref<OrganizationClass> | undefined) {
    this.organization_id = val;
  }

  @prop({ type: () => String, default: '', alias: 'avatarUrl' })
  public avatar_url?: string;

  public get avatarUrl(): string | undefined {
    return this.avatar_url;
  }
  public set avatarUrl(val: string | undefined) {
    this.avatar_url = val;
  }

  @prop({ type: () => String, select: false, alias: 'refreshToken' })
  public refresh_token?: string;

  public get refreshToken(): string | undefined {
    return this.refresh_token;
  }
  public set refreshToken(val: string | undefined) {
    this.refresh_token = val;
  }

  public get userId(): string {
    return (this as unknown as { _id?: { toString(): string } })._id?.toString() || '';
  }

  public async comparePassword(this: DocumentType<UserClass>, candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  public generateAccessToken(this: DocumentType<UserClass>): string {
    return jwt.sign(
      {
        id: this._id.toString(),
        userId: this._id.toString(),
        email: this.user_email,
        userEmail: this.user_email,
        role: this.user_role,
        userRole: this.user_role,
        isSuperAdmin: this.is_super_admin,
        organizationId: this.organization_id ? this.organization_id.toString() : undefined
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
