"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkbox, formToObject, hexColor, isUniqueViolation, type ActionState } from "@/lib/admin";
import { slugify } from "@/lib/utils";
import { firstError } from "@/lib/validators";

const postSchema = z.object({
  title: z.string().trim().min(3, "Give the post a title").max(160),
  slug: z.string().trim().max(160).default(""),
  excerpt: z.string().trim().max(400).default(""),
  content: z.string().trim().min(20, "Write at least a few sentences").max(50_000),
  palette: z
    .string()
    .transform((v) => v.split(","))
    .pipe(z.tuple([hexColor, hexColor])),
  author: z.string().trim().min(2, "Add an author name").max(80),
  published: checkbox,
});

export async function savePost(postId: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = postSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const input = parsed.data;

  const slug = slugify(input.slug || input.title);
  if (!slug) return { error: "Enter a slug using letters or numbers." };
  const owner = await db.post.findUnique({ where: { slug }, select: { id: true, title: true } });
  if (owner && owner.id !== postId) return { error: `The slug “${slug}” is already used by “${owner.title}”.` };

  const data = { ...input, slug, palette: input.palette.join(",") };
  let id = postId;
  try {
    if (postId) await db.post.update({ where: { id: postId }, data });
    else id = (await db.post.create({ data, select: { id: true } })).id;
  } catch (error) {
    if (isUniqueViolation(error)) return { error: "That slug is already in use." };
    throw error;
  }

  revalidatePath("/", "layout");
  if (!postId) redirect(`/admin/blog/${id}?notice=created`);
  return { ok: true, message: input.published ? "Post saved and live." : "Draft saved." };
}

export async function setPostPublished(postId: string, published: boolean) {
  await requireAdmin();
  if (typeof published !== "boolean") return;
  await db.post.update({ where: { id: postId }, data: { published } });
  revalidatePath("/", "layout");
}

export async function deletePost(postId: string): Promise<ActionState> {
  await requireAdmin();
  await db.post.deleteMany({ where: { id: postId } });
  revalidatePath("/", "layout");
  redirect("/admin/blog?notice=deleted");
}
