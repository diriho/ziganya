import { useState, useEffect } from 'react';
import Button from '../Button';
import { Apple, LogOut } from 'lucide-react';
import Login from '../../pages/Login';
import supabase from '../../supabase/supabaseConfig';
import type { User } from '@supabase/supabase-js';
import { signOutUser } from '../../utils/auth';

const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsLoginOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = () => {
    setIsLoginOpen(true);
  }

  const handleSignOut = async () => {
    await signOutUser();
  };

  return (
    <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-8 py-3 px-6 bg-white/80 rounded-full border border-zinc-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md">
        <div className="group flex items-center gap-2 mr-4 cursor-pointer transition-transform duration-200">
          <span className="text-xl font-bold tracking-tighter text-[#063b1e]"><a href="#">ziganya</a></span>
          <div className="w-[3px] h-6 bg-[#6eff8a] rounded-full transition-transform duration-200 group-hover:scale-y-125" />
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <a href="#" className="text-sm font-bold text-zinc-500 hover:text-[#063b1e] transition-colors duration-200 no-underline">Features</a>
          <a href="#" className="text-sm font-bold text-zinc-500 hover:text-[#063b1e] transition-colors duration-200 no-underline">About</a>
          <a href="#" className="text-sm font-bold text-zinc-500 hover:text-[#063b1e] transition-colors duration-200 no-underline">Contact</a>
        </div>
        
        {user ? (
          <div className="flex items-center gap-4">
             <span className="font-semibold text-sm text-black">
              Hi, {user.user_metadata?.full_name ? user.user_metadata.full_name.split(' ')[0] : 'User'}
            </span>
            <Button
              type="button"
              variant="primary"
              className="!flex items-center gap-[2px] !px-4 !py-2 !bg-[#063b1e] !rounded-full !border !border-[#063b1e] cursor-pointer transition-all duration-200 hover:!bg-black active:scale-95 text-white" 
              onClick={handleSignOut}
            >
              <LogOut size={16} className="text-[#6eff8a] fill-[#6eff8a]" />
              <span className="text-sm font-bold text-[#6eff8a]">Sign Out</span>
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="primary"
            className="!flex items-center gap-[2px] !px-4 !py-2 !bg-[#063b1e] !rounded-full !border !border-[#063b1e] cursor-pointer transition-all duration-200 hover:!bg-black active:scale-95 text-white"
            onClick={handleSignIn}
          >
            <Apple size={16} className="text-[#6eff8a] fill-[#6eff8a]" />
            <span className="text-sm font-bold text-[#6eff8a]">Sign In</span>
          </Button>
        )}
      </div>
      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </nav>
  );
};

export default Header;