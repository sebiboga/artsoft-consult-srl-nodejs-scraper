# Actualizare About repo pe GitHub

## CLI (gh)

```bash
# Descriere
gh repo edit sebiboga/artsoft-consult-srl-nodejs-scraper \
  --description "web scraper pentru a aduce locurile de munca de la Artsoft Consult in platforma peviitor.ro"

# Website
gh repo edit sebiboga/artsoft-consult-srl-nodejs-scraper \
  --homepage "https://sebiboga.github.io/artsoft-consult-srl-nodejs-scraper/"

# Topics (EXACT aceste două)
gh repo edit sebiboga/artsoft-consult-srl-nodejs-scraper \
  --add-topic job-seeker-ro-spider --add-topic peviitor-ro
```

## Verificare

```bash
gh repo view sebiboga/artsoft-consult-srl-nodejs-scraper --json description,homepage,topics
```
