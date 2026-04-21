import type { PartyPromise } from "./ps-promises";

// ─── SMER–SD ────────────────────────────────────────────────────────────────
// Programové východiská: "Návrat dôstojnosti do života ľudí" (2023) + vládny program 2023–2027
export const SMER_PROGRAM_NAME = "Návrat dôstojnosti — Programové priority SMER-SD";
export const SMER_PROMISES: PartyPromise[] = [
  // Ekonomika
  { text: "Zachovanie 13. dôchodku a 13. platu ako trvalej zákonnej povinnosti", category: "Ekonomika", isPro: true },
  { text: "Ústavné zakotvenie maximálneho veku odchodu do dôchodku 64 rokov", category: "Ekonomika", isPro: true },
  { text: "Konsolidácia verejných financií bez sekania sociálnych dávok a dôchodkov", category: "Ekonomika", isPro: true },
  { text: "Regulácia cien základných potravín a energií pre domácnosti v núdzi", category: "Ekonomika", isPro: true },
  { text: "Podpora domácich výrobcov — povinný podiel slovenských potravín na pultoch obchodov", category: "Ekonomika", isPro: true },
  { text: "Zvýšenie minimálnej mzdy na úroveň 60 % priemernej mzdy", category: "Ekonomika", isPro: true },
  { text: "Ochrana strategických podnikov pred predajom zahraničnému kapitálu", category: "Ekonomika", isPro: true },
  { text: "Štátna podpora domácich investícií a priemyselných parkov mimo Bratislavy", category: "Ekonomika", isPro: true },
  // Sociálne veci
  { text: "Zvýšenie rodinných prídavkov na deti a zavedenie daňového bonusu pre všetky deti", category: "Sociálne veci", isPro: true },
  { text: "Zachovanie bezplatného prístupu k jasliach a škôlkach pre všetky deti od 3 rokov", category: "Sociálne veci", isPro: true },
  { text: "Podpora ľudí v hmotnej núdzi — zvýšenie životného minima a dávok", category: "Sociálne veci", isPro: true },
  { text: "Program dostupného nájomného bývania pre mladé rodiny zo sociálne slabších vrstiev", category: "Sociálne veci", isPro: true },
  { text: "Ochrana práv pracujúcich — posilnenie odborov a práva na štrajk", category: "Sociálne veci", isPro: true },
  // Zdravotníctvo
  { text: "Zachovanie bezplatného zdravotníctva — odmietnutie akýchkoľvek poplatkov za bežnú starostlivosť", category: "Zdravotníctvo", isPro: true },
  { text: "Zvýšenie platov sestier a zdravotníckych pracovníkov o 20 %", category: "Zdravotníctvo", isPro: true },
  { text: "Rozšírenie siete geriatrických a paliatívnych oddelení", category: "Zdravotníctvo", isPro: true },
  { text: "Zrušenie privatizácie nemocníc — štátne nemocnice zostanú v štátnych rukách", category: "Zdravotníctvo", isPro: true },
  { text: "Dostupnosť drahých onkologických liekov hradených zo zdravotného poistenia", category: "Zdravotníctvo", isPro: true },
  // Zahraničná politika
  { text: "Diplomatické riešenie vojny na Ukrajine — SR nepošle zbrane ani vojakov", category: "Zahraničná politika", isPro: true },
  { text: "Zachovanie suverénneho práva Slovenska rozhodovať o sankciách voči Rusku", category: "Zahraničná politika", isPro: true },
  { text: "Udržanie dobrých hospodárskych vzťahov so všetkými obchodnými partnermi vrátane Ruska", category: "Zahraničná politika", isPro: true },
  { text: "Aktívna úloha SR v mierových rokovaniach medzi Ukrajinou a Ruskom", category: "Zahraničná politika", isPro: true },
  { text: "Ochrana záujmov SR v rámci EÚ — veto voči rozhodnutiam poškodzujúcim SR", category: "Zahraničná politika", isPro: true },
  // Bezpečnosť
  { text: "Nulová tolerancia nelegálnej migrácie — okamžité vyhostenie osôb bez dokladov", category: "Bezpečnosť", isPro: true },
  { text: "Posilnenie Policajného zboru SR — nábor a vyššie platy policajtov", category: "Bezpečnosť", isPro: true },
  { text: "Prísnejšie tresty za korupciu, daňové podvody a organizovaný zločin", category: "Bezpečnosť", isPro: true },
  { text: "Reforma prokuratúry — väčšia zodpovednosť a transparentnosť", category: "Bezpečnosť", isPro: true },
];

// ─── HLAS–SD ────────────────────────────────────────────────────────────────
// Pellegrini elected president June 2024, left party. Šutaj Eštok leads HLAS. Coalition with SMER+SNS.
export const HLAS_PROGRAM_NAME = "Silný štát pre ľudí — Programové priority HLAS-SD";
export const HLAS_PROMISES: PartyPromise[] = [
  // Zdravotníctvo
  { text: "Modernizácia siete nemocníc — investície z Plánu obnovy do rekonštrukcie a vybavenia", category: "Zdravotníctvo", isPro: true },
  { text: "Zvýšenie platov lekárov a sestier v štátnych nemocniciach o 25 %", category: "Zdravotníctvo", isPro: true },
  { text: "Zákon o dlhodobej starostlivosti — plná podpora seniorov a ľudí so zdravotným postihnutím", category: "Zdravotníctvo", isPro: true },
  { text: "Bezplatná dentálna starostlivosť pre deti do 18 rokov", category: "Zdravotníctvo", isPro: true },
  { text: "Psychiatrická reforma — dostupná duševná starostlivosť vo všetkých krajoch", category: "Zdravotníctvo", isPro: true },
  { text: "Zníženie čakacích lehôt na diagnostiku a operácie na maximálne 60 dní", category: "Zdravotníctvo", isPro: true },
  { text: "Elektronické zdravotníctvo — jednotný register pacientov a e-recepty", category: "Zdravotníctvo", isPro: true },
  // Sociálne veci
  { text: "Zvýšenie minimálnej mzdy na úroveň 62 % priemernej mzdy", category: "Sociálne veci", isPro: true },
  { text: "Rodičovský príspevok pre všetky rodiny bez rozdielu formy starostlivosti o dieťa", category: "Sociálne veci", isPro: true },
  { text: "Program Prvý byt — štátna pomoc pri kúpe prvého bytu pre mladé páry do 35 rokov", category: "Sociálne veci", isPro: true },
  { text: "Ochrana pracujúcich pred prepúšťaním — posilnenie zákonníka práce", category: "Sociálne veci", isPro: true },
  { text: "Príspevok na starostlivosť o chorého príbuzného doma ako alternatíva k domovom", category: "Sociálne veci", isPro: true },
  { text: "Bezplatné škôlky pre deti od 2 rokov — rozšírenie kapacít", category: "Sociálne veci", isPro: true },
  // Ekonomika
  { text: "Zelená transformácia priemyslu — podpora automobilového a strojárskeho sektora", category: "Ekonomika", isPro: true },
  { text: "Podpora malých a stredných podnikov — zjednodušenie prístupu k eurofondom", category: "Ekonomika", isPro: true },
  { text: "Digitálna ekonomika — investície do IT sektora a štartupového ekosystému", category: "Ekonomika", isPro: true },
  { text: "Zníženie byrokracie pre podnikateľov — jedno miesto, jeden formulár", category: "Ekonomika", isPro: true },
  { text: "Potravinová bezpečnosť — podpora slovenských poľnohospodárov a spracovateľov", category: "Ekonomika", isPro: true },
  // Zahraničná politika
  { text: "Pevná proeurópska orientácia — SR ako aktívny a rešpektovaný člen EÚ", category: "Zahraničná politika", isPro: true },
  { text: "Podpora diplomatického riešenia konfliktu na Ukrajine, humanitárna pomoc slovenských občanov", category: "Zahraničná politika", isPro: true },
  { text: "Aktívna spolupráca v rámci V4 na spoločných záujmoch SR", category: "Zahraničná politika", isPro: true },
  { text: "Zachovanie záväzkov SR v rámci NATO — obranné výdavky na úrovni 2 % HDP", category: "Zahraničná politika", isPro: true },
  // Školstvo
  { text: "Zvýšenie platov učiteľov o 20 % v prvých dvoch rokoch vládnutia", category: "Školstvo", isPro: true },
  { text: "Bezplatné obedy pre všetky deti na základných školách", category: "Školstvo", isPro: true },
  { text: "Reforma stredného odborného vzdelávania — spolupráca so zamestnávateľmi", category: "Školstvo", isPro: true },
  { text: "Digitalizácia školstva — tablety a notebooky pre žiakov zo sociálne slabých rodín", category: "Školstvo", isPro: true },
];

// ─── KDH ────────────────────────────────────────────────────────────────────
export const KDH_PROGRAM_NAME = "Hodnoty a prosperita — Programové priority KDH";
export const KDH_PROMISES: PartyPromise[] = [
  // Rodina a hodnoty
  { text: "Ústavná ochrana manželstva ako zväzku muža a ženy", category: "Rodina", isPro: true },
  { text: "Zvýšenie daňového bonusu na dieťa — vyššia podpora pre rodiny s tromi a viac deťmi", category: "Rodina", isPro: true },
  { text: "Opatrovateľský príspevok pre rodiča starajúceho sa o dieťa doma do 3 rokov", category: "Rodina", isPro: true },
  { text: "Podpora adopcií — zjednodušenie procesu a skrátenie čakacích lehôt", category: "Rodina", isPro: true },
  { text: "Program Rodinný dom — štátna podpora pri výstavbe rodinných domov mimo veľkých miest", category: "Rodina", isPro: true },
  { text: "Finančná podpora materských centier a rodičovských skupín v komunitách", category: "Rodina", isPro: true },
  // Školstvo
  { text: "Zvýšenie platov pedagógov na 130 % priemernej mzdy", category: "Školstvo", isPro: true },
  { text: "Zachovanie výučby náboženstva a etiky ako plnohodnotných predmetov", category: "Školstvo", isPro: true },
  { text: "Reforma vzdelávania — dôraz na kritické myslenie, praktické zručnosti a hodnoty", category: "Školstvo", isPro: true },
  { text: "Podpora cirkevných a súkromných škôl — rovnaké financovanie ako štátnych", category: "Školstvo", isPro: true },
  { text: "Ochrana detí online — zákon o digitálnej bezpečnosti maloletých", category: "Školstvo", isPro: true },
  { text: "Povinná telesná výchova a podpora športu na školách", category: "Školstvo", isPro: true },
  // Ekonomika
  { text: "Nižšie dane pre rodiny s deťmi — špeciálna sadzba dane z príjmu", category: "Ekonomika", isPro: true },
  { text: "Podpora vidieka — investície do infraštruktúry, škôl a zdravotníctva v malých obciach", category: "Ekonomika", isPro: true },
  { text: "Podpora poľnohospodárstva — priame platby a ochrana pôdy pred špekulatívnym nákupom", category: "Ekonomika", isPro: true },
  { text: "Zníženie byrokracie pre drobných živnostníkov a roľníkov", category: "Ekonomika", isPro: true },
  { text: "Stabilný a predvídateľný daňový systém bez neustálych zmien", category: "Ekonomika", isPro: true },
  // Zdravotníctvo
  { text: "Dostupná paliatívna starostlivosť v každom kraji — financovaná zo zdravotného poistenia", category: "Zdravotníctvo", isPro: true },
  { text: "Zachovanie verejného zdravotného poistenia bez poplatkov za základnú starostlivosť", category: "Zdravotníctvo", isPro: true },
  { text: "Podpora rodičovskej osvety a preventívnych prehliadok detí", category: "Zdravotníctvo", isPro: true },
  { text: "Reforma závislostí — liečba drog ako zdravotný, nie trestnoprávny problém", category: "Zdravotníctvo", isPro: true },
  // Zahraničná politika
  { text: "Aktívna rola SR v EÚ — obhajoba kresťanských základov európskej civilizácie", category: "Zahraničná politika", isPro: true },
  { text: "Podpora Ukrajinskej zvrchovanosti — diplomatická aj humanitárna pomoc", category: "Zahraničná politika", isPro: true },
  { text: "Solidarita s prenasledovanými kresťanmi a nábožensko-etnickými menšinami vo svete", category: "Zahraničná politika", isPro: true },
];

// ─── SaS ─────────────────────────────────────────────────────────────────────
// Gröhling chairman since March 2024. Program conference March 2025 confirmed 19% flat tax + zrušenie transakčnej dane
export const SAS_PROGRAM_NAME = "Slobodná krajina — Programové priority SaS";
export const SAS_PROMISES: PartyPromise[] = [
  // Ekonomika
  { text: "Zavedenie rovnej dane pre fyzické aj právnické osoby na úrovni 19 %", category: "Ekonomika", isPro: true },
  { text: "Zníženie odvodov pre zamestnancov o 3 percentuálne body — viac peňazí v peňaženke", category: "Ekonomika", isPro: true },
  { text: "Zrušenie dane z dividend — koniec dvojitého zdaňovania podnikateľov", category: "Ekonomika", isPro: true },
  { text: "Plán konsolidácie bez zvyšovania daní — výlučne znižovaním zbytočných výdavkov", category: "Ekonomika", isPro: true },
  { text: "Pravidlo vyrovnaného rozpočtu v ústave — záväzná dlhová brzda", category: "Ekonomika", isPro: true },
  { text: "Zrušenie Ficovej transakčnej dane — škodlivé opatrenie zavedené v 2025 musí ísť preč", category: "Ekonomika", isPro: true },
  { text: "Regulačná gilotína — povinné prehodnotenie každej regulácie staršej ako 10 rokov", category: "Ekonomika", isPro: true },
  { text: "Liberalizácia trhu s energiami — viac konkurencie, nižšie ceny", category: "Ekonomika", isPro: true },
  { text: "Podpora startupov — investičné stimuly pre firmy do 5 rokov", category: "Ekonomika", isPro: true },
  { text: "Zníženie korporátnej dane pre malé firmy do obratu 1 milión EUR na 15 %", category: "Ekonomika", isPro: true },
  // Školstvo
  { text: "Reforma vzdelávania podľa fínskeho modelu — menej memorovania, viac kritického myslenia", category: "Školstvo", isPro: true },
  { text: "Autonómia škôl — riaditelia rozhodujú, koho prijmú a ako učia", category: "Školstvo", isPro: true },
  { text: "Povinná finančná gramotnosť od základnej školy", category: "Školstvo", isPro: true },
  { text: "Zvýšenie platov učiteľov naviazané na výsledky a hodnotenie", category: "Školstvo", isPro: true },
  { text: "Vouchery na vzdelávanie — rodičia si vyberú školu pre dieťa sami", category: "Školstvo", isPro: true },
  { text: "Digitálna trieda — internet a zariadenia pre každého žiaka", category: "Školstvo", isPro: true },
  // Zdravotníctvo
  { text: "Súťaž zdravotných poisťovní — viac poisťovní, viac možností pre poistencov", category: "Zdravotníctvo", isPro: true },
  { text: "Platba za výkon — nemocnice dostanú zaplatené za to, čo skutočne urobia", category: "Zdravotníctvo", isPro: true },
  { text: "Zverejňovanie výsledkov nemocníc — transparentné rebríčky kvality", category: "Zdravotníctvo", isPro: true },
  { text: "Dobrovoľné doplnkové zdravotné poistenie — kto chce lepšiu starostlivosť, zaplatí si sám", category: "Zdravotníctvo", isPro: true },
  // Právny štát
  { text: "Nezávislosť Súdnej rady od politických vplyvov — odborné kritériá výberu sudcov", category: "Právny štát", isPro: true },
  { text: "Zákon o konflikte záujmov — politici nesmú podnikať ani mať majetkové prepojenia na štátne zákazky", category: "Právny štát", isPro: true },
  { text: "Transparentné financovanie politických strán — prísne limity a verejný audit", category: "Právny štát", isPro: true },
  // Zahraničná politika
  { text: "Pevné zakotvenie v EÚ a NATO ako strategická priorita bez kompromisov", category: "Zahraničná politika", isPro: true },
  { text: "Podpora Ukrajinskej zvrchovanosti — vojenská a hospodárska pomoc", category: "Zahraničná politika", isPro: true },
  { text: "Zvýšenie obranného rozpočtu na 2 % HDP podľa záväzku voči NATO", category: "Zahraničná politika", isPro: true },
];

// ─── REPUBLIKA ───────────────────────────────────────────────────────────────
// Did not enter parliament in 2023 (4.75%). Referendum on NATO withdrawal confirmed as policy.
export const REPUBLIKA_PROGRAM_NAME = "Republika pre Slovákov — Programové priority Republika";
export const REPUBLIKA_PROMISES: PartyPromise[] = [
  // Zahraničná politika
  { text: "Odmietnutie ďalšej federalizácie EÚ — zachovanie suverenity členských štátov", category: "Zahraničná politika", isPro: true },
  { text: "Koniec zasielania zbraní na Ukrajinu — SR sa nezúčastní proxy vojny veľmocí", category: "Zahraničná politika", isPro: true },
  { text: "Obnovenie hospodárskych vzťahov s Ruskom — výhodné zmluvy na plyn a ropu", category: "Zahraničná politika", isPro: true },
  { text: "Referendum o neutralite SR — ľud rozhodne o zahranično-politickom kurze krajiny", category: "Zahraničná politika", isPro: true },
  { text: "Veto voči akýmkoľvek sankciám EÚ poškodzujúcim slovenské hospodárstvo", category: "Zahraničná politika", isPro: true },
  { text: "Bilaterálne hospodárske zmluvy s krajinami mimo EÚ — diverzifikácia partnerov", category: "Zahraničná politika", isPro: true },
  // Bezpečnosť
  { text: "Uzatvorenie hraníc pre nelegálnych migrantov — okamžité odovzdanie orgánom krajiny vstupu", category: "Bezpečnosť", isPro: true },
  { text: "Zákon o ochrane hraníc — policajné právomoci pre ochranu štátnej hranice SR", category: "Bezpečnosť", isPro: true },
  { text: "Nulová tolerancia zločinnosti cudzincov — okamžité vyhostenie po odpykaní trestu", category: "Bezpečnosť", isPro: true },
  { text: "Posilnenie armády SR — nábor, vyššie platy a moderná technika", category: "Bezpečnosť", isPro: true },
  { text: "Domáca bezpečnosť ako priorita — viac policajtov v uliciach, nie na hraniciach Eurázie", category: "Bezpečnosť", isPro: true },
  // Sociálne veci
  { text: "Zákon o tradičnej rodine — štátna podpora výlučne pre rodiny muža a ženy s deťmi", category: "Sociálne veci", isPro: true },
  { text: "Demografický fond — jednorazový príspevok pri každom narodenom dieťati", category: "Sociálne veci", isPro: true },
  { text: "Zvýšenie materského príspevku na úroveň priemernej mzdy", category: "Sociálne veci", isPro: true },
  { text: "Podpora slovenských rodín — prídavky na deti len pre občanov SR alebo dlhoročných rezidentov", category: "Sociálne veci", isPro: true },
  { text: "Bytová politika — stavebné sporenie s príspevkom štátu na prvý byt", category: "Sociálne veci", isPro: true },
  // Ekonomika
  { text: "Energetická suverenita — výstavba nového jadrového bloku a rozvoj domácich zdrojov", category: "Ekonomika", isPro: true },
  { text: "Zníženie daní pre rodinné podniky a živnostníkov do obratu 300-tis. EUR", category: "Ekonomika", isPro: true },
  { text: "Potravinová sebestačnosť — podpora domáceho poľnohospodárstva a zákaz špekulatívneho výkupu pôdy", category: "Ekonomika", isPro: true },
  { text: "Ochrana slovenského priemyslu pred dumpingom z Ázie — antidumpingové clá", category: "Ekonomika", isPro: true },
  { text: "Odmietnutie povinného Green Dealu — SR nepôjde do ekologickej transformácie na úkor pracovníkov", category: "Ekonomika", isPro: true },
  // Kultúra
  { text: "Zachovanie slovenského jazyka ako jediného štátneho jazyka — prísne sankcie za porušenie", category: "Kultúra", isPro: true },
  { text: "Podpora slovenskej kultúry a histórie v školských osnovách", category: "Kultúra", isPro: true },
  { text: "Zákon o mediálnom pluralizme — koniec zahraničnej dominancie v slovenských médiách", category: "Kultúra", isPro: true },
];

// ─── SNS ─────────────────────────────────────────────────────────────────────
// Coalition with SMER+HLAS since 2023. SNS notably had a very short 2023 program.
export const SNS_PROGRAM_NAME = "Slovensko predovšetkým — Programové priority SNS";
export const SNS_PROMISES: PartyPromise[] = [
  // Národná identita
  { text: "Ochrana slovenského jazyka — zákon o povinnom používaní štátneho jazyka v úradnom styku", category: "Národná identita", isPro: true },
  { text: "Povinná výučba slovenských dejín a kultúry na všetkých stupňoch škôl", category: "Národná identita", isPro: true },
  { text: "Podpora slovenského folklóru, tradícií a ľudovej kultúry z verejných zdrojov", category: "Národná identita", isPro: true },
  { text: "Ochrana slovenských kultúrnych pamiatok — národný program obnovy hradov a kláštorov", category: "Národná identita", isPro: true },
  { text: "Povinný štátny symbol — zákon o zaobchádzaní so slovenskou vlajkou a hymnou", category: "Národná identita", isPro: true },
  // Bezpečnosť a obrana
  { text: "Zvýšenie rozpočtu armády SR na 2 % HDP a modernizácia vojenského vybavenia", category: "Bezpečnosť", isPro: true },
  { text: "Posilnenie vojenského spravodajstva a kyberbezpečnosti SR", category: "Bezpečnosť", isPro: true },
  { text: "Profesionalizácia Policajného zboru — vyššie platy a lepšie vybavenie", category: "Bezpečnosť", isPro: true },
  { text: "Zákon o ochrane hraníc SR — spolupráca s Frontexom a posilnenie pohraničnej stráže", category: "Bezpečnosť", isPro: true },
  { text: "Zákon o kybernetickej bezpečnosti kritickej infraštruktúry SR", category: "Bezpečnosť", isPro: true },
  // Ekonomika
  { text: "Potravinová sebestačnosť Slovenska — podpora domácich poľnohospodárov a spracovateľov", category: "Ekonomika", isPro: true },
  { text: "Podpora vidieka — výstavba ciest, kanalizácie a internetu v malých obciach", category: "Ekonomika", isPro: true },
  { text: "Ochrana slovenských lesov — zastavenie vývozu surového dreva", category: "Ekonomika", isPro: true },
  { text: "Investície do obnovy priemyselných zón mimo krajských miest", category: "Ekonomika", isPro: true },
  { text: "Program rozvoja cestovného ruchu — Slovensko ako turistická destinácia", category: "Ekonomika", isPro: true },
  // Školstvo
  { text: "Zachovanie tradičných hodnotových základov vzdelávania — rodina, vlasť, viera", category: "Školstvo", isPro: true },
  { text: "Zvýšenie platov učiteľov — pedagóg musí byť prestížnou profesiou", category: "Školstvo", isPro: true },
  { text: "Odmietnutie genderovej ideológie v školských osnovách", category: "Školstvo", isPro: true },
  { text: "Posilnenie odborného vzdelávania — duálny systém pre remeslá a technické obory", category: "Školstvo", isPro: true },
  // Zahraničná politika
  { text: "Suverénna zahraničná politika SR — záujmy Slovenska nad záujmami zahraničných lobbistov", category: "Zahraničná politika", isPro: true },
  { text: "Zachovanie dobrých vzťahov s Českou republikou a krajinami V4", category: "Zahraničná politika", isPro: true },
  { text: "Odmietnutie povinných migračných kvót z Bruselu", category: "Zahraničná politika", isPro: true },
];

// ─── DEMOKRATI ───────────────────────────────────────────────────────────────
// Did not enter parliament in 2023 (~3%). 5 program pillars confirmed: security/geopolitics, crisis preparedness, rule of law.
export const DEMOKRATI_PROGRAM_NAME = "Slobodné a bezpečné Slovensko — Programové priority Demokrati";
export const DEMOKRATI_PROMISES: PartyPromise[] = [
  // Právny štát
  { text: "Obnova nezávislosti prokuratúry — reforma výberu generálneho prokurátora bez politického vplyvu", category: "Právny štát", isPro: true },
  { text: "Súdna reforma — zásluhové menovanie sudcov podľa výsledkov a etiky, nie konexií", category: "Právny štát", isPro: true },
  { text: "Zákon o protikorupčných opatreniach — povinné zverejňovanie majetku funkcionárov", category: "Právny štát", isPro: true },
  { text: "Posilnenie Úradu špeciálnej prokuratúry a zabezpečenie jeho nezávislosti", category: "Právny štát", isPro: true },
  { text: "Zákon o whistlebloweroch — plná ochrana oznamovateľov korupcie a protiprávneho konania", category: "Právny štát", isPro: true },
  { text: "Transparentné verejné zákazky — povinné zverejňovanie všetkých zmlúv nad 5 000 EUR", category: "Právny štát", isPro: true },
  // Zahraničná politika a bezpečnosť
  { text: "Pevná proatlantická orientácia SR — NATO ako základ bezpečnostnej architektúry", category: "Zahraničná politika", isPro: true },
  { text: "Podpora Ukrajinskej zvrchovanosti — vojenská, humanitárna a diplomatická pomoc", category: "Zahraničná politika", isPro: true },
  { text: "Obranný rozpočet na 2 % HDP — splnenie záväzku voči aliančným partnerom", category: "Zahraničná politika", isPro: true },
  { text: "Aktívna rola SR v EÚ a NATO — Slovensko ako spoľahlivý partner", category: "Zahraničná politika", isPro: true },
  { text: "Reforma bezpečnostných zložiek SR — depolitizácia polície, SIS a vojenskej rozviedky", category: "Zahraničná politika", isPro: true },
  // Ekonomika
  { text: "Transparentnosť eurofondov — každoročný verejný audit čerpania prostriedkov EÚ", category: "Ekonomika", isPro: true },
  { text: "Podnikateľský kódex — konsolidácia zákonov do jedného prehľadného celku", category: "Ekonomika", isPro: true },
  { text: "Podpora digitálneho hospodárstva a IT sektora — výhodné podmienky pre technologické firmy", category: "Ekonomika", isPro: true },
  // Zdravotníctvo
  { text: "Reforma zdravotníctva — výkonnostný model financovania pre lepšie výsledky", category: "Zdravotníctvo", isPro: true },
  { text: "Dostupná psychiatrická pomoc — investície do duševného zdravia spoločnosti", category: "Zdravotníctvo", isPro: true },
  // Školstvo
  { text: "Podpora kritického myslenia a mediálnej gramotnosti od základnej školy", category: "Školstvo", isPro: true },
  { text: "Reforma vysokých škôl — prepojenie výskumu a praxe, medzinárodné hodnotenie", category: "Školstvo", isPro: true },
];

// ─── ALIANCIA ────────────────────────────────────────────────────────────────
// 2023 leader: Krisztián Forró. Gubík chairman from Sept 2024. Did not enter parliament 2023 (4.38%).
// Program confirmed: hospital renewal, minorities law, infrastructure on south Slovakia.
export const ALIANCIA_PROGRAM_NAME = "Spolu za lepšie Slovensko — Programové priority Aliancie";
export const ALIANCIA_PROMISES: PartyPromise[] = [
  // Práva menšín
  { text: "Zákon o ochrane práv národnostných menšín — povinné zohľadnenie v rozhodnutiach samosprávy", category: "Práva menšín", isPro: true },
  { text: "Zachovanie práva na dvojjazyčné označenie obcí podľa platnej legislatívy", category: "Práva menšín", isPro: true },
  { text: "Dvojjazyčné vzdelávanie — financovanie škôl s vyučovacím jazykom maďarskej menšiny na rovnakej úrovni ako slovenských", category: "Práva menšín", isPro: true },
  { text: "Podpora menšinových kultúrnych inštitúcií — divadlá, kultúrne domy, festivaly", category: "Práva menšín", isPro: true },
  { text: "Zachovanie menšinového vysielania vo verejnoprávnych médiách", category: "Práva menšín", isPro: true },
  { text: "Uznanie Maďarskej akadémie vied ako partnera pri výskume spoločných dejín", category: "Práva menšín", isPro: true },
  // Regionálny rozvoj
  { text: "Osobitný investičný plán pre juh Slovenska — historicky zaostávajúce regióny", category: "Regionálny rozvoj", isPro: true },
  { text: "Dobudovanie diaľničného spojenia Bratislava — Komárno — Košice", category: "Regionálny rozvoj", isPro: true },
  { text: "Rekonštrukcia mostov a ciest na juhu Slovenska z eurofondov", category: "Regionálny rozvoj", isPro: true },
  { text: "Podpora regionálneho poľnohospodárstva — zachovanie pôdy pre miestnych farmárov", category: "Regionálny rozvoj", isPro: true },
  { text: "Zriadenie rozvojovej agentúry pre južné Slovensko s vlastným rozpočtom", category: "Regionálny rozvoj", isPro: true },
  // Zahraničná politika
  { text: "Proeurópska zahraničná politika — plné využívanie fondov a politík EÚ v záujme SR", category: "Zahraničná politika", isPro: true },
  { text: "Dobrá susedská politika — kultúrna a hospodárska spolupráca s Maďarskom", category: "Zahraničná politika", isPro: true },
  { text: "Aktívna účasť SR v spolupráci V4 pri riešení regionálnych výziev", category: "Zahraničná politika", isPro: true },
  { text: "Diplomatická podpora Ukrajinskej zvrchovanosti a mierového riešenia konfliktu", category: "Zahraničná politika", isPro: true },
  // Samospráva
  { text: "Posilnenie kompetencií a rozpočtu samospráv — menej rozhodnutí z Bratislavy", category: "Samospráva", isPro: true },
  { text: "Právo menšinových spoločenstiev na zastúpenie v orgánoch miestnej samosprávy", category: "Samospráva", isPro: true },
  { text: "Transparentné rozdeľovanie eurofondov cez samosprávy bez politických preferencií", category: "Samospráva", isPro: true },
];

// ─── SLOVENSKO (OĽaNO–Matovič) ───────────────────────────────────────────────
// 258-page 2023 program, 5 pillars: anti-corruption, justice, family, education, healthcare
// Not in parliament. Anti-corruption flagship.
export const SLOVENSKO_PROGRAM_NAME = "Čisté Slovensko — Programové priority hnutia Slovensko";
export const SLOVENSKO_PROMISES: PartyPromise[] = [
  // Boj proti korupcii
  { text: "Zákon o konfiškácii majetku nadobudnutého korupciou bez potreby trestného odsúdenia", category: "Protikorupcia", isPro: true },
  { text: "Povinné zverejňovanie daňových priznaní všetkých verejných funkcionárov a ich rodinných príslušníkov", category: "Protikorupcia", isPro: true },
  { text: "Zákon o lobingu — povinná registrácia lobistov a zverejňovanie stretnutí s politikmi", category: "Protikorupcia", isPro: true },
  { text: "Zákon o zákaze krížového vlastníctva médií a štátnych zákaziek — koniec olígarchov", category: "Protikorupcia", isPro: true },
  { text: "Vytvorenie nezávislej protikorupčnej agentúry podľa vzoru OLAF s reálnymi právomocami", category: "Protikorupcia", isPro: true },
  { text: "Audit všetkých verejných zákaziek nad 100-tis. EUR za posledných 10 rokov", category: "Protikorupcia", isPro: true },
  // Sociálne veci
  { text: "Zvýšenie prídavkov na deti — trojnásobná suma pre rodiny s príjmom pod mediánom", category: "Sociálne veci", isPro: true },
  { text: "Dostupné bývanie pre mladé rodiny — štátny fond lacných nájmov s odkupnou opciou", category: "Sociálne veci", isPro: true },
  { text: "Bezplatná škôlka od dvoch rokov — rozšírenie kapacít za každých okolností", category: "Sociálne veci", isPro: true },
  { text: "Zvýšenie opatrovateľského príspevku — rodičia starajúci sa o postihnuté deti doma zaslúžia dôstojnú odmenu", category: "Sociálne veci", isPro: true },
  { text: "Program Prvý byt — garancie a nízkoúročené pôžičky pre prvých kupujúcich do 35 rokov", category: "Sociálne veci", isPro: true },
  // Ekonomika
  { text: "Revízia všetkých predražených IT zákaziek štátu — vrátenie peňazí daňovníkov", category: "Ekonomika", isPro: true },
  { text: "Zákon o štátnych nákupoch — povinné elektronické aukcie a zverejnenie finálnej ceny", category: "Ekonomika", isPro: true },
  { text: "Zníženie DPH na základné potraviny, lieky a detský tovar na 5 %", category: "Ekonomika", isPro: true },
  { text: "Podpora malých podnikateľov — nulové odvody pre živnostníkov s príjmom pod minimálnou mzdou", category: "Ekonomika", isPro: true },
  { text: "Rekonštrukcia diaľnic a ciest I. triedy z eurofondov bez predraženia", category: "Ekonomika", isPro: true },
  // Zdravotníctvo
  { text: "Dostupnosť inovatívnych liekov hradených poisťovňou — koniec diskriminácie pacientov", category: "Zdravotníctvo", isPro: true },
  { text: "Zákon o záchrannej zdravotnej službe — garantované dojazdové časy v každom regióne", category: "Zdravotníctvo", isPro: true },
  { text: "Zvýšenie platov zdravotníkov — sestry aj záchranári na úroveň priemernej mzdy", category: "Zdravotníctvo", isPro: true },
  // Školstvo
  { text: "Plošné zavedenie bezplatných obedov pre žiakov základných škôl", category: "Školstvo", isPro: true },
  { text: "Digitalizácia škôl — notebook alebo tablet pre každého žiaka zo štátneho", category: "Školstvo", isPro: true },
  { text: "Reforma maturít — menej memorovania, viac aplikácie vedomostí", category: "Školstvo", isPro: true },
];
