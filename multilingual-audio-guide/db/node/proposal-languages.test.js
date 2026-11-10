import assert from 'node:assert/strict';
import test from 'node:test';
import { getProposalLanguageError } from '../../shared/utils/proposalLanguages.js';

test('adding a short description requires both languages', () => {
  const current = { subtitleVi: '', subtitleEn: '' };
  const proposed = { ...current, subtitleVi: 'Ven sông Sài Gòn' };
  assert.match(getProposalLanguageError(proposed, current), /mô tả ngắn/);
  assert.equal(getProposalLanguageError({
    ...proposed, subtitleEn: 'Along the Saigon River',
  }, current), '');
});

test('an existing translation must be updated when its counterpart changes', () => {
  const current = { descriptionVi: 'Mô tả cũ', descriptionEn: 'Old description' };
  assert.match(getProposalLanguageError({
    ...current, descriptionEn: 'New description',
  }, current), /mô tả chi tiết/);
});

test('changing shared content allows unchanged language fields, including legacy blanks', () => {
  const current = { subtitleVi: 'Ven sông', subtitleEn: '', latitude: 10 };
  assert.equal(getProposalLanguageError({
    ...current, subtitleVi: 'Ven sông ', latitude: 11,
  }, current), '');
});

test('an audio update requires two nonempty URLs', () => {
  const current = { audioViUrl: 'vi.mp3', audioEnUrl: 'en.mp3' };
  assert.match(getProposalLanguageError({
    audioViUrl: 'new-vi.mp3', audioEnUrl: null,
  }, current), /âm thanh/);
  assert.equal(getProposalLanguageError({
    audioViUrl: 'new-vi.mp3', audioEnUrl: 'new-en.mp3',
  }, current), '');
});
