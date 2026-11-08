// src/content/legal.ts
// Privacy policy and terms of use for letsraffle.co and the Lets Raffle iOS app.
// Keep this in sync with what the backend actually stores and which processors it uses.

export type LegalDoc = "privacy" | "terms";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
  /** Shown after the list. */
  note?: string;
}

export interface LegalContent {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export const CONTACT_EMAIL = "hey@letsraffle.co";
const UPDATED_TR = "Son güncelleme: 9 Kasım 2026";
const UPDATED_EN = "Last updated: November 9, 2026";

export const legal: Record<LegalDoc, Record<"tr" | "en", LegalContent>> = {
  privacy: {
    tr: {
      title: "Gizlilik Politikası",
      updated: UPDATED_TR,
      intro:
        "Lets Raffle (letsraffle.co ve Lets Raffle iOS uygulaması), arkadaş, aile ve ekipler için yılbaşı hediye çekilişi düzenlemeye yarar. Bu politika hangi verileri neden topladığımızı, kimlerle paylaştığımızı ve haklarını açıklar.",
      sections: [
        {
          heading: "Topladığımız veriler",
          items: [
            "Hesap bilgileri: e-posta adresin ve (e-posta ile kayıt olduysan) şifrenin geri döndürülemez özeti. Apple veya Google ile giriş yaparsan, ilgili hesabın tekil kimliğini ve paylaştığın e-posta adresini saklarız; şifrene hiçbir zaman erişmeyiz.",
            "Çekiliş bilgileri: oluşturduğun çekilişler, tarihleri, dil tercihi ve davet bağlantıları.",
            "Katılımcı bilgileri: çekilişe eklenen veya katılan kişilerin adı, soyadı ve e-posta adresi; organizatör istediyse hediye gönderimi için adres ve telefon numarası; çekiliş sonucunda kimin kime hediye alacağı.",
            "Cihaz bilgileri (iOS): bildirim gönderebilmek için cihazının bildirim jetonu ve dil tercihi.",
            "Kullanım ve teknik veriler: web sitesinde ziyaret istatistikleri (Google Analytics) ve hataları düzeltebilmek için teknik hata kayıtları.",
          ],
        },
        {
          heading: "Verileri nasıl kullanıyoruz",
          items: [
            "Hesabını oluşturmak, giriş yapmanı sağlamak ve oturumunu korumak.",
            "Çekilişi yürütmek: eşleşmeleri yapmak, katılımcılara sonuçlarını e-posta ve bildirimle iletmek, hatırlatma göndermek.",
            "Hizmeti çalışır ve güvenli tutmak, hataları gidermek ve kullanımı anlamak.",
          ],
          note: "Verilerini satmayız ve reklam amacıyla kullanmayız.",
        },
        {
          heading: "Paylaştığımız hizmet sağlayıcılar",
          paragraphs: ["Verilerini yalnızca hizmeti sunmak için gereken sağlayıcılarla paylaşırız:"],
          items: [
            "DigitalOcean (Frankfurt, Almanya): sunucu ve veritabanı barındırma.",
            "Amazon Web Services (SES): çekiliş e-postalarının gönderimi.",
            "Apple: Apple ile Giriş ve iOS bildirimleri (APNs).",
            "Google: Google ile Giriş ve web sitesi ziyaret istatistikleri (Google Analytics).",
            "Sentry: teknik hata kayıtları.",
          ],
        },
        {
          heading: "Saklama süresi ve hesabın silinmesi",
          paragraphs: [
            "Verilerini hesabın açık olduğu ve çekilişlerin yürütülmesi için gerektiği sürece saklarız. Hesabını istediğin zaman web sitesinde panelin altındaki \"Hesabımı sil\" bağlantısından, iOS uygulamasında Profil ekranından ya da " + CONTACT_EMAIL + " adresine yazarak silebilirsin; hesap bilgilerin silinir. Diğer katılımcıların sonuçlarını görebilmesi için geçmiş çekilişler hesabınla ilişkisi kaldırılarak tutulabilir. Silinmesini istediğin başka veriler için bize yazabilirsin.",
          ],
        },
        {
          heading: "Hakların",
          paragraphs: [
            "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve geçerli diğer mevzuat kapsamında verilerine erişme, düzeltilmesini veya silinmesini isteme, işlenmesine itiraz etme haklarına sahipsin. Taleplerini " +
              CONTACT_EMAIL +
              " adresine iletebilirsin.",
          ],
        },
        {
          heading: "Çocuklar",
          paragraphs: ["Lets Raffle 13 yaşın altındaki çocuklara yönelik değildir ve bilerek onlardan veri toplamayız."],
        },
        {
          heading: "Değişiklikler ve iletişim",
          paragraphs: [
            "Bu politikayı güncellediğimizde bu sayfadaki tarihi değiştiririz. Her türlü soru için: " + CONTACT_EMAIL,
          ],
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      updated: UPDATED_EN,
      intro:
        "Lets Raffle (letsraffle.co and the Lets Raffle iOS app) helps friends, families and teams run holiday gift draws. This policy explains what data we collect and why, who we share it with, and your rights.",
      sections: [
        {
          heading: "Data we collect",
          items: [
            "Account data: your email address and, if you sign up with email, a one-way hash of your password. If you sign in with Apple or Google, we store that account's unique identifier and the email address you share; we never see your password.",
            "Draw data: the draws you create, their dates, language and invite links.",
            "Participant data: first name, last name and email of people added to or joining a draw; address and phone number when the organizer asks for them for gift delivery; and who gives a gift to whom.",
            "Device data (iOS): your device's push notification token and language, so we can send notifications.",
            "Usage and technical data: website visit statistics (Google Analytics) and technical error logs used to fix bugs.",
          ],
        },
        {
          heading: "How we use it",
          items: [
            "To create your account, sign you in and keep your session secure.",
            "To run draws: make the matches, send participants their results by email and notification, and send reminders.",
            "To keep the service working and secure, fix errors and understand usage.",
          ],
          note: "We do not sell your data or use it for advertising.",
        },
        {
          heading: "Service providers we share data with",
          paragraphs: ["We only share data with providers needed to run the service:"],
          items: [
            "DigitalOcean (Frankfurt, Germany): server and database hosting.",
            "Amazon Web Services (SES): sending draw emails.",
            "Apple: Sign in with Apple and iOS notifications (APNs).",
            "Google: Sign in with Google and website visit statistics (Google Analytics).",
            "Sentry: technical error logs.",
          ],
        },
        {
          heading: "Retention and account deletion",
          paragraphs: [
            "We keep your data while your account is open and as long as needed to run draws. You can delete your account at any time with \"Delete my account\" at the bottom of your dashboard on the website, from the Profile screen in the iOS app, or by emailing " + CONTACT_EMAIL + "; your account data is then deleted. Past draws may be kept, detached from your account, so other participants can still see their results. Email us to request deletion of any other data.",
          ],
        },
        {
          heading: "Your rights",
          paragraphs: [
            "Under the Turkish Personal Data Protection Law (KVKK), the GDPR where applicable, and other laws, you can request access to, correction or deletion of your data and object to its processing. Send requests to " +
              CONTACT_EMAIL +
              ".",
          ],
        },
        {
          heading: "Children",
          paragraphs: ["Lets Raffle is not directed at children under 13 and we do not knowingly collect their data."],
        },
        {
          heading: "Changes and contact",
          paragraphs: ["When we update this policy we change the date on this page. Questions: " + CONTACT_EMAIL],
        },
      ],
    },
  },
  terms: {
    tr: {
      title: "Kullanım Koşulları",
      updated: UPDATED_TR,
      intro:
        "Lets Raffle web sitesini ve iOS uygulamasını kullanarak bu koşulları kabul etmiş olursun. Lütfen dikkatlice oku.",
      sections: [
        {
          heading: "Hizmet",
          paragraphs: [
            "Lets Raffle, hediye çekilişi düzenlemek, katılımcı toplamak ve eşleşmeleri katılımcılara iletmek için ücretsiz bir araçtır. Hizmeti önceden haber vermeden değiştirebilir veya durdurabiliriz.",
          ],
        },
        {
          heading: "Hesabın",
          items: [
            "Kayıt sırasında doğru bilgi vermekten ve hesabının güvenliğinden sen sorumlusun.",
            "Hesabını istediğin zaman web sitesinden, iOS uygulamasından ya da " + CONTACT_EMAIL + " adresine yazarak silebilirsin.",
          ],
        },
        {
          heading: "Katılımcı bilgileri",
          paragraphs: [
            "Bir çekilişe başkalarının bilgilerini ekliyorsan, bu bilgileri paylaşmak ve onlara çekilişle ilgili e-posta gönderilmesi için gerekli izne sahip olduğunu kabul edersin.",
          ],
        },
        {
          heading: "Kabul edilemez kullanım",
          items: [
            "Hizmeti spam, taciz, dolandırıcılık veya yasa dışı amaçlarla kullanmak.",
            "Hizmetin güvenliğini veya işleyişini bozmaya çalışmak.",
            "Başkalarının hesaplarına veya verilerine izinsiz erişmeye çalışmak.",
          ],
          note: "Bu koşulları ihlal eden hesapları kapatabiliriz.",
        },
        {
          heading: "Sorumluluk",
          paragraphs: [
            "Hizmet \"olduğu gibi\" sunulur. Hediyelerin alınması, gönderilmesi veya teslimi katılımcıların sorumluluğundadır; Lets Raffle bunlardan sorumlu değildir. Yasaların izin verdiği ölçüde, hizmetin kullanımından doğan dolaylı zararlardan sorumlu tutulamayız.",
          ],
        },
        {
          heading: "Gizlilik",
          paragraphs: ["Verilerini nasıl işlediğimizi Gizlilik Politikamızda bulabilirsin."],
        },
        {
          heading: "Değişiklikler ve iletişim",
          paragraphs: [
            "Koşulları güncellediğimizde bu sayfadaki tarihi değiştiririz; güncellemeden sonra hizmeti kullanmaya devam etmen yeni koşulları kabul ettiğin anlamına gelir. Sorular için: " +
              CONTACT_EMAIL,
          ],
        },
      ],
    },
    en: {
      title: "Terms of Use",
      updated: UPDATED_EN,
      intro: "By using the Lets Raffle website and iOS app you agree to these terms. Please read them carefully.",
      sections: [
        {
          heading: "The service",
          paragraphs: [
            "Lets Raffle is a free tool for organizing gift draws, collecting participants and telling them their matches. We may change or discontinue the service without notice.",
          ],
        },
        {
          heading: "Your account",
          items: [
            "You are responsible for providing accurate information and for keeping your account secure.",
            "You can delete your account at any time on the website, in the iOS app, or by emailing " + CONTACT_EMAIL + ".",
          ],
        },
        {
          heading: "Participant information",
          paragraphs: [
            "If you add other people's details to a draw, you confirm you have permission to share them and for them to receive emails about the draw.",
          ],
        },
        {
          heading: "Acceptable use",
          items: [
            "Do not use the service for spam, harassment, fraud or any unlawful purpose.",
            "Do not try to disrupt the security or operation of the service.",
            "Do not try to access other people's accounts or data without permission.",
          ],
          note: "We may close accounts that break these terms.",
        },
        {
          heading: "Liability",
          paragraphs: [
            "The service is provided \"as is\". Buying, sending and delivering gifts is up to participants; Lets Raffle is not responsible for them. To the extent permitted by law, we are not liable for indirect damages arising from use of the service.",
          ],
        },
        {
          heading: "Privacy",
          paragraphs: ["See our Privacy Policy for how we handle your data."],
        },
        {
          heading: "Changes and contact",
          paragraphs: [
            "When we update these terms we change the date on this page; continuing to use the service after an update means you accept the new terms. Questions: " +
              CONTACT_EMAIL,
          ],
        },
      ],
    },
  },
};
