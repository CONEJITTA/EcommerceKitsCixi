"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function CreateProductForm({ categories, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    // Subida a Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "cixi_products"); // reemplaza con tu preset
    const res = await fetch("https://api.cloudinary.com/v1_1/doh7f2dbo/image/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setUploadedImageUrl(data.secure_url);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = {
        name: name.trim(),
        description: description.trim() || null,
        price: price === "" ? null : Number(price),
        stock: stock === "" ? 0 : Number(stock),
        categoryId: categoryId !== "" ? Number(categoryId) : null,
        image: uploadedImageUrl,
      };
      console.log("Body a enviar:", body);

      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      // Resetear formulario
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setCategoryId("");
      setImageFile(null);
      setImagePreview(null);
      setUploadedImageUrl(null);

      await onCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-4 space-y-3">
      <h3 className="text-slate-900 font-semibold text-lg">Crear producto</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          className="input-base"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="input-base"
        >
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Precio"
          className="input-base"
        />
        <input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Cantidad"
          className="input-base"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full input-base"
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Vista previa"
            className="w-32 h-32 object-cover rounded shadow mt-2"
          />
        )}
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción"
        rows={3}
        className="w-full input-base"
      />

      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
      >
        {loading ? "Creando..." : "Crear"}
      </button>
    </form>
  );
}

function ProductRow({ p, onChanged, isAdmin }) {
  const [price, setPrice] = useState(p.price ?? 0);
  const [stock, setStock] = useState(p.stock ?? 0);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await fetch(`/api/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: Number(price), stock: Number(stock) }),
      });
      await onChanged();
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return;
    setLoading(true);
    try {
      await fetch(`/api/products/${p.id}`, { method: "DELETE" });
      await onChanged();
    } finally {
      setLoading(false);
    }
  };

  return (
  <li className="card p-4 flex flex-col md:flex-row justify-between text-slate-900">
      <div className="flex-1 space-y-1">
        {p.image && (
          <img
            src={p.image}
            alt={p.name}
            className="w-32 h-32 object-cover rounded shadow mb-2"
          />
        )}

        <div className="font-semibold text-[#623645] text-lg">{p.name}</div>
        <div className="text-xs">{p.category ? `Categoría: ${p.category.name}` : "Sin categoría"}</div>
        <div className="text-xs">{p.description || "Sin descripción"}</div>
        <div className="text-xs">Precio actual: {p.price != null ? `$${p.price}` : "—"}</div>
        <div className="text-xs">Stock: {p.stock != null ? p.stock : 0}</div>
      </div>

      {isAdmin && (
        <div className="mt-3 md:mt-0 flex items-center gap-3">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="input-base"
          />
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            placeholder="Cantidad"
            className="input-base"
          />
          <button
            onClick={save}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <button
            onClick={remove}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      )}
    </li>
  );
}

export default function PricingPage() {
  const { data: session } = useSession();

  useEffect(() => {
    console.log("Sesión frontend:", session);
  }, [session]);
  const isAdmin = session?.user?.role === "admin";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  async function loadProducts() {
    const res = await fetch("/api/products", { cache: "no-store" });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  }

  async function loadCategories() {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  }

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Filtrar productos por categoría y por término de búsqueda (nombre, descripción o categoría)
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredByCategory = selectedCategoryId
    ? products.filter((p) => p.categoryId === selectedCategoryId)
    : products;

  const filteredProducts = filteredByCategory.filter((p) => {
    if (!normalizedSearch) return true;
    const name = (p.name || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    const cat = (p.category?.name || "").toLowerCase();
    return (
      name.includes(normalizedSearch) ||
      desc.includes(normalizedSearch) ||
      cat.includes(normalizedSearch)
    );
  });

  return (
  <div className="min-h-screen bg-white">

      {/* Buscador (pequeño) + Botón Categorías fuera del navbar */}
  <div className="flex items-center justify-end gap-3 pt-10 px-6">
        {/* Buscador pequeño, visible para todos */}
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar productos..."
          className="w-56 input-base"
        />
        {/* Categorías button + dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="rounded px-4 py-1 text-xs font-semibold shadow-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            aria-haspopup="listbox"
            aria-expanded={showCategories}
          >
            <span>Categorías</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={`h-3 w-3 transition-transform duration-200 ${showCategories ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {showCategories && (
            <ul className="absolute right-0 mt-1 bg-white border border-slate-200 rounded shadow-md max-h-48 overflow-auto w-48 text-slate-700 text-xs z-50">
              <li
                onClick={() => {
                  setSelectedCategoryId(null);
                  setShowCategories(false);
                }}
                className={`px-4 py-1 cursor-pointer hover-accent ${
                  selectedCategoryId === null ? "is-active-accent" : ""
                }`}
              >
                Ver todos
              </li>
              {categories.length === 0 ? (
                <li className="px-4 py-1 text-center">No hay categorías</li>
              ) : (
                categories.map((cat) => (
                  <li
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setShowCategories(false);
                    }}
                    className={`px-4 py-1 cursor-pointer hover-accent ${
                      selectedCategoryId === cat.id ? "is-active-accent" : ""
                    }`}
                  >
                    {cat.name}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="flex justify-center pt-10 px-4">
        <div className="w-3/5 space-y-6">
          <h2 className="text-3xl text-slate-900 font-bold text-center">Productos</h2>

          {isAdmin && <CreateProductForm categories={categories} onCreated={loadProducts} />}

          {filteredProducts.length === 0 ? (
            <p className="text-xs text-slate-200 text-center mt-2">No hay productos disponibles.</p>
          ) : (
            <ul className="space-y-3">
              {filteredProducts.map((p) => (
                <ProductRow key={p.id} p={p} onChanged={loadProducts} isAdmin={isAdmin} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
