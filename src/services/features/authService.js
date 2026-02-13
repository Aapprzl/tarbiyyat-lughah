import { supabase } from '../../supabaseClient';

export const authService = {
    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data.user;
    },

    async register(email, password) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
        return data.user;
    },

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return true;
    },

    onAuthStateChange(callback) {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
            callback(session?.user || null);
        });
        return () => data.subscription.unsubscribe();
    },

    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    isAuthenticated() {
        return false; 
    }
};
