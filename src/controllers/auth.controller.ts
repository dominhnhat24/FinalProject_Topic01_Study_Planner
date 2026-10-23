import type { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result });
}

export async function me(req: Request, res: Response) {
  const user = await authService.getCurrentUser(req.userId!);
  res.json({ success: true, data: user });
}

export async function logout(_req: Request, res: Response) {
  // JWT is stateless: client must remove token from SecureStore.
  res.json({ success: true, message: "Đã đăng xuất ở phía ứng dụng. Hãy xóa token cục bộ." });
}
