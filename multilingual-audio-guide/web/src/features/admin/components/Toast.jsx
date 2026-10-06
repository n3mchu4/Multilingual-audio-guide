import { useAdmin } from '../AdminContext';

export default function Toast() {
  const { toastMsg } = useAdmin();
  return <div className={'toast' + (toastMsg ? ' show' : '')}>{toastMsg}</div>;
}
