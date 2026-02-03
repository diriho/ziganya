import SettingsSection from '../settinSection/index'
import { User } from 'lucide-react';


const Profile = () => {
  return (
    <SettingsSection title="Profile Information" description="Update your personal details and how others see you.">
      <div className="p-6 bg-white border border-zinc-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-6 mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-[#6eff8a] rounded-2xl border-4 border-white">
                      {/* <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" width={80} height={80} /> */}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 bg-[#063b1e] text-[#6eff8a] rounded-lg shadow-lg hover:scale-110 transition-transform">
                      <User size={14} />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#063b1e]">Tharcisse</h4>
                    <p className="text-sm text-zinc-500">Member since January 2024</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Full Name</label>
                    <input type="text" defaultValue="Tharcisse" className="w-full px-4 py-2 bg-zinc-60 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6eff8a]/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Email Address</label>
                    <input type="email" defaultValue="tharcisse@gmail.com" className="w-full px-4 py-2 bg-zinc-60 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6eff8a]/20" />
                  </div>
                </div>
                <button className="mt-2 px-6 py-2 bg-[#063b1e] text-[#6eff8a] rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
                  Save Changes
                </button>
              </div>
    </SettingsSection>
  )
}

export default Profile;