import { jest } from '@jest/globals';

const VALID_CIF = '15997630';
const COMPANY_BRAND = 'ARTSOFT CONSULT';

describe('Integration: ANAF API', () => {
  let anaf;

  beforeAll(async () => {
    anaf = await import('../../src/anaf.js');
  });

  it('should search for Artsoft brand and find the company', async () => {
    const results = await anaf.searchCompany(COMPANY_BRAND);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    const artsoft = results.find(c =>
      c.name.toUpperCase().includes('ARTSOFT') && c.statusLabel === 'Funcțiune'
    );
    expect(artsoft).toBeDefined();
    expect(artsoft.cui.toString()).toBe(VALID_CIF);
  }, 15000);

  it('should return empty array for non-existent brand', async () => {
    const results = await anaf.searchCompany('ThisBrandDoesNotExistXYZ123');

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  }, 15000);

  it('should fetch company details by valid CIF', async () => {
    const data = await anaf.getCompanyFromANAF(VALID_CIF);

    expect(data).toBeDefined();
    expect(data.cui).toBe(15997630);
    expect(data.name).toBe('ARTSOFT CONSULT SRL');
    expect(data).toHaveProperty('address');
    expect(data).toHaveProperty('registrationNumber');
    expect(data).toHaveProperty('caenCode');
    expect(data).toHaveProperty('onrcStatusLabel', 'Funcțiune');
  }, 15000);

  it('should throw for invalid CIF', async () => {
    await expect(anaf.getCompanyFromANAF('00000000')).rejects.toThrow();
  }, 60000);

  it('should use cached data when API fails (getCompanyFromANAFWithFallback)', async () => {
    const cached = { cui: 15997630, name: 'ARTSOFT CONSULT SRL' };

    const data = await anaf.getCompanyFromANAFWithFallback(VALID_CIF, cached);

    expect(data).toBeDefined();
    expect(data.cui).toBe(15997630);
  }, 15000);
});
