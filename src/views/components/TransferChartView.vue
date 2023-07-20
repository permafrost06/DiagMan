<script setup lang="ts">
import Container from "@/components/dev/Container.vue";
import TextArea from "@/components/dev/TextArea.vue";
import TextInput from "@/components/dev/TextInput.vue";
import Row from "@/components/dev/Row.vue";
import Btn from "@/components/dev/Btn.vue";
import Chart from "@/components/chart/Chart.vue";
import type { TransferChartData } from "@/components/chart/TransferChart";
import { onMounted, ref } from "vue";

const dataText = ref<string>("");
const data = ref<TransferChartData>({
    total: 0,
    packets: [],
});

const size = ref<number>(1000 * 10);
const packetCount = ref<number>(100);
const maxPacket = ref<number>(10000);

onMounted(() => {
    genRandom();
});

function genRandom() {
    const dataL: TransferChartData = {
        total: 0,
        packets: [],
    };
    let text = "";
    for (let i = 0; i < packetCount.value; i++) {
        const pack = Math.round(Math.random() * maxPacket.value);
        text += pack.toString() + " ";
        dataL.packets.push(pack);
    }

    data.value = dataL;
    dataText.value = text;
}

const applyInput = () => {
    const dataL: TransferChartData = {
        total: size.value,
        packets: [],
    };
    dataText.value.split(" ").forEach((val) => {
        const pack = parseInt(val);
        if (!pack) {
            return;
        }
        dataL.packets.push(pack);
    });

    data.value = dataL;
};
</script>

<template>
    <Container>
        <Row class="my-sm" gap="5px">
            <div>
                <TextInput v-model="size" placeholder="Total Size" />
            </div>
            <div>
                <TextInput v-model="packetCount" placeholder="Packet Count" />
            </div>
            <div>
                <TextInput
                    v-model="maxPacket"
                    placeholder="Maximum Packet Size"
                />
            </div>
        </Row>
        <TextArea placeholder="Data" v-model="dataText"> </TextArea>
        <Btn class="my-sm" @click="applyInput">Apply</Btn>
        <Btn class="m-sm" @click="genRandom">Random</Btn>
    </Container>
    <Container>
        <Chart type="transfer" :data="data" />
    </Container>
</template>
<style>
svg {
    height: 200px !important;
}
</style>
