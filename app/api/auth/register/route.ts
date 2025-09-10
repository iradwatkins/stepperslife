import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists in Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in Prisma (for Auth.js)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
      },
    });

    // Create user in Convex (for app data)
    const convex = getConvexClient();
    try {
      await convex.mutation(api.users.createUser, {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name || email.split("@")[0],
        passwordHash, // Store the hash in Convex too for consistency
      });
    } catch (convexError) {
      console.error("Failed to create user in Convex:", convexError);
      // Continue anyway - user can still sign in with Prisma auth
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}