import { languageMeta, type Language } from './translations';
import { useLanguage } from './LanguageProvider';

const languages: Language[] = ['ar', 'ku', 'en'];

export function HeaderLanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="talaba-language-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        width: '100%',
        padding: '6px 8px',
        overflowX: 'auto',
      }}
    >
      {languages.map((item) => {
        const meta = languageMeta[item];
        const active = item === language;

        return (
          <button
            key={item}
            type="button"
            onClick={() => setLanguage(item)}
            aria-pressed={active}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              borderRadius: 999,
              border: active ? '1px solid rgba(255,255,255,0.95)' : '1px solid rgba(255,255,255,0.3)',
              background: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.14)',
              color: active ? '#111827' : '#ffffff',
              fontWeight: 800,
              fontSize: 12,
              padding: '6px 10px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            <span>{meta.flag}</span>
            <span>{meta.nativeName}</span>
          </button>
        );
      })}
    </div>
  );
}
