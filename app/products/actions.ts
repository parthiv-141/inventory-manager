"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function sellOne(id: string | number) {
  const { error } = await supabase.rpc("sell_one", { p_id: id });
  if (error) redirect(`/products?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/products");
  redirect("/products");
}

export async function addProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const price = Number(formData.get("price"));
  const mrp = Number(formData.get("mrp"));
  const gst_rate = Number(formData.get("gst_rate"));
  const stock = Number(formData.get("stock"));

  if (!name || !sku || isNaN(price) || isNaN(mrp) || isNaN(gst_rate) || isNaN(stock)) return;

  const { error } = await supabase.from("products").insert({
    name,
    sku,
    selling_price: price,
    mrp,
    gst_rate,
    stock,
  });

 if (error) redirect(`/products?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/products");
  redirect("/products");
}

export async function deleteProduct(id: string | number) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) redirect(`/products?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(id: string | number, formData: FormData) {
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  if (isNaN(price) || isNaN(stock)) {
    redirect(`/products?error=${encodeURIComponent("Enter a valid price and stock")}`);
  }

  const { error } = await supabase
    .from("products")
    .update({ selling_price: price, stock })
    .eq("id", id);
  if (error) redirect(`/products?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/products");
  redirect("/products");
}