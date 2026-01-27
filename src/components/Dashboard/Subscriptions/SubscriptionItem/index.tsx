interface itemOptions {
    name: string,
    amount: string,
    date: string,
    color?: string
}

export const SubscriptionItem = ({ name, amount, date }: itemOptions) => {
  return (
    <div className='p-3 sm:p-4 bg-zinc-50 rounded-xl sm:rounded-2xl border border-zinc-100 flex items-center justify-between hover:border-brand-green-light/50 hover:bg-zinc-100/50 transition-all cursor-pointer group'>
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* logo */}
            <div className="flex-shrink-0 flex items-center justify-center text-white bg-brand-green text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl w-9 h-9 sm:w-11 sm:h-11">
                {name.charAt(0)}
            </div>
            {/* name */}
            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-zinc-700 font-bold truncate">{name}</p>
                <p className="text-[10px] sm:text-xs text-zinc-400">{date}</p>
            </div>
        </div>
        
        <p className="text-xs sm:text-sm font-semibold text-brand-green ml-2 flex-shrink-0">{amount}</p>
    </div>
  )
}