"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  // Ocultar navbar en páginas de auth (login/register)
  if (pathname?.startsWith("/auth")) return null;
  const isAdmin = session?.user?.role === "admin";

  return (
    <nav className="bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center">
      <h1 className="text-slate-900 text-2xl font-bold">CIXI</h1>
      <div className="flex gap-4 items-center">
        {!isAdmin && (
          <>
            <a href="/" className="text-slate-700 hover:text-[#f7c3c9] font-medium">Home</a>
            <a href="/cart" className="text-slate-700 hover:text-[#f7c3c9] font-medium">Carrito</a>
            <a href="/products/pricing" className="text-slate-700 hover:text-[#f7c3c9] font-medium">Productos</a>
          </>
        )}

        {isAdmin && (
          <a href="/categories" className="text-slate-700 hover:text-[#f7c3c9] font-medium">
            Categorías
          </a>
        )}

        <UserMenu />
      </div>
    </nav>
  );
}
