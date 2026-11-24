/**
 * Text content under the home page's first screen: what the site does, how it works and common
 * questions. It is real, visible copy for people first; search engines read the same text.
 *
 * Keep every claim true to the product: manual mode needs no account, invite mode needs one,
 * 3 to 200 people, nobody draws themselves, results go out by e-mail, the organizer does not
 * see the pairs.
 */
import type { Locale } from "@/i18n";

export interface HomeContent {
  heading: string;
  intro: string;
  stepsHeading: string;
  steps: { title: string; text: string }[];
  modesHeading: string;
  modes: { title: string; text: string }[];
  faqHeading: string;
  faq: { q: string; a: string }[];
}

export const homeContent: Record<Locale, HomeContent> = {
  tr: {
    heading: "Online yılbaşı hediye çekilişi nasıl yapılır?",
    intro:
      "Lets Raffle ile yılbaşı hediye çekilişini (Secret Santa) kâğıda isim yazmadan, herkesi aynı yerde toplamadan kurarsın. Çekiliş ücretsizdir, isimler adil şekilde eşleşir ve herkes yalnızca kime hediye alacağını öğrenir.",
    stepsHeading: "Üç adımda isim çekme",
    steps: [
      {
        title: "Çekilişi oluştur",
        text: "Katılımcıları kendin ekle ya da bir davet linki oluştur. Katılımcıları kendin eklediğin manuel modda hesap açman bile gerekmez.",
      },
      {
        title: "Katılımcıları topla",
        text: "Davet linkini veya QR kodu WhatsApp grubuna, e-postaya ya da ofis kanalına bırak. Herkes adını ve e-posta adresini kendisi girer.",
      },
      {
        title: "İsimleri çek",
        text: "Çekilişi tek tıkla başlat ya da bir tarih ve saat belirle, çekiliş o an kendiliğinden yapılsın. Herkes kime hediye alacağını e-postayla öğrenir.",
      },
    ],
    modesHeading: "İki çekiliş modu",
    modes: [
      {
        title: "Manuel mod",
        text: "Katılımcıların adını ve e-postasını kendin yazarsın, çekiliş hemen yapılır. Hesap gerekmez. Aile ya da küçük arkadaş grupları için en hızlı yol.",
      },
      {
        title: "Davet linki modu",
        text: "Hesabınla bir çekiliş açar, link veya QR kodla paylaşırsın. Katılımcılar formu kendileri doldurur; istersen adres ve telefon da istenir. Ofis, okul ve kalabalık gruplar için uygun.",
      },
    ],
    faqHeading: "Sık sorulan sorular",
    faq: [
      { q: "Lets Raffle ücretli mi?", a: "Hayır. Çekilişi kurmak, katılmak ve sonucu öğrenmek ücretsiz." },
      { q: "Kaç kişiyle çekiliş yapılabilir?", a: "En az 3, en fazla 200 kişiyle." },
      {
        q: "Biri kendi adını çekebilir mi?",
        a: "Hayır. Eşleşmeler herkes başka birine hediye alacak şekilde yapılır.",
      },
      {
        q: "Kimin kime hediye alacağını kim görür?",
        a: "Yalnızca kişinin kendisi. Herkes kendi eşleşmesini e-postayla öğrenir; organizatör de eşleşmeleri görmez, böylece sürpriz bozulmaz.",
      },
      {
        q: "Katılımcıların uygulama indirmesi gerekiyor mu?",
        a: "Hayır. Davet linki tarayıcıda açılır. iPhone kullananlar isterse Lets Raffle iOS uygulamasını da kullanabilir.",
      },
      {
        q: "Çekilişi ileri bir tarihte yapabilir miyim?",
        a: "Evet. Davet linki modunda tarih ve saat belirlersen çekiliş o an kendiliğinden yapılır ve sonuçlar herkese gönderilir.",
      },
    ],
  },
  en: {
    heading: "How to run a Secret Santa online",
    intro:
      "Lets Raffle runs your Secret Santa gift exchange without names in a hat or getting everyone in the same room. It is free, names are drawn fairly, and each person only finds out who they are buying a gift for.",
    stepsHeading: "Draw names in three steps",
    steps: [
      {
        title: "Create the draw",
        text: "Add the participants yourself or create an invite link. In manual mode, where you add everyone yourself, you do not even need an account.",
      },
      {
        title: "Gather everyone",
        text: "Drop the invite link or QR code into your group chat, an e-mail or the office channel. Everyone enters their own name and e-mail address.",
      },
      {
        title: "Draw the names",
        text: "Start the draw with one tap, or pick a date and time and let it run by itself. Everyone finds out who they are buying for by e-mail.",
      },
    ],
    modesHeading: "Two ways to draw",
    modes: [
      {
        title: "Manual mode",
        text: "Type in everyone's name and e-mail and the names are drawn right away. No account needed. The quickest option for families and small groups of friends.",
      },
      {
        title: "Invite link mode",
        text: "Create a draw with your account and share it as a link or QR code. Participants fill in the form themselves, and you can ask for a postal address and phone number too. Made for offices, classes and larger groups.",
      },
    ],
    faqHeading: "Frequently asked questions",
    faq: [
      { q: "Is Lets Raffle free?", a: "Yes. Creating a draw, joining one and getting your match are all free." },
      { q: "How many people can take part?", a: "From 3 to 200 people." },
      { q: "Can someone draw their own name?", a: "No. Names are matched so that everyone buys a gift for someone else." },
      {
        q: "Who can see who is buying for whom?",
        a: "Only each person themselves. Everyone gets their own match by e-mail; the organizer does not see the pairs either, so the surprise stays intact.",
      },
      {
        q: "Do participants need to install an app?",
        a: "No. The invite link opens in any browser. iPhone users can also use the Lets Raffle iOS app if they like.",
      },
      {
        q: "Can I schedule the draw for later?",
        a: "Yes. In invite link mode, set a date and time and the names are drawn at that moment and sent to everyone.",
      },
    ],
  },
};
