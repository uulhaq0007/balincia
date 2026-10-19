import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { param } from "@/lib/utils";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = param((await searchParams).q);
  return { title: q ? `Search: ${q}` : "Shop all perfumes" };
}

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = param(sp.q);
  return (
    <CatalogView
      title={q ? `Results for “${q}”` : "The Library"}
      description={
        q
          ? "Scents whose name, notes or family match your search."
          : "Every Balincia perfume, attar and home fragrance in one place. Filter by mood, season or note to find yours."
      }
      palette="#2b2118,#c9a27a"
      basePath="/shop"
      where={{}}
      searchParams={sp}
      defaultSort={q ? "popular" : "featured"}
    />
  );
}
