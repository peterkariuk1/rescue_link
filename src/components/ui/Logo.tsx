import { LifeBuoy } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  light?: boolean;
}

export function Logo({ size = 'md', showText = true, light = false }: LogoProps) {
  const sizes = {
    sm: { icon: 24, container: 'w-8 h-8', text: 'text-base' },
    md: { icon: 30, container: 'w-10 h-10', text: 'text-lg' },
    lg: { icon: 40, container: 'w-14 h-14', text: 'text-2xl' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${s.container} rounded-xl bg-navy-950 flex items-center justify-center shrink-0`}>
        <LifeBuoy size={s.icon} className="text-white" strokeWidth={2.5} />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold ${s.text} ${light ? 'text-white' : 'text-navy-950'}`}>
            Rescue Link
          </span>
          <span className={`text-[10px] font-medium ${light ? 'text-navy-200' : 'text-navy-400'} tracking-wide uppercase mt-0.5`}>
            Emergency Dispatch
          </span>
        </div>
      )}
    </div>
  );
}
