import { create } from "zustand";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoadingIng: false,
    isUpdatingProfile: false,

    isCheckingAuth:true,

    checkAuth: async() =>{
        try{

        } catch(error){
            
        }
    }
}));