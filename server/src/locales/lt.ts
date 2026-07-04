export default {
  emails: {
    resetPassword: {
      subject: 'Atkurkite slaptažodį',
      text: 'Spustelėkite nuorodą, kad atkurtumėte slaptažodį: %{resetLink}',
      greeting: 'Sveiki!',
      message:
        'Gavome prašymą atkurti jūsų slaptažodį. Spustelėkite žemiau esantį mygtuką, kad sukurtumėte naują slaptažodį:',
      buttonText: 'Atkurti slaptažodį',
      orCopy: 'Arba nukopijuokite ir įklijuokite šią nuorodą į savo naršyklę:',
      linkExpiry:
        'Ši nuoroda baigs galioti po 1 valandos dėl saugumo priežasčių.',
      noRequest:
        'Jei jūs neprašėte atkurti slaptažodžio, galite drąsiai ignoruoti šį laišką.',
      footer: 'Šis el. laiškas buvo išsiųstas InvoiceTrackr',
      copyright: '© %{year} InvoiceTrackr. Visos teisės saugomos.'
    },
    verifyEmail: {
      subject: 'Patvirtinkite InvoiceTrackr el. paštą',
      text: 'Spustelėkite nuorodą, kad patvirtintumėte el. paštą: %{verificationLink}',
      greeting: 'Sveiki prisijungę prie InvoiceTrackr!',
      message:
        'Patvirtinkite el. pašto adresą, kad galėtumėte siųsti sąskaitas ir gauti paskyros pranešimus.',
      buttonText: 'Patvirtinti el. paštą',
      orCopy: 'Arba nukopijuokite ir įklijuokite šią nuorodą į savo naršyklę:',
      linkExpiry:
        'Ši nuoroda baigs galioti po 24 valandų dėl saugumo priežasčių.',
      noRequest:
        'Jei nekūrėte InvoiceTrackr paskyros, galite drąsiai ignoruoti šį laišką.',
      footer: 'Šis el. laiškas buvo išsiųstas InvoiceTrackr',
      copyright: '© %{year} InvoiceTrackr. Visos teisės saugomos.'
    },
    invoice: {
      title: 'InvoiceTrackr',
      defaultMessage: 'Prašome rasti prisegtos sąskaitos faktūrą.',
      detailsTitle: 'Sąskaitos faktūros informacija',
      sentBy: 'Šią sąskaitą faktūrą per InvoiceTrackr išsiuntė %{senderName}.',
      invoiceNumber: 'Sąskaitos numeris:',
      amount: 'Suma:',
      dueDate: 'Terminas:',
      from: 'Nuo:',
      attachmentTitle: 'Sąskaita prisegta',
      attachmentMessage:
        'Pilnas sąskaitos faktūros dokumentas pridėtas prie šio el. laiško kaip PDF failas.',
      signingTitle: 'Peržiūrėkite ir pasirašykite sąskaitą',
      signingMessage:
        'Atidarykite saugią sąskaitos nuorodą, peržiūrėkite dokumentą, pridėkite parašą ir atsisiųskite pasirašytą PDF.',
      signingButton: 'Peržiūrėti ir pasirašyti',
      publicInvoiceTitle: 'Peržiūrėti sąskaitą',
      publicInvoiceMessage:
        'Atidarykite saugų sąskaitos puslapį, peržiūrėkite PDF, mokėjimo informaciją ir apmokėkite internetu, jei siuntėjas priima kortelių mokėjimus.',
      publicInvoiceButton: 'Peržiūrėti sąskaitą',
      signedNotification: {
        recipient: 'Gavėjas',
        subject: 'Sąskaita %{invoiceId} buvo pasirašyta',
        message: '%{receiverName} pasirašė sąskaitą %{invoiceId}.',
        review: 'Pasirašytą sąskaitą galite peržiūrėti čia:',
        reviewButton: 'Peržiūrėti pasirašytą sąskaitą'
      },
      footer: 'Šis el. laiškas buvo išsiųstas InvoiceTrackr',
      copyright: 'InvoiceTrackr. Visos teisės saugomos.'
    },
    billing: {
      buttonText: 'Tvarkyti mokėjimą',
      fallback:
        'Arba nukopijuokite ir įklijuokite šią mokėjimo nuorodą į naršyklę:',
      note: 'Atnaujinti mokėjimo duomenys padeda be pertraukų naudotis sąskaitų išrašymo procesu.',
      trialEnding: {
        subject: 'Jūsų bandomasis laikotarpis netrukus baigsis',
        text: 'Jūsų 7 dienų bandomasis laikotarpis netrukus baigsis. Pridėkite mokėjimo būdą paskyros nustatymuose, kad galėtumėte toliau naudotis InvoiceTrackr.'
      },
      paymentFailed: {
        subject: 'Nepavyko apdoroti InvoiceTrackr mokėjimo',
        text: 'Nepavyko apdoroti prenumeratos mokėjimo. Turite 3 dienas atnaujinti mokėjimo būdą paskyros nustatymuose.'
      }
    },
    incomeJournal: {
      filename: 'pajamu-zurnalas',
      paymentDate: 'Apmokėjimo data',
      invoiceDate: 'Sąskaitos data',
      documentNumber: 'Dokumento numeris',
      client: 'Pirkėjas',
      clientCode: 'Pirkėjo kodas',
      services: 'Paslaugos / prekės',
      subtotal: 'Suma be PVM (%{currency})',
      vatTotal: 'PVM suma (%{currency})',
      grandTotal: 'Bendra suma (%{currency})'
    }
  },
  validation: {
    general: 'Peržiūrėkite laukus ir bandykite dar kartą',
    reviewField: 'Peržiūrėkite lauką',
    password: {
      required: 'Slaptažodis yra privalomas',
      currentRequired: 'Dabartinis slaptažodis yra privalomas',
      tooShort: 'Slaptažodis turi būti bent 8 simbolių ilgio',
      tooLong: 'Slaptažodis negali viršyti 100 simbolių',
      requireUppercase: 'Slaptažodis turi turėti bent vieną didžiąją raidę',
      requireLowercase: 'Slaptažodis turi turėti bent vieną mažąją raidę',
      requireNumber: 'Slaptažodis turi turėti bent vieną skaičių',
      mismatch: 'Slaptažodžiai nesutampa'
    },
    invoice: {
      invoiceId: 'Turi atitikti formatą "ABC123" arba "SF001"',
      invoiceSeries: 'Sąskaitos serija turi būti 2-8 raidės',
      date: 'Reikalinga tinkama data',
      dueDate: 'Reikalinga tinkama data',
      dueDateAfterDate: 'Terminas neturi būti ankstesnis už sąskaitos datą',
      incomeJournalDateRange:
        'Pabaigos data negali būti ankstesnė už pradžios datą',
      status: 'Tinkama būsena yra privaloma',
      documentType: 'Tinkamas sąskaitos dokumento tipas yra privalomas',
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
        quantity: {
          number: 'Kiekis turi būti skaičius',
          min: 'Kiekis turi būti bent 0.0001',
          max: 'Kiekis negali viršyti 10,000'
        },
        amount: {
          number: 'Suma turi būti skaičius',
          min: 'Suma turi būti bent 0.01',
          max: 'Suma negali viršyti 10,000,000'
        }
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
    bankAccount: {
      name: 'Banko pavadinimas yra privalomas',
      code: 'Banko kodas yra privalomas',
      accountNumber: 'Banko sąskaitos numeris yra privalomas'
    },
    user: {
      name: 'Vardas arba pavadinimas yra privalomas',
      businessNumber: 'Įmonės kodas yra privalomas',
      address: 'Adresas yra privalomas',
      email: 'Tinkamas el. pašto adresas yra privalomas',
      currency: 'Valiuta yra privaloma',
      language: 'Kalba yra privaloma',
      preferredInvoiceLanguage: 'Pageidaujama sąskaitos kalba yra privaloma'
    },
    contact: {
      email: 'Neteisingas el. pašto adresas',
      message: 'Žinutė turi būti nuo 1 iki 5000 simbolių ilgio'
    }
  },
  success: {
    user: {
      loggedIn: 'Sėkmingai prisijungta',
      created: 'Vartotojas sukurtas sėkmingai',
      updated: 'Vartotojo informacija atnaujinta sėkmingai',
      deleted: 'Paskyra ištrinta sėkmingai',
      profilePictureUpdated: 'Profilio nuotrauka atnaujinta sėkmingai',
      accountSettingsUpdated: 'Paskyros nustatymai atnaujinti sėkmingai',
      passwordChanged: 'Slaptažodis pakeistas sėkmingai',
      resetLinkSent:
        'Slaptažodžio atstatymo nuoroda išsiųsta į nurodytą el. paštą',
      verificationEmailSent: 'Patvirtinimo laiškas išsiųstas',
      emailVerified: 'El. paštas patvirtintas sėkmingai',
      emailAlreadyVerified: 'El. paštas jau patvirtintas',
      oauthLinked: 'Google paskyra prijungta sėkmingai',
      selectedBankAccountUpdated:
        'Pagrindinė banko sąskaita atnaujinta sėkmingai'
    },
    invoice: {
      created: 'Sąskaita faktūra pridėta sėkmingai',
      updated: 'Sąskaita faktūra atnaujinta sėkmingai',
      deleted: 'Sąskaita faktūra ištrinta sėkmingai',
      statusUpdated: 'Sąskaitos faktūros būsena atnaujinta sėkmingai',
      emailSent: 'El. laiškas išsiųstas sėkmingai',
      signed: 'Sąskaita faktūra pasirašyta sėkmingai',
      signingLinkRevoked: 'Pasirašymo nuoroda atšaukta',
      signingLinkRegenerated: 'Sugeneruota nauja pasirašymo nuoroda',
      correctionCreated: 'Sukurtas tikslinimo juodraštis',
      creditNoteCreated: 'Sukurtas kreditinės sąskaitos juodraštis'
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
      unableToSendVerificationEmail:
        'Nepavyko išsiųsti patvirtinimo laiško. Bandykite vėliau',
      emailVerificationRequired:
        'Patvirtinkite el. paštą prieš siųsdami sąskaitas el. paštu',
      emailVerificationCooldown:
        'Palaukite prieš prašydami kito patvirtinimo laiško',
      oauthEmailNotVerified:
        'Google nepatvirtino šio el. pašto adreso. Naudokite kitą prisijungimo būdą',
      tokenInvalid: 'Raktas yra neteisingas',
      tokenExpired: 'Rakto galiojimo laikas pasibaigė',
      tokenAlreadyUsed: 'Raktas jau panaudotas',
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
      unableToSendEmail: 'Nepavyko išsiųsti el. laiško',
      unableToCreatePublicLink: 'Nepavyko sukurti viešos sąskaitos nuorodos',
      unableToCreateSigningLink:
        'Nepavyko sukurti sąskaitos pasirašymo nuorodos',
      unableToCreateCorrection:
        'Nepavyko sukurti šios sąskaitos tikslinimo',
      unableToRegenerateSigningLink:
        'Nepavyko atnaujinti sąskaitos pasirašymo nuorodos',
      signingLinkExpired:
        'Šios sąskaitos nuorodos galiojimas baigėsi. Paprašykite siuntėjo naujos nuorodos.',
      signingLinkRevoked:
        'Ši sąskaitos nuoroda buvo atšaukta. Paprašykite siuntėjo naujos nuorodos.',
      publicLinkExpired:
        'Šios sąskaitos nuorodos galiojimas baigėsi. Paprašykite siuntėjo naujos nuorodos.',
      publicLinkRevoked:
        'Ši sąskaitos nuoroda buvo atšaukta. Paprašykite siuntėjo naujos nuorodos.',
      publicLinkRequired:
        'Apmokėjimui internetu reikia viešos sąskaitos nuorodos. Paprašykite siuntėjo naujos sąskaitos nuorodos.',
      notPayable: 'Šios sąskaitos negalima apmokėti internetu.',
      onlinePaymentUnavailable:
        'Siuntėjas nepriima internetinių mokėjimų už šią sąskaitą.',
      alreadySigned: 'Sąskaita faktūra jau pasirašyta',
      paidIssuedImmutable:
        'Ši sąskaita apmokėta per Stripe, todėl jos būsenos rankiniu būdu keisti negalima.',
      voidedImmutable:
        'Anuliuotų sąskaitų būsenos negalima keisti iš lentelės pasirinkimo.',
      issuedImmutable:
        'Išrašytų sąskaitų negalima redaguoti ar ištrinti šiame sraute'
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
