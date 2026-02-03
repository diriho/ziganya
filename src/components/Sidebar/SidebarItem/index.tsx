import { Link } from "react-router";

interface iconOptions {
    icon: React.ReactNode;
    text: string;
    active: boolean;
    hasActiveState: boolean;
    location?: string;
    onClick: () => void;
}
export const SidebarItem = ({
    icon,
    text,
    active,
    hasActiveState,
    location,
    onClick
}: iconOptions) => {
    const resolvedLocation = location ?? "/";

    return (
        <nav className="mb-1">
            <Link
                to={resolvedLocation}
                onClick={onClick}
                className={`
                    flex flex-row items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 ease-in-out
                    cursor-pointer no-underline
                    ${
                        hasActiveState && active
                            ? 'bg-[#063b1e] text-[#6eff8a] shadow-sm'
                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }
                `}
                aria-current={hasActiveState && active ? "page" : undefined}
            >
                <span className="flex items-center">{icon}</span>
                <span className="text-sm font-medium">{text}</span>
            </Link>
        </nav>
    );
};
