import * as random from "../records.js";

export default {
    methods: {
        randomGen(field) {
            switch (field) {
                case "id":
                    this.id = Math.random().toString(36).substr(2, 9);
                    break;
                case "name":
                    this.patientName = random.getRandomName();
                    break;
                case "collDate":
                    this.collDate = random.getRandomDate();
                    break;
                case "date":
                    this.date = random.getRandomDate();
                    break;
                case "age":
                    this.age = String(random.random(100));
                    break;
                case "gender":
                    this.gender = random.getRandomGender();
                    break;
                case "contact":
                    this.contactNo = random.getRandomContact();
                    break;
                case "specimen":
                    this.specimen = random.getRandomSpecimen();
                    break;
                case "referer":
                    this.referer = random.getRandomReferer();
                    break;
                case "deliveryDate":
                    this.deliveryDate = random.getRandomDate();
                    break;

                default:
                    this.id = Math.random().toString(36).substr(2, 9);
                    this.patientName = random.getRandomName();
                    this.collDate = random.getRandomDate();
                    this.date = random.getRandomDate();
                    this.age = String(random.random(100));
                    this.gender = random.getRandomGender();
                    this.contactNo = random.getRandomContact();
                    this.specimen = random.getRandomSpecimen();
                    this.referer = random.getRandomReferer();
                    this.deliveryDate = random.getRandomDate();
                    this.selectedTests = Array.from(
                        new Set(
                            [...Array(4)].map(
                                () =>
                                    ~~(
                                        (Math.random() * 40) %
                                        this.filteredTests.length
                                    )
                            )
                        )
                    ).map((x) => this.filteredTests[x]._id);
                    this.discount = random.random(this.subtotal);
                    break;
            }
        },
    },
};
