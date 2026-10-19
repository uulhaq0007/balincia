import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Notice } from "@/components/admin/Notice";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { Pill } from "@/components/admin/StatusPill";
import { readParam } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { parseImages, parsePalette, splitList } from "@/lib/utils";
import { deleteProduct, saveProduct } from "../actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id }, select: { name: true } });
  return { title: product ? `Edit ${product.name}` : "Product" };
}

export default async function EditProductPage({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { sortOrder: "asc" } },
        _count: { select: { orderItems: true, reviews: true } },
      },
    }),
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
  ]);
  if (!product) notFound();

  const hasOrders = product._count.orderItems > 0;

  return (
    <div>
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        eyebrow="Catalogue"
        title={product.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {!product.isActive && <Pill tone="stone">Inactive</Pill>}
            Added {formatDate(product.createdAt)} · {product.soldCount.toLocaleString()} sold · {product._count.reviews} reviews
          </span>
        }
      />

      {readParam(sp, "notice") === "created" && <Notice>Product created. You can keep refining it below.</Notice>}

      <ProductForm
        action={saveProduct.bind(null, product.id)}
        categories={categories}
        storeHref={`/products/${product.slug}`}
        initial={{
          name: product.name,
          slug: product.slug,
          tagline: product.tagline,
          description: product.description,
          categoryId: product.categoryId,
          gender: product.gender,
          concentration: product.concentration,
          genre: product.genre,
          topNotes: product.topNotes,
          heartNotes: product.heartNotes,
          baseNotes: product.baseNotes,
          longevity: product.longevity,
          sillage: product.sillage,
          bottleShape: product.bottleShape,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          isBestseller: product.isBestseller,
          isNew: product.isNew,
          families: splitList(product.families),
          seasons: splitList(product.seasons),
          occasions: splitList(product.occasions),
          images: parseImages(product.images),
          palette: parsePalette(product.palette),
          variants: product.variants.map((v) => ({
            id: v.id,
            label: v.label,
            sku: v.sku,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stock: v.stock,
          })),
        }}
        footer={
          <ConfirmButton
            action={deleteProduct.bind(null, product.id)}
            title={hasOrders ? "Archive this product?" : "Delete this product?"}
            description={
              hasOrders
                ? `${product.name} appears in past orders, so it will be archived — hidden from the store but kept for your records.`
                : `${product.name}, its variants and reviews will be permanently deleted. This can't be undone.`
            }
            confirmLabel={hasOrders ? "Archive" : "Delete"}
            className="btn btn-ghost btn-sm w-full text-sale hover:bg-rose-50"
          >
            <Trash2 size={14} /> {hasOrders ? "Archive product" : "Delete product"}
          </ConfirmButton>
        }
      />
    </div>
  );
}
