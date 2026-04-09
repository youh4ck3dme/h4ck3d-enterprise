
import { motion } from "framer-motion";
import { ArrowRight, Check, Code2, Globe, Laptop, Rocket, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    title: "AI Brain 5.0",
    desc: "Najvýkonnejšie modely GPT-5 optimalizované pre písanie kódu a systémovú analýzu.",
    icon: <Zap className="w-8 h-8" />,
    color: "bg-red-500"
  },
  {
    title: "MCP Runtime",
    desc: "Bezpečné spúšťanie nástrojov a shellových príkazov priamo cez AI rozhranie.",
    icon: <Code2 className="w-8 h-8" />,
    color: "bg-yellow-400"
  },
  {
    title: "Global Edge",
    desc: "Sériovo blesková odozva vďaka nasadeniu na Supabase Edge Functions.",
    icon: <Globe className="w-8 h-8" />,
    color: "bg-red-500"
  },
  {
    title: "Stripe Security",
    desc: "Plne integrovaný platobný systém s PCI DSS ochranou najvyššej úrovne.",
    icon: <Shield className="w-8 h-8" />,
    color: "bg-yellow-400"
  }
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-yellow-400">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b-4 border-black px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 border-2 border-black" />
          H4CK3D <span className="text-red-600">ENTERPRISE</span>
        </div>
        <div className="hidden md:flex gap-8 font-bold items-center">
          <a href="#features" className="hover:text-red-600 transition-colors">FUNKCIE</a>
          <a href="/pricing" className="hover:text-red-600 transition-colors">CENNÍK</a>
          <button 
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-black text-white border-2 border-black hover:bg-yellow-400 hover:text-black transition-all active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Vstúpiť do App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-start gap-8">
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-yellow-400 border-4 border-black p-2 font-black text-sm uppercase tracking-widest inline-block"
        >
          Budúcnosť AI Vývoja je tu
        </motion.div>
        
        <motion.h1 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-9xl font-black leading-[0.9] text-left uppercase"
        >
          Kóduj rýchlejšie <br />
          <span className="text-red-600">Zarábaj viac.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl font-bold max-w-2xl text-left border-l-8 border-red-600 pl-6 my-4"
        >
          H4CK3D Enterprise je brutálny workspace pre inžinierov, ktorí chcú monetizovať svoje nápady rýchlosťou svetla.
        </motion.p>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-4"
        >
          <button 
            onClick={() => navigate("/dashboard")}
            className="px-10 py-5 bg-red-600 text-white text-xl font-black uppercase border-4 border-black hover:bg-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center gap-4"
          >
            Začať ihneď <ArrowRight size={24} />
          </button>
          <button 
             onClick={() => navigate("/pricing")}
             className="px-10 py-5 bg-white text-black text-xl font-black uppercase border-4 border-black hover:bg-yellow-400 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
          >
            Pozrieť ceny
          </button>
        </motion.div>
      </section>

      {/* Stats / Proof */}
      <section className="bg-black text-white py-12 px-6 overflow-hidden">
        <div className="flex gap-20 whitespace-nowrap animate-marquee font-black text-4xl uppercase opacity-50">
          <span>GPT-5 integration • PCI DSS COMPLIANT • REAL-TIME EDGE • CLOUD MONETIZATION • </span>
          <span>GPT-5 integration • PCI DSS COMPLIANT • REAL-TIME EDGE • CLOUD MONETIZATION • </span>
          <span>GPT-5 integration • PCI DSS COMPLIANT • REAL-TIME EDGE • CLOUD MONETIZATION • </span>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-black uppercase mb-16 text-center underline decoration-yellow-400 decoration-8 underline-offset-8">
          Vybavený na <span className="text-red-600">Extrém.</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div 
              key={f.title}
              whileHover={{ scale: 1.02 }}
              className="border-4 border-black p-8 flex flex-col items-start gap-4 hover:shadow-[12px_12px_0px_0px_rgba(255,10,10,0.2)] transition-all bg-white"
            >
              <div className={`${f.color} p-4 border-2 border-black inline-block mb-4`}>
                {f.icon}
              </div>
              <h3 className="text-2xl font-black uppercase">{f.title}</h3>
              <p className="font-bold text-gray-600">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Visual Product Mockup */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="border-[12px] border-black shadow-[20px_20px_0px_0px_rgba(252,211,77,1)] relative group">
          <div className="bg-black px-4 py-2 flex gap-2 border-b-4 border-black">
             <div className="w-3 h-3 rounded-full bg-red-600" />
             <div className="w-3 h-3 rounded-full bg-yellow-400" />
             <div className="w-3 h-3 rounded-full bg-white/20" />
          </div>
          <div className="aspect-video bg-white flex items-center justify-center overflow-hidden">
             {/* Mock Dashboard UI */}
             <div className="w-full h-full p-8 flex flex-col gap-4">
                <div className="h-10 w-48 bg-red-600 border-2 border-black flex items-center px-4 text-xs font-black text-white">SYSTEM READY</div>
                <div className="flex-1 grid grid-cols-3 gap-4">
                   <div className="col-span-1 border-2 border-black bg-gray-100 p-4 space-y-2">
                      <div className="h-4 w-full bg-black/10" />
                      <div className="h-4 w-3/4 bg-black/10" />
                      <div className="h-4 w-1/2 bg-black/10" />
                   </div>
                   <div className="col-span-2 border-2 border-black bg-white p-4 relative">
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                         <span className="text-[10px] font-black">AI THINKING...</span>
                      </div>
                      <div className="space-y-4">
                        <div className="h-2 w-full bg-black/5" />
                        <div className="h-2 w-full bg-black/5" />
                        <div className="h-26 w-full border-2 border-dashed border-black flex items-center justify-center font-black text-xs">
                           GENERATE PAYMENTS
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
          <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center bg-yellow-400 border-y-8 border-black">
          <h2 className="text-4xl md:text-7xl font-black uppercase mb-8">
             Pripravený na <br />
             <span className="bg-black text-white px-4">Monetizáciu?</span>
          </h2>
          <button 
             onClick={() => navigate("/dashboard")}
             className="px-16 py-8 bg-black text-white text-3xl font-black uppercase border-4 border-black hover:bg-red-600 transition-all shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-2 active:translate-y-2"
          >
             Otvoriť Workspace
          </button>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t-8 border-black">
          <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-start gap-12">
             <div className="max-w-sm">
                <div className="text-2xl font-black tracking-tighter mb-4 uppercase">
                   H4CK3D Enterprise
                </div>
                <p className="font-bold text-gray-500">
                   Najpokročilejší AI workspace pre vývojárov, ktorí nečakajú. Vytvorené pre maximálny zisk a rýchlosť.
                </p>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
                <div className="flex flex-col gap-4 font-bold">
                   <span className="text-xs uppercase text-gray-400 font-black">Produkt</span>
                   <a href="#" className="hover:text-red-600">Dokumentácia</a>
                   <a href="#" className="hover:text-red-600">Komponenty</a>
                   <a href="#" className="hover:text-red-600">Bezpečnosť</a>
                </div>
                <div className="flex flex-col gap-4 font-bold">
                   <span className="text-xs uppercase text-gray-400 font-black">Spoločnosť</span>
                   <a href="#" className="hover:text-red-600">O nás</a>
                   <a href="#" className="hover:text-red-600">Kontakt</a>
                   <a href="#" className="hover:text-red-600">Právne info</a>
                </div>
             </div>
          </div>
          <div className="max-w-7xl mx-auto mt-20 pt-8 border-t-2 border-black/10 flex justify-between items-center font-bold text-sm">
             <div>© 2026 H4CK3D Enterprise. Všetky práva vyhradené.</div>
             <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white hover:bg-red-600 transition-colors pointer-cursor">𝕏</div>
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white hover:bg-red-600 transition-colors pointer-cursor">🐙</div>
             </div>
          </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @font-face {
          font-family: 'Space Grotesk';
          src: url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap');
        }
      `}</style>
    </div>
  );
}
