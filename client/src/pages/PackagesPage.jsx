import React, { useEffect } from 'react';
import PackageSection from '../components/packages/PackageSection';

export default function PackagesPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-[#FFF8FA]">
      <PackageSection />
    </div>
  );
}
