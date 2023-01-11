<template>
    <div class="container">
        <select v-model="selectedMonth">
            <option v-for="month in allMonthsList" :key="month" :value="month">
                {{ month }}
            </option>
        </select>
        <p>Total tests cost: BDT{{ currentMonthEarnings }}</p>
        <p>Total discount offered: BDT{{ currentMonthDiscounts }}</p>
        <p>Net earnings: BDT{{ currentMonthNetEarnings }}</p>
    </div>
</template>

<script>
const ipc = window.ipcRenderer;

export default {
    name: "Summary",
    data() {
        return {
            tests: [],
            allData: [],
            allMonths: new Set(),
            selectedMonth: "",
        };
    },
    computed: {
        allMonthsList() {
            const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            return Array.from(this.allMonths).sort((a, b) => {
                const a_year = a.split(" ")[1];
                const b_year = b.split(" ")[1];
                if (a_year == b_year) {
                    const a_month = months.indexOf(a.split(" ")[0]);
                    const b_month = months.indexOf(b.split(" ")[0]);
                    return a_month - b_month;
                } else return a_year - b_year;
            });
        },
        currentMonthRecords() {
            return this.allData.filter(
                (record) => record.date == this.selectedMonth
            );
        },
        currentMonthEarnings() {
            const mapTestToCost = (testID) => {
                const matchingTests = this.tests.filter(
                    (test) => test._id == testID
                );
                if (matchingTests.length) {
                    return matchingTests[0].cost;
                } else {
                    return 0;
                }
            };

            const getRecordTestsCost = (record) => {
                return record.tests.reduce((acc, test) => {
                    return acc + mapTestToCost(test);
                }, 0);
            };

            return this.currentMonthRecords.reduce((acc, record) => {
                return acc + getRecordTestsCost(record);
            }, 0);
        },
        currentMonthDiscounts() {
            return this.currentMonthRecords.reduce((acc, record) => {
                return acc + record.discount;
            }, 0);
        },
        currentMonthNetEarnings() {
            return this.currentMonthEarnings - this.currentMonthDiscounts;
        },
    },
    methods: {
        dateToMonth(dateString) {
            const timestamp = Date.parse(dateString);
            const dateObj = new Date(timestamp);
            const date_year = dateObj.toDateString().split(" ");
            return `${date_year[1]} ${date_year[3]}`;
        },
    },
    beforeMount() {
        this.allData = ipc.sendSync("get-staged", {});
        this.allData.push(...ipc.sendSync("get-records", {}));
        this.tests = ipc.sendSync("get-tests");
    },
    mounted() {
        this.allData.forEach((record) => {
            record.date = this.dateToMonth(record.date);
            this.allMonths.add(record.date);
        });
    },
};
</script>

<style lang="scss" scoped>
.container {
    margin: 1rem;
    font-size: 1.5rem;

    select {
        font-size: 1.5rem;
        margin-bottom: 0.75rem;
    }

    * {
        margin-bottom: 0.5rem;
    }
}
</style>
