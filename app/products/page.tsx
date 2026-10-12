import { Suspense } from "react";
import { connection } from "next/server";
import { supabase } from "@/lib/supabase";
import { sellOne, addProduct, deleteProduct, updateProduct } from "./actions";


async function SalesList() {
  await connection();
  const { data, error } = await supabase
    .from("sales")
    .select("id, product_name, price_at_sale, sold_at")
    .order("sold_at", { ascending: false })
    .limit(10);
  if (error) return <p>Error: {error.message}</p>;
  return (
    <ul className="space-y-1">
      {data.map((s) => (
        <li key={s.id}>
          {s.product_name} - ₹{s.price_at_sale} -{" "}
          {new Date(s.sold_at).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })}
        </li>
      ))}
    </ul>
  );
}
async function ProductList() {
  await connection();
  const { data, error } = await supabase.from("products").select("*");
  if (error) return <p>Error: {error.message}</p>;
  return (
    <ul className="space-y-3">
      {data.map((p) => (
        <li key={p.id}>
          {p.name} ({p.sku}) - ₹{p.selling_price} (MRP ₹{p.mrp}) - GST{" "}
          {p.gst_rate}% - Stock: {p.stock}
          <form action={sellOne.bind(null, p.id)} className="inline ml-3">
            <button
              disabled={p.stock <= 0}
              className="rounded border px-2 py-1 disabled:opacity-40"
            >
              Sell 1
            </button>
          </form>
          <form action={deleteProduct.bind(null, p.id)} className="inline ml-2">
  <button className="rounded border border-red-500 text-red-500 px-2 py-1">
    Delete
  </button>
  </form>
<form action={updateProduct.bind(null, p.id)} className="inline ml-3">
  <input
    name="price"
    type="number"
    step="0.01"
    defaultValue={p.selling_price}
    className="w-28 rounded border px-2 py-1 bg-transparent"
  />
  <input
    name="stock"
    type="number"
    defaultValue={p.stock}
    className="w-20 ml-1 rounded border px-2 py-1 bg-transparent"
  />
  <button className="ml-1 rounded border px-2 py-1">Update</button>
</form>
        </li>
      ))}
    </ul>
  );
}
async function ErrorMessage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!error) return null;
  return (
    <p className="mb-4 rounded border border-red-500 px-3 py-2 text-red-500">
      {error}
    </p>
  );
}
export default function Products({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <Suspense>
  <ErrorMessage searchParams={searchParams} />
</Suspense>

      <form action={addProduct} className="flex flex-wrap gap-2 mb-6">
        <input
          name="name"
          placeholder="Name"
          required
          className="rounded border px-2 py-1 bg-transparent"
        />
        <input
          name="sku"
          placeholder="SKU"
          required
          className="rounded border px-2 py-1 bg-transparent"
        />
        <input
          name="price"
          type="number"
          step="0.01"
          placeholder="Price"
          required
          className="rounded border px-2 py-1 bg-transparent"
        />
        <input
          name="mrp"
          type="number"
          step="0.01"
          placeholder="MRP"
          required
          className="rounded border px-2 py-1 bg-transparent"
        />
        <select
          name="gst_rate"
          required
          defaultValue="18"
          className="rounded border px-2 py-1 bg-black"
        >
          <option value="0">GST 0%</option>
          <option value="5">GST 5%</option>
          <option value="12">GST 12%</option>
          <option value="18">GST 18%</option>
          <option value="28">GST 28%</option>
        </select>
        <input
          name="stock"
          type="number"
          placeholder="Stock"
          required
          className="rounded border px-2 py-1 bg-transparent"
        />
        <button className="rounded border px-3 py-1">Add product</button>
      </form>

      <Suspense fallback={<p>Loading...</p>}>
        <ProductList />
      </Suspense>
      <h2 className="mt-8 mb-2 text-lg font-semibold">Recent sales</h2>
<Suspense fallback={<p>Loading...</p>}>
  <SalesList />
</Suspense>
    </main>
  );
}