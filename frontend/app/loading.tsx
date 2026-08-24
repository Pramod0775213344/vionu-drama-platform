import React from 'react';

export default function RootLoading() {
  return (
    <div className="w-full min-h-screen bg-[#0E1015] pt-8 px-4 sm:px-8 lg:px-14 space-y-8 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="w-full h-[55vh] min-h-[380px] bg-[#181C26] rounded-2xl" />

      {/* Row Skeletons */}
      <div className="space-y-8">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-5 w-48 bg-[#181C26] rounded-lg" />
            <div className="flex gap-4 overflow-hidden">
              {[...Array(7)].map((_, j) => (
                <div
                  key={j}
                  className="w-[170px] shrink-0 aspect-[2/3] rounded-xl bg-[#181C26]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
