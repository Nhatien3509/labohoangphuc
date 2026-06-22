import { Cloud } from "@common/components/icons";

const DOT_DELAYS = [0, 120, 240];

const HydrationLoading = () => {
  return (
    <div className="fixed flex h-full w-full items-center justify-center">
      <div className="absolute z-20 flex w-full -translate-y-3/4 flex-col items-center">
        <div className="">
          <Cloud size={84} className="text-primary-100" />
        </div>

        <div className="inline-flex items-center gap-3">
          {DOT_DELAYS.map((delay) => (
            <span
              key={delay}
              className="block h-3 w-3 animate-loading-wave rounded-full bg-primary-100"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 z-10 animate-pulse bg-primary-50 opacity-70" />
    </div>
  );
};

export default HydrationLoading;
