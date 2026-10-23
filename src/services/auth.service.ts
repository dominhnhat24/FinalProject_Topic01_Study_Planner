import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccessToken } from "../utils/jwt";

export async function register(input: {
  name: string; email: string; password: string; timezone?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const existing = await User.findOne({ email }).lean();
  if (existing) throw new ApiError(409, "Email đã được sử dụng");

  const user = await User.create({
    name: input.name,
    email,
    passwordHash: await hashPassword(input.password),
    timezone: input.timezone ?? "Asia/Ho_Chi_Minh",
  });

  return {
    user: { id: user.id, name: user.name, email: user.email, timezone: user.timezone },
    token: signAccessToken(user.id),
  };
}

export async function login(input: { email: string; password: string }) {
  const user = await User.findOne({ email: input.email.trim().toLowerCase() }).select("+passwordHash");
  if (!user || !(await comparePassword(input.password, user.passwordHash))) {
    throw new ApiError(401, "Email hoặc mật khẩu không chính xác");
  }

  return {
    user: { id: user.id, name: user.name, email: user.email, timezone: user.timezone },
    token: signAccessToken(user.id),
  };
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId).select("name email timezone createdAt updatedAt").lean();
  if (!user) throw new ApiError(404, "Không tìm thấy tài khoản");
  return user;
}
