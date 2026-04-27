export default function TopNav() {
  return (
    <nav
      className="flex items-center justify-between px-3 text-white"
      style={{ background: '#152238', height: '44px', minHeight: '44px' }}
    >
      {/* Left: User info */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center rounded-full font-bold text-white"
          style={{ width: '32px', height: '32px', fontSize: '12px', background: '#1e5bb8' }}
        >
          JD
        </div>
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>John Doe</div>
          <div className="flex items-center gap-1" style={{ fontSize: '11px', color: '#4caf50' }}>
            Online
            <span
              className="inline-block rounded-full"
              style={{ width: '7px', height: '7px', background: '#4caf50' }}
            />
          </div>
        </div>
      </div>

      {/* Center: Job selector pill */}
      <div className="flex items-center">
        <button
          className="flex items-center gap-2 cursor-pointer"
          style={{
            background: '#e65100',
            color: '#fff',
            padding: '5px 18px',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: 500,
            border: 'none',
          }}
        >
          No Job Selected
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        <button
          className="cursor-pointer"
          style={{
            padding: '4px 14px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#90b4e0',
            background: 'transparent',
            border: '1px solid #3a5a80',
            borderRadius: '4px',
          }}
        >
          Feedback
        </button>
        <button className="flex items-center justify-center cursor-pointer" style={{ color: '#7ea3c8', background: 'none', border: 'none', padding: '4px' }}>
          <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button
          className="flex items-center justify-center cursor-pointer"
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            border: '1.5px solid #3a5a80',
            background: 'transparent',
            color: '#7ea3c8',
            fontSize: '14px',
            fontWeight: 700,
            padding: 0,
          }}
        >
          ?
        </button>
      </div>
    </nav>
  );
}
