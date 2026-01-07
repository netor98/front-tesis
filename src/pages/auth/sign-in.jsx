

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Input,
  Typography,
} from "@material-tailwind/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function SignIn() {
  // --- LOGIC REMAINS UNCHANGED ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation function (at least 6 characters)
  const isValidPassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e)
    setError("");

    // Validate email format
    if (!isValidEmail(email)) {
      setError("Por favor, ingresa un email válido.");
      return;
    }

    // Validate password
    if (!isValidPassword(password)) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    console.log("Login Data:", { email, password });
    // If validation passes, navigate to dashboard
    navigate("/dashboard/home");
  };
  // -------------------------------

  return (
    <section className="min-h-screen flex items-center justify-center p-4 ">
      <div className="flex w-full max-w-screen-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* LEFT SIDE: Image */}
        <div className="hidden lg:block w-5/12 relative font-sans">
          <img
            src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop"
            alt="Fleet Management Trucks"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-gray-300 mix-blend-multiply"></div>


          <div className="absolute bottom-0 left-0 p-12 text-white">
             <Typography variant="h3" className="font-bold">FleetConnect</Typography>
             <Typography className="opacity-80">Gestión inteligente de transporte.</Typography>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center py-12 px-8 lg:px-16">
          <div className="text-center lg:text-left mb-8">
            <Typography variant="h2" color="blue-gray" className="font-bold mb-2">
              Bienvenido de nuevo
            </Typography>

            <Typography variant="paragraph" className="text-lg font-normal text-blue-gray-600">
              Ingresa tus credenciales para acceder al sistema.
            </Typography>
          </div>

          <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md lg:mx-0">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Typography variant="small" color="red" className="font-medium">
                  {error}
                </Typography>
              </div>
            )}
            <div className="mb-6 flex flex-col gap-6">

              {/* Email Input */}
              <div>

                <Typography variant="small" color="blue-gray" className="mb-2 font-semibold">
                  Tu Email
                </Typography>
                <Input
                  size="lg"
                  type="email"
                  placeholder="nombre@flota.com"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                className: "before:content-none after:content-none", }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Input */}
              <div>
                 <div className="flex items-center justify-between mb-2">
                    <Typography variant="small" color="blue-gray" className="font-semibold">
                      Contraseña
                    </Typography>
                     <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                      Recuperar Contraseña
                    </a>
                </div>

                <div className="relative">
                  <Input
                    type={passwordVisible ? "text" : "password"}
                    size="lg"
                    placeholder="********"
                    className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-gray-400 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    {passwordVisible ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" className="mt-4 bg-black hover:bg-blue-gray-800 shadow-md hover:shadow-lg transition-all" fullWidth size="lg">
              Iniciar Sesión
            </Button>

          </form>
        </div>
      </div>
    </section>
  );
}

export default SignIn;
