'use client'

export function ThemeInit() {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      id="theme-init"
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var isAdmin=window.location.pathname.indexOf('/admin')===0;var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme:dark)').matches;var r=isAdmin?'light':(t==='dark'||(!t&&d)?'dark':'light');document.documentElement.classList.add(r)}catch(e){document.documentElement.classList.add('light')}})();`,
      }}
    />
  )
}