import { Receipt, Smartphone, Sparkles, Wallet } from 'lucide-react';

export default function UIMock() {
  return (
    <div className="mt-24 relative max-w-5xl mx-auto">
      <div className="relative aspect-video bg-white rounded-[1.5rem] border border-zinc-200 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6eff8a]/5 to-transparent z-10" />
        {/* UI Elements */}
        <div className="absolute top-8 left-8 flex flex-col gap-4 w-64 z-20">
          <div className="p-4 bg-zinc-100 rounded-2xl border border-zinc-100 flex items-center gap-3 animate-[uimock-bounce-slow_2.5s_infinite_alternate]">
            <div className="w-10 h-10 bg-[#6eff8a] rounded-full flex items-center justify-center text-[#063b1e]">
              <Receipt className="text-[#063b1e]" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#063b1e]">Receipt scanned</p>
              <p className="text-xs text-zinc-500">Starbucks • $4.50</p>
            </div>
          </div>
          <div className="p-4 bg-zinc-100 rounded-2xl border border-zinc-100 flex items-center gap-3 animate-[uimock-bounce-slow_2.5s_infinite_alternate] [animation-delay:0.75s]">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-zinc-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-zinc-400">
              <Smartphone className="text-zinc-400" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#063b1e]">Bank SMS detected</p>
              <p className="text-xs text-zinc-500">Apple • $9.99</p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-48 h-48 bg-[#6eff8a]/10 rounded-full blur-3xl animate-[uimock-pulse_2s_infinite_alternate]" />
          <Sparkles className="text-[#063b1e] w-12 h-12 animate-[uimock-pulse_2s_infinite_alternate]" />
        </div>
        <div className="absolute bottom-8 right-8 flex flex-col gap-4 w-64 z-20">
          <div className="p-6 bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-zinc-100">
            <div className="flex justify-between items-center mb-4">
              <p className="font-bold text-[#063b1e]">Spending Today</p>
              <Wallet className="text-[#6eff8a]" size={20} />
            </div>
            <div className="text-[2rem] font-bold text-[#063b1e]">$14.49</div>
            <div className="mt-2 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#6eff8a] w-2/3 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
