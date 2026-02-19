import React from "react";

interface ActivityItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    amount: string;
    category: string;
}

export const ActivityItem = ({ icon, title, subtitle, amount, category }: ActivityItemProps) => {
    return (
        <div className="flex items-start gap-4 group">
            {/* Icon */}
            <div className="
                w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100
                flex items-center justify-center
                text-brand-green
                group-hover:bg-brand-green-light/10 group-hover:border-brand-green-light/20
                transition-all duration-200
                flex-shrink-0
            ">
                {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-zinc-900 mb-1 truncate">
                            {title}
                        </h4>
                        <p className="text-xs text-zinc-500 mb-2">
                            {subtitle}
                        </p>
                        <span className="inline-block text-xs font-medium text-zinc-400 uppercase tracking-wide">
                            {category}
                        </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-zinc-900">
                            {amount}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
