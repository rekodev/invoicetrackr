export default {
  emails: {
    resetPassword: {
      subject: "Atkurkite slaptažodį",
      text: "Spustelėkite nuorodą, kad atkurtumėte slaptažodį: %{resetLink}",
      token: {
        invalid: "Raktas yra neteisingas",
        expired: "Rakto galiojimo laikas pasibaigė",
      },
    },
  },
  text: "Tekstas",
  validationErrors: {
    invoice: {
      name: "Vardas arba pavadinimas yra privalomas",
      status: "Būsena yra privaloma",
      services: {
        description: "Aprašymas yra privalomas",
        amount: "Kiekis yra privalomas",
      },
    },
    user: {
      password: "Dabartinis slaptažodis yra privalomas",
      newPassword: "Naujas slaptažodis yra privalomas",
      confirmedNewPassword: "Naujas patvirtintas slaptažodis yra privalomas",
    },
  },
  errors: {
    user: {
      accountSettings: {
        update: {
          success: "Paskyros nustatymai atnaujinti sėkmingai",
          badRequest: "Nepavyko atnaujinti paskyros nustatymų",
        },
      },
      changePassword: {
        currentPassword: "Dabartinis slaptažodis neteisingas",
        newAndConfirmed:
          "Naujas ir naujas patvirtintas slaptažodžiai nesutampa",
        success: "Slaptažodis pakeistas sėkmingai",
        badRequest: "Nepavyko pakeisti slaptažodžio",
      },
      resetPassword: {
        notFound: "Vartotojas su nurodytu el. paštu nerastas",
        success: "Slaptažodžio atstatymo nuoroda išsiųsta į nurodytą el. paštą",
      },
    },
  },
};
