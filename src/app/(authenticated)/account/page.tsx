"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { getUserData } from "@/app/actions/user";
import { updateUserProfile } from "@/app/actions/account";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/kibo-ui/dropzone";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type User = Awaited<ReturnType<typeof getUserData>>;

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User>(null);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File[] | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    getUserData().then((userData) => {
      if (userData) {
        setUser(userData);
        setName(userData.name || "");
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData();
    formData.append("name", name);
    if (imageFile && imageFile[0]) {
      formData.append("image", imageFile[0]);
    }

    const result = await updateUserProfile(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      router.refresh();
    }
    setIsPending(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label>Profile Picture</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
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

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
