import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../../config/config";
import prisma from "../../utils/prisma";
import { AppError } from "../../utils/appError";
import { JwtPayload } from "../../middleware/auth";

export class AuthService {
  static async register(data: { email: string; password: string; name: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(409, "CONFLICT", "Email address is already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return { user, tokens };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid email or password");
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };

    return { user: userResponse, tokens };
  }

  static async refreshToken(token: string) {
    if (!token) {
      throw new AppError(401, "UNAUTHORIZED", "Refresh token missing");
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload;
    } catch (error) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid or expired refresh token");
    }

    const savedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!savedToken || savedToken.revoked || savedToken.expiresAt < new Date()) {
      throw new AppError(401, "UNAUTHORIZED", "Refresh token revoked or expired");
    }

    const newAccessToken = jwt.sign(
      { userId: savedToken.user.id, email: savedToken.user.email, role: savedToken.user.role },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return { accessToken: newAccessToken };
  }

  static async logout(token: string) {
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { revoked: true },
      });
    }
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, "NOT_FOUND", "User not found");
    }

    return user;
  }

  private static async generateTokens(userId: string, email: string, role: string) {
    const accessToken = jwt.sign({ userId, email, role }, config.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      { userId, email, role, jti: crypto.randomUUID() },
      config.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}