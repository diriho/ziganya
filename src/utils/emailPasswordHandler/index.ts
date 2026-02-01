import supabase from "../../supabase/supabaseConfig";
import type { User } from "@supabase/supabase-js";

async function createOrUpdateUserDoc(u: User) {
    try {
        const { error } = await supabase
            .from('users')
            .upsert({
                uid: u.id,
                email: u.email ?? null,
                displayName: u.user_metadata?.full_name ?? u.user_metadata?.name ?? null,
                lastSeen: new Date().toISOString()
            }, { onConflict: 'uid' });

        if (error) console.error("Failed to write user doc", error);
    } catch (err) {
        return {
            message: "Failed to write user doc",
            error: err,
            timestamp: new Date().toISOString() 
        }

    }
}

const emailPassword_Logic = {
    signIn: async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (data.user) {
                await createOrUpdateUserDoc(data.user);
            }
            return { user: data.user, error: null };
        } catch (err) {
            return { 
                user: null, 
                error: {
                    error: err,
                    message: "Email sign-in failed",
                    timestamp: new Date().toISOString() }
            };
        }
    },
    register: async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            if (data.user) {
                await createOrUpdateUserDoc(data.user);
            }
            return { user: data.user, error: null };
        } catch (err) {
            return { 
                user: null,
                 error: {
                    error: err,
                    message: "Registration failed! Make sure you add a valid email",
                    timestamp: new Date().toISOString() 
                }
        }
        
        }
    }
};

export default emailPassword_Logic;
