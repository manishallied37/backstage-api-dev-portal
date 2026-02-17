import { dbSetupPlugin } from './plugin';

describe('db-setup', () => {
  it('should export plugin', () => {
    expect(dbSetupPlugin).toBeDefined();
  });
});
