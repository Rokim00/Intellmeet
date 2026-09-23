import { prop, getModelForClass, DocumentType, modelOptions, Severity, Ref } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { UserClass } from './user.model.js';
import { OrganizationClass } from './organization.model.js';
import { ProjectStatus } from '../types/index.js';

@modelOptions({
  schemaOptions: {
    collection: 'projects',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        return {
          projectId: (ret._id as { toString(): string })?.toString(),
          projectName: ret.project_name as string,
          projectCode: (ret.project_code ?? '') as string,
          projectDescription: (ret.project_description ?? '') as string,
          projectStatus: ret.project_status as string,
          organizationId: ret.organization_id,
          hosts: (ret.project_hosts as string[]) || [],
          members: (ret.project_members as string[]) || [],
          createdBy: ret.created_by,
          createdAt: ret.created_at,
          updatedAt: ret.updated_at
        };
      }
    },
    toObject: { virtuals: true }
  },
  options: { allowMixed: Severity.ALLOW }
})
export class ProjectClass {
  @prop({
    type: () => String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [2, 'Project name must be at least 2 characters'],
    alias: 'projectName'
  })
  public project_name!: string;

  public get projectName(): string {
    return this.project_name;
  }
  public set projectName(val: string) {
    this.project_name = val;
  }

  @prop({ type: () => String, default: '', index: true, alias: 'projectCode' })
  public project_code?: string;

  public get projectCode(): string | undefined {
    return this.project_code;
  }
  public set projectCode(val: string | undefined) {
    this.project_code = val;
  }

  @prop({ type: () => String, default: '', alias: 'projectDescription' })
  public project_description?: string;

  public get projectDescription(): string | undefined {
    return this.project_description;
  }
  public set projectDescription(val: string | undefined) {
    this.project_description = val;
  }

  @prop({ ref: () => 'OrganizationClass', required: true, index: true, alias: 'organizationId' })
  public organization_id!: Ref<OrganizationClass>;

  public get organizationId(): Ref<OrganizationClass> {
    return this.organization_id;
  }
  public set organizationId(val: Ref<OrganizationClass>) {
    this.organization_id = val;
  }

  @prop({
    type: () => String,
    enum: ['active', 'archived', 'completed'],
    default: 'active',
    alias: 'projectStatus'
  })
  public project_status!: ProjectStatus;

  public get projectStatus(): ProjectStatus {
    return this.project_status;
  }
  public set projectStatus(val: ProjectStatus) {
    this.project_status = val;
  }

  @prop({ ref: () => UserClass, type: () => [Types.ObjectId], default: [], alias: 'hosts' })
  public project_hosts!: Ref<UserClass>[];

  public get hosts(): Ref<UserClass>[] {
    return this.project_hosts;
  }
  public set hosts(val: Ref<UserClass>[]) {
    this.project_hosts = val;
  }

  public get projectHosts(): Ref<UserClass>[] {
    return this.project_hosts;
  }
  public set projectHosts(val: Ref<UserClass>[]) {
    this.project_hosts = val;
  }

  @prop({ ref: () => UserClass, type: () => [Types.ObjectId], default: [], alias: 'members' })
  public project_members!: Ref<UserClass>[];

  public get members(): Ref<UserClass>[] {
    return this.project_members;
  }
  public set members(val: Ref<UserClass>[]) {
    this.project_members = val;
  }

  public get projectMembers(): Ref<UserClass>[] {
    return this.project_members;
  }
  public set projectMembers(val: Ref<UserClass>[]) {
    this.project_members = val;
  }

  @prop({ ref: () => UserClass, required: true, alias: 'createdBy' })
  public created_by!: Ref<UserClass>;

  public get createdBy(): Ref<UserClass> {
    return this.created_by;
  }
  public set createdBy(val: Ref<UserClass>) {
    this.created_by = val;
  }

  public get projectId(): string {
    return (this as unknown as { _id?: { toString(): string } })._id?.toString() || '';
  }
}

export type ProjectDocument = DocumentType<ProjectClass>;
export const Project = getModelForClass(ProjectClass);
