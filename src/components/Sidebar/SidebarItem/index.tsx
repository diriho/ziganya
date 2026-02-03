import { Link } from "react-router"

interface iconOptions {
    icon: React.ReactNode,
    text: string,
    active: boolean,
    hasActiveState: boolean,
    location?:string,
    onClick: () => void
}
export const SidebarItem = ({
    icon,
    text,
    active,
    hasActiveState,
    location,
    onClick
}: iconOptions) => {
    return (
        <nav className="mb-1">
            <div
                className={`
                    flex flex-row items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 ease-in-out
                    cursor-pointer
                    ${
                        hasActiveState && active
                            ? 'bg-[#063b1e] text-[#6eff8a] shadow-sm'
                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }
                `}
            >
                <button 
                className="w-full flex flex-row items-center gap-3"
                onClick={onClick}
                >   
                    <span className="flex items-center">{icon}</span>
                    <Link to={location ?? "/"}>
                        <span className="text-sm font-medium">{text}</span>
                    </Link>
                    
                </button>
            </div>
        </nav>
    )
}