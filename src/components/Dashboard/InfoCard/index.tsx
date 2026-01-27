
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface InfoCardProps {
    title: string;
    value: string;
    trend: string;
    trendUp: boolean;
    className?: string;
    accentColor?: string;
}

export const InfoCard = ({ 
    title, 
    value, 
    trend, 
    trendUp, 
    className = "", 
    accentColor 
}: InfoCardProps) => {
    // Determine if this is a dark card (with accentColor background)
    const isDarkCard = !!accentColor;
    
    // Card background and text colors
    const cardBg = isDarkCard ? 'bg-brand-green' : 'bg-white';
    const cardBorder = isDarkCard ? 'border-brand-green' : 'border-zinc-200';
    const titleColor = isDarkCard ? 'text-white/80' : 'text-zinc-600';
    const valueColor = isDarkCard ? 'text-white' : 'text-zinc-900';
    
    // Icon badge styling
    const iconBadgeBg = isDarkCard ? 'bg-brand-green' : 'bg-zinc-50';
    const iconBadgeBorder = isDarkCard ? 'border-brand-green-light/20' : 'border-zinc-100';
    const iconColor = isDarkCard ? 'text-brand-green-light' : 'text-brand-green';
    
    // Trend colors
    const trendMainColor = trendUp 
        ? (isDarkCard ? 'text-brand-green-light' : 'text-green-500')
        : 'text-red-500';
    const trendSubColor = isDarkCard ? 'text-brand-green-light/70' : 'text-zinc-500';

    return (
        <div className={`
            p-8 rounded-[2rem] ${cardBg} ${cardBorder} border
            shadow-sm hover:shadow-md transition-shadow duration-200
            relative overflow-hidden
            ${className}
        `}>
            {/* Icon Badge */}
            <div className={`
                absolute top-4 right-4 w-10 h-10 rounded-full 
                flex items-center justify-center 
                ${iconBadgeBg} ${iconBadgeBorder} border
            `}>
                {trendUp ? (
                    <ArrowUpRight size={20} className={iconColor} />
                ) : (
                    <ArrowDownRight size={20} className="text-red-500" />
                )}
            </div>

            {/* Content */}
            <div className="pr-12">
                <p className={`text-sm font-bold ${titleColor} mb-2`}>
                    {title}
                </p>
                <h3 className={`text-3xl font-bold tracking-tight ${valueColor} mb-2`}>
                    {value}
                </h3>
                <p className={`text-xs font-bold ${trendMainColor}`}>
                    {trend} 
                    <span className={`font-medium ${trendSubColor}`}>
                        {' '}{trendUp ? 'increase' : 'decrease'} from last month
                    </span>
                </p>
            </div>
        </div>
    );
};