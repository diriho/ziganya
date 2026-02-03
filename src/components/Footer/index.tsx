import { Link } from "react-router";

export default function Footer() {
	return (
		<footer className="py-12 border-t border-zinc-100 bg-white">
			<div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-center md:justify-between items-center gap-12">
				<div className="flex items-center gap-2">
					<span className="text-xl font-bold tracking-tighter text-[#063b1e]"><Link to="/">ziganya</Link></span>
					<div className="w-[2px] h-4 bg-[#6eff8a] rounded-full" />
					<span className="text-sm text-zinc-400 font-medium">© 2026 Ziganya Finance</span>
				</div>
				<div className="flex items-center gap-8 text-base font-medium text-zinc-500">
					<a href="#" className="text-zinc-500 hover:text-black transition-colors duration-200">Twitter</a>
					<a href="#" className="text-zinc-500 hover:text-black transition-colors duration-200">Privacy</a>
					<a href="#" className="text-zinc-500 hover:text-black transition-colors duration-200">Terms</a>
				</div>
			</div>
		</footer>
	);
}
