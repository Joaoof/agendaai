import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignUpSuccessPage() {
  return (
    <div className="flex w-full h-screen">
      {/* Lado esquerdo - Background com gradiente */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-purple-600 via-purple-500 to-cyan-500 items-center justify-center relative overflow-hidden">  
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative z-10 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-white text-2xl font-bold">Bem-vindo!</h2>
            <p className="text-white/80 text-sm">Confirme seu email para continuar</p>
          </div>
        </div>
      </div>

      {/* Lado direito - Success message */}
      <div className="w-full lg:w-1/2 bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-cyan-500 rounded-full blur opacity-75 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center">
                <img src="https://cdn-icons-png.flaticon.com/512/5290/5290109.png" alt="" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3 text-center">
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "Open Sans, sans-serif" }}>
              Cadastro Realizado!
            </h1>
            <p className="text-lg text-purple-400 font-semibold" style={{ fontFamily: "Open Sans, sans-serif" }}>
              Sua conta foi criada com sucesso
            </p>
          </div>

          {/* Message */}
          <div className="space-y-4 bg-linear-to-r from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 p-6 backdrop-blur-sm">
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-sm" style={{ fontFamily: "Open Sans, sans-serif" }}>
                ✉️ Verifique seu email
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed" style={{ fontFamily: "Open Sans, sans-serif" }}>
                Enviamos um link de confirmação para seu email. Clique no link para verificar sua conta e acessar a plataforma.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-700/50">
              <p className="text-slate-400 text-xs" style={{ fontFamily: "Open Sans, sans-serif" }}>
                💡 Verifique também a pasta de spam se não encontrar o email em alguns minutos.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <Link href="/auth/login">
                <span className="flex items-center justify-center gap-2">
                  Voltar ao Login
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </Button>
          </div>

          {/* Footer help */}
          <div className="text-center space-y-1 pt-4 border-t border-slate-800">
            <p className="text-slate-400 text-sm" style={{ fontFamily: "Open Sans, sans-serif" }}>
              Não recebeu o   ?
            </p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors" style={{ fontFamily: "Open Sans, sans-serif" }}>
              Reenviar link de confirmação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
