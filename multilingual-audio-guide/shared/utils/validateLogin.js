// Kiểm tra dữ liệu nhập ở bước 1 của UC8. Dùng chung cho FE (báo lỗi sớm) và BE (không tin dữ liệu client).
export function validateLoginInput(input) {
  const unfid = typeof input?.unfid === 'string' ? input.unfid.trim() : ''
  const password = typeof input?.password === 'string' ? input.password : ''
  const errors = {}
  if (!unfid) errors.unfid = 'REQUIRED'
  if (!password) errors.password = 'REQUIRED'
  return { valid: Object.keys(errors).length === 0, errors, value: { unfid, password } }
}
