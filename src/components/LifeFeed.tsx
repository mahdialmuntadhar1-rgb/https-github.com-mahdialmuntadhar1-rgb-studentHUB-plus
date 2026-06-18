import React, { useMemo, useState } from 'react';

export type LifeFeedProps = any;

const governorates = [
  ['Baghdad','بغداد',false], ['Erbil','هەولێر',true], ['Sulaymaniyah','سلێمانی',true],
  ['Duhok','دهۆک',true], ['Halabja','هەڵەبجە',true], ['Nineveh','نينوى',false],
  ['Basra','البصرة',false], ['Kirkuk','كركوك',false], ['Najaf','النجف',false],
  ['Karbala','كربلاء',false], ['Dhi Qar','ذي قار',false], ['Babil','بابل',false],
  ['Anbar','الأنبار',false], ['Diyala','ديالى',false], ['Salah al-Din','صلاح الدين',false],
  ['Wasit','واسط',false], ['Maysan','ميسان',false], ['Al-Qadisiyah','القادسية',false],
  ['Muthanna','المثنى',false],
] as const;

const templates = [
  ['🎓','Campus Guide','Start your semester with a simple plan','ابدأ الفصل الدراسي بخطة بسيطة','سەرەتای وەرز بە پلانی سادە بکە'],
  ['💼','Career Prep','Prepare a clean student CV','جهّز سيرة ذاتية طلابية واضحة','CV ـی خوێندکاری پاک و ڕوون ئامادە بکە'],
  ['📚','Scholarship Tips','Keep scholarship documents ready','احتفظ بوثائق المنح جاهزة','بەڵگەنامەکانی بورسە ئامادە بهێڵەوە'],
  ['📝','Exam Prep','Make exam preparation weekly','اجعل التحضير للامتحان أسبوعياً','ئامادەکاری تاقیکردنەوە هەفتانە بکە'],
  ['🤝','Volunteering','Use volunteering to build experience','استخدم التطوع لبناء الخبرة','خۆبەخشکاری بۆ ئەزموون بەکاربهێنە'],
  ['🧭','Student Services','Know the offices that help students','تعرّف على المكاتب التي تساعد الطلبة','ئەو ئۆفیسەی یارمەتی خوێندکار دەدات بناسە'],
  ['🚌','Transport Tips','Plan your transport before exam days','خطط للنقل قبل أيام الامتحان','پێش ڕۆژانی تاقیکردنەوە پلانی هاتوچۆ دابنێ'],
  ['🌐','Digital Skills','Build one useful digital skill each month','ابنِ مهارة رقمية مفيدة كل شهر','هەر مانگێک شارەزاییەکی دیجیتاڵی فێربە'],
  ['🏛️','Clubs & Activities','Join one useful student activity','انضم إلى نشاط طلابي مفيد','بەشداری چالاکیەکی بەسوودی خوێندکاری بکە'],
  ['📢','Opportunity Habit','Check opportunities twice a week','راجع الفرص مرتين في الأسبوع','هەفتانە دوو جار دەرفەتەکان بپشکنە'],
] as const;

function buildPosters() {
  return governorates.flatMap(([gov, local, isKurdish]) =>
    templates.map(([icon, category, en, ar, ku], index) => ({
      id: `${gov}-${index}`,
      governorate: gov,
      icon,
      category,
      title: isKurdish ? ku : ar,
      subtitle: en,
      description: isKurdish
        ? `ئەم ڕێنماییە بۆ خوێندکارانی ${local} ـە. ئەمە بابەتی ڕێنمایی گشتییە، نە پۆستی کەسی.`
        : `هذه بطاقة إرشادية لطلبة ${local}. هذا محتوى إرشادي عام وليس منشوراً شخصياً مزيفاً.`,
    }))
  );
}

export default function LifeFeed() {
  const [governorate, setGovernorate] = useState('All Iraq');
  const posters = useMemo(buildPosters, []);
  const visible = governorate === 'All Iraq' ? posters : posters.filter(p => p.governorate === governorate);

  return (
    <section style={{padding:18, maxWidth:1200, margin:'0 auto'}}>
      <div style={{background:'linear-gradient(135deg,#0f766e,#14b8a6)', color:'white', padding:22, borderRadius:26, marginBottom:16}}>
        <div style={{opacity:.9}}>Safe Campus Life</div>
        <h1 style={{margin:'4px 0'}}>Campus guide posters</h1>
        <p style={{margin:0}}>Editorial student guide content only. No fake users, no fake messages, no fake social posts.</p>
      </div>

      <div style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', padding:14, border:'1px solid #e5e7eb', borderRadius:18, marginBottom:14}}>
        <strong>Governorate</strong>
        <select value={governorate} onChange={e => setGovernorate(e.target.value)} style={{padding:10, borderRadius:12}}>
          <option>All Iraq</option>
          {governorates.map(([gov]) => <option key={gov}>{gov}</option>)}
        </select>
        <span style={{color:'#64748b'}}>Showing {visible.length} guide cards</span>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:14}}>
        {visible.map(p => (
          <article key={p.id} style={{border:'1px solid #e5e7eb', borderRadius:22, padding:16, background:'white', boxShadow:'0 8px 22px rgba(15,23,42,.06)'}}>
            <div style={{fontSize:34}}>{p.icon}</div>
            <div style={{color:'#0f766e', fontSize:13, fontWeight:700}}>{p.category} • {p.governorate}</div>
            <h2 style={{fontSize:18, margin:'8px 0 4px'}}>{p.title}</h2>
            <div style={{fontSize:13, color:'#64748b', marginBottom:8}}>{p.subtitle}</div>
            <p style={{fontSize:14, color:'#334155'}}>{p.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
