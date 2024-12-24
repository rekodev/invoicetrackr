export default {
  text: 'Tekstas',
  validationErrors: {
    invoice: {
      name: 'Vardas arba pavadinimas yra privalomas',
      status: 'Būsena yra privaloma',
      services: {
        description: 'Aprašymas yra privalomas',
        amount: 'Kiekis yra privalomas',
      },
    },
    user: {
      password: 'Dabartinis slaptažodis yra privalomas',
      newPassword: 'Naujas slaptažodis yra privalomas',
      confirmedNewPassword: 'Naujas patvirtintas slaptažodis yra privalomas',
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
      changePassword: {
        currentPassword: 'Dabartinis slaptažodis neteisingas',
        newAndConfirmed:
          'Naujas ir naujas patvirtintas slaptažodžiai nesutampa',
        success: 'Slaptažodis pakeistas sėkmingai',
        badRequest: 'Nepavyko pakeisti slaptažodžio',
      },
    },
  },
};
