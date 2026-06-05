# Robots.txt Analysis — artsoft-consult.ro

Sursa: https://www.artsoft-consult.ro/robots.txt

## Reguli

```
User-agent: *
Disallow: /admin/
Allow: /
```

## Interpretare

| Cale | Accesibil? | Ce conține |
|---|---|---|
| `/` | ✅ Da | Pagina principală |
| `/careers/job-openings` | ✅ Da | Lista de job-uri |
| `/admin/*` | ❌ Disallowed | Panou administrare |

## Recomandare

- Scraperul accesează doar pagina de job-uri — permis de robots.txt
- Rate limiting: 1 request per page, delay rezonabil
- User-Agent standard de browser
- Riscul de blocare este minim
