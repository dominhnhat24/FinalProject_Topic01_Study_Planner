import { beforeEach, describe, expect, it, vi } from "vitest";
import { logout } from "../src/services/auth.service.js";
import { UserSession } from "../src/models/session.model.js";

vi.mock("../src/models/user.model.js", () => ({ User: {} }));
vi.mock("../src/models/session.model.js", () => ({ UserSession: { updateOne: vi.fn() } }));
vi.mock("../src/utils/jwt.js", () => ({ signAccessToken: vi.fn() }));
vi.mock("../src/utils/password.js", () => ({ comparePassword: vi.fn(), hashPassword: vi.fn() }));

const userId = "507f1f77bcf86cd799439011";
const jti = "session-logout-test";

describe("auth service logout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("revokes only the calling user's current session", async () => {
    vi.mocked(UserSession.updateOne).mockResolvedValue({ matchedCount: 1 } as never);
    await expect(logout(userId, jti)).resolves.toEqual({ revoked: true });
    expect(UserSession.updateOne).toHaveBeenCalledWith(
      { userId, jti, revokedAt: null },
      { $set: { revokedAt: expect.any(Date) } },
    );
  });

  it("does not report successful revocation when that session is not found", async () => {
    vi.mocked(UserSession.updateOne).mockResolvedValue({ matchedCount: 0 } as never);
    await expect(logout(userId, jti)).rejects.toMatchObject({ statusCode: 401 });
  });
});
