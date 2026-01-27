import {motion} from "framer-motion"

export const Budget = () => {
  return (
    <div className="w-full bg-white p-4 sm:p-6 md:p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
        <h3 className="text-lg sm:text-xl font-bold text-brand-green mb-1 sm:mb-2">Budget</h3>
        <p className="text-zinc-500 text-xs sm:text-sm mb-4 sm:mb-6 md:mb-8">Monthly budget: $3,000</p>
        <div className="relative flex items-center justify-center">
            <svg 
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 -rotate-90" 
                viewBox="0 0 192 192"
            >
                <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="transparent"
                    className="text-zinc-100"
                />
                <motion.circle 
                    initial={{strokeDashoffset: 502}}
                    animate={{strokeDashoffset: 502 - (502 * 0.71)}}
                    transition={{duration: 1.5, ease: "easeInOut"}}
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="transparent"
                    strokeDasharray="502"
                    strokeLinecap="round"
                    className="text-brand-green"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-green">71%</span>
                <span className="text-xs sm:text-sm font-bold uppercase text-zinc-400 tracking-widest mt-1">Used</span>
            </div>
        </div>
        <div className="mt-4 sm:mt-6 md:mt-8 flex justify-between px-2 sm:px-4">
            <div className="flex flex-row items-center gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-brand-green rounded-full"></div>
                <span className="text-xs font-bold text-zinc-500">Spent</span>
            </div>
            <div className="flex flex-row items-center gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-zinc-200 rounded-full"></div>
                <span className="text-xs font-bold text-zinc-500">Remaining</span>
            </div>
        </div>
    </div>
  )
}

export default Budget