import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog/CatalogView";
import { resolveCollection } from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = await resolveCollection((await params).slug);
  if (!collection) return { title: "Collection not found" };
  return { title: collection.name, description: collection.description };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const collection = await resolveCollection(slug);
  if (!collection) notFound();

  return (
    <CatalogView
      title={collection.name}
      description={collection.description}
      palette={collection.palette}
      basePath={`/collections/${slug}`}
      where={collection.where}
      searchParams={sp}
      defaultSort={collection.defaultSort}
      hideFilters={slug === "men" || slug === "women" || slug === "unisex" ? ["gender"] : undefined}
      crumbs={[{ label: "Shop", href: "/shop" }]}
    />
  );
}
