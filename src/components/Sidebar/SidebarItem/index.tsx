interface iconOptions {
    icon: React.ReactNode,
    text: string,
    active: boolean,
    hasActiveState: boolean,
    onClick: () => void
}
export const SidebarItem = ({
    icon,
    text,
    active,
    hasActiveState,
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
                    <span className="text-sm font-medium">{text}</span>
                </button>
            </div>
        </nav>
    )
}