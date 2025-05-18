import { useRouter } from 'next/router';
import { useEffect } from 'react';

// This page will redirect to the locations page
export default function FacilitiesIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/facilities/locations');
  }, [router]);

  return null;
}
