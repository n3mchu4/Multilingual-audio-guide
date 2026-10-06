import { Route, Routes } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Accounts from './pages/Accounts';
import Activity from './pages/Activity';
import Buses from './pages/Buses';
import Dashboard from './pages/Dashboard';
import Places from './pages/Places';
import Settings from './pages/Settings';

/** Gắn trong AppRouter với đường dẫn "/admin/*". */
export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="places" element={<Places />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="buses" element={<Buses />} />
        <Route path="activity" element={<Activity />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
