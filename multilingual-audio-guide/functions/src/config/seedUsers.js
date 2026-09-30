// CHỈ DÙNG KHI DEV: database chưa có nên tạo sẵn 2 tài khoản để chạy được UC8.
// Khi có database thật (Firebase/Supabase), xoá file này và tạo tài khoản trực tiếp trong DB
// (mật khẩu phải được băm bằng passwordService.hashPassword trước khi lưu).
import { USER_TYPES } from '../../../shared/constants/roles.js'

export const DEV_SEED_USERS = [
  { unfid: 'ADMIN001', name: 'Nguyễn Văn Admin', userType: USER_TYPES.ADMIN, password: 'Admin@123' },
  { unfid: 'MANAGER001', name: 'Trần Thị Manager', userType: USER_TYPES.MANAGER, password: 'Manager@123' },
]
