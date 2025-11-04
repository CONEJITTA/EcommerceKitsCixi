"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();

  const onSubmit = handleSubmit(async (data) => {
    if (data.password !== data.confirmPassword) {
      return alert("Contraseña no coincide");
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      alert("Usuario creado con éxito");
      router.push('/auth/login');
    } else {
      const errorData = await res.json();
      alert(errorData.error || "El usuario ya existe");
    }
  });

  // Función para redirigir al Home
  const handleHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="card w-full max-w-sm p-6">
        <h1 className="text-slate-900 font-bold text-2xl mb-4 text-center">Registro</h1>

        <label className="text-slate-600 mb-1 block text-xs">Nombre de usuario</label>
        <input
          type="text"
          {...register("username", { required: { value: true, message: "Nombre de usuario requerido" } })}
          className="input-base w-full mb-2"
          placeholder="nombre de usuario"
        />
  {errors.username && <span className="text-slate-700 text-xs">{errors.username.message}</span>}

        <label className="text-slate-600 mb-1 block text-xs">E-mail</label>
        <input
          type="email"
          {...register("email", { required: { value: true, message: "E-mail requerido" } })}
          className="input-base w-full mb-2"
          placeholder="email@gmail.com"
        />
  {errors.email && <span className="text-slate-700 text-xs">{errors.email.message}</span>}

        <label className="text-slate-600 mb-1 block text-xs">Contraseña</label>
        <input
          type="password"
          {...register("password", { required: { value: true, message: "Contraseña requerida" } })}
          className="input-base w-full mb-2"
          placeholder="*******"
        />
  {errors.password && <span className="text-slate-700 text-xs">{errors.password.message}</span>}

        <label className="text-slate-600 mb-1 block text-xs">Confirmar contraseña</label>
        <input
          type="password"
          {...register("confirmPassword", { required: { value: true, message: "Confirmación requerida" } })}
          className="input-base w-full mb-3"
          placeholder="*******"
        />
  {errors.confirmPassword && <span className="text-slate-700 text-xs">{errors.confirmPassword.message}</span>}

        <button className="btn-primary w-full mt-3">Registrarse</button>
      </form>
    </div>
  );
}

export default RegisterPage;
