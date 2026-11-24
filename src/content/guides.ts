/**
 * Guide pages: answers to what people search for around a gift draw (how to run one, drawing
 * names, office draws, the rules, gift ideas). One entry per page and language; `topic` pairs a
 * Turkish page with its English counterpart for hreflang.
 *
 * Keep every claim true to the product: manual mode needs no account, invite mode needs one,
 * 3 to 200 people, nobody draws themselves, results go out by e-mail, the organizer does not see
 * the pairs, the result page shows the receiver's address / phone when the draw asked for them.
 * URLs carry no year so they keep their history from season to season.
 */
import type { Locale } from "@/i18n";

export type GuideTopic = "gift-draw" | "name-draw" | "office" | "rules" | "gift-ideas";

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

export interface Guide {
  topic: GuideTopic;
  locale: Locale;
  /** full path, Turkish without a prefix, English under /en */
  path: string;
  /** <title> and meta description */
  title: string;
  description: string;
  /** the page's <h1> and the short name used in links */
  h1: string;
  linkText: string;
  intro: string;
  sections: GuideSection[];
  faq: { q: string; a: string }[];
}

export const guides: Guide[] = [
  // --- Turkish ---------------------------------------------------------------------------------
  {
    topic: "gift-draw",
    locale: "tr",
    path: "/yilbasi-hediye-cekilisi",
    title: "Yılbaşı Hediye Çekilişi Nasıl Yapılır? Online ve Ücretsiz – Lets Raffle",
    description:
      "Yılbaşı hediye çekilişini online ve ücretsiz yap: katılımcıları ekle ya da davet linki paylaş, isimler adil şekilde eşleşsin, herkes kime hediye alacağını e-postayla öğrensin.",
    h1: "Yılbaşı hediye çekilişi nasıl yapılır?",
    linkText: "Yılbaşı hediye çekilişi nasıl yapılır?",
    intro:
      "Yılbaşı hediye çekilişi, bir grubun her üyesinin kurayla belirlenen bir kişiye gizlice hediye aldığı bir gelenek. Eskiden isimler kâğıtlara yazılıp bir torbadan çekilirdi. Bugün aynı işi birkaç dakikada, herkesi bir araya toplamadan online yapabilirsin.",
    sections: [
      {
        heading: "Kâğıt yerine online çekiliş neden daha kolay?",
        paragraphs: [
          "Kâğıtla yapılan çekilişte birinin kendi adını çekmesi, herkesin aynı anda orada olması gerekmesi ve kimin kimi çektiğinin yanlışlıkla görülmesi sık yaşanan sorunlar. Online çekilişte isimler kimse kendi adını çekmeyecek şekilde eşleşir, katılımcılar farklı şehirlerde olsa bile katılabilir ve herkes yalnızca kendi sonucunu görür.",
        ],
      },
      {
        heading: "Adım adım yılbaşı hediye çekilişi",
        items: [
          "Grubu belirle: aile, arkadaşlar, ofis ya da sınıf. Çekiliş için en az 3 kişi gerekir.",
          "Bütçeyi ve tarihi konuşun. Hediyeler için bir üst sınır ve hediyeleşme günü belirlemek kimsenin mahcup olmamasını sağlar.",
          "Lets Raffle'da çekilişi oluştur. Katılımcıları kendin ekleyebilir ya da bir davet linki oluşturabilirsin.",
          "İsimleri çek. Çekilişi hemen başlat ya da bir tarih ve saat seç, o an kendiliğinden yapılsın.",
          "Herkes kime hediye alacağını e-postayla öğrenir. Organizatör dahil kimse başkasının eşleşmesini görmez.",
        ],
      },
      {
        heading: "Hangi modu seçmeliyim?",
        paragraphs: [
          "Herkesin adını ve e-posta adresini biliyorsan manuel mod en hızlısı: listeyi yazarsın, çekiliş hemen yapılır ve hesap açman gerekmez.",
          "Grup kalabalıksa ya da herkesin bilgisini toplamak zahmetliyse davet linki modunu kullan. Linki ya da QR kodu paylaşırsın, katılımcılar formu kendileri doldurur. Hediyeler kargoyla gidecekse adres ve telefon da isteyebilirsin; herkes sonuç sayfasında hediye alacağı kişinin bu bilgilerini görür.",
        ],
      },
      {
        heading: "Çekilişi keyifli kılmak için ipuçları",
        items: [
          "Bütçeyi herkesin rahatça uyabileceği bir seviyede tut.",
          "Katılımcılardan birkaç ipucu ya da kısa bir istek listesi paylaşmalarını iste.",
          "Hediyeleşme gününü takvime ekle; uzaktaki arkadaşlar için kargo süresini hesaba kat.",
          "Hediyeyi kimin aldığını hediyeler açılana kadar söylememek eğlencenin yarısı.",
        ],
      },
    ],
    faq: [
      { q: "Online yılbaşı çekilişi ücretsiz mi?", a: "Evet. Lets Raffle ile çekiliş kurmak, katılmak ve sonucu öğrenmek ücretsiz." },
      {
        q: "Katılımcıların e-posta adresi gerekli mi?",
        a: "Evet. Herkes kime hediye alacağını e-postayla öğrendiği için her katılımcının bir e-posta adresi olmalı.",
      },
      {
        q: "Farklı şehirlerdeki kişilerle çekiliş yapabilir miyim?",
        a: "Evet. Davet linki modunda adres bilgisini zorunlu yaparsan herkes hediyesini nereye göndereceğini sonuç sayfasında görür.",
      },
    ],
  },
  {
    topic: "name-draw",
    locale: "tr",
    path: "/isim-cekme",
    title: "Online İsim Çekme: Hediye Çekilişi İçin Ücretsiz Kura – Lets Raffle",
    description:
      "Hediye çekilişi için online isim çekme: isimleri yaz, kura otomatik çekilsin. Kimse kendi adını çekmez, herkes sonucunu e-postayla alır. Ücretsiz ve üyeliksiz.",
    h1: "Online isim çekme",
    linkText: "Online isim çekme",
    intro:
      "Bir grupta kimin kime hediye alacağını belirlemenin en adil yolu kura çekmek. Lets Raffle'da isimleri yazıp tek tıkla çekebilir, sonuçları herkese ayrı ayrı ve gizli olarak gönderebilirsin.",
    sections: [
      {
        heading: "Online isim çekme nasıl çalışır?",
        paragraphs: [
          "Katılımcıların adlarını ve e-posta adreslerini girersin. Sistem isimleri rastgele eşleştirir: herkes başka bir kişiye hediye alır, kimse kendi adını çekmez ve her isim yalnızca bir kez çekilir. Ardından her katılımcıya yalnızca kendi eşleşmesini anlatan bir e-posta gider.",
        ],
      },
      {
        heading: "Kâğıtla kura çekmekten farkı",
        items: [
          "Kimse kendi adını çekmez, yeniden çekmek gerekmez.",
          "Herkesin aynı anda aynı yerde olması gerekmez.",
          "Sonuçlar gizli kalır: organizatör de kimin kimi çektiğini görmez.",
          "Kimse kâğıdını kaybetmez, sonuç e-posta kutusunda durur.",
        ],
      },
      {
        heading: "Üye olmadan isim çekme",
        paragraphs: [
          "Manuel modda hesap açmadan isim çekebilirsin; en az 3, en fazla 200 kişi ekleyebilirsin. Gruptaki kişilerin adlarını kendilerinin yazmasını istiyorsan ücretsiz bir hesapla davet linki oluşturup paylaşman yeterli.",
        ],
      },
      {
        heading: "Nerelerde kullanılır?",
        items: [
          "Aile içinde yılbaşı hediyeleşmesi",
          "Arkadaş grupları ve ev arkadaşları",
          "Ofis ve ekip hediyeleşmeleri",
          "Okul ve sınıf etkinlikleri",
        ],
      },
    ],
    faq: [
      { q: "İsim çekmenin sonucu nasıl öğrenilir?", a: "Her katılımcıya kime hediye alacağını söyleyen ayrı bir e-posta gönderilir." },
      { q: "Kaç kişiyle isim çekebilirim?", a: "En az 3, en fazla 200 kişiyle." },
      { q: "Biri kendi adını çekebilir mi?", a: "Hayır. Eşleşmeler herkes başka birine hediye alacak şekilde yapılır." },
    ],
  },
  {
    topic: "office",
    locale: "tr",
    path: "/ofis-yilbasi-cekilisi",
    title: "Ofiste Yılbaşı Hediye Çekilişi: Adım Adım Rehber – Lets Raffle",
    description:
      "Ofiste yılbaşı hediye çekilişi nasıl düzenlenir? Davet linkiyle katılımcı topla, bütçeyi belirle, çekilişi otomatik yap. Uzaktan çalışan ekipler için de uygun.",
    h1: "Ofiste yılbaşı hediye çekilişi nasıl düzenlenir?",
    linkText: "Ofiste yılbaşı hediye çekilişi",
    intro:
      "Ofiste yılbaşı hediye çekilişi, yılın son haftalarında ekibi bir araya getirmenin en sevilen yollarından biri. Organizatör için ise kimin katılacağını takip etmek, isimleri adil çekmek ve sürprizi korumak iş yükü olabilir. Bu rehber süreci baştan sona online nasıl yürütebileceğini anlatıyor.",
    sections: [
      {
        heading: "Başlamadan önce kararlaştırın",
        items: [
          "Katılım gönüllü mü olacak?",
          "Hediye bütçesi: herkesin rahatça uyabileceği bir üst sınır belirleyin.",
          "Çekiliş tarihi ve hediyeleşme günü.",
          "Uzaktan çalışanların hediyeleri kargoyla mı gönderilecek?",
        ],
      },
      {
        heading: "Davet linkiyle katılımcı toplamak",
        paragraphs: [
          "Herkesin e-posta adresini tek tek toplamak yerine Lets Raffle'da davet linki modunda bir çekiliş aç ve linki şirket içi yazışma kanalına ya da e-postaya bırak. Katılmak isteyen herkes adını ve e-postasını kendisi girer, katılımcı listesi de sen bakarken güncellenir.",
          "Hediyeler kargoyla gidecekse çekiliş ayarlarında adres ve telefon bilgisini zorunlu yapabilirsin. Böylece herkes sonuç sayfasında hediyesini nereye göndereceğini görür.",
        ],
      },
      {
        heading: "Çekilişi zamanlamak",
        paragraphs: [
          "Çekiliş için bir tarih ve saat belirlersen isimler o an kendiliğinden çekilir ve herkese e-posta gider; son katılımcıları beklerken kimseyi hatırlatmayla uğraşmazsın. İstersen tarihi beklemeden çekilişi tek tıkla da başlatabilirsin.",
        ],
      },
      {
        heading: "Uzaktan ve hibrit ekipler için",
        paragraphs: [
          "Ekip farklı şehirlerdeyse çekilişi online yapmak en pratik yol. Kargo süresini hesaba katarak çekilişi hediyeleşme gününden en az bir iki hafta önce yapın. Hediyeler bir görüntülü toplantıda birlikte açılabilir.",
        ],
      },
      {
        heading: "Ofis hediyesi seçerken",
        items: [
          "Çok kişisel ya da şaka amaçlı hediyeler yerine herkesin kullanabileceği şeyleri tercih edin.",
          "Masa bitkisi, kaliteli bir kupa, defter, kahve ya da çay seti ve kitap güvenli seçeneklerdir.",
          "Belirlenen bütçeye herkes uysun; kimse diğerlerinden daha pahalı bir hediye almak zorunda hissetmesin.",
        ],
      },
    ],
    faq: [
      {
        q: "Organizatör kimin kimi çektiğini görür mü?",
        a: "Hayır. Organizatör katılımcı listesini görür ama eşleşmeleri görmez. Herkes yalnızca kendi sonucunu öğrenir.",
      },
      { q: "Kaç kişilik ekipler için uygun?", a: "3 kişiden 200 kişiye kadar ekipler için." },
      {
        q: "Katılımcıların hesap açması gerekiyor mu?",
        a: "Hayır. Hesap yalnızca davet linkli çekilişi açan organizatör için gerekir; katılımcılar linkteki formu doldurur.",
      },
    ],
  },
  {
    topic: "rules",
    locale: "tr",
    path: "/secret-santa-nedir",
    title: "Secret Santa Nedir, Nasıl Oynanır? Kurallar ve İpuçları – Lets Raffle",
    description:
      "Secret Santa (gizli Noel Baba) nedir, kuralları nelerdir, nasıl oynanır? Yılbaşı hediye çekilişinin kuralları, popüler varyasyonları ve online nasıl yapılacağı.",
    h1: "Secret Santa nedir, nasıl oynanır?",
    linkText: "Secret Santa nedir?",
    intro:
      "Secret Santa, Türkçede çoğu zaman yılbaşı hediye çekilişi ya da gizli Noel Baba olarak bilinen bir hediyeleşme oyunu. Grubun her üyesi kurayla bir kişiye gizlice hediye alır; kimin kime hediye aldığı hediyeler açılana kadar sır kalır.",
    sections: [
      {
        heading: "Secret Santa'nın kuralları",
        items: [
          "Her katılımcının adı çekilişe girer ve herkes başka bir kişiyi çeker.",
          "Kimse kendi adını çekmez.",
          "Herkes çektiği kişiye, belirlenen bütçeyi aşmadan bir hediye alır.",
          "Kimin kimi çektiği hediyeler açılana kadar söylenmez.",
          "Hediyeler kararlaştırılan gün birlikte açılır.",
        ],
      },
      {
        heading: "Neden bu kadar sevilen bir gelenek?",
        paragraphs: [
          "Kalabalık bir grupta herkesin herkese hediye alması hem pahalı hem yorucu. Secret Santa'da herkes yalnızca bir hediye alır ve herkes bir hediye kazanır. Gizlilik de işin heyecanını artırır: hediyeyi alan kişi onu kimin seçtiğini bilmeden açar.",
        ],
      },
      {
        heading: "Secret Santa nasıl organize edilir?",
        paragraphs: [
          "Önce katılımcıları, bütçeyi ve hediyeleşme gününü belirleyin, sonra isimleri çekin. Kâğıtla çekmek mümkün ama birinin kendi adını çekmesi ya da herkesin aynı yerde olamaması işi zorlaştırır. Lets Raffle gibi online bir araçla isimler otomatik ve adil şekilde eşleşir, herkes sonucunu e-postayla öğrenir.",
        ],
      },
      {
        heading: "Popüler varyasyonlar",
        items: [
          "Tema belirlemek: kitap, el yapımı ya da yerel bir ürün gibi.",
          "İstek listesi: herkes almak istediği birkaç şeyi grupla paylaşır, hediye seçmek kolaylaşır.",
          "Tahmin oyunu: hediyeler açıldıktan sonra herkes kendi Secret Santa'sını tahmin eder.",
        ],
      },
    ],
    faq: [
      {
        q: "Secret Santa ile yılbaşı hediye çekilişi aynı şey mi?",
        a: "Evet. İkisi de kurayla belirlenen bir kişiye gizlice hediye alınan aynı oyunu anlatır.",
      },
      { q: "Secret Santa kaç kişiyle oynanır?", a: "En az 3 kişi gerekir. Lets Raffle 200 kişiye kadar çekilişleri destekler." },
    ],
  },
  {
    topic: "gift-ideas",
    locale: "tr",
    path: "/yilbasi-hediye-fikirleri",
    title: "Yılbaşı Hediye Çekilişi İçin Hediye Fikirleri – Lets Raffle",
    description:
      "Yılbaşı hediye çekilişinde kime ne alınır? Küçük, orta ve geniş bütçeler için hediye fikirleri, ofis ve arkadaş grupları için güvenli öneriler.",
    h1: "Yılbaşı hediye çekilişi için hediye fikirleri",
    linkText: "Yılbaşı hediye fikirleri",
    intro:
      "Çekilişte adını çektiğin kişiyi iyi tanımıyorsan ya da bütçe sınırlıysa hediye seçmek zorlaşabilir. Aşağıdaki fikirler bütçe seviyesine ve gruba göre ayrıldı; hepsi farklı zevklere uyarlanabilir.",
    sections: [
      {
        heading: "Küçük bütçeli hediyeler",
        items: [
          "Güzel bir kupa ve içine özenle seçilmiş kahve ya da bitki çayı",
          "Yeni yıl temalı bir mum ya da oda kokusu",
          "Ajanda, defter veya şık bir kalem seti",
          "Küçük bir sukulent ya da kaktüs",
          "El yapımı kurabiye veya reçel",
        ],
      },
      {
        heading: "Orta bütçeli hediyeler",
        items: [
          "Sevdiği türde bir kitap",
          "Kaliteli bir termos ya da su şişesi",
          "Polar şal, battaniye ya da yumuşak bir çorap seti",
          "Masa oyunu ya da yapboz",
          "Kahve sevenler için demleme ekipmanı",
        ],
      },
      {
        heading: "Geniş bütçeli hediyeler",
        items: [
          "Kablosuz kulaklık ya da küçük bir hoparlör",
          "Bir atölye, konser ya da deneyim hediyesi",
          "Kaliteli bir sırt çantası veya deri cüzdan",
        ],
      },
      {
        heading: "Ofis çekilişi için güvenli seçimler",
        paragraphs: [
          "İş arkadaşının zevkini tam bilmiyorsan herkesin kullanabileceği şeyler en güvenlisi: masa bitkisi, kupa, defter, kahve, çikolata ya da kitap ayracı gibi. Çok kişisel ya da şaka amaçlı hediyelerin yanlış anlaşılabileceğini unutma.",
        ],
      },
      {
        heading: "Doğru hediyeyi bulmak için ipuçları",
        items: [
          "Katılımcılardan birkaç ipucu ya da kısa bir istek listesi isteyin.",
          "Belirlenen bütçenin üstüne çıkmayın; herkes için eşit ve rahat olsun.",
          "Hediye fişi eklemek, beğenilmezse değiştirmeyi kolaylaştırır.",
          "Özenli bir paket ve kısa bir not küçük bir hediyeyi bile özel kılar.",
        ],
      },
    ],
    faq: [
      {
        q: "Yılbaşı çekilişi için bütçe ne kadar olmalı?",
        a: "Herkesin rahatça uyabileceği bir tutarı grupça belirleyin. Önemli olan tutarın yüksekliği değil, herkesin aynı sınıra uyması.",
      },
      {
        q: "Çektiğim kişiyi tanımıyorsam ne almalıyım?",
        a: "Kupa, defter, bitki, kahve ya da kitap gibi çoğu kişinin kullanabileceği hediyeler en güvenlisi. Ortak bir arkadaşa ipucu sormak da işe yarar.",
      },
    ],
  },

  // --- English ---------------------------------------------------------------------------------
  {
    topic: "gift-draw",
    locale: "en",
    path: "/en/secret-santa-generator",
    title: "Free Secret Santa Generator: Draw Names Online – Lets Raffle",
    description:
      "Free online Secret Santa generator. Add everyone or share an invite link, names are drawn fairly and each person gets their match by e-mail. No account needed to draw names.",
    h1: "Free online Secret Santa generator",
    linkText: "Secret Santa generator",
    intro:
      "A Secret Santa generator draws names for your gift exchange so nobody has to cut up paper or get everyone in the same room. With Lets Raffle you add the group or share a link, and each person privately finds out who they are buying for.",
    sections: [
      {
        heading: "How the generator works",
        paragraphs: [
          "Enter each participant's name and e-mail address, or let them sign up through an invite link. Names are matched at random so that everyone buys for someone else, nobody draws themselves and every name is drawn exactly once. Each person then gets an e-mail with their own match and nothing else.",
        ],
      },
      {
        heading: "Why draw names online",
        items: [
          "Nobody draws their own name, so there is no redraw.",
          "People can join from anywhere; no need to meet up.",
          "Matches stay secret: even the organizer cannot see who drew whom.",
          "Nobody loses their slip of paper; the result sits in their inbox.",
        ],
      },
      {
        heading: "Manual mode or invite link?",
        paragraphs: [
          "If you already know everyone's name and e-mail, manual mode is the fastest: type the list, the names are drawn right away, and you do not need an account.",
          "For bigger groups, create an invite link or QR code and share it. Participants fill in the form themselves. If gifts will be shipped, ask for a postal address and phone number; each person sees their match's details on their result page.",
        ],
      },
      {
        heading: "Schedule the draw",
        paragraphs: [
          "In invite link mode you can pick a date and time. The names are drawn at that moment and everyone gets their e-mail, so you do not have to chase late sign-ups. You can also start the draw with one tap whenever you are ready.",
        ],
      },
    ],
    faq: [
      { q: "Is the Secret Santa generator free?", a: "Yes. Creating a draw, joining one and getting your match are all free." },
      { q: "How many people can take part?", a: "From 3 to 200 people." },
      {
        q: "Do participants need an account?",
        a: "No. Only the organizer of an invite link draw needs one; participants just fill in the form.",
      },
    ],
  },
  {
    topic: "office",
    locale: "en",
    path: "/en/office-secret-santa",
    title: "Office Secret Santa: A Step-by-Step Guide – Lets Raffle",
    description:
      "How to organize an office Secret Santa: collect sign-ups with an invite link, set a budget, schedule the draw and keep the matches secret. Works for remote and hybrid teams.",
    h1: "How to organize an office Secret Santa",
    linkText: "Office Secret Santa",
    intro:
      "An office Secret Santa is one of the easiest ways to bring a team together at the end of the year. For the organizer, though, tracking sign-ups, drawing names fairly and keeping the surprise can take real effort. This guide walks through running the whole thing online.",
    sections: [
      {
        heading: "Agree on the basics first",
        items: [
          "Is taking part optional?",
          "A gift budget everyone is comfortable with.",
          "The draw date and the day gifts are exchanged.",
          "Will remote colleagues ship their gifts?",
        ],
      },
      {
        heading: "Collect sign-ups with an invite link",
        paragraphs: [
          "Instead of collecting everyone's e-mail by hand, create an invite link draw on Lets Raffle and post the link in your team chat or an e-mail. Whoever wants to join enters their own name and e-mail, and you see the participant list fill up.",
          "If gifts will be shipped, make the postal address and phone number required in the draw settings. Each person then sees where to send their gift on their result page.",
        ],
      },
      {
        heading: "Schedule the draw",
        paragraphs: [
          "Pick a date and time and the names are drawn automatically, with an e-mail to everyone. No reminders needed while you wait for the last sign-ups. You can also run the draw early with one tap.",
        ],
      },
      {
        heading: "Remote and hybrid teams",
        paragraphs: [
          "When the team is spread out, drawing names online is the only practical option. Allow for shipping time and run the draw at least a week or two before the exchange. Gifts can be opened together on a video call.",
        ],
      },
    ],
    faq: [
      {
        q: "Can the organizer see who drew whom?",
        a: "No. The organizer sees who joined but not the matches. Each person only learns their own.",
      },
      { q: "How big can the team be?", a: "From 3 up to 200 people." },
    ],
  },
  {
    topic: "rules",
    locale: "en",
    path: "/en/how-to-do-secret-santa",
    title: "How to Do Secret Santa: Rules and Tips – Lets Raffle",
    description:
      "How does Secret Santa work? The rules, how to organize it, popular variations and how to draw names online so nobody picks themselves.",
    h1: "How to do Secret Santa",
    linkText: "How to do Secret Santa",
    intro:
      "Secret Santa is a gift exchange where everyone in a group is secretly assigned one person to buy a gift for. Who bought for whom stays a secret until the gifts are opened, or forever if you like.",
    sections: [
      {
        heading: "The rules",
        items: [
          "Everyone's name goes into the draw and everyone draws someone else.",
          "Nobody draws their own name.",
          "Each person buys one gift for their match, within the agreed budget.",
          "Nobody reveals who they drew until the gifts are opened.",
          "Gifts are exchanged on the agreed day.",
        ],
      },
      {
        heading: "Why people love it",
        paragraphs: [
          "In a big group, buying a gift for everyone is expensive and tiring. With Secret Santa everyone buys one gift and everyone gets one. The secrecy adds the fun: you open a gift without knowing who picked it.",
        ],
      },
      {
        heading: "How to organize it",
        paragraphs: [
          "Agree on who is in, the budget and the exchange day, then draw names. Paper slips work, but someone drawing themselves or people not being in the same place makes it awkward. With an online tool like Lets Raffle, names are matched automatically and fairly, and everyone gets their result by e-mail.",
        ],
      },
      {
        heading: "Popular variations",
        items: [
          "A theme: books, handmade, or something local.",
          "Wish lists: everyone shares a few ideas with the group.",
          "Guessing game: after opening, everyone guesses their Secret Santa.",
        ],
      },
    ],
    faq: [
      { q: "How many people do you need?", a: "At least 3. Lets Raffle supports draws of up to 200 people." },
      {
        q: "Can couples or housemates avoid drawing each other?",
        a: "Lets Raffle draws names fully at random and does not support exclusions, so anyone can draw anyone except themselves.",
      },
    ],
  },
  {
    topic: "gift-ideas",
    locale: "en",
    path: "/en/secret-santa-gift-ideas",
    title: "Secret Santa Gift Ideas for Every Budget – Lets Raffle",
    description:
      "What to buy for Secret Santa: gift ideas for small, medium and bigger budgets, plus safe picks for office gift exchanges.",
    h1: "Secret Santa gift ideas for every budget",
    linkText: "Secret Santa gift ideas",
    intro:
      "Choosing a gift is hard when you barely know your match or the budget is tight. These ideas are grouped by budget and occasion, and each one is easy to adapt to different tastes.",
    sections: [
      {
        heading: "Small budget",
        items: [
          "A nice mug with good coffee or herbal tea",
          "A scented candle",
          "A notebook, planner or a good pen",
          "A small succulent or cactus",
          "Homemade cookies or jam",
        ],
      },
      {
        heading: "Medium budget",
        items: [
          "A book in a genre they enjoy",
          "A quality insulated bottle",
          "A cosy blanket, scarf or a set of warm socks",
          "A board game or jigsaw puzzle",
          "Coffee brewing gear for coffee lovers",
        ],
      },
      {
        heading: "Bigger budget",
        items: [
          "Wireless earbuds or a small speaker",
          "A workshop, concert or experience",
          "A quality backpack or leather wallet",
        ],
      },
      {
        heading: "Safe picks for the office",
        paragraphs: [
          "If you do not know a colleague's taste well, go for things anyone can use: a desk plant, a mug, a notebook, coffee, chocolate or a bookmark. Very personal or joke gifts can land badly at work.",
        ],
      },
    ],
    faq: [
      {
        q: "How much should a Secret Santa gift cost?",
        a: "Agree on an amount everyone is comfortable with. What matters is that everyone sticks to the same limit.",
      },
    ],
  },
];

export const guidesFor = (locale: Locale) => guides.filter((guide) => guide.locale === locale);

export const findGuide = (path: string) => guides.find((guide) => guide.path === path);

/** the same topic in the other language, if that page exists */
export const counterpart = (guide: Guide) =>
  guides.find((other) => other.topic === guide.topic && other.locale !== guide.locale);
