import { Search } from "lucide-react"

export const SearchInput = () => {
    return (
        <div className="relative w-full lg:max-w-xl">
            <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <input
                className="
                    w-full bg-white border border-zinc-200 
                    pl-11 pr-4 py-3 rounded-xl
                    text-zinc-900 placeholder-zinc-400
                    focus:outline-none focus:ring-2 focus:ring-brand-green-light focus:border-transparent
                    transition-all duration-200
                    shadow-sm hover:shadow-md
                "
                type="text"
                placeholder="Search transactions, subscriptions..."
            />
        </div>
    )
}