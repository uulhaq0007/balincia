import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { db } from "@/lib/db";
import { saveProduct } from "../actions";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        eyebrow="Catalogue"
        title="New product"
        description="Add a fragrance with its variants, scent profile and imagery."
      />
      <ProductForm action={saveProduct.bind(null, null)} categories={categories} />
    </div>
  );
}
