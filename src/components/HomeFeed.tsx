import React from 'react';

export type HomeFeedProps = any;

export function SkeletonLoader() {
  return (
    <div style={{ padding: 16, borderRadius: 18, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
      Loading...
    </div>
  );
}

export default function HomeFeed(props: HomeFeedProps) {
  const onNavigateTab = props?.onNavigateTab || (() => {});

  const cards = [
    {
      icon: '💼',
      title: 'Jobs',
      text: 'Browse real imported job opportunities from rafid-db.',
      action: () => onNavigateTab('future')
    },
    {
      icon: '🎓',
      title: 'Scholarships',
      text: 'Browse real scholarship opportunities and official source links.',
      action: () => onNavigateTab('future')
    },
    {
      icon: '🏛️',
      title: 'Campus Life',
      text: 'Safe campus guide posters for students across Iraq.',
      action: () => onNavigateTab('life')
    },
    {
      icon: '🗺️',
      title: 'Governorates',
      text: 'Use governorate filters inside Jobs, Scholarships, and Campus Life.',
      action: () => onNavigateTab('future')
    }
  ];

  return (
    <main style={{ padding: 18, maxWidth: 1180, margin: '0 auto' }}>
      <section style={{
        borderRadius: 28,
        padding: 24,
        background: 'linear-gradient(135deg,#f97316,#7c3aed)',
        color: 'white',
        marginBottom: 18,
        boxShadow: '0 18px 45px rgba(124,58,237,0.20)'
      }}>
        <div style={{ fontSize: 14, opacity: 0.92, marginBottom: 6 }}>
          Jamiaati / جامعتي
        </div>
        <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.15 }}>
          Iraq university opportunities in one place
        </h1>
        <p style={{ marginTop: 10, marginBottom: 0, opacity: 0.94 }}>
          Jobs, scholarships, training, events, exams, and safe campus guides powered by your live backend data.
        </p>
      </section>

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(245px,1fr))',
        gap: 14
      }}>
        {cards.map(card => (
          <button
            key={card.title}
            onClick={card.action}
            style={{
              textAlign: 'left',
              border: '1px solid #e5e7eb',
              background: 'white',
              borderRadius: 22,
              padding: 18,
              cursor: 'pointer',
              boxShadow: '0 8px 22px rgba(15,23,42,0.06)'
            }}
          >
            <div style={{ fontSize: 34 }}>{card.icon}</div>
            <h2 style={{ fontSize: 20, margin: '8px 0 6px', color: '#0f172a' }}>
              {card.title}
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: '#475569', lineHeight: 1.5 }}>
              {card.text}
            </p>
          </button>
        ))}
      </section>

      <section style={{
        marginTop: 18,
        border: '1px solid #e5e7eb',
        background: '#f8fafc',
        borderRadius: 22,
        padding: 16,
        color: '#334155'
      }}>
        <strong>Live data status:</strong>
        <p style={{ margin: '6px 0 0', fontSize: 14 }}>
          Opportunities are loaded from rafid-api and rafid-db. No fake student profiles, no fake messages, and no old mock opportunity feed on this homepage.
        </p>
      </section>
    </main>
  );
}
