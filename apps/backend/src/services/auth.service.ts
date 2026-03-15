import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import * as userRepo from "../repositories/user.repository.js";

const SALT_ROUNDS = 12;

export async function signup(name: string, email: string, password: string) {
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepo.create({ name, email, passwordHash });
  const token = generateToken(user.id);

  return { user, token };
}

export async function login(email: string, password: string) {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(user.id);
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, token };
}

export async function getMe(userId: string) {
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

function generateToken(userId: string) {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/** Typed application error with HTTP status code */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}
