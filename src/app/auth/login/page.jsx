"use client";

import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();

  const onSubmit = handleSubmit(async (data) => {
    setError(null);

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res.error) {
      setError(res.error);
    } else {
      // Esperamos un momento para que la sesión se actualice
      setTimeout(() => {
        const userRole = session?.user?.role;

        if (userRole === "admin") {
          router.push("/products/pricing");
        } else {
          router.push("/");
        }
      }, 500); // Esperamos 500ms para que la sesión se propague
    }
  });

  // Función para volver al home o página anterior
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="card w-full max-w-sm p-6">
        {error && (
          <p className="alert-soft mb-3">{error}</p>
        )}

        <h1 className="text-slate-900 font-bold text-2xl mb-4 text-center">Iniciar sesión</h1>

        <label className="text-slate-600 mb-1 block text-xs">Email</label>
        <input
          type="email"
          {...register("email", {
            required: { value: true, message: "Email requerido" },
          })}
          className="input-base w-full mb-2"
          placeholder="user@gmail.com"
        />
  {errors.email && <span className="text-slate-700 text-xs">{errors.email.message}</span>}

        <label className="text-slate-600 mt-2 mb-1 block text-xs">Contraseña</label>
        <input
          type="password"
          {...register("password", { required: { value: true, message: "Contraseña requerida" } })}
          className="input-base w-full mb-3"
          placeholder="******"
        />
  {errors.password && <span className="text-slate-700 text-xs">{errors.password.message}</span>}

        <button type="submit" className="btn-primary w-full mt-3">Iniciar sesión</button>

        <div className="text-center mt-3">
          <button
            type="button"
            onClick={() => router.push("/auth/register")}
            className="text-[#f7c3c9] text-xs hover:underline"
          >
            ¿No tienes una cuenta? Regístrate
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
