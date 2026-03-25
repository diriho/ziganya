

import { useNavigate } from "react-router";
import {signOutUser} from "@/utils/auth";


export const LogoutPage = () => {
   // handle user sign out logic
  const handleSignOut = async () => {
          await signOutUser();
  };

  // go back to the home page after signing out 
  const navigate = useNavigate();

  // set this as the onClick handler for loging out. Logout and then navigate back to the home page.
  const handleGoHome = () => {
      handleSignOut();
      navigate("/");
  };

  return (
    <section className="p-6">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-zinc-900">
              You have been logged out successfully
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Press on the button below to go back to the home page.
            </p>
            <button
              type="button"
              onClick={handleGoHome}
              className="mt-6 inline-flex rounded-xl bg-brand-green px-5 py-2.5 text-sm font-medium text-brand-green-light transition-colors hover:bg-black"
            >
              Go to home page
            </button>
          </div>
        </div>
    </section>
  );
};
