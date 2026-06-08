import { jest } from '@jest/globals';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const HAS_SOLR = !!process.env.SOLR_AUTH;

function itIfSolr(name, fn, timeout) {
  if (HAS_SOLR) {
    return it(name, fn, timeout);
  }
  return it.skip(`${name} (skipped: SOLR_AUTH not set)`, fn, timeout);
}

const ARTSOFT_BRAND = 'ARTSOFT CONSULT';
const ARTSOFT_COMPANY = 'ARTSOFT CONSULT SRL';
const ARTSOFT_CIF = '15997630';

beforeAll(() => {
  try { fs.unlinkSync('tmp/company.json'); } catch {}
  if (HAS_SOLR) {
    process.env.SOLR_AUTH = process.env.SOLR_AUTH;
  }
});

describe('Integration: Scraper', () => {

  describe('Company Validation', () => {
    let company;

    beforeAll(async () => {
      company = await import('../../company.js');
    });

    it('should validate company data from ANAF', async () => {
      const companyData = await company.getCompanyData();

      expect(companyData).toHaveProperty('company', ARTSOFT_COMPANY);
      expect(companyData).toHaveProperty('cif', ARTSOFT_CIF);
      expect(companyData).toHaveProperty('active', true);
    }, 30000);

    it('should load company from cache if tmp/company.json exists', async () => {
      const testData = { summary: { company: ARTSOFT_COMPANY, cif: ARTSOFT_CIF, active: true }, anaf: { name: ARTSOFT_COMPANY, cui: parseInt(ARTSOFT_CIF) } };
      fs.mkdirSync('tmp', { recursive: true });
      fs.writeFileSync('tmp/company.json', JSON.stringify(testData));

      const companyData = await company.getCompanyData();

      expect(companyData.company).toBe(ARTSOFT_COMPANY);
      expect(companyData.cif).toBe(ARTSOFT_CIF);
    }, 15000);

    it('should detect inactive company', async () => {
      const anaf = await import('../../src/anaf.js');

      const inactiveRecord = {
        cui: 99999999,
        name: 'INACTIVE COMPANY S.R.L.',
        address: 'Test address',
        caenCode: '6201',
        inactive: true,
        vatRegistered: false,
        eFacturaRegistered: false
      };

      const anafData = await anaf.getCompanyFromANAFWithFallback('99999999', inactiveRecord);
      expect(anafData.inactive).toBe(true);
    }, 15000);
  });

  describe('Index Module Exports', () => {
    let index;

    beforeAll(async () => {
      index = await import('../../index.js');
    });

    it('should export parseJobs', () => {
      expect(typeof index.parseJobs).toBe('function');
    });

    it('should export mapToJobModel', () => {
      expect(typeof index.mapToJobModel).toBe('function');
    });

    it('should export transformJobsForSOLR', () => {
      expect(typeof index.transformJobsForSOLR).toBe('function');
    });
  });

  describe('SOLR Indexing', () => {
    let solr;

    beforeAll(async () => {
      solr = await import('../../solr.js');
    });

    itIfSolr('should add jobs to Solr and return success status', async () => {
      const jobs = [{
        url: 'https://www.artsoft-consult.ro/careers/test-job',
        title: 'Test Job - Integration Test',
        company: ARTSOFT_COMPANY,
        city: 'Cluj-Napoca',
        county: 'Cluj',
        country: 'Romania',
        remote: [],
        published: new Date().toISOString().split('T')[0]
      }];

      const result = await solr.upsertJobs(jobs);
      expect(result).toBeDefined();
      expect(result.status).toBe(0);
    }, 15000);

    itIfSolr('should be able to remove test jobs after adding', async () => {
      const url = 'https://www.artsoft-consult.ro/careers/test-job';
      const result = await solr.deleteJobByUrl(url);
      expect(result).toBeDefined();
      expect(result.status).toBe(0);
    }, 15000);
  });

  describe('Full Verification', () => {
    itIfSolr('should verify company exists in SOLR after scrape', async () => {
      const solr = await import('../../solr.js');
      const solrResult = await solr.queryCompanySOLR(`id:${ARTSOFT_CIF}`);
      expect(solrResult.numFound).toBe(1);
      expect(solrResult.docs[0].company).toBe(ARTSOFT_COMPANY);
      expect(solrResult.docs[0].status).toBe('activ');
    }, 15000);

    itIfSolr('should have correct company model in company core', async () => {
      const solr = await import('../../solr.js');
      const solrResult = await solr.queryCompanySOLR(`id:${ARTSOFT_CIF}`);
      const artsoft = solrResult.docs[0];

      expect(artsoft).toHaveProperty('id', ARTSOFT_CIF);
      expect(artsoft).toHaveProperty('company', ARTSOFT_COMPANY);
      expect(artsoft).toHaveProperty('brand', ARTSOFT_BRAND);
      expect(artsoft).toHaveProperty('location');
      expect(Array.isArray(artsoft.location)).toBe(true);
      expect(artsoft.location.length).toBeGreaterThan(0);

      expect(artsoft).toHaveProperty('website');
      expect(Array.isArray(artsoft.website)).toBe(true);
      expect(artsoft.website[0]).toMatch(/^https?:\/\//);

      expect(artsoft).toHaveProperty('career');
      expect(Array.isArray(artsoft.career)).toBe(true);
      expect(artsoft.career[0]).toMatch(/^https?:\/\//);

      expect(artsoft).toHaveProperty('lastScraped');
      expect(artsoft.lastScraped).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      expect(artsoft).toHaveProperty('scraperFile');
      expect(artsoft.scraperFile).toMatch(/nodejs-scraper\/scraper\.py$/);
    }, 15000);
  });
});
