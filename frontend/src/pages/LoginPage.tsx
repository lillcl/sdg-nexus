import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import api from "@/api/client";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    mode: "login" as "login" | "register",
    username: "",
    full_name: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth, user } = useAuthStore();
  const nav = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) nav("/dashboard");
  }, [user, nav]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (form.mode === "register") {
        const regRes = await api.post(
          "/auth/register",
          {
            email: form.email,
            password: form.password,
            username: form.username,
            full_name: form.full_name,
          },
          { headers: { "Content-Type": "application/json" } },
        );
        setSuccess(
          "Account created! Please check your email to confirm, then sign in.",
        );
        setForm((p) => ({ ...p, mode: "login" }));
        setLoading(false);
        return;
      }

      // Login with JSON body
      const r = await api.post(
        "/auth/login",
        { email: form.email, password: form.password },
        { headers: { "Content-Type": "application/json" } },
      );

      const meR = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${r.data.access_token}` },
      });

      setAuth(meR.data, r.data.access_token); // Fixed: removed third argument
      nav("/dashboard");
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } }; message?: string })
          ?.response?.data?.detail ||
        (e instanceof Error ? e.message : "Authentication failed");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl overflow-hidden grid grid-cols-4 gap-[1px] p-[2px] bg-slate-800 mx-auto mb-4">
            {[
              "#E5243B",
              "#DDA63A",
              "#4C9F38",
              "#C5192D",
              "#FF3A21",
              "#26BDE2",
              "#FCC30B",
              "#A21942",
              "#FD6925",
              "#DD1367",
              "#FD9D24",
              "#BF8B2E",
              "#3F7E44",
              "#0A97D9",
              "#56C02B",
              "#00689D",
            ].map((c, i) => (
              <div
                key={i}
                className="rounded-[2px]"
                style={{ background: c }}
              />
            ))}
          </div>
          <h1 className="font-bold text-white text-2xl">SDG Nexus</h1>
          <p className="text-slate-500 text-sm mt-1">
            Interactive SDG Learning Platform
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex bg-slate-800 rounded-xl p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setForm((p) => ({ ...p, mode: m }));
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${form.mode === m ? "bg-blue-600 text-white" : "text-slate-400"}`}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {form.mode === "register" && (
            <>
              <input
                placeholder="Username"
                value={form.username}
                onChange={(e) =>
                  setForm((p) => ({ ...p, username: e.target.value }))
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <input
                placeholder="Full Name"
                value={form.full_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, full_name: e.target.value }))
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />

          {error && (
            <p className="text-red-400 text-xs bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-400 text-xs bg-green-950/30 border border-green-900/50 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
          >
            {loading
              ? "Please wait..."
              : form.mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>

          <p className="text-center text-xs text-slate-500">
            Or{" "}
            <button
              onClick={() => nav("/")}
              className="text-blue-400 hover:underline"
            >
              explore map without login →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
