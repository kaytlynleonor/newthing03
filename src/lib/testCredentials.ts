/** Local demo logins — bypass Firebase where noted. Remove or gate for production. */

export const TEST_SHOP_USER = 'admin';
export const TEST_CMS_USER = 'smillie';
export const TEST_PASSWORD = '1234';

export function normalizeLoginId(value: string): string {
  return value.toLowerCase().trim();
}

export function isTestShopLogin(id: string, password: string): boolean {
  return normalizeLoginId(id) === TEST_SHOP_USER && password === TEST_PASSWORD;
}

export function isTestCmsLogin(id: string, password: string): boolean {
  return normalizeLoginId(id) === TEST_CMS_USER && password === TEST_PASSWORD;
}
