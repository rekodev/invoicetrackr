export default {
  emails: {
    resetPassword: {
      subject: 'Atkurkite slaptažodį',
      text: 'Spustelėkite nuorodą, kad atkurtumėte slaptažodį: %{resetLink}'
    }
  },
  validation: {
    invoice: {
      name: 'Vardas arba pavadinimas yra privalomas',
      status: 'Būsena yra privaloma',
      services: {
        description: 'Aprašymas yra privalomas',
        amount: 'Kiekis yra privalomas'
      }
    },
    client: {
      email: 'Turi būti tinkamas el. pašto adresas'
    },
    user: {
      password: 'Dabartinis slaptažodis yra privalomas',
      newPassword: 'Naujas slaptažodis yra privalomas',
      confirmedNewPassword: 'Naujas patvirtintas slaptažodis yra privalomas'
    }
  },
  success: {
    user: {
      created: 'Vartotojas sukurtas sėkmingai',
      updated: 'Vartotojo informacija atnaujinta sėkmingai',
      deleted: 'Paskyra ištrinta sėkmingai',
      profilePictureUpdated: 'Profilio nuotrauka atnaujinta sėkmingai',
      accountSettingsUpdated: 'Paskyros nustatymai atnaujinti sėkmingai',
      passwordChanged: 'Slaptažodis pakeistas sėkmingai',
      resetLinkSent: 'Slaptažodžio atstatymo nuoroda išsiųsta į nurodytą el. paštą',
      selectedBankAccountUpdated: 'Pagrindinė banko sąskaita atnaujinta sėkmingai'
    },
    invoice: {
      created: 'Sąskaita faktūra pridėta sėkmingai',
      updated: 'Sąskaita faktūra atnaujinta sėkmingai',
      deleted: 'Sąskaita faktūra ištrinta sėkmingai',
      statusUpdated: 'Sąskaitos faktūros būsena atnaujinta sėkmingai',
      emailSent: 'El. laiškas išsiųstas sėkmingai'
    },
    client: {
      created: 'Klientas pridėtas sėkmingai',
      updated: 'Klientas atnaujintas sėkmingai',
      deleted: 'Klientas ištrintas sėkmingai'
    },
    bankAccount: {
      created: 'Banko sąskaita pridėta sėkmingai',
      createdWithWarning: 'Banko sąskaita pridėta sėkmingai. Pasirinkite ją kaip pagrindinę sąskaitą.',
      updated: 'Banko sąskaita atnaujinta sėkmingai',
      deleted: 'Banko sąskaita ištrinta sėkmingai'
    },
    payment: {
      subscriptionCanceled: 'Prenumerata atšaukta sėkmingai'
    },
    contact: {
      messageSent: 'Žinutė išsiųsta sėkmingai'
    }
  },
  error: {
    user: {
      notFound: 'Vartotojas nerastas',
      alreadyExists: 'Vartotojas jau egzistuoja',
      invalidCredentials: 'Neteisingi prisijungimo duomenys',
      passwordsDoNotMatch: 'Slaptažodžiai nesutampa',
      currentPasswordIncorrect: 'Dabartinis slaptažodis neteisingas',
      newPasswordMismatch: 'Naujas ir naujas patvirtintas slaptažodžiai nesutampa',
      unableToCreate: 'Nepavyko sukurti vartotojo',
      unableToUpdate: 'Nepavyko atnaujinti vartotojo informacijos',
      unableToDelete: 'Šiuo metu nepavyko ištrinti paskyros. Bandykite vėliau',
      unableToUpdateProfilePicture: 'Nepavyko atnaujinti profilio nuotraukos',
      unableToUpdateAccountSettings: 'Nepavyko atnaujinti paskyros nustatymų',
      unableToChangePassword: 'Nepavyko pakeisti slaptažodžio',
      unableToSendResetLink: 'Nepavyko išsiųsti nuorodos slaptažodžiui atkurti. Bandykite vėliau',
      tokenInvalid: 'Raktas yra neteisingas',
      tokenExpired: 'Rakto galiojimo laikas pasibaigė',
      unableToUploadSignature: 'Nepavyko įkelti parašo',
      unableToUpdateSelectedBankAccount: 'Nepavyko atnaujinti pagrindinės banko sąskaitos'
    },
    invoice: {
      notFound: 'Sąskaita faktūra nerasta',
      alreadyExists: 'Sąskaita faktūra su nurodytu numeriu jau egzistuoja',
      unableToCreate: 'Nepavyko pridėti sąskaitos faktūros',
      unableToUpdate: 'Nepavyko atnaujinti sąskaitos faktūros',
      unableToDelete: 'Nepavyko ištrinti sąskaitos faktūros',
      unableToUpdateStatus: 'Nepavyko atnaujinti sąskaitos faktūros būsenos',
      unableToRetrieveData: 'Nepavyko gauti sąskaitos faktūros duomenų',
      unableToSendEmail: 'Nepavyko išsiųsti el. laiško'
    },
    client: {
      notFound: 'Klientas nerastas',
      alreadyExists: 'Klientas jau egzistuoja',
      unableToCreate: 'Nepavyko pridėti kliento',
      unableToUpdate: 'Nepavyko atnaujinti kliento',
      unableToDelete: 'Nepavyko ištrinti kliento'
    },
    bankAccount: {
      notFound: 'Banko sąskaita nerasta',
      alreadyExists: 'Banko sąskaita su nurodytu sąskaitos numeriu jau egzistuoja',
      unableToCreate: 'Nepavyko pridėti banko sąskaitos',
      unableToUpdate: 'Nepavyko atnaujinti banko sąskaitos',
      unableToDelete: 'Nepavyko ištrinti banko sąskaitos',
      cannotDeleteSelected: 'Negalima ištrinti pasirinktos banko sąskaitos'
    },
    payment: {
      customerNotFound: 'Klientas nerastas',
      unableToCreateCustomer: 'Nepavyko sukurti kliento',
      subscriptionNotFound: 'Prenumerata nerasta',
      subscriptionAlreadyActive: 'Prenumerata jau aktyvi',
      unableToCreateSubscription: 'Nepavyko sukurti prenumeratos',
      unableToCancel: 'Nepavyko atšaukti prenumeratos'
    },
    contact: {
      unableToSendMessage: 'Nepavyko išsiųsti žinutės'
    }
  }
};
