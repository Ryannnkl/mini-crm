"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/kibo-ui/dropzone";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import type { User } from "better-auth";
import { uploadFile } from "@/app/actions/files";
import { authClient } from "@/lib/auth-client";

export function AccountForm({ user }: { user: User }) {
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [imageFile, setImageFile] = useState<File[] | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData();
    formData.append("name", name);
    if (imageFile && imageFile[0]) {
      formData.append("image", imageFile[0]);
    }

    const image = imageFile
      ? await uploadFile(imageFile[0], user.id)
      : undefined;
    const result = await authClient.updateUser({
      name,
      image,
    });

    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success("User updated successfully!");
      router.refresh();
    }
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label>Profile Picture</Label>
        <div className="flex flex-col items-center gap-4">
          <Avatar className="size-36">
            <AvatarImage
              src={
                imageFile?.[0]
                  ? URL.createObjectURL(imageFile[0])
                  : user?.image || undefined
              }
            />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Dropzone
            className="flex-1"
            accept={{ "image/*": [] }}
            maxFiles={1}
            src={imageFile ?? undefined}
            onDrop={setImageFile}
          >
            {imageFile ? <DropzoneContent /> : <DropzoneEmptyState />}
          </Dropzone>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? <Spinner /> : "Save Changes"}
      </Button>
    </form>
  );
}
