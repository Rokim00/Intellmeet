import { prop, getModelForClass, DocumentType, modelOptions, Severity, Ref } from '@typegoose/typegoose';
import { UserClass } from './user.model.js';

@modelOptions({
  schemaOptions: {
    collection: 'organizations',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        return {
          organizationId: (ret._id as { toString(): string })?.toString(),
          organizationName: ret.organization_name as string,
          organizationSlug: ret.organization_slug as string,
          organizationLocation: (ret.organization_location ?? '') as string,
          organizationDescription: (ret.organization_description ?? '') as string,
          inviteCode: ret.organization_invite_code as string,
          revokedInviteCodes: (ret.revoked_invite_codes as string[]) || [],
          ownerId: ret.organization_owner_id,
          createdAt: ret.created_at,
          updatedAt: ret.updated_at
        };
      }
    },
    toObject: { virtuals: true }
  },
  options: { allowMixed: Severity.ALLOW }
})
export class OrganizationClass {
  @prop({
    type: () => String,
    required: [true, 'Organization name is required'],
    trim: true,
    minlength: [2, 'Organization name must be at least 2 characters'],
    alias: 'organizationName'
  })
  public organization_name!: string;

  public get organizationName(): string {
    return this.organization_name;
  }
  public set organizationName(val: string) {
    this.organization_name = val;
  }

  @prop({
    type: () => String,
    required: [true, 'Organization slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    alias: 'organizationSlug'
  })
  public organization_slug!: string;

  public get organizationSlug(): string {
    return this.organization_slug;
  }
  public set organizationSlug(val: string) {
    this.organization_slug = val;
  }

  @prop({ type: () => String, default: '', alias: 'organizationLocation' })
  public organization_location?: string;

  public get organizationLocation(): string | undefined {
    return this.organization_location;
  }
  public set organizationLocation(val: string | undefined) {
    this.organization_location = val;
  }

  @prop({ type: () => String, default: '', alias: 'organizationDescription' })
  public organization_description?: string;

  public get organizationDescription(): string | undefined {
    return this.organization_description;
  }
  public set organizationDescription(val: string | undefined) {
    this.organization_description = val;
  }

  @prop({
    type: () => String,
    required: [true, 'Invite code is required'],
    unique: true,
    index: true,
    alias: 'inviteCode'
  })
  public organization_invite_code!: string;

  public get inviteCode(): string {
    return this.organization_invite_code;
  }
  public set inviteCode(val: string) {
    this.organization_invite_code = val;
  }

  @prop({
    type: () => [String],
    default: [],
    alias: 'revokedInviteCodes'
  })
  public revoked_invite_codes!: string[];

  public get revokedInviteCodes(): string[] {
    return this.revoked_invite_codes;
  }
  public set revokedInviteCodes(val: string[]) {
    this.revoked_invite_codes = val;
  }

  @prop({ ref: () => 'UserClass', required: true, alias: 'ownerId' })
  public organization_owner_id!: Ref<UserClass>;

  public get ownerId(): Ref<UserClass> {
    return this.organization_owner_id;
  }
  public set ownerId(val: Ref<UserClass>) {
    this.organization_owner_id = val;
  }

  public get organizationId(): string {
    return (this as unknown as { _id?: { toString(): string } })._id?.toString() || '';
  }
}

export type OrganizationDocument = DocumentType<OrganizationClass>;
export const Organization = getModelForClass(OrganizationClass);
