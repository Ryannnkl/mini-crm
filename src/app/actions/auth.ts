"use server";

import { LoginSchema, LoginSchemaType } from "@/lib/schemas/login.schema";
import { cookies } from "next/headers";
import { session as sessionTable } from "@/db/schema";
import {
  SignupSchema,
  type SignupSchemaType,
} from "@/lib/schemas/signup.schema";
import { db } from "@/db";
import { user as userTable, account as accountTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function signUp(data: SignupSchemaType) {
  const validationResult = SignupSchema.safeParse(data);

  if (!validationResult.success) {
    return { error: "Invalid data provided.", status: 400 };
  }

  const { name, email, password } = validationResult.data;

  try {
    const existingUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

    if (existingUser.length > 0) {
      return { error: "User with this email already exists.", status: 409 };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await db.transaction(async (tx) => {
      await tx.insert(userTable).values({
        id: userId,
        name: name,
        email: email,
      });

      await tx.insert(accountTable).values({
        id: uuidv4(),
        userId: userId,
        providerId: "email",
        accountId: email,
        password: hashedPassword,
      });
    });

    return { success: "User created successfully!", status: 201 };
  } catch (e) {
    console.error("Sign-up error:", e);
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function signIn(data: LoginSchemaType) {
  const validationResult = LoginSchema.safeParse(data);

  if (!validationResult.success) {
    return { error: "Invalid data provided.", status: 400 };
  }

  const { email, password } = validationResult.data;

  try {
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);

    if (!user[0]) {
      return { error: "Invalid email or password.", status: 401 };
    }

    const account = await db
      .select()
      .from(accountTable)
      .where(eq(accountTable.userId, user[0].id))
      .limit(1);

    if (!account[0].password) {
      return { error: "Invalid email or password.", status: 401 };
    }

    const isPasswordValid = await bcrypt.compare(password, account[0].password);

    if (!isPasswordValid) {
      return { error: "Invalid email or password.", status: 401 };
    }

    const sessionToken = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.insert(sessionTable).values({
      id: uuidv4(),
      token: sessionToken,
      userId: user[0].id,
      expiresAt: expiresAt,
    });

    const cookieStore = await cookies();
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
    });

    return { success: "Logged in successfully!", status: 200 };
  } catch (e) {
    console.error("Sign-in error:", e);
    return { error: "An unexpected error occurred.", status: 500 };
  }
}
