import React from "react";
import SettingsSection from "../settinSection/index";
import { formatDate } from "@/lib/format";
import {CircleUser} from "lucide-react"
import { useCurrentUser} from '@sdk/requests';

export default function Profile() {
  // initiliate the currect user and extract his metadata from supabase
  const { user: currentUser, isLoading} = useCurrentUser();

  // wait until the user date gets loaded
  if (isLoading) {
    return <div>Loading uer info...</div>
  }
 
  //chatch error when the user object wasn't found
  if (!currentUser) {
    return (
      <SettingsSection title="Profile" description="Update your personal details and how others see you.">
        <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm text-center text-zinc-500">
          No profile found. Create your profile to get started.
        </div>
      </SettingsSection>
    );
  }

  // retruing the HTML element with the metadata extracted about the user
  return (
    <SettingsSection
      title="Profile"
      description="Update your personal details and how others see you."
    >
      <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-6 bg-[#F3F3F5] p-8 rounded-xl w-auto transition-transform duration-300 hover:scale-105 hover:shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
  
          {/* User avatar/image pulled from the googleAuth metadata, if it exists, otherwise show a default profile icon*/}
          <div><CircleUser className="h-16 w-16 text-gray-500" /></div>

          {/* user bio information extracted metadata from supabase*/}
          <div className="mt-6 space-y-4 text-sm text-gray-800">
            <div><p className="font-medium"><b>Name:</b> {currentUser?.fullName}</p></div>
            <div><p className="font-medium"><b>Email:</b> {currentUser?.email}</p></div>
            <div><p className="font-medium"><b>Member since:</b> {formatDate(currentUser?.createdAt)}</p></div>
            <div><p className="font-medium"><b>Last Login:</b> {formatDate(currentUser?.lastSignedIn)}</p></div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
