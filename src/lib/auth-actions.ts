import { PrismaClient } from '@prisma/client';
import { verify } from '@node-rs/argon2';
import { cookies } from 'next/headers';
import { lucia, validateRequest } from './auth';
import { redirect } from 'next/navigation';
import { hash } from '@node-rs/argon2';
import { generateId } from 'lucia';
import type { ActionResult } from '@/lib/form';

const prisma = new PrismaClient();

export async function login(_: any, formData: FormData): Promise<ActionResult> {
    "use server";
    const username = formData.get("username");
    if (
        typeof username !== "string" ||
        username.length < 3 ||
        username.length > 31 ||
        !/^[a-z0-9_-]+$/.test(username)
    ) {
        return {
            error: "Invalid username"
        };
    }
    const password = formData.get("password");
    if (typeof password !== "string" || password.length < 6 || password.length > 255) {
        return {
            error: "Invalid password"
        };
    }

    const existingUser = await prisma.user.findUnique({
        where: { username }
    });
    if (!existingUser) {
        return {
            error: "Incorrect username or password"
        };
    }

    const validPassword = await verify(existingUser.hashed_password, password);
    if (!validPassword) {
        return {
            error: "Incorrect username or password"
        };
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return redirect("/");

}

export async function signup(_: any, formData: FormData): Promise<ActionResult> {
    "use server";
    const username = formData.get("username");
    if (
        typeof username !== "string" ||
        username.length < 3 ||
        username.length > 31 ||
        !/^[a-z0-9_-]+$/.test(username)
    ) {
        return {
            error: "Invalid username"
        };
    }
    const password = formData.get("password");
    if (typeof password !== "string" || password.length < 6 || password.length > 255) {
        return {
            error: "Invalid password"
        };
    }

    const passwordHash = await hash(password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });

    try {
        const newUser = await prisma.user.create({
            data: {
                id: generateId(20),
                username,
                hashed_password: passwordHash
            }
        });

        const session = await lucia.createSession(newUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        return redirect("/");
    } catch (e) {
        if (e instanceof Error && e.message.includes("Unique constraint failed")) {
            return {
                error: "Username already used"
            };
        }
        return {
            error: "An unknown error occurred"
        };
    }

}

export async function logout(): Promise<ActionResult> {
    "use server";
    const { session } = await validateRequest();
    if (!session) {
      return {
        error: "Unauthorized"
      };
    }
  
    await lucia.invalidateSession(session.id);
  
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return redirect("/login");
  }


  export async function getAuthenticatedUser() {
    const { user } = await validateRequest();
    if (!user) {
      return null;
    }
    return user;
  }

