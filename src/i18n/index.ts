import { createI18n } from "vue-i18n";

export const localeOptions = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
] as const;

export type Locale = (typeof localeOptions)[number]["code"];

const STORAGE_KEY = "santas_draw_locale";

const messages = {
  tr: {
    languageSwitcher: {
      label: "Dil seçimi",
    },
    common: {
      appName: "Santa's Draw",
      ok: "Tamam",
      cancel: "İptal",
      copy: "Kopyala",
      copied: "Link kopyalandı!",
      loading: "Yükleniyor…",
      tagline: "MUTLU",
      title: "YILLAR"
    },
    landing: {
      tagline: "Santa's Edition",
      title: "Santa's Draw",
      subtitlePrefix: "Yılbaşı çekilişini",
      subtitleManualHighlight: "hemen başlat",
      subtitleMiddle: "veya",
      subtitleInviteHighlight: "davet linkiyle katılımcı topla",
      manualCardDescriptionLine1: "Katılımcıları kendin ekle,",
      manualCardDescriptionLine2: "hemen çekilişi başlat ve yılbaşı eğlencesine başla! ⚡",
      manualCardButton: "Başla",
      inviteCardDescriptionLine1: "Katılımcılar form ile katılsın,",
      inviteCardDescriptionLine2: "belirlediğin tarihte otomatik çekilsin ya da sen tek tıkla başlat! 🎄",
      inviteCardButton: "Üye Ol & Başla",
      footnote:
        "🎁 Katılımcıların e-posta ile bilgilendirilmesi, çekiliş zamanlaması ve grup yönetimi daha sonra eklenecek.",
      back: "← Geri dön",
      goRegister: "← Kayıt ol",
    },
    dashboard: {
      tagline: "Yılbaşı eğlencesi başlıyor! 🎉",
      title: "Çekiliş Modunu Seç",
      subtitle: "Aktif etkinliklerini solda gör, sağdan yeni bir çekiliş başlat.",
      manualCard: {
        title: "Manuel Mod",
        description: "Katılımcıları kendin ekle, kuralları belirle ve hemen çekilişi başlat! ⚡",
        cta: "Başla ⚡",
      },
      inviteCard: {
        title: "Davet Mod",
        description: "Katılımcılar formu doldursun, belirlediğin tarihte otomatik çekilsin veya sen tek tıkla başlat! 🎄",
        description2: "Yeni Yıla Özel Davet Modu!",
        cta: "Noel'i başlat",
        tag: "Özel"
      },
      backButton: "Geri",
      logout: "Çıkış Yap"
    },
    drawSettings: {
      settingsTitle: "Çekiliş Ayarları",
      settingsActive: "{count} ayar aktif",
      settingsOptional: "Opsiyonel ayarları yapılandırın",
      requireAddress: "Adres Bilgisi İste",
      requireAddressDesc: "Katılımcılardan teslimat için adres bilgisi toplanır",
      requirePhone: "Telefon Numarası İste",
      requirePhoneDesc: "Katılımcılardan iletişim için telefon numarası toplanır",
      enableDrawDate: "Çekiliş Tarihi Belirle",
      drawDateEnabledDesc: "Çekiliş belirlenen tarihte otomatik olarak yapılır",
      drawDateDisabledDesc: "İstediğiniz zaman manuel olarak çekiliş yapabilirsiniz",
      dateLabel: "Tarih",
      timeLabel: "Saat",
      selectTime: "Saat seçiniz",
      drawDateTimeInfo: "Çekiliş {date} tarihinde otomatik olarak gerçekleştirilecektir",
      drawDateOnlyInfo: "Çekiliş {date} tarihinde yapılacaktır (Saat belirtilmedi)"
    },
    draw: {
      headingTagline: "Santa's Draw",
      headingTitle: "Çekilişini Yönet",
      headingSubtitle: "Katılımcıları ekle, kuralları belirle ve yeni yılın ilk sürprizini başlat! 🎁✨",
      manualModeTitle: "Manuel katılımcı modu",
      inviteModeTitle: "Davet linki modu",
      modeDescription:
        "Katılımcıları istersen elle ekle, istersen davet linkiyle gelenleri izle. Modu yukarıdaki butonla değiştirebilirsin.",
      viewInviteButton: "Davet linki modunu gör",
      backManualButton: "Manuel moda dön",
      requireAddress: "Adres zorunlu olsun",
      requirePhone: "Telefon zorunlu olsun",
      enableDrawDate: "Çekiliş tarihi ekle",
      drawDateOptionalHint: "Tarih eklemezsen, çekilişi istediğin an başlatabilirsin! ⚡",
      drawDateLabel: "Çekiliş Tarihi",
      drawDateHelper: "Çekiliş tarihi seçilmelidir",
      drawDateInfo: "Çekiliş {date} gece yarısı (00:00) yapılacak",
      fields: {
        firstName: { label: "İsim", placeholder: "Örn. Hakan" },
        lastName: { label: "Soyisim", placeholder: "Örn. Budak" },
        email: { label: "Email", placeholder: "{'Örn. hakan@example.com'}" },
        address: { label: "Adres", placeholder: "Hediye göndermek için adres" },
        phone: { label: "Telefon", placeholder: "İletişim için telefon" },
      },
      manualButtons: {
        add: "Katılımcı ekle",
        update: "Katılımcıyı güncelle",
        cancel: "İptal",
        create: "Çekilişi Yap",
        creating: "Çekiliş yapılıyor…",
        newDraw: "Yeni Çekiliş Yap",
      },
      inviteButtons: {
        save: "Bilgilerimi kaydet",
        saving: "Kaydediliyor…",
        newDraw: "Yeni Çekiliş Başlat",
      },
      executeButton: "Çekilişi Yap",
      executingButton: "Çekiliş yapılıyor…",
      executeButtonHint: "En az 3 katılımcı olmadan çekiliş yapamazsın.",
      readyForDrawButton: "Çekilişe Hazırız",
      readyForDrawMessage: "Çekiliş belirlenen tarihte otomatik olarak yapılacak.",
      readyForDrawInfoTitle: "Çekilişiniz Hazır! 🎉",
      readyForDrawInfoMessage: "Çekilişiniz hazır! Belirlediğiniz tarihte çekiliş yapılacaktır.",
      registerPromptTitle: "🎁 Davet Linki ile Çekiliş Oluştur",
      registerPromptMessage: "Kayıt olarak davet linki ile çekiliş oluşturabilir, katılımcıların form ile katılmasını sağlayabilirsin!",
      registerPromptButton: "Kayıt Ol",
    },
    manualSummary: {
      mobileTitle: "Eklenen katılımcılar ({count})",
      previewTagline: "Önizleme",
      statusTitle: "Çekilişin Durumu",
      emptyState: "Henüz katılımcı eklemedin. Soldaki formu kullanarak başla!",
      participantsLabel: "Katılımcı",
      treeTitle: "🎄 Katılımcı Ağacı",
      deleteTooltip: "Katılımcıyı sil",
      featuresTitle: "Çekiliş Özellikleri",
      addressRequired: "Adres zorunlu",
      phoneRequired: "Telefon zorunlu",
    },
    invitePanel: {
      shareTitle: "🎁 Davet Linkini Paylaş",
      copy: "Kopyala",
      qrTitle: "QR Kod ile Paylaş",
      qrHint: "QR kodu taratarak davet linkine hızlıca erişebilirsiniz",
      previewTagline: "Davet önizleme",
      previewTitle: "Davet linkiyle katılanlar",
      refresh: "Yenile",
      refreshing: "Yükleniyor…",
      description:
        "Katılımcılar davet linkini kullanarak formu doldurdukça burada görünürler. Liste gerçek zamanlı güncellenmez, yeni kayıtları görmek için Yenile butonuna tıkla.",
      emptyState:
        "Henüz davet linkiyle katılan yok. Linki arkadaşlarınla paylaş ve buradan takibini yap.",
      deleteButton: "Sil",
      howItWorks: {
        title: "Nasıl Çalışır?",
        intro: "Çekiliş sürecini başlatmak için aşağıdaki adımları takip edin. Davet linki modunda katılımcılar formu doldurarak çekilişe katılabilirler.",
        step1Title: "Çekilişi Oluştur",
        step1Desc: "Çekiliş grubunuzu oluşturun, gerekli ayarları yapın ve çekiliş tarihini belirleyin.",
        step2Title: "Paylaş ve Katılımcı Topla",
        step2Desc: "Oluşturulan davet linkini katılımcılarla paylaşın. Katılımcılar formu doldurdukça listede görünecektir.",
        step3Title: "Çekilişi Gerçekleştir",
        step3Desc: "Belirlediğiniz tarihte otomatik olarak veya manuel olarak çekilişi gerçekleştirebilirsiniz.",
      },
    },
    participantsPanel: {
      tagline: "Etkinliklerim",
      title: "Aktif Etkinliklerim",
      loading: "Etkinlikler yükleniyor...",
      emptyState: "Henüz aktif etkinliğiniz yok.",
      drawType: {
        manual: "Manuel",
        dynamic: "Davet Linki",
      },
      status: {
        active: "Aktif",
        in_progress: "Devam Ediyor",
        completed: "Tamamlandı",
        cancelled: "İptal Edildi",
      },
      participantCount: "Katılımcı sayısı: {count}",
      drawDateLabel: "Çekiliş tarihi: {date}",
      createdAt: "Oluşturulma: {date}",
      clickToView: "Detayları görmek için tıklayın",
    },
    modals: {
      successTitle: "Tebrikler!",
      successMessage: "Çekilişin başarıyla tamamlandı! Artık herkes yeni yıla özel hediyesini alabilir! 🎁✨",
      successFooter: "Mutlu Seneler! 🎄",
      close: "Tamam",
      executeSuccessTitle: "Çekiliş Tamamlandı! 🎉",
      executeSuccessMessage: "Çekiliş tamamlandı! Sonuçlar e-posta ile gönderildi. 🎉",
      executeSuccessInfo: "Lütfen e-posta ve spam klasörünü kontrol et. Sonuçlar orada seni bekliyor! 📧",
      executeSuccessFooter: "Mutlu Yıllar! 🎄",
    },
    alerts: {
      manualMissingParticipants: "Çekiliş için en az bir katılımcı eklemelisin! 🎁",
      manualMinimumParticipants: "Çekiliş için en az 3 katılımcı gerekli. Daha fazla eğlence için daha fazla katılımcı ekle! 🎉",
      manualCreateError: "Çekiliş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
      copySuccess: "Link kopyalandı!",
      copyError: "Link kopyalanamadı. Lütfen manuel olarak kopyalayın.",
      inviteLoadError: "Katılımcılar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
      drawDateRequired: "Çekiliş tarihi seçilmelidir",
      drawDateFuture: "Çekiliş tarihi gelecekte olmalıdır",
      inviteCreateError: "Çekiliş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
      executeSuccess: "Çekiliş başarıyla tamamlandı! 🎉",
      executeSuccessWithEmail: "Çekiliş başarıyla tamamlandı! 🎉\n\nLütfen e-posta ve spam klasörlerinizi kontrol edin. Sonuçlar e-posta ile gönderildi.\n\nMutlu Yıllar! 🎄",
      executeError: "Çekiliş yapılırken bir hata oluştu. Lütfen tekrar deneyin.",
      joinMissingInvite: "Davet kodu bulunamadı",
      joinLoadError: "Çekiliş bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
      joinSubmitError: "Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.",
      deleteParticipantError: "Katılımcı silinirken bir hata oluştu. Lütfen tekrar deneyin.",
      drawsLoadError: "Etkinlikler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
      drawDetailLoadError: "Etkinlik detayları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
    },
    validation: {
      firstNameRequired: "İsim gerekli",
      lastNameRequired: "Soyisim gerekli",
      addressRequired: "Adres zorunlu",
      phoneRequired: "Telefon zorunlu",
      emailRequired: "Email gerekli",
      emailInvalid: "Geçerli bir email adresi girin",
      emailDuplicate: "Bu email adresi zaten kullanılıyor",
      joinFirstNameRequired: "İsim gereklidir",
      joinLastNameRequired: "Soyisim gereklidir",
      joinEmailRequired: "Email gereklidir",
      joinEmailInvalid: "Geçerli bir email adresi giriniz",
      joinAddressRequired: "Adres gereklidir",
      joinPhoneRequired: "Telefon gereklidir",
    },
    join: {
      loading: "Çekiliş bilgileri yükleniyor...",
      errorTitle: "Bir hata oluştu",
      retry: "Tekrar Dene",
      heading: "Çekilişe Katıl",
      subheading: "Bilgilerini doldur ve yılbaşı çekilişine katıl! 🎉",
      submit: "Kayıt Ol",
      submitting: "Kaydediliyor…",
      successTitle: "Tebrikler!",
      successMessage: "Harika! Çekilişe katıldın! Artık sıranın gelmesini bekle 🎁✨",
      successInfo: "Emailinizi ve spam klasörünüzü kontrol etmeyi unutmayın.",
      successFooter: "Mutlu Seneler! 🎄",
      successButton: "Tamam",
      drawDateInfo: "Çekilişiniz {date} tarihinde yapılacaktır.",
    },
    auth: {
      goRegister: "← Kayıt ol",
      goBack: "← Geri dön",
      loginTitle: "Giriş Yap",
      loginSubtitle: "Hesabına giriş yap ve yılbaşı çekilişlerini yönetmeye devam et! 🎄",
      registerTitle: "Kayıt Ol",
      registerSubtitle: "Hesabını oluştur, yılbaşı çekilişlerini başlat ve eğlenceyi paylaş! 🎁✨",
      emailLabel: "Email",
      passwordLabel: "Şifre",
      emailPlaceholder: "Email adresinizi girin",
      passwordPlaceholder: "Şifrenizi girin",
      loginButton: "Giriş Yap",
      loginLoading: "Giriş yapılıyor...",
      registerButton: "Hesap Oluştur",
      registerLoading: "Oluşturuluyor...",
      haveAccount: "Zaten hesabın var mı?",
      loginLink: "Giriş yap",
      celebration: "🎉 Yılbaşı çekilişi macerası başlıyor!",
      logout: "Çıkış Yap",
      errors: {
        emailInvalid: "Lütfen geçerli bir email adresi girin!",
        passwordRequired: "Lütfen bir şifre girin!",
        passwordLength: "Şifre en az 6 karakter olmalıdır.",
        genericLogin: "Giriş yapılırken bir sorun oluştu.",
        genericRegister: "Hesabınız oluşturulurken bir sorun oluştu.",
        duplicateEmail: "Bu e-posta adresine sahip bir hesap zaten mevcut. Lütfen giriş yapın.",
      },
    },
  },
  en: {
    languageSwitcher: {
      label: "Choose language",
    },
    common: {
      appName: "Santa's Draw",
      ok: "OK",
      cancel: "Cancel",
      copy: "Copy",
      copied: "Link copied!",
      loading: "Loading…",
      tagline: "MERRY",
      title: "CHRISTMAS"
    },
    landing: {
      tagline: "Santa's Edition",
      title: "Santa's Draw",
      subtitlePrefix: "Start your Secret Santa draw now",
      subtitleManualHighlight: "kick things off instantly",
      subtitleMiddle: "or",
      subtitleInviteHighlight: "gather participants with the invitation link",
      manualCardDescriptionLine1: "Add participants manually,",
      manualCardDescriptionLine2: "launch your draw right away!",
      manualCardButton: "Start",
      inviteCardDescriptionLine1: "Let participants join via form,",
      inviteCardDescriptionLine2: "run it on your chosen date or with one tap.",
      inviteCardButton: "Register & Begin",
      footnote:
        "🎁 Email notifications, scheduling, and advanced group management are coming soon.",
      back: "← Back",
      goRegister: "← Register",
    },
    dashboard: {
      tagline: "New Year celebrations are starting! 🎉",
      title: "Choose your draw mode",
      subtitle: "Track active events on the left, start a new flow on the right.",
      manualCard: {
        title: "Manual Mode",
        description: "Add participants yourself, tweak the rules, and run the draw instantly.",
        cta: "Get Started ⚡",
      },
      inviteCard: {
        title: "Invite Mode",
        description: "Let participants join via form, schedule the draw, or run it whenever you like.",
        description2: "New Year Special Mode!",
        cta: "Start Christmas",
        tag: "Special"
      },
      backButton: "Dashboard",
      logout: "Log Out"
    },
    drawSettings: {
      settingsTitle: "Draw Settings",
      settingsActive: "{count} setting(s) active",
      settingsOptional: "Configure optional settings",
      requireAddress: "Require Address",
      requireAddressDesc: "Collect address information from participants for delivery",
      requirePhone: "Require Phone",
      requirePhoneDesc: "Collect phone number from participants for contact",
      enableDrawDate: "Set Draw Date",
      drawDateEnabledDesc: "The draw will be executed automatically on the specified date",
      drawDateDisabledDesc: "You can manually execute the draw at any time",
      dateLabel: "Date",
      timeLabel: "Time",
      selectTime: "Select time",
      drawDateTimeInfo: "The draw will be executed automatically on {date}",
      drawDateOnlyInfo: "The draw will be executed on {date} (Time not specified)"
    },
    draw: {
      headingTagline: "Santa's Draw",
      headingTitle: "Manage Your Draw",
      headingSubtitle: "Add participants, set the rules, and kick off the first surprise of the new year! 🎁",
      manualModeTitle: "Manual participant mode",
      inviteModeTitle: "Invite link mode",
      modeDescription:
        "Add participants manually or monitor invite link submissions. Switch using the button above.",
      viewInviteButton: "View invite link mode",
      backManualButton: "Back to manual mode",
      requireAddress: "Require address",
      requirePhone: "Require phone",
      enableDrawDate: "Add a draw date",
      drawDateOptionalHint: "Skip the date to run the draw whenever you're ready.",
      drawDateLabel: "Draw Date",
      drawDateHelper: "You must pick a draw date",
      drawDateInfo: "The draw will happen at midnight (00:00) on {date}",
      fields: {
        firstName: { label: "First name", placeholder: "e.g. Alex" },
        lastName: { label: "Last name", placeholder: "e.g. Stone" },
        email: { label: "Email", placeholder: "{'e.g. alex@example.com'}" },
        address: { label: "Address", placeholder: "Shipping address for gifts" },
        phone: { label: "Phone", placeholder: "Phone number for contact" },
      },
      manualButtons: {
        add: "Add participant",
        update: "Update participant",
        cancel: "Cancel",
        create: "Run the draw",
        creating: "Running draw…",
        newDraw: "Create New Draw",
      },
      inviteButtons: {
        save: "Save my details",
        saving: "Saving…",
        newDraw: "Start New Draw",
      },
      executeButton: "Run the draw",
      executingButton: "Running...",
      executeButtonHint: "Need at least 3 participants before running the draw.",
      readyForDrawButton: "Ready for Draw",
      readyForDrawMessage: "The draw will be automatically executed on the scheduled date.",
      readyForDrawInfoTitle: "Your Draw is Ready! 🎉",
      readyForDrawInfoMessage: "Your draw is ready! The draw will be executed on the scheduled date.",
      registerPromptTitle: "🎁 Create Draw with Invite Link",
      registerPromptMessage: "Register to create draws with invite links and let participants join via form!",
      registerPromptButton: "Register",
    },
    manualSummary: {
      mobileTitle: "Added participants ({count})",
      previewTagline: "Preview",
      statusTitle: "Draw Status",
      emptyState: "No participants yet. Use the form on the left to get started!",
      participantsLabel: "Participants",
      treeTitle: "🎄 Participant Tree",
      deleteTooltip: "Remove participant",
      featuresTitle: "Draw Settings",
      addressRequired: "Address required",
      phoneRequired: "Phone required",
    },
    invitePanel: {
      shareTitle: "🎁 Share Invite Link",
      copy: "Copy",
      qrTitle: "Share via QR",
      qrHint: "Scan the QR code to open the invite link instantly.",
      previewTagline: "Invite preview",
      previewTitle: "Participants via invite link",
      refresh: "Refresh",
      refreshing: "Loading…",
      description:
        "As people join through the invite link, they will appear here. Refresh to fetch the latest list.",
      emptyState:
        "No invite entries yet. Share the link with friends and track them here.",
      deleteButton: "Remove",
      howItWorks: {
        title: "How It Works?",
        intro: "Follow the steps below to start the draw process. In invite link mode, participants can join the draw by filling out the form.",
        step1Title: "Create the Draw",
        step1Desc: "Create your draw group, configure the necessary settings, and set the draw date.",
        step2Title: "Share and Collect Participants",
        step2Desc: "Share the generated invite link with participants. As participants fill out the form, they will appear in the list.",
        step3Title: "Execute the Draw",
        step3Desc: "You can execute the draw automatically on your scheduled date or manually at any time.",
      },
    },
    participantsPanel: {
      tagline: "My Draws",
      title: "My Active Draws",
      loading: "Loading draws...",
      emptyState: "You don't have any active draws yet.",
      drawType: {
        manual: "Manual",
        dynamic: "Invite Link",
      },
      status: {
        active: "Active",
        in_progress: "In Progress",
        completed: "Completed",
        cancelled: "Cancelled",
      },
      participantCount: "Participants: {count}",
      drawDateLabel: "Draw date: {date}",
      createdAt: "Created: {date}",
      clickToView: "Click to view details",
    },
    modals: {
      successTitle: "Congrats!",
      successMessage: "You successfully completed the draw! 🎁",
      successFooter: "Happy Holidays! 🎄",
      close: "Got it",
      executeSuccessTitle: "Draw Completed! 🎉",
      executeSuccessMessage: "The draw has been executed successfully!",
      executeSuccessInfo: "Please check your email and spam folders. Results have been sent via email.",
      executeSuccessFooter: "Happy Holidays! 🎄",
    },
    alerts: {
      manualMissingParticipants: "You must add at least one participant for the raffle!",
      manualMinimumParticipants: "At least 3 participants are required for the raffle. Add more participants for more fun!",
      manualCreateError: "Something went wrong while creating the draw. Please try again.",
      copySuccess: "Link copied!",
      copyError: "Could not copy the link. Please copy it manually.",
      inviteLoadError: "We couldn't load participants. Please try again.",
      drawDateRequired: "A draw date is required",
      drawDateFuture: "The draw date must be in the future",
      inviteCreateError: "Something went wrong while creating the draw. Please try again.",
      executeSuccess: "Draw executed successfully! 🎉",
      executeSuccessWithEmail: "Draw executed successfully! 🎉\n\nPlease check your email and spam folders. Results have been sent via email.\n\nHappy Holidays! 🎄",
      executeError: "Something went wrong while running the draw. Please try again.",
      joinMissingInvite: "Invite code not found",
      joinLoadError: "We couldn't load the draw info. Please try again.",
      joinSubmitError: "Something went wrong while joining. Please try again.",
      deleteParticipantError: "We couldn't remove this participant. Please try again.",
      drawsLoadError: "Something went wrong while loading draws. Please try again.",
      drawDetailLoadError: "Something went wrong while loading draw details. Please try again.",
    },
    validation: {
      firstNameRequired: "First name is required",
      lastNameRequired: "Last name is required",
      addressRequired: "Address is required",
      phoneRequired: "Phone is required",
      emailRequired: "Email is required",
      emailInvalid: "Enter a valid email address",
      emailDuplicate: "This email is already used",
      joinFirstNameRequired: "First name is required",
      joinLastNameRequired: "Last name is required",
      joinEmailRequired: "Email is required",
      joinEmailInvalid: "Enter a valid email address",
      joinAddressRequired: "Address is required",
      joinPhoneRequired: "Phone is required",
    },
    join: {
      loading: "Loading draw information...",
      errorTitle: "Something went wrong",
      retry: "Try Again",
      heading: "Join the Draw",
      subheading: "Fill in your details and enter the New Year's raffle",
      submit: "Join",
      submitting: "Submitting…",
      successTitle: "Congrats!",
      successMessage: "Great! You've entered the draw! Now just wait for your turn. 🎁✨",
      successInfo: "Don't forget to check your inbox and spam folder.",
      successFooter: "Happy Holidays! 🎄",
      successButton: "Great!",
      drawDateInfo: "Your draw will take place on {date}.",
    },
    auth: {
      goRegister: "← Register",
      goBack: "← Back",
      loginTitle: "Log In",
      loginSubtitle: "Sign in to Santa's Draw and manage your giveaways 🎄",
      registerTitle: "Create Account",
      registerSubtitle: "Open your account and start running draws 🎁",
      emailLabel: "Email",
      passwordLabel: "Password",
      emailPlaceholder: "Enter your email address",
      passwordPlaceholder: "Enter your password",
      loginButton: "Log In",
      loginLoading: "Signing in...",
      registerButton: "Create Account",
      registerLoading: "Creating...",
      haveAccount: "Already have an account?",
      loginLink: "Log in",
      celebration: "🎁 The draw adventure begins!",
      logout: "Log Out",
      errors: {
        emailInvalid: "Please enter a valid email address!",
        passwordRequired: "Please enter a password!",
        passwordLength: "Password must be at least 6 characters.",
        genericLogin: "Something went wrong while logging you in.",
        genericRegister: "Something went wrong while creating your account.",
        duplicateEmail: "An account with this email already exists. Please log in.",
      },
    },
  },
} as const;

const getStoredLocale = (): Locale | null => {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && localeOptions.some((option) => option.code === stored)) {
    return stored;
  }
  return null;
};

const getBrowserLocale = (): Locale => {
  if (typeof navigator === "undefined") return "tr";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("tr")) return "tr";
  return "en";
};

const initialLocale = getStoredLocale() || getBrowserLocale();

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: "tr",
  messages,
});

const updateDocumentLang = (locale: Locale) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", locale);
  }
};

updateDocumentLang(initialLocale);

export const setLocale = (locale: Locale) => {
  if (!localeOptions.some((option) => option.code === locale)) return;
  i18n.global.locale.value = locale;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, locale);
  }
  updateDocumentLang(locale);
};

export const getLocale = (): Locale => i18n.global.locale.value as Locale;


