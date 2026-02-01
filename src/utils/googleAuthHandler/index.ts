import supabase from "../../supabase/supabaseConfig";

const googleSignIn_Logic = async () => {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) throw error;
        return { error: null };
    } catch (err) {
        return {
            error: {    
                error: err,
                message: "Google sign-in failed",
                timestamp: new Date().toISOString()
            }
        };
    }
};

export default googleSignIn_Logic;
