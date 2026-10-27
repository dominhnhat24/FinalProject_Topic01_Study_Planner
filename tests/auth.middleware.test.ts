import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../src/utils/ApiError.js";
import { requireAuth } from "../src/middleware/auth.js";
import { verifyAccessToken } from "../src/utils/jwt.js";
import { UserSession } from "../src/models/session.model.js";

vi.mock("../src/utils/jwt.js", () => ({ verifyAccessToken: vi.fn() }));
vi.mock("../src/models/session.model.js", () => ({ UserSession: { findOne: vi.fn() } }));

const userIdA = "507f1f77bcf86cd799439011";
const sessionIdA = "session-a";

type Middleware = (req: Request, res: Response, next: NextFunction) => Promise<void>;

function invoke(authorization?: string) {
  const req = { headers: { authorization } } as unknown as Request;
  const res = {} as Response;
  const next = vi.fn() as unknown as NextFunction & ReturnType<typeof vi.fn>;
  const result = (requireAuth as unknown as Middleware)(req, res, next);
  return { req, res, next, result };
}

function mockSessionQuery(value: unknown) {
  const query = {
    select: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(value),
  };
  vi.mocked(UserSession.findOne).mockReturnValue(query as never);
  return query;
}

describe("requireAuth session validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyAccessToken).mockReturnValue({ userId: userIdA, jti: sessionIdA });
    mockSessionQuery({ _id: "active-session" });
  });

  it("rejects requests without a bearer token", async () => {
    const { next, result } = invoke();
    await result;
    expect(next).toHaveBeenCalledOnce();
    expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBeInstanceOf(ApiError);
    expect(((next as ReturnType<typeof vi.fn>).mock.calls[0][0] as ApiError).statusCode).toBe(401);
    expect(UserSession.findOne).not.toHaveBeenCalled();
  });

  it("rejects malformed or expired JWTs before looking up a session", async () => {
    vi.mocked(verifyAccessToken).mockImplementation(() => { throw new Error("invalid token"); });
    const { next, result } = invoke("Bearer invalid");
    await result;
    expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0]).toMatchObject({ statusCode: 401 });
    expect(UserSession.findOne).not.toHaveBeenCalled();
  });

  it("rejects revoked, expired, or unknown server sessions", async () => {
    mockSessionQuery(null);
    const { next, result } = invoke("Bearer valid-shaped-token");
    await result;
    expect(UserSession.findOne).toHaveBeenCalledWith({
      userId: userIdA,
      jti: sessionIdA,
      revokedAt: null,
      expiresAt: { $gt: expect.any(Date) },
    });
    expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });

  it("attaches the server-verified user and session IDs for active sessions", async () => {
    const { req, next, result } = invoke("Bearer valid-shaped-token");
    await result;
    expect(next).toHaveBeenCalledWith();
    expect(req.userId).toBe(userIdA);
    expect(req.sessionId).toBe(sessionIdA);
  });

  it("passes database failures to error handling instead of mislabeling them as invalid credentials", async () => {
    const dbError = new Error("database unavailable");
    const query = { select: vi.fn().mockReturnThis(), lean: vi.fn().mockRejectedValue(dbError) };
    vi.mocked(UserSession.findOne).mockReturnValue(query as never);
    const { next, result } = invoke("Bearer valid-shaped-token");
    await result;
    expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(dbError);
  });
});
