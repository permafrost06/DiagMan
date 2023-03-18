<script setup lang="ts">
import { ref } from "vue";
import TableComponent from "@/components/TableComponent.vue";

const tableCols = ref([
    {
        name: "id",
        label: "ID",
        break: true,
    },
    {
        name: "date",
        label: "Date",
        break: true,
    },
    {
        name: "patientName",
        label: "Name",
        break: true,
    },
    {
        name: "age",
        label: "Age",
        break: true,
    },
    {
        name: "referer",
        label: "Referer",
        break: true,
    },
    {
        name: "specimen",
        label: "Specimen",
        break: true,
    },
    {
        name: "aspNote",
        label: "Note",
        break: true,
    },
    {
        name: "impression",
        label: "Impression",
        break: true,
    },
    {
        name: "me",
        label: "Me",
        break: true,
    },
]);

const tableData = ref([
    {
        id: "00002",
        date: "01-01-2020",
        patientName: "Mr Laxmiban Chakma",
        age: "44 years",
        referer: "Prof. / Dr:",
        specimen: "Left parotid swelling",
        aspNote: "On aspiration blood mixed material came out.",
        me: "Smears showed cellular material composed of many scattered and clusters of benign ductal epithelial cells along with lymphocytes and histiocytes, in the background of scanty blood.        No epithelioid or malignant cell was seen.",
        impression: "Left parotid swelling(FNA): Sialadenitis",
    },
    {
        id: "00003",
        date: "01-01-2020",
        patientName: "Humayra",
        age: "06 years",
        referer: "Prof. / Dr: Md Salim, MBBS,MCPS, MS(Surgery)",
        specimen: "Left cervical lymph nodes",
        aspNote: "On aspiration, blood mixed cellular material came out.",
        me: "Smear showed cellular material composed of polymorphous population of lymphoid cells along cells with much enlarged nucleus with prominent nucleoli often they were binucleated in the background of scanty blood.No epithelioid cell was seen.",
        impression:
            "Left cervical lymph nodes(FNA):See description please NB: Require histopathology to exclude HodgkinÆs disease",
    },
    {
        id: "00004",
        date: "02-01-2020",
        patientName: "Mrs Lucky",
        age: "40 years",
        referer: "Prof. / Dr: CGH",
        specimen: "Right forearm swellinlling",
        aspNote: "On aspiration blood mixed material came out.",
        me: "Smears showed few clusters of benign fibroblasts, adipocytes along with many lymphocytes in a background of blood.No epithelioid or malignant cell was seen.",
        impression: "Right forearm swellinlling(FNA):Benign mesenchymal lesion",
    },
    {
        id: "00005",
        date: "02-01-2020",
        patientName: "Ishrat Jahan",
        age: "14 years",
        referer: "Prof. / Dr: Kamol Krisna Pramanik, MBBS, FCPS(ENT)",
        specimen: "Right cervical lymph nodes",
        aspNote: "On aspiration, caseous necrotic material came out.",
        me: "Smear showed many scattered and aggregates of epithelioid cells along with histiocytes, lymphocytes in the background of caseation necrosis.No malignant cell was seen.",
        impression:
            "Right cervical lymph nodes(FNA):Caseating granuloma Suggestive of Tuberculosis",
    },
    {
        id: "00006",
        date: "02-01-2020",
        patientName: "Mrs Baby Dey",
        age: "34 years",
        referer: "Prof. / Dr: Supran  Biswas, MBBS,  FCPS",
        specimen: "Left thyroid swelling",
        aspNote:
            "On aspiration, brownish fluid came out. Aspirated from two sites.",
        me: "Smears showed many scattered and sheets of regular follicular cells with plenty of scattered histiocytes, colloid and hemosiderin laden macrophages in the background of blood mixed colloid.No epithelioid or malignant cell was seen.",
        impression:
            "Left thyroid swelling (FNA): Nodular goitre with cystic changes",
    },
    {
        id: "00007",
        date: "02-01-2020",
        patientName: "Mr Borhan Uddin",
        age: "26 years",
        referer: "Prof. / Dr: Mohammad Omar Farooque,MBBS, MCPS,DLO(DU)",
        specimen: "Swelling over dorsum of the tongue",
        aspNote: "On aspiration scanty blood mixed material came out.",
        me: "Smears showed hypo-cellular material composed of few scattered fibroblasts and mixed inflamtory cells in the background of blood.        No epithelioid or malignant cell was seen.",
        impression:
            "Swelling over dorsum of the tongue(FNA): Negative for malignant cell",
    },
    {
        id: "00009",
        date: "05-01-2020",
        patientName: "Mr Arun Kanti Nath",
        age: "88 years",
        referer: "Prof. / Dr: Tapash Mitra, MBBS, MPhil, FCPS",
        specimen: "Left cervical lymph node",
        aspNote: "On aspiration necrotic cellular material came out.",
        me: "Smears showed cellular material composed of many scattered and small to large clusters of spindle to polygonal malignant squamous epithelial cells with pleomorphic, enlarged and hyperchromatic nucleus in the background of necrosis and plenty of acute inflammatory cells and lymphocytes.",
        impression:
            "Left cervical lymph node (FNA): Metastatic squamous cell carcinoma",
    },
    {
        id: "00010",
        date: "05-01-2020",
        patientName: "Ms Jannatul Naim",
        age: "13 years",
        referer: "Prof. / Dr: Muhammad Mukit Osman Chawdhury, MBBS, BCS",
        specimen: "Submental lymph node",
        aspNote: "On aspiration, scanty blood mixed material came out..",
        me: "Smear showed hypo-cellular material composed of few reactive lymphocytes, adipocytes and skeletal muscle cells  in the background of scanty blood.No epithelioid or malignant cell was seen.",
        impression:
            "Submental lymph node(FNA):Chronic non-specific lymphadenitis",
    },
    {
        id: "00011",
        date: "05-01-2020",
        patientName: "Mrs Protima Das",
        age: "41 years",
        referer: "Prof. / Dr: Sreekanto Banik,MBBS, MCPS, MS(Surgery)",
        specimen: "Left supra-clavicular lymph node",
        aspNote: "On aspiration, caseous necrotic material came out.",
        me: "Smear showed many scattered and aggregates of epithelioid cells along with histiocytes, lymphocytes in the background of blood mixed caseation necrosis.No malignant cell was seen.",
        impression:
            "Left supra-clavicular lymph node (FNA):Caseating granuloma Suggestive of Tuberculosis",
    },
    {
        id: "00012",
        date: "05-01-2020",
        patientName: "Mrs Shahnaz Begum",
        age: "32 years",
        referer: "Prof. / Dr: CMCH",
        specimen:
            "Left breast lump (USG guided FNA)USG guide: Dr. Subash Mazumder, MBBS,BCS, MD : Professor & Head, R&I Dept, CMCH",
        aspNote: "Blood mixed material came out on aspiration.",
        me: "Smears show cellular material composed of many scattered, clusters and tiny fragments of monolayer sheets of benign ductal epithelial cells along with plenty of bare nuclei and many histiocytes.No epithelioid or malignant cell was seen.",
        impression:
            "Left breast lump (USG guided FNA):Fibroadenoma with fibrocystic changes",
    },
]);

const actionOne = (data: any) => {
    console.log(data);
};
</script>

<template>
    <TableComponent
        :cols="tableCols"
        :data="tableData"
        mobile-view="collapsed"
        :actions="[
            {
                text: 'Finalize',
                onClick: actionOne,
            },
            {
                text: 'Delete',
                onClick: actionOne,
            },
        ]"
    />
</template>
