"use server";

import { v2 as cloudinary } from "cloudinary";
import { cookies } from "next/headers";
import { db } from "@/db";
import { user as userTable, session as sessionTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

cloudinary.config();

export async function updateUserProfile(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    if (!sessionToken) return { error: "Unauthorized" };

    const [session] = await db
      .select({ userId: sessionTable.userId })
      .from(sessionTable)
      .where(eq(sessionTable.token, sessionToken));
    if (!session) return { error: "Unauthorized" };

    const userId = session.userId;

    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File | null;

    let imageUrl: string | undefined = undefined;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "avatars",
                public_id: userId,
                overwrite: true,
              },
              (error, result) => {
                if (error) {
                  reject(error);
                  return;
                }
                if (!result) {
                  reject(new Error("Upload failed: No result from Cloudinary"));
                  return;
                }
                resolve(result);
              }
            )
            .end(buffer);
        }
      );

      imageUrl = uploadResult.secure_url;
    }

    const updateData: { name?: string; image?: string } = {};
    if (name) updateData.name = name;
    if (imageUrl) updateData.image = imageUrl;

    if (Object.keys(updateData).length > 0) {
      await db
        .update(userTable)
        .set(updateData)
        .where(eq(userTable.id, userId));
    }

    revalidatePath("/account");
    revalidatePath("/");
    revalidateTag("user-data-by-token", "max");
    return { success: "Profile updated successfully!" };
  } catch (e) {
    console.error("Update profile error:", e);
    return { error: "An unexpected error occurred." };
  }
}
