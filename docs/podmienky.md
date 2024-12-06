# Podmienky zadania

1. registrácia, prihlásenie a odhlásenie používateľa
    - používateľ má meno a priezvisko, nickName a email
2. používateľ vidí zoznam kanálov, v ktorých je členom
    - pri opustení kanála, alebo trvalom vyhodení z kanála je daný kanál odobratý zo zoznamu
    - pri pozvánke do kanála je daný kanál zvýraznený a topovaný
    - v zozname môže cez používateľské rozhranie kanál vytvoriť, opustiť, a ak je správcom aj zrušiť
    - dva typy kanálov - súkromný (private channel) a verejný kanál (public channel)
    - správcom kanála je používateľ, ktorý kanál vytvoril
    - ak nie je kanál aktívny (nie je pridaná nová správa) viac ako 30 dní, kanál prestáva existovať (následne je možné použiť channelName kanála pre "nový" kanál)
3. používateľ odosiela správy a príkazy cez "príkazový riadok", ktorý je "fixným" prvkom aplikácie. používateľ môže odoslať správu v kanáli, ktorého je členom
4. vytvorenie komunikačného kanála (channel) cez príkazový riadok
    - kanál môže vytvoriť ľubovolný používateľ cez príkaz /join channelName [private]
    - do súkromného kanála môže pridávať/odoberať používateľov iba správca kanála cez príkazy /invite nickName a /revoke nickName
    - do verejného kanála sa môže pridať ľubovolný používateľ cez príkaz /join channelName (ak kanál neexistuje, automaticky sa vytvorí)
    - do verejného kanála môže člen kanála pozvať iného používateľa príkazom /invite nickName
    - vo verejnom kanáli môže člen "vyhodiť" iného člena príkazom /kick nickName. ak tak spravia aspoň 3 členovia, používateľ má "trvalý" ban pre daný kanál. správca môže používateľa vyhodiť "natrvalo" kedykoľvek príkazom /kick nickName, alebo naopak "obnovit" používateľovi prístup do kanála cez príkaz /invite
    - nickName ako aj channelName sú unikátne
    - správca môže kanál zatvoriť/zrušiť príkazom /quit
5. používateľ môže zrušiť svoje členstvo v kanáli príkazom /cancel, ak tak spraví správca kanála, kanál zaniká
6. správu v kanáli je možné adresovať konkrétnemu používateľovi cez príkaz @nickname
    - správa je zvýraznená danému používateľovi v zozname správ
7. používateľ si môže pozrieť kompletnú históriu správ
    - efektívny inifinite scroll
8. používateľ je informovaný o každej novej správe prostredníctvom notifikácie
    - notifikácia sa vystavuje iba ak aplikácia nie je v stave "visible" (pozrite quasar docu App Visibility)
    - notifikácia obsahuje časť zo správy a odosielateľa
    - používateľ si môže nastaviť, aby mu chodili notifikácie iba pre správy, ktoré sú mu adresované
9. používateľ si môže nastaviť stav (online, DND, offline)
    - stav sa zobrazuje používateľom
    - ak je nastavený DND stav, neprichádzajú notifikácie
    - ak je nastavený offline stav, neprichádzajú používateľovi správy, po prepnutí do online sú kanály automaticky aktualizované
10. používateľ si môže pozrieť zoznam členov kanála (ak je tiež členom kanála) príkazom /list
11. ak má používateľ aktívny niektorý z kanálov (nachádza sa v okne správ pre daný kanál) vidí v stavovej lište informáciu o tom, kto aktuálne píše správu (napr. Ed is typing)
    - po kliknutí na nickName si môže pozrieť rozpísaný text v reálnom čase, predtým, ako ju odosielateľ odošle (každá zmena je viditeľná) :-)

# TODO

3. vytvorenie komunikačného kanála (channel) cez príkazový riadok
    - vo verejnom kanáli môže člen "vyhodiť" iného člena príkazom /kick nickName. ak tak spravia aspoň 3 členovia, používateľ má "trvalý" ban pre daný kanál. správca môže používateľa vyhodiť "natrvalo" kedykoľvek príkazom /kick nickName, alebo naopak "obnovit" používateľovi prístup do kanála cez príkaz /invite
4. používateľ je informovaný o každej novej správe prostredníctvom notifikácie
    - notifikácia sa vystavuje iba ak aplikácia nie je v stave "visible" (pozrite quasar docu App Visibility)
    - notifikácia obsahuje časť zo správy a odosielateľa
    - používateľ si môže nastaviť, aby mu chodili notifikácie iba pre správy, ktoré sú mu adresované
5. používateľ si môže nastaviť stav (online, DND, offline)
    - ak je nastavený DND stav, neprichádzajú notifikácie
    - ak je nastavený offline stav, neprichádzajú používateľovi správy, po prepnutí do online sú kanály automaticky aktualizované

-   Notifikácie, keď je quasar open, tak stačí Notify, keď minimized, system notifications
-   repo.txt (link na GITHUB repozitár)
