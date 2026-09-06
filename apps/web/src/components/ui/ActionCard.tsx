import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type ActionCardProps = {
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  onClick?: () => void;
  href?: string;
};

export default function ActionCard({ title, subtitle, Icon, onClick, href }: ActionCardProps) {
  const content = (
    <>
      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-[#0F3160]" strokeWidth={2} />
      </div>
      
      <div className="flex-1 ml-4 flex flex-col">
        <span className="font-bold text-[#0F3160] text-[15px] leading-tight">{title}</span>
        <span className="text-slate-500 text-[13px] mt-0.5">{subtitle}</span>
      </div>
      
      <div className="flex-shrink-0 ml-2">
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>
    </>
  );

  const className = `bg-white rounded-2xl p-4 flex items-center shadow-sm border border-slate-100 ${(onClick || href) ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={className}>
      {content}
    </div>
  );
}
