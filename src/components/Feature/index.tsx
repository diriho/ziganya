import React from "react";

type FeatureProps = {
	icon: React.ReactNode;
	title: string;
	description: string;
};

export default function Feature({ icon, title, description }: FeatureProps) {
	return (
		<div className="flex flex-col gap-6 bg-[#F3F3F5] p-8 rounded-xl transition-transform duration-300 hover:scale-105 hover:shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
			<div className="w-12 h-12 bg-[#f4f4f5] rounded-2xl flex items-center justify-center border border-[#063b1e]">
				{icon}
			</div>
			<h3 className="text-[2rem] font-bold text-[#063b1e]">{title}</h3>
			<p className="text-[#71717a] leading-[1.7] font-medium">{description}</p>
		</div>
	);
}
