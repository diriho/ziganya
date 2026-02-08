import { dbClient,type User } from "@sdk/db";

async function createOrUpdateUserDoc(u: User) {
    //TODO: Subject to change based on the db we defined
    try {
        const { error } = await dbClient
            .from('users')
            .upsert({
                username: u.user_metadata?.full_name ?? " ",
                email: u.email,
                user_id: u.id,
                created_at: u.created_at,
                updated_at: new Date().toISOString(),
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
            const { data, error } = await dbClient.auth.signInWithPassword({ email, password });
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
            const { data, error } = await dbClient.auth.signUp({ email, password });
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
