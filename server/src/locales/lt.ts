export default {
  emails: {
    resetPassword: {
      subject: 'Atkurkite slaptažodį',
      text: 'Spustelėkite nuorodą, kad atkurtumėte slaptažodį: %{resetLink}'
    }
  },
  validation: {
    general: 'Peržiūrėkite laukus ir bandykite dar kartą',
    reviewField: 'Peržiūrėkite lauką',
    invoice: {
      invoiceId: 'Turi atitikti formatą "ABC123"',
      date: 'Reikalinga tinkama data',
      dueDate: 'Reikalinga tinkama data',
      dueDateAfterDate: 'Terminas neturi būti ankstesnis už sąskaitos datą',
      status: 'Tinkama būsena yra privaloma',
      businessType: 'Reikalingas "Verslas" arba "Fizinis asmuo"',
      partyType: 'Tinkamas šalies tipas yra privalomas',
      totalAmount: 'Bendra suma yra privaloma',
      sender: {
        required: 'Siuntėjas yra privalomas',
        name: 'Vardas arba pavadinimas yra privalomas',
        businessNumber: 'Įmonės kodas yra privalomas',
        address: 'Adresas yra privalomas',
        email: 'Tinkamas el. pašto adresas yra privalomas'
      },
      receiver: {
        required: 'Gavėjas yra privalomas',
        name: 'Vardas arba pavadinimas yra privalomas',
        businessNumber: 'Įmonės kodas iki 15 simbolių yra privalomas',
        address: 'Adresas iki 255 simbolių yra privalomas',
        email: 'Tinkamas el. pašto adresas yra privalomas'
      },
      services: {
        required: 'Būtina bent viena paslauga',
        description: 'Aprašymas iki 200 simbolių yra privalomas',
        unit: 'Vienetas iki 20 simbolių yra privalomas',
        quantity: 'Kiekis tarp 0.0001 ir 10,000 yra privalomas',
        amount: 'Suma tarp 0.01 ir 1,000,000 yra privaloma'
      },
      bankingInformation: {
        required: 'Banko informacija yra privaloma',
        name: 'Banko pavadinimas yra privalomas',
        code: 'Banko kodas yra privalomas',
        accountNumber: 'Banko sąskaitos numeris yra privalomas'
      },
      email: {
        format: 'Neteisingas el. pašto adresas',
        subject: 'Tema yra privaloma',
        message: 'Žinutė per ilga'
      },
      recipientEmail: 'Tinkamas gavėjo el. pašto adresas yra privalomas',
      subject: 'Tema yra privaloma',
      message: 'Žinutė negali viršyti 1000 simbolių'
    },
    client: {
      name: 'Vardas arba pavadinimas yra privalomas',
      businessNumber: 'Įmonės kodas yra privalomas',
      address: 'Adresas yra privalomas',
      email: 'Turi būti tinkamas el. pašto adresas'
    },
    bankingInformation: {
      name: 'Banko pavadinimas yra privalomas',
      code: 'Banko kodas yra privalomas',
      accountNumber: 'Banko sąskaitos numeris yra privalomas'
    },
    user: {
      name: 'Vardas arba pavadinimas yra privalomas',
      businessNumber: 'Įmonės kodas yra privalomas',
      address: 'Adresas yra privalomas',
      email: 'Tinkamas el. pašto adresas yra privalomas',
      password: 'Dabartinis slaptažodis yra privalomas',
      newPassword: 'Naujas slaptažodis yra privalomas',
      confirmedNewPassword: 'Naujas patvirtintas slaptažodis yra privalomas',
      passwordMismatch:
        'Patvirtintas slaptažodis nesutampa su nauju slaptažodžiu',
      loginPassword: 'Slaptažodis turi būti bent 6 simbolių ilgio',
      registerPassword: 'Slaptažodis turi būti bent 6 simbolių ilgio',
      confirmedPassword: 'Turi sutapti su slaptažodžiu',
      currency: 'Valiuta yra privaloma',
      language: 'Kalba yra privaloma'
    },
    contact: {
      email: 'Neteisingas el. pašto adresas',
      message: 'Žinutė turi būti nuo 1 iki 5000 simbolių ilgio'
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
      resetLinkSent:
        'Slaptažodžio atstatymo nuoroda išsiųsta į nurodytą el. paštą',
      selectedBankAccountUpdated:
        'Pagrindinė banko sąskaita atnaujinta sėkmingai'
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
      createdWithWarning:
        'Banko sąskaita pridėta sėkmingai. Pasirinkite ją kaip pagrindinę sąskaitą.',
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
      unableToCreate: 'Nepavyko sukurti vartotojo',
      unableToUpdate: 'Nepavyko atnaujinti vartotojo informacijos',
      unableToDelete: 'Šiuo metu nepavyko ištrinti paskyros. Bandykite vėliau',
      unableToUpdateProfilePicture: 'Nepavyko atnaujinti profilio nuotraukos',
      unableToUpdateAccountSettings: 'Nepavyko atnaujinti paskyros nustatymų',
      unableToChangePassword: 'Nepavyko pakeisti slaptažodžio',
      unableToSendResetLink:
        'Nepavyko išsiųsti nuorodos slaptažodžiui atkurti. Bandykite vėliau',
      tokenInvalid: 'Raktas yra neteisingas',
      tokenExpired: 'Rakto galiojimo laikas pasibaigė',
      unableToUploadSignature: 'Nepavyko įkelti parašo',
      unableToUpdateSelectedBankAccount:
        'Nepavyko atnaujinti pagrindinės banko sąskaitos'
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
      alreadyExists:
        'Banko sąskaita su nurodytu sąskaitos numeriu jau egzistuoja',
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
