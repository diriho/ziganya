import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export const SpendingAnalytics = () => {
    const chartData = [60, 45, 80, 55, 95, 70, 85];
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="bg-white p-3 sm:p-4 md:p-6 lg:p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-brand-green">Spending Analytics</h3>
                <div className="relative">
                    <select className="
                        appearance-none bg-zinc-50 border border-zinc-100 
                        rounded-lg px-3 py-1.5 pr-8 text-sm font-bold text-brand-green
                        cursor-pointer hover:bg-zinc-100 transition-colors
                        focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent
                    ">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>Last 3 Months</option>
                    </select>
                    <ChevronDown 
                        size={16} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-green pointer-events-none" 
                    />
                </div>
            </div>

            {/* Chart */}
            <div className="h-48 sm:h-56 md:h-64 flex items-end justify-between gap-2 sm:gap-4">
                {chartData.map((height, index) => (
                    <div 
                        key={index} 
                        className="flex-1 flex flex-col items-center gap-3 group"
                    >
                        {/* Bar container */}
                        <div 
                            className="w-full bg-zinc-100 rounded-2xl relative overflow-hidden transition-all group-hover:bg-brand-green-light/20" 
                            style={{ height: '100%' }}
                        >
                            {/* Animated bar */}
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ 
                                    delay: index * 0.1, 
                                    duration: 0.8,
                                    ease: "easeOut"
                                }}
                                className={`absolute bottom-0 w-full rounded-2xl ${
                                    height > 80 ? 'bg-brand-green' : 'bg-brand-green-light'
                                }`}
                            />
                        </div>
                        
                        {/* Weekday label */}
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">
                            {weekdays[index]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
