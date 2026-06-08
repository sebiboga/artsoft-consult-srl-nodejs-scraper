# Artsoft Consult — Verification Checklist

> Use this file to track what has been verified (manually or automated) for Artsoft Consult.

## Pașul 1: Teste Locale (locale)

- [ ] `npm test` — toate testele trec
- [ ] `node company.js` — validare ANAF + Peviitor funcționează
- [ ] `node solr.js` — query SOLR funcționează (dacă `SOLR_AUTH` e setat)
- [ ] `node index.js` — scrape-ul se execută fără erori
- [ ] Fișierul `tmp/company.json` e generat corect
- [ ] Fișierul `tmp/company_core.json` e generat corect (după scrape)

## Pașul 2: GitHub Actions (remote)

- [ ] `Automation-Tests` — toate testele trec în CI
- [ ] `validate-jobs` — Artsoft apare în company core
- [ ] `Scheduled Scrape` — rulează zilnic și publică job-uri

## Pașul 3: Verificare Peviitor (production)

- [ ] Job-urile Artsoft apar pe [Peviitor.ro](https://peviitor.ro)
- [ ] Logo, descriere, locații corecte
- [ ] Link-urile către cariere funcționează

## Note

- CIF: 15997630
- Brand: ARTSOFT CONSULT
- Frecvență scrape: zilnic (06:00 UTC)
- Site: https://www.artsoft-consult.ro
- Cariere: https://www.artsoft-consult.ro/careers/job-openings
