import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiPost } from './apiClient';
import { createVisitorId } from '../../shared/utils/visitorId.js';

const QUEUE = 'guide.listening.outbox';

let chain = Promise.resolve();
let identity;

// Giữ mã khách ổn định giữa các lần mở app.
export function getVisitorId() {
  identity ??= AsyncStorage.getItem('guide.visitorId')
    .then(async (saved) => {
      const validId =
        /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

      if (validId.test(saved || '')) {
        return saved;
      }

      const id = createVisitorId();

      await AsyncStorage.setItem('guide.visitorId', id);

      return id;
    })
    .catch(() => createVisitorId());

  return identity;
}

// Lưu trước khi gửi, chỉ xóa khi backend phản hồi thành công.
// Xử lý tuần tự để các lần gửi không ghi đè dữ liệu của nhau.
export function flushListening(event) {
  chain = chain.catch(() => {}).then(async () => {
    const stored = await AsyncStorage.getItem(QUEUE);
    const queue = JSON.parse(stored || '{}');

    if (event) {
      queue[event.listenSessionId] = event;

      await AsyncStorage.setItem(
        QUEUE,
        JSON.stringify(queue)
      );
    }

    for (const [id, snapshot] of Object.entries(queue)) {
      try {
        await apiPost('/api/analytics/play', snapshot);

        delete queue[id];

        await AsyncStorage.setItem(
          QUEUE,
          JSON.stringify(queue)
        );
      } catch {
        // Giữ dữ liệu để thử gửi lại lần sau.
        break;
      }
    }
  });

  return chain.catch(() => {});
}