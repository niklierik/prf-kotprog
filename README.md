# Leírás

## Online hírportál (inspiráció: Telex, Index, stb...)

Szerepkörök: vendég, olvasó, író, admin, szuperadmin
A vendégek a kezdőoldalon az éppen aktuális, releváns cikkekből kapnak ajánlást (cikk "életkora" és kattintás száma alapján), illetve ezeket eltudják olvasni. A vendégek ezentúl be tudnak regisztrálni, illetve lépni, ekkor olvasókká válnak.

Az olvasók tudnak megjegyzéseket hagyni a cikkek alatt, illetve létezhetnek olyan cikkek, amelyek csak regisztrált olvasók tudnak megtekinteni (vendégek csak az elejéből részletet). Az olvasók tudnak avatart állítani.

Íróknak van lehetőségük cikkeket készíteni, saját cikkeiket szerkeszteni, komment szekcióját moderálni és törölni, illetve a cikkhez tartozó címkéket kezelni. Emellett tudnak fájlokat (cikkekhez képeket) feltölteni.

Admin felhasználóknak van lehetőségük olvasókat íróvá léptetni, mások cikkeit is szerkeszteni, módosítani, törölni, illetve cikkek "tulajdonjogát" módosítani. Van lehetőségűk új cimkék létrehozására, illetve azok szerkesztésére.
A szuperadmin is admin, azonban az ő felhasználója a rendszer létrejöttével létezik, és más adminok kijelölése a feladata ennek a felhasználónak.

# Telepítés

Az alkalmazáshoz csak development environment készült. Ez miatt előfeltétel, hogy a futtató eszközön legyen Node 22.

Az NPM csomagok kezeléséhez `Yarn`-t használtam, ezt telepíteni a következő paranccsal lehet:

```bash
npm i -g yarn
```

Ezután a `node_modules`-okat a következő paranccsal tudjuk telepíteni:

```bash
yarn
```

Ezután szükséges a projects/backend mappában létrehozni egy `env.json` fájlt, mely a szerver konfigurációját tartalmazza. Az env.example.json tartalmaz egy példa változatot.

Az alkalmazás Dockerral indítható (Development build, tehát watchmode-ban):

```bash
docker compose up -d
```

Ezzel elindul minden szükséges service. Az nginx `81`-es portra van configolva, az alkalmazás a http://localhost:81 cím alatt érhető el. Az adatbázis seedelése is megtörténik, ezt a backend projektben található `.seeded-db` fájl létezése jelzi (ha ezt a fájlt kitöröljük, akkor indításkor az adatbázis újra seedelődik). Ez a folyamat képek letöltése miatt időbe telhet.

A superadminnal való bejelentkezéshez:

- Felhasználónév: super
- Jelszó: admin
