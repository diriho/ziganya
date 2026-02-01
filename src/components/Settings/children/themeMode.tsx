import React from 'react'
import SettingsSection from '../settinSection'
import { Moon, Sun} from "lucide-react";

const ThemeMode = () => {
    const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
            if (savedTheme) return savedTheme;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    React.useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };
                   
    return (
        <SettingsSection title="Appearance" description="Customize the appearance of the application.">
            <div className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#6eff8a]/20 rounded-xl flex items-center justify-center text-[#063b1e]">
                        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div>
                        <p className="font-bold text-[#063b1e]">Dark Mode</p>
                        <p className="text-xs text-zinc-500">Switch between light and dark themes while keeping the green accents.</p>
                    </div>
                </div>
                
                <button
                    onClick={toggleTheme}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                        theme === 'dark' ? 'bg-[#6eff8a]' : 'bg-gray-200'
                    }`}
                >
                    <span
                        className={`block w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                            theme === 'dark' ? 'translate-x-7 bg-[#063b1e]' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>
        </SettingsSection>
    )
}

export default ThemeMode;
