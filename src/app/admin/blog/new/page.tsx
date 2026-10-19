import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm } from "@/components/admin/PostForm";
import { savePost } from "../actions";

export const metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <div>
      <PageHeader back={{ href: "/admin/blog", label: "Journal" }} eyebrow="Content" title="New post" />
      <PostForm action={savePost.bind(null, null)} />
    </div>
  );
}
