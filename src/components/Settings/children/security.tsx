import React from 'react'
import SettingsSection from '../settinSection'
import { Shield } from "lucide-react";  


const Security  = () => {
  return (
    <SettingsSection title='Security' description='Manage your password and account security settings.'>
        <div className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#6eff8a]/20 rounded-xl flex items-center justify-center text-[#063b1e] ">
                    <Shield size={20} />
                </div>
                <div>
                    <p className="font-bold text-[#063b1e]">Two-Factor Authentication</p>
                    <p className="text-xs text-zinc-500">Add an extra layer of security to your account.</p>
                </div>
            </div>
            <button className="text-sm font-bold text-[#063b1e] hover:underline">Enable</button>
            </div>
    </SettingsSection>
  )
}

export default Security;
