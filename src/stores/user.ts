import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { defineStore } from "pinia";

interface User {
    id: number;
    name: string;
    email: string;
    pin: number;
}

export const useUser = defineStore("user", {
    state: (): User => ({
        id: 0,
        name: "",
        email: "",
        pin: 0,
    }),

    getters: {
        isLogged(state) {
            return state.id > 0;
        },
        verified(state) {
            return state.pin != 0;
        },
    },

    actions: {
        async sync() {
            try {
                const res = await fetchApi(API_BASE + "/auth");
                if (!res.success || !res.rows?.length) {
                    throw new Error("Does not matter");
                }
                const user = res.rows[0];
                this.id = user.id;
                this.name = user.name;
                this.email = user.email;
                this.pin = 0;
            } catch (error) {
                this.id = 0;
                this.name = "";
                this.pin = 0;
            }
        },

        apply(user: any) {
            this.id = user.id;
            this.name = user.name;
            this.email = user.email;
            this.pin = user.pin;
        },
    },
});
