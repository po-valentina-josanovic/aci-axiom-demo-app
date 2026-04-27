export default function Footer() {
  return (
    <footer
      className="flex items-center justify-between px-4 mt-auto"
      style={{
        height: '30px',
        minHeight: '30px',
        background: '#fff',
        borderTop: '1px solid #d9dfe7',
        fontSize: '11px',
        color: '#5a6577',
      }}
    >
      <span>
        Copyright &copy; 2025{' '}
        <span style={{ color: '#2979ff', fontWeight: 500 }}>ProfitOptics Inc</span>
        . All rights reserved.
      </span>
      <span>Version: 2.24.3347, Core version: 1.0.0.48055.3347</span>
    </footer>
  );
}
