# job_seeker_ro_spider

**job_seeker_ro_spider** — scraper pentru job-urile Artsoft Consult din România.

Extrage anunțurile de pe [Artsoft Consult Careers](https://www.artsoft-consult.ro/careers/job-openings) și le publică în [peviitor.ro](https://peviitor.ro).

## Ce face

1. **Validează compania** — interoghează API-ul ANAF după brand-ul ARTSOFT CONSULT
2. **Cross-validează cu Peviitor** — verifică existența în API-ul Peviitor
3. **Scrape-uiește pagina de job-uri** — extrage lista de job-uri
4. **Parsează fiecare anunț** — extrage detalii
5. **Stochează în SOLR**

## Structură proiect

```
├── index.js           # Orchestrator principal
├── company.js         # Validare companie
├── src/anaf.js        # Modul ANAF API
├── solr.js            # Operații SOLR
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── .github/workflows/
    ├── scrape.yml     # Rulează zilnic la 6 AM
    └── test.yml       # Teste la fiecare push/PR
```

## Testare

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```
