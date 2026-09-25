import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { Organization } from '../models/organization.model.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';
import { generateOrgInviteCode } from '../utils/codeGenerator.js';
import { validateRequired } from '../utils/validation.js';
import {
  IUserRegisterInput,
  IUserLoginInput,
  IAuthTokensResponse
} from '../types/index.js';

export const registerUserService = async (input: IUserRegisterInput): Promise<IAuthTokensResponse> => {
  validateRequired(input, ['userName', 'userEmail', 'password']);

  const userName = input.userName.trim();
  const userEmail = input.userEmail.toLowerCase().trim();
  const password = input.password;

  const existingUser = await User.findOne({ user_email: userEmail });
  if (existingUser) {
    throw ApiError.badRequest('User with this email already exists', [
      { field: 'userEmail', message: 'User with this email already exists' }
    ]);
  }

  const isCreatingOrg = Boolean(input.isCreatingOrg);
  const avatarUrl = input.avatarUrl || '';

  let assignedOrgId: string | undefined;

  if (isCreatingOrg) {
    // ── CASE 1: Toggle = TRUE (Creating Organization -> SuperAdmin) ──
    const orgName = (input.organizationName || '').trim();
    if (!orgName) {
      throw ApiError.badRequest('Organization name is required when creating an organization', [
        { field: 'organizationName', message: 'Organization name is required' }
      ]);
    }

    const baseSlug = (input.organizationSlug || orgName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-');

    let finalSlug = baseSlug;
    const existingOrg = await Organization.findOne({ organization_slug: finalSlug });
    if (existingOrg) {
      finalSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const generatedInvite = generateOrgInviteCode(finalSlug);

    // 1. Create User as SuperAdmin
    const user = new User({
      user_name: userName,
      user_email: userEmail,
      password,
      user_role: 'SuperAdmin',
      is_super_admin: true,
      avatar_url: avatarUrl
    });

    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    // 2. Create Organization with user as owner
    const newOrg = await Organization.create({
      organization_name: orgName,
      organization_slug: finalSlug,
      organization_location: input.organizationLocation ? input.organizationLocation.trim() : '',
      organization_invite_code: generatedInvite,
      organization_owner_id: user._id
    });

    // 3. Link organization to user
    user.organization_id = newOrg._id;
    await user.save();

    // 4. Generate accessToken with organizationId included in the payload
    const accessToken = user.generateAccessToken();

    const populatedUser = await User.findById(user._id).populate(
      'organization_id',
      'organization_name organization_slug organization_location organization_description organization_invite_code revoked_invite_codes organization_owner_id created_at updated_at'
    );

    return {
      user: populatedUser!.toJSON() as unknown as IAuthTokensResponse['user'],
      accessToken
    };
  }

  // ── CASE 2: Toggle = FALSE (Joining via Invite Code -> Member) ──
  const inviteCode = (input.inviteCode || '').trim().toUpperCase();
  if (inviteCode) {
    // Check if code was previously revoked
    const revokedOrg = await Organization.findOne({ revoked_invite_codes: inviteCode });
    if (revokedOrg) {
      throw ApiError.badRequest('This invite code has been revoked. Please request an updated invite code from your SuperAdmin.', [
        { field: 'inviteCode', message: 'Invite code is revoked' }
      ]);
    }

    const org = await Organization.findOne({ organization_invite_code: inviteCode });
    if (!org) {
      throw ApiError.badRequest('Invalid invite code. Organization not found.', [
        { field: 'inviteCode', message: 'Invalid invite code. Please check with your SuperAdmin.' }
      ]);
    }
    assignedOrgId = org._id.toString();
  }

  const user = new User({
    user_name: userName,
    user_email: userEmail,
    password,
    user_role: 'Member',
    is_super_admin: false,
    organization_id: assignedOrgId,
    avatar_url: avatarUrl
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  const populatedUser = await User.findById(user._id).populate(
    'organization_id',
    'organization_name organization_slug organization_location organization_description organization_invite_code revoked_invite_codes organization_owner_id created_at updated_at'
  );

  return {
    user: populatedUser!.toJSON() as unknown as IAuthTokensResponse['user'],
    accessToken
  };
};

export const loginUserService = async (input: IUserLoginInput): Promise<IAuthTokensResponse & { refreshToken: string }> => {
  validateRequired(input, ['userEmail', 'password']);

  const userEmail = input.userEmail.toLowerCase().trim();
  const { password } = input;

  const user = await User.findOne({ user_email: userEmail }).select('+password +refreshToken');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  const populatedUser = await User.findById(user._id).populate(
    'organization_id',
    'organization_name organization_slug organization_location organization_description organization_invite_code revoked_invite_codes organization_owner_id created_at updated_at'
  );

  return {
    user: populatedUser!.toJSON() as unknown as IAuthTokensResponse['user'],
    accessToken,
    refreshToken
  };
};

export const refreshAccessTokenService = async (incomingRefreshToken: string): Promise<{ accessToken: string; newRefreshToken: string }> => {
  if (!incomingRefreshToken) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  let decoded: { id: string };
  try {
    decoded = jwt.verify(incomingRefreshToken, env.JWT_REFRESH_SECRET) as { id: string };
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    newRefreshToken
  };
};

export const logoutUserService = async (userId: string): Promise<void> => {
  if (userId) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }
};

export const getCurrentUserService = async (userId: string): Promise<IAuthTokensResponse['user']> => {
  const user = await User.findById(userId).populate(
    'organization_id',
    'organization_name organization_slug organization_location organization_description organization_invite_code revoked_invite_codes organization_owner_id created_at updated_at'
  );
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user.toJSON() as unknown as IAuthTokensResponse['user'];
};
