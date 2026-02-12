import { adminPlugin } from './plugin';

describe('admin', () => {
  it('should export plugin', () => {
    expect(adminPlugin).toBeDefined();
  });
});
