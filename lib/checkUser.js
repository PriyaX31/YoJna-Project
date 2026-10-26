import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export const checkUser = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return null;
    }
    // 1. Check if user already exists in the database by Clerk ID
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const email = user.emailAddresses?.[0]?.emailAddress || "";

    // 2. Check if user already exists by email (to avoid duplicate email error)
    if (email) {
      const existingUserByEmail = await db.user.findUnique({
        where: {
          email,
        },
      });

      if (existingUserByEmail) {
        const updatedUser = await db.user.update({
          where: {
            email,
          },
          data: {
            clerkUserId: user.id,
            imageUrl: user.imageUrl || existingUserByEmail.imageUrl,
          },
        });
        return updatedUser;
      }
    }

    // 3. Otherwise, create a new user record in the database
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name: name || user.username || "User",
        imageUrl: user.imageUrl || null,
        email,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error);
    return null;
  }
};

export default checkUser;
