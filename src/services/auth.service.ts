import { ApiError } from "../utils/ApiError.js";
import { signAccessToken } from "../utils/jwt.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { User } from "../models/user.model.js";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  timezone: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

function toPublicUser(user: { _id: unknown; name: string; email: string; timezone: string }) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    timezone: user.timezone,
  };
}

export async function register(input: RegisterInput) {
  const email = input.email.trim().toLowerCase();
  const existing = await User.findOne({ email }).select("_id").lean();

  if (existing) {
    throw new ApiError(409, "Email đã được đăng ký");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    name: input.name.trim(),
    email,
    passwordHash,
    timezone: input.timezone,
  });

  return {
    accessToken: signAccessToken(String(user._id)),
    user: toPublicUser(user),
  };
}

export async function login(input: LoginInput) {
  const email = input.email.trim().toLowerCase();
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user || !(await comparePassword(input.password, user.passwordHash))) {
    throw new ApiError(401, "Email hoặc mật khẩu không đúng");
  }

  return {
    accessToken: signAccessToken(String(user._id)),
    user: toPublicUser(user),
  };
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId).select("name email timezone").lean();

  if (!user) {
    throw new ApiError(404, "Không tìm thấy tài khoản");
  }

  return toPublicUser(user);
}
