<template>
    <div>
        <button @click="addTimeStampsToAll">Add Timestamps</button>
        <div v-for="(rec, idx) in records" :key="rec._id">
            {{ idx + ": " + rec._id }}
        </div>
    </div>
</template>

<script>
import { getAllStaged, addTimestamp } from "../firebase";

export default {
    name: "timestampFix",
    data() {
        return {
            records: [],
        };
    },
    async mounted() {
        this.records = await getAllStaged();
    },
    methods: {
        async addTimeStampsToAll() {
            const staged = await getAllStaged();

            for (let i = 0; i <= 242; i++) {
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(true);
                    }, 1500);
                });
                console.log(staged[i]._id);
                await addTimestamp(staged[i]);
            }

            const unstamped = [];
            for (let i = 243; i <= staged.length; i++) {
                unstamped.push(staged[i]);
            }

            unstamped.sort((a, b) => {
                if (!a || !b) return 0;

                const id_a = Number(
                    a._id
                        .replace("(", "{")
                        .split("C-23-")[1]
                        .split("{")[0]
                        .trim()
                );
                const id_b = Number(
                    b._id
                        .replace("(", "{")
                        .split("C-23-")[1]
                        .split("{")[0]
                        .trim()
                );

                return id_a - id_b;
            });

            for (const rec of unstamped) {
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(true);
                    }, 1500);
                });

                if (rec) {
                    console.log(rec._id);
                    await addTimestamp(rec);
                }
            }
        },
    },
};
</script>
