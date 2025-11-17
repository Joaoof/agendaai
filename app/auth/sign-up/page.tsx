"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState } from "react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen">
      {/* Lado esquerdo - Background com gradiente */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-purple-600 via-purple-500 to-cyan-500 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative z-10">
          <svg className="w-40 h-40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M80 60L120 100L80 140" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M120 60L160 100L120 140" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Lado direito - Sign Up form */}
      <div className="w-full lg:w-1/2 bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="flex justify-start">
            <span className="text-white text-sm font-semibold tracking-wide">
              Agendaai
            </span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-white text-3xl font-bold">Crie sua conta</h1>
          </div>
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-950 text-slate-500 text-xs">Crie sua conta</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Seu e-mail"
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repeat-password" className="text-slate-300 text-sm font-medium">
                Repita a Senha
              </Label>
              <Input
                id="repeat-password"
                type="password"
                placeholder="Repita sua senha"
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Cadastrar"}
            </Button>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800">
            <button className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors group">
              <Link
                href="/auth/login"
                className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br flex items-center justify-center">
                    <img src="https://cdn-icons-png.flaticon.com/512/7133/7133470.png" alt="" />
                  </div>
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">Já tem uma conta?</p>
                    <p className="text-purple-400 text-xs font-medium">Faça login na sua conta</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
