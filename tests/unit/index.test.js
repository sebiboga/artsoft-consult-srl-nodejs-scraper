import { jest } from '@jest/globals';

describe('index.js Component Tests', () => {
  let index;

  beforeAll(async () => {
    index = await import('../../index.js');
  });

  describe('transformJobsForSOLR', () => {
    it('should preserve locations as-is and default empty to România', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', location: ['Cluj-Napoca'] },
          { url: 'https://test.com/2', title: 'Job 2', location: [] },
          { url: 'https://test.com/3', title: 'Job 3', location: ['Bucharest'] }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].location).toEqual(['Cluj-Napoca']);
      expect(result.jobs[1].location).toEqual(['România']);
      expect(result.jobs[2].location).toEqual(['Bucharest']);
    });

    it('should keep company uppercase', () => {
      const payload = {
        source: 'artsoft-consult.ro',
        company: 'artsoft consult srl',
        cif: '15997630',
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', company: 'artsoft consult', cif: '15997630' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.company).toBe('ARTSOFT CONSULT SRL');
    });

    it('should normalize workmode values', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', workmode: 'Remote' },
          { url: 'https://test.com/2', title: 'Job 2', workmode: 'ON-SITE' },
          { url: 'https://test.com/3', title: 'Job 3', workmode: 'Hybrid' },
          { url: 'https://test.com/4', title: 'Job 4', workmode: 'hybrid' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].workmode).toBe('remote');
      expect(result.jobs[1].workmode).toBe('on-site');
      expect(result.jobs[2].workmode).toBe('hybrid');
      expect(result.jobs[3].workmode).toBe('hybrid');
    });

    it('should handle empty jobs array', () => {
      const result = index.transformJobsForSOLR({ jobs: [] });
      expect(result.jobs).toEqual([]);
    });
  });

  describe('mapToJobModel', () => {
    it('should map raw job to job model format', () => {
      const rawJob = {
        url: 'https://www.artsoft-consult.ro/careers/job/123',
        title: 'Senior Developer',
        location: ['Cluj-Napoca'],
        workmode: 'hybrid'
      };

      const COMPANY_NAME = 'ARTSOFT CONSULT SRL';
      const COMPANY_CIF = '15997630';

      const result = index.mapToJobModel(rawJob, COMPANY_CIF, COMPANY_NAME);

      expect(result.url).toBe(rawJob.url);
      expect(result.title).toBe(rawJob.title);
      expect(result.company).toBe(COMPANY_NAME);
      expect(result.cif).toBe(COMPANY_CIF);
      expect(result.location).toEqual(rawJob.location);
      expect(result.workmode).toBe(rawJob.workmode);
      expect(result.status).toBe('scraped');
      expect(result.date).toBeDefined();
    });

    it('should handle missing fields with defaults', () => {
      const rawJob = {
        url: 'https://www.artsoft-consult.ro/careers/job/1',
        title: 'Job 1'
      };

      const result = index.mapToJobModel(rawJob, '15997630');

      expect(result.location).toEqual([]);
      expect(result.workmode).toBe('on-site');
    });

    it('should handle missing title', () => {
      const rawJob = { url: 'https://www.artsoft-consult.ro/careers/job/1' };

      const result = index.mapToJobModel(rawJob, '15997630');

      expect(result.title).toBeUndefined();
      expect(result.url).toBe('https://www.artsoft-consult.ro/careers/job/1');
    });
  });

  describe('parseJobs', () => {
    it('should parse HTML and return job list', () => {
      const html = `
        <html>
          <body>
            <div class="single-job-container">
              <h3><a href="/careers/job/1">Senior Developer</a></h3>
            </div>
            <div class="single-job-container">
              <h3><a href="https://external.com/job/2">Junior Tester</a></h3>
            </div>
          </body>
        </html>
      `;

      const jobs = index.parseJobs(html);

      expect(jobs).toHaveLength(2);
      expect(jobs[0].title).toBe('Senior Developer');
      expect(jobs[0].url).toBe('https://www.artsoft-consult.ro/careers/job/1');
      expect(jobs[1].title).toBe('Junior Tester');
      expect(jobs[1].url).toBe('https://external.com/job/2');
    });

    it('should skip entries with no title or link', () => {
      const html = `
        <html>
          <body>
            <div class="single-job-container">
              <h3><a href="">Empty</a></h3>
            </div>
            <div class="single-job-container">
              <span>No link here</span>
            </div>
          </body>
        </html>
      `;

      const jobs = index.parseJobs(html);

      expect(jobs).toHaveLength(0);
    });

    it('should handle empty HTML', () => {
      const jobs = index.parseJobs('<html><body></body></html>');
      expect(jobs).toEqual([]);
    });
  });
});
