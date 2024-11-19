export default {
  text: 'Tekstas',
  validationErrors: {
    invoice: {
      name: 'Vardas arba pavadinimas yra privalomas',
      status: 'Būsena yra privaloma',
    },
    services: {
      description: 'Aprašymas yra privalomas',
      amount: 'Kiekis yra privalomas',
    },
  },
  errors: {
    user: {
      accountSettings: {
        update: {
          success: 'Paskyros nustatymai atnaujinti sėkmingai',
          badRequest: 'Nepavyko atnaujinti paskyros nustatymų',
        },
      },
    },
  },
};
