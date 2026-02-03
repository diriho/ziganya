import { SidebarItem } from "../SidebarItem"; //TODO: fix it to use @components/Sidebar

interface sideBarOptions {
    title: string,
    items: Array<{ icon: React.ReactNode; text: string; active: boolean; location?: string }>,
    hasActiveState: boolean,
    onItemClick: (title: string, text: string) => void
}

export const SidebarSection = ({ title, items, hasActiveState, onItemClick }: sideBarOptions) => {
    return (
        <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 mb-2">{title}</p>
            {items.map((item, index) => (
                <SidebarItem
                    key={index}
                    icon={item.icon}
                    text={item.text}
                    active={item.active}
                    location={item.location}
                    hasActiveState={hasActiveState}
                    onClick={() => onItemClick(title,item.text)}
                />
            ))}
        </div>
    )
}
