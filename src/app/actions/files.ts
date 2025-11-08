"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config();

export async function uploadFile(file: File, userId: string) {
  const bytes = await file.arrayBuffer();
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

  return uploadResult.secure_url;
}
