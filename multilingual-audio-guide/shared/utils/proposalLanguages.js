const bilingualFields = [
  ['titleVi', 'titleEn', 'tên địa danh'],
  ['subtitleVi', 'subtitleEn', 'mô tả ngắn'],
  ['descriptionVi', 'descriptionEn', 'mô tả chi tiết'],
  ['transcriptVi', 'transcriptEn', 'lời thuyết minh'],
  ['audioViUrl', 'audioEnUrl', 'âm thanh'],
];

export function getProposalLanguageError(proposed, current) {
  for (const [viKey, enKey, label] of bilingualFields) {
    const vi = proposed[viKey]?.trim() ?? '';
    const en = proposed[enKey]?.trim() ?? '';
    const viChanged = vi !== (current[viKey]?.trim() ?? '');
    const enChanged = en !== (current[enKey]?.trim() ?? '');

    if ((viChanged || enChanged) && !(viChanged && enChanged && vi && en)) {
      return `Khi sửa ${label}, hãy cập nhật cả bản tiếng Việt và tiếng Anh.`;
    }
  }
  return '';
}
