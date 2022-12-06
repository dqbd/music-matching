# Obecná audio podobnost (NI-VMM)

## Popis projektu

Projekt je zaměřen na implementaci podobnostní míry pro písničky. Aplikace by měla obsahovat databázi audio souborů. Uživatel se následně může dotázat vlastním audio dotazem (skrze webové rozhraní) do databáze a aplikace vrátí množinu podobných audio souborů v databázi. V rámci projektu je třeba
naimplementovat extrakci deskriptorů ze zvoleného typu audio souborů a navrhnout a implementovat na nich vlastní podobnostní míru.

Vstup: Audio soubor.

Výstup: Množina databázových audio souborů podobných vstupnímu audiu setříděných podle podobnosti s možností
jejich přehrání.

Aplikace by měla obsahovat části:

- Modul extrakce deskriptorů z audia
- Modul podobnostní míra pro porovnání dvojice audio souborů, tj. jejich deskriptorů
- Modul identifikace podobných databázových audio záznamů s ohledem na vstupní audio
- Webový interface

## Způsob řešení

Náš způsob extrakce deskriptorů a jejich následné porovnání je inspirováno aplikací Shazam.

Nejprve si z audio souboru ve formátu WAV získaneme spektrogram pomocí Krátkodobé Fourierové Transformace (STFT), který analyzuje signál po krátkých časových úsecích. Vzniklý spektrogram rozdělíme na jednotlivé pásma frekvencí (Hz): 0-40, 40-80, 80-120, 120-180, 180-300, 300-Inf.

Z té si následně vytáhneme jednotlivá pásma frekvencí (Hz):. Z každého pásma pak vybereme nejhlasitější frekvence a zprůměrujeme jejich amplitudy. Vybereme však pouze frekvence, které mají větší amplitudu je průměrná pro celé pásmo.

Tím dostaneme tzv. peak frequencies.

Z těchto "peak frequencies" sestrojíme za pomoci techniky "sliding window" hashe ve formátu `{"time": time, "hash": hash}`, kde `time` je čas mezi těmito špičkami. Tyto hashe následně uložíme do databáze.

Tento postup uděláme pro celý dataset při nasazení aplikace. Když pak přijde soubor na vstupu zpracujeme ho stejným způsobem a porovnáme jeho hashe s našimi v databázi, počet shodných hashů pak bereme jako míru podobnosti mezi vstupem a daným audiem z datasetu.

Tento algoritmus je detailně popsán i [zde](https://willdrevo.com/fingerprinting-and-audio-recognition-with-python/).

## Implementace

Celé porovnávní je implementováno v Pythonu za pomocí knihoven [librosa](https://librosa.org/doc/latest/index.html) pro práci s audiem a [NumPy](https://numpy.org/) pro matematické operace. Spouštění Python skriptů probíhá skrze Node.js funkci [child_process.spawn](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options) pro spouštění procesů.

Webové rozhraní je React aplikace využívající [t3 stack](https://create.t3.gg/).

Pro ukládání hashů a metadat o písničkách používáme SQLite.

Ke spuštění je tedy potřeba mít nainstalovaný Python a v souboru [client/src/server/constants.ts](./client/src/server/constants.ts) specifikovat cestu k jeho executable.

## Příklad výstupu

Úvodní stránka: ![Úvodní stranka](research/images/landing_page.png "Úvodní stránka")

Porovnávání záznamů: ![Porovnavani zaznamu](research/images/matching_samples.png "Porovnávání záznamů")

Výsledky porovnávání: ![Vysledky porovnavani](research/images/results.png "Výsledky porovnávání")

## Experimentální sekce

V adresáři [research](research) jsou uloženy ukázky našeho prozkoumávání možností implementace audio podobnosti. Nejdříve jsme začli s vytažením samotných MFCC a následně jejich porovnáváním pomocí algoritmu Dynamic time warping (DTW). To se ukázalo jako poměrně výpočetně náročné a tedy i pomalé. Udělali jsme tedy rešerši implementace Shazamu a inspirovali se jejich vytvářením hashů peak frekvencí. Výsledek je spolehlivější a rychlejší.

TODO možná přidat experimentální srovnání implementací.

## Diskuze

Jako dataset jsme zvolili stažení vlastní knihovny Youtube Music. Kvůli nadměrné velikosti jsme ji však neukládali do repozitáře. Způsob přidání datasetu je tedy skrze lokální složky dataset, která se díky Prisma zpracuje a uloží do databáze. Z hlediska konfigurace by se to určitě dalo vymyslet lépe.

Spouštění Python skriptů jsme zkoušeli implementovat skrze [RabbitMQ](https://www.rabbitmq.com/) a [Celery](https://docs.celeryq.dev/en/stable/) jobů, to se však ukázalo zbytečně složité.

Náš způsob implementace podobnosti funguje poměrně dobře, ale určitě by se dal vylepšit. Např. TODO

## Závěr

Aplikaci jsme vytvořili dle zadaných požadavků a v některých ohledech je i možná přesahujeme (např. možnost nahrání záznamu skrze mikrofon, hezký design). Výsledek projektu tedy hodnotíme velmi kladně.
