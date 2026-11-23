import test from 'node:test';
import assert from 'node:assert/strict';
import { ADMIN_PASSWORD_MAX_AGE_MS, isAdminPasswordExpired, validateAdminNewPassword } from '../../shared/utils/adminPasswordPolicy.js';
const now = Date.parse('2026-11-23T00:00:00Z');
test('admin password expires at 24 hours exactly', () => {
  assert.equal(isAdminPasswordExpired({ role:'ADMIN', password_changed_at:new Date(now - ADMIN_PASSWORD_MAX_AGE_MS + 1).toISOString() }, now), false);
  assert.equal(isAdminPasswordExpired({ role:'ADMIN', password_changed_at:new Date(now - ADMIN_PASSWORD_MAX_AGE_MS).toISOString() }, now), true);
  assert.equal(isAdminPasswordExpired({ role:'MANAGER', password_changed_at:null }, now), false);
  assert.equal(isAdminPasswordExpired({ role:'ADMIN', password_changed_at:null }, now), true);
});
test('new password validation enforces length and difference', () => {
  assert.equal(validateAdminNewPassword('oldoldoldold', 'newnewnewnew'), null);
  assert.ok(validateAdminNewPassword('samepassword', 'samepassword'));
  assert.ok(validateAdminNewPassword('oldoldoldold', 'short'));
});
