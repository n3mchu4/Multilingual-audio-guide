import { DEV_SEED_USERS } from '../config/seedUsers.js'
import { hashPassword } from './passwordService.js'

/**
 * "Hợp đồng" truy cập dữ liệu người dùng. authService chỉ biết hàm này, không biết DB nào đứng sau.
 *   findByUnfid(unfid) -> { unfid, name, userType, passwordHash } | null
 * Khi có Firebase/Supabase, viết thêm 1 hàm createFirestoreUserRepository() có cùng hàm findByUnfid
 * rồi truyền vào authService — không phải sửa logic đăng nhập.
 */
const normalize = (unfid) => String(unfid).trim().toUpperCase()

export function createInMemoryUserRepository(users) {
  const byUnfid = new Map(users.map((u) => [normalize(u.unfid), u]))
  return {
    async findByUnfid(unfid) {
      return byUnfid.get(normalize(unfid)) ?? null
    },
  }
}

export async function createDevUserRepository() {
  const users = await Promise.all(
    DEV_SEED_USERS.map(async ({ password, ...rest }) => ({
      ...rest,
      passwordHash: await hashPassword(password),
    })),
  )
  return createInMemoryUserRepository(users)
}
