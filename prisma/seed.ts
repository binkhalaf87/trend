import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Seed Trends ──────────────────────────────────────────────────────────────

const TRENDS = [
  {
    titleAr: "عباءة الفراشة المزخرفة",
    titleEn: "Butterfly Embroidered Abaya",
    summaryAr: "عباءة بأكمام منفوخة على شكل فراشة مع تطريز ذهبي يكتسح تيك توك الخليجي",
    descriptionAr:
      "اجتاح هذا التصميم الفريد للعباءة منصة تيك توك بأكثر من 18 مليون مشاهدة خلال 5 أيام. " +
      "الإقبال الأكبر من السعودية والكويت. يُتوقع الوصول للذروة خلال أسبوع. " +
      "مناسب للمتاجر المتخصصة في الملابس النسائية الخليجية.",
    category: "FASHION",
    status: "RISING",
    source: "TIKTOK",
    geographicFocus: "GULF",
    signalStrength: 91,
    growthRate: 340,
    searchVolume7d: 52000,
    socialMentions7d: 18700,
    engagementScore: 8.4,
    peakExpectedAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    peakConfidence: 0.82,
    keywords: ["عباءة فراشة", "عباية مزخرفة", "butterfly abaya", "عباءة خليجية"],
    relatedProducts: ["عباءة فراشة سوداء", "عباءة تطريز ذهبي", "عباءة مناسبات"],
    sourceUrls: ["https://tiktok.com/trending/abaya"],
    priceRangeAr: "250–600 ر.س",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400",
    detectedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
  },
  {
    titleAr: "سماعات الهواء المفتوح",
    titleEn: "Open-Ear Air Conduction Headphones",
    summaryAr: "سماعات لاسلكية لا تسد الأذن — ترند ضخم على أمازون السعودية",
    descriptionAr:
      "نوع جديد من السماعات لا يسد قناة الأذن ويتيح سماع المحيط أثناء الاستماع للموسيقى. " +
      "شهدت ارتفاعاً 280% في المبيعات على أمازون السعودية والإمارات خلال 10 أيام. " +
      "الفئة المستهدفة: الرياضيون، الطلاب، مستخدمو المكتب.",
    category: "ELECTRONICS",
    status: "PEAK",
    source: "AMAZON",
    geographicFocus: "GULF",
    signalStrength: 88,
    growthRate: 280,
    searchVolume7d: 38000,
    socialMentions7d: 9800,
    engagementScore: 6.1,
    peakExpectedAt: new Date(Date.now() + 2 * 24 * 3600 * 1000),
    peakConfidence: 0.91,
    keywords: ["سماعات هواء مفتوح", "open ear headphones", "سماعات رياضية", "bone conduction"],
    relatedProducts: ["سماعات Shokz", "سماعات JLab", "سماعات رياضية لاسلكية"],
    sourceUrls: ["https://amazon.sa/bestsellers/electronics"],
    priceRangeAr: "150–450 ر.س",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    detectedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
  },
  {
    titleAr: "مجموعة المطبخ الياباني الحديث",
    titleEn: "Modern Japanese Kitchen Set",
    summaryAr: "أدوات مطبخ بتصميم ياباني أنيق — مبيعات تتضاعف على Pinterest وInstagram",
    descriptionAr:
      "مجموعة أدوات مطبخ مستوحاة من التصميم الياباني البسيط (Minimalist). " +
      "الألوان الرئيسية: أبيض، رمادي، خشبي طبيعي. " +
      "ارتفعت مبيعاتها 190% على متاجر الديكور خلال أسبوعين. " +
      "مناسب لمتاجر المنزل والمطبخ.",
    category: "HOME",
    status: "RISING",
    source: "PINTEREST",
    geographicFocus: "ARAB",
    signalStrength: 79,
    growthRate: 190,
    searchVolume7d: 22000,
    socialMentions7d: 6500,
    engagementScore: 5.3,
    peakExpectedAt: new Date(Date.now() + 14 * 24 * 3600 * 1000),
    peakConfidence: 0.67,
    keywords: ["مطبخ ياباني", "أدوات مطبخ مينيمال", "ديكور مطبخ", "Japanese kitchen"],
    relatedProducts: ["طقم سكاكين ياباني", "أواني مطبخ خشبية", "منظم مطبخ"],
    sourceUrls: ["https://pinterest.com/trending/kitchen"],
    priceRangeAr: "80–350 ر.س",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    detectedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
  },
  {
    titleAr: "كريم حماية الشمس بالسنبلة",
    titleEn: "Wheat Germ SPF 50+ Sun Cream",
    summaryAr: "كريم SPF 50+ بزيت جنين القمح — يُهيمن على قسم العناية بالبشرة على TikTok Shop",
    descriptionAr:
      "كريم حماية من الشمس يجمع بين الترطيب العالي وعامل حماية SPF50+. " +
      "يُستخدم تحت المكياج مباشرة. حقق 40,000 مشاركة على TikTok خلال 72 ساعة. " +
      "مناسب لأصحاب متاجر العناية بالبشرة والمنتجات الطبيعية.",
    category: "BEAUTY",
    status: "EARLY",
    source: "TIKTOK",
    geographicFocus: "GULF",
    signalStrength: 72,
    growthRate: 520,
    searchVolume7d: 14000,
    socialMentions7d: 5100,
    engagementScore: 9.2,
    peakExpectedAt: new Date(Date.now() + 10 * 24 * 3600 * 1000),
    peakConfidence: 0.74,
    keywords: ["كريم سنبلة SPF", "wheat germ sunscreen", "كريم حماية طبيعي", "سكينكير"],
    relatedProducts: ["كريم SPF50 كوري", "مرطب بالسنبلة", "سيروم فيتامين C"],
    sourceUrls: ["https://tiktok.com/trending/skincare"],
    priceRangeAr: "40–120 ر.س",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
    detectedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
  },
  {
    titleAr: "حذاء النعل المرن (Bouncy Sole)",
    titleEn: "Ultra-Cushion Bouncy Sole Sneakers",
    summaryAr: "أحذية رياضية بنعل فائق المرونة — اجتاحت Reddit وأمازون وتيك توك في وقت واحد",
    descriptionAr:
      "نعل مصنوع من مادة جديدة تُعطي إحساساً بالارتداد عند كل خطوة. " +
      "تحتل المرتبة الأولى في bestsellers الأحذية الرياضية على أمازون السعودية. " +
      "تجاوزت المبيعات 15,000 قطعة في الخليج خلال 3 أسابيع. " +
      "مناسب لمتاجر الأحذية الرياضية وتجهيزات الجيم.",
    category: "FITNESS",
    status: "PEAK",
    source: "REDDIT",
    geographicFocus: "GLOBAL",
    signalStrength: 95,
    growthRate: 410,
    searchVolume7d: 61000,
    socialMentions7d: 23400,
    engagementScore: 7.8,
    peakExpectedAt: new Date(Date.now() + 3 * 24 * 3600 * 1000),
    peakConfidence: 0.88,
    keywords: ["حذاء مرن", "bouncy sneakers", "أحذية رياضية مريحة", "نعل هوائي"],
    relatedProducts: ["New Balance 1080", "Hoka Bondi", "أحذية جري مريحة"],
    sourceUrls: ["https://reddit.com/r/Sneakers", "https://amazon.sa/bestsellers/shoes"],
    priceRangeAr: "200–650 ر.س",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    detectedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
  },
] as const;

// ─── Seed Influencers ──────────────────────────────────────────────────────────

const INFLUENCERS = [
  {
    name: "سارة المودة",
    handle: "@sara_almoda",
    platform: "INSTAGRAM",
    followersCount: 420000,
    engagementRate: 6.8,
    categories: ["FASHION", "BEAUTY"],
    bio: "مدوّنة موضة وجمال من الرياض — أسلوب يومي وإطلالات مناسبات خليجية",
    contactEmail: "sara@almoda.sa",
    whatsapp: "+966501234567",
    priceRange: "2000-5000",
    currency: "SAR",
    isVerified: true,
    country: "SA",
    city: "الرياض",
    avgLikes: 28500,
    avgComments: 1200,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    profileUrl: "https://instagram.com/sara_almoda",
  },
  {
    name: "أحمد التقني",
    handle: "@ahmad_tech_sa",
    platform: "TIKTOK",
    followersCount: 890000,
    engagementRate: 9.2,
    categories: ["ELECTRONICS", "GAMING"],
    bio: "مراجعات تقنية باللهجة السعودية — أحدث الأجهزة والملحقات الذكية",
    contactEmail: "ahmad@tqni.com",
    priceRange: "3000-8000",
    currency: "SAR",
    isVerified: true,
    country: "SA",
    city: "جدة",
    avgLikes: 82000,
    avgComments: 3400,
    avgViews: 1200000,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    profileUrl: "https://tiktok.com/@ahmad_tech_sa",
  },
  {
    name: "نور الديكور",
    handle: "@noor_decor_ae",
    platform: "INSTAGRAM",
    followersCount: 215000,
    engagementRate: 7.4,
    categories: ["HOME", "FOOD"],
    bio: "مصممة داخلية من دبي — أفكار ديكور عصرية بميزانية معقولة",
    contactEmail: "noor@decor.ae",
    whatsapp: "+971501234567",
    priceRange: "1500-4000",
    currency: "AED",
    isVerified: false,
    country: "AE",
    city: "دبي",
    avgLikes: 15900,
    avgComments: 680,
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    profileUrl: "https://instagram.com/noor_decor_ae",
  },
] as const;

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting TrendZone seed...\n");

  // ── Trends
  console.log("📈 Seeding trends...");
  const createdTrends: Record<string, string> = {};

  for (const t of TRENDS) {
    const trend = await prisma.trend.upsert({
      where: { titleEn: t.titleEn },
      update: {},
      create: {
        ...t,
        keywords:        JSON.parse(JSON.stringify(t.keywords)),
        relatedProducts: JSON.parse(JSON.stringify(t.relatedProducts)),
        sourceUrls:      JSON.parse(JSON.stringify(t.sourceUrls)),
        peakExpectedAt:  t.peakExpectedAt,
        detectedAt:      t.detectedAt,
      },
    });
    createdTrends[t.titleEn] = trend.id;
    console.log(`  ✔ ${t.titleAr} (${trend.id})`);
  }

  // ── TrendContent — بوست لكل ترند على Instagram + TikTok
  console.log("\n📝 Seeding trend content...");

  const sampleContent: Array<{
    titleAr: string;
    titleEn: string;
    post: string;
    caption: string;
    hashtags: string[];
  }> = [
    {
      titleEn: "Butterfly Embroidered Abaya",
      titleAr: "عباءة الفراشة",
      post: "✨ الترند اللي كلنا انتظرناه وصل أخيراً!\n\nعباءة الفراشة المزخرفة — التصميم الذي اجتاح تيك توك الخليج بأكثر من 18 مليون مشاهدة.\n\nأكمام منفوخة فاخرة + تطريز ذهبي يدوي = إطلالة لا تُنسى في كل مناسبة 🦋\n\nمتوفرة الآن بالمقاسات الكاملة — التوصيل لجميع دول الخليج خلال 3-5 أيام.",
      caption: "عباءة الفراشة 🦋 — الإطلالة الملكية التي تحدث عنها الجميع. تطريز ذهبي فاخر وتصميم خليجي أصيل.",
      hashtags: ["#عباءة_الفراشة", "#عباءات_خليجية", "#موضة_خليجية", "#butterfly_abaya", "#عباءات_فاخرة"],
    },
    {
      titleEn: "Open-Ear Air Conduction Headphones",
      titleAr: "سماعات الهواء المفتوح",
      post: "🎧 انسَ السماعات التقليدية!\n\nسماعات الهواء المفتوح — اسمع الموسيقى واسمع محيطك في آنٍ واحد.\n\n✅ مثالية للجري والرياضة\n✅ لا تؤثر على الأذن\n✅ بطارية 8 ساعات\n✅ مقاومة للماء IP55\n\nأكثر من 10,000 تقييم ⭐⭐⭐⭐⭐ على أمازون السعودية.",
      caption: "سماعات الهواء المفتوح 🎧 — حرية الصوت بلا حدود. مثالية للرياضيين وعشاق التقنية.",
      hashtags: ["#سماعات_رياضية", "#open_ear_headphones", "#تقنية", "#إلكترونيات", "#أمازون_السعودية"],
    },
    {
      titleEn: "Modern Japanese Kitchen Set",
      titleAr: "مطبخ ياباني",
      post: "🍳 حوّل مطبخك إلى لوحة فنية يابانية!\n\nمجموعة أدوات المطبخ الياباني الحديث — البساطة الراقية التي اشتاق لها مطبخك.\n\nأبيض نقي + خشب طبيعي + تصميم مينيمال = مطبخ يستحق الصورة 📸\n\nيشمل الطقم:\n• طقم أواني 5 قطع\n• لوح تقطيع خشبي فاخر\n• حامل أدوات مطبخ",
      caption: "مطبخ ياباني مينيمال 🍳 — عندما تصبح أدوات المطبخ قطعاً فنية. البساطة هي الفخامة الحقيقية.",
      hashtags: ["#ديكور_مطبخ", "#مطبخ_ياباني", "#مينيمال", "#تصميم_داخلي", "#ديكور_منزل"],
    },
    {
      titleEn: "Wheat Germ SPF 50+ Sun Cream",
      titleAr: "كريم السنبلة",
      post: "☀️ أخيراً! كريم الشمس الذي يرطب ويحمي في نفس الوقت.\n\nكريم SPF 50+ بزيت جنين القمح 🌾\n\n• يُستخدم تحت المكياج مباشرة\n• لا يترك بياض على البشرة\n• ترطيب 24 ساعة\n• مناسب للبشرة الحساسة\n\n40,000 شارة على TikTok خلال 72 ساعة — اكتشفي السر! 🌟",
      caption: "كريم حماية الشمس بالسنبلة ☀️ — الحماية الطبيعية التي تبحثين عنها. SPF50+ ترطيب + حماية من الشمس.",
      hashtags: ["#سكينكير", "#كريم_شمس", "#عناية_بشرة", "#skincare_routine", "#بيوتي_روتين"],
    },
    {
      titleEn: "Ultra-Cushion Bouncy Sole Sneakers",
      titleAr: "حذاء Bouncy",
      post: "👟 هل جربت المشي على الهواء؟\n\nأحذية Bouncy Sole — النعل الذي يغيّر مفهوم الراحة كلياً!\n\nمادة Ultra-Foam الثورية تُعطيك إحساس الارتداد في كل خطوة.\n\n✅ 15,000 قطعة مُباعة في الخليج\n✅ الأول في bestsellers أمازون السعودية\n✅ متوفر بـ 12 لون\n\nلا تفوّتها — الكميات محدودة! ⚡",
      caption: "أحذية Bouncy Sole 👟 — عندما يصبح المشي متعة. نعل فائق المرونة يمنحك راحة لا مثيل لها.",
      hashtags: ["#أحذية_رياضية", "#bouncy_sneakers", "#رياضة", "#لياقة_بدنية", "#أمازون"],
    },
  ];

  for (const item of sampleContent) {
    const trendId = createdTrends[item.titleEn];
    if (!trendId) continue;

    // Instagram post
    await prisma.trendContent.create({
      data: {
        trendId,
        platform: "INSTAGRAM",
        contentType: "POST",
        generatedBy: "OPENAI",
        titleAr: item.titleAr,
        contentAr: item.post,
        hashtags: JSON.stringify(item.hashtags),
        isApproved: true,
        qualityScore: Math.floor(Math.random() * 15) + 82,
      },
    });

    // TikTok caption
    await prisma.trendContent.create({
      data: {
        trendId,
        platform: "TIKTOK",
        contentType: "CAPTION",
        generatedBy: "CLAUDE",
        contentAr: item.caption,
        hashtags: JSON.stringify(item.hashtags),
        isApproved: true,
        qualityScore: Math.floor(Math.random() * 15) + 78,
      },
    });

    console.log(`  ✔ Content for: ${item.titleAr}`);
  }

  // ── Influencers
  console.log("\n🤳 Seeding influencers...");
  const createdInfluencers: string[] = [];

  for (const inf of INFLUENCERS) {
    const influencer = await prisma.influencer.upsert({
      where: { handle_platform: { handle: inf.handle, platform: inf.platform } },
      update: {},
      create: {
        ...inf,
        categories: JSON.parse(JSON.stringify(inf.categories)),
      },
    });
    createdInfluencers.push(influencer.id);
    console.log(`  ✔ ${inf.name} (${inf.handle})`);
  }

  // ── InfluencerMatch — ربط المؤثرين بالترندات المناسبة
  console.log("\n🔗 Seeding influencer matches...");

  const matchMap = [
    // سارة المودة ← عباءة الفراشة (fashion)
    { trendIdx: "Butterfly Embroidered Abaya", influencerIdx: 0, matchScore: 96, reasonAr: "مؤثرة موضة خليجية بنسبة تفاعل 6.8% — جمهورها مثالي لعباءات المناسبات" },
    { trendIdx: "Wheat Germ SPF 50+ Sun Cream", influencerIdx: 0, matchScore: 88, reasonAr: "تُغطي سارة محتوى البيوتي بانتظام وجمهورها اهتمام عالٍ بالسكينكير" },
    // أحمد التقني ← سماعات + حذاء
    { trendIdx: "Open-Ear Air Conduction Headphones", influencerIdx: 1, matchScore: 97, reasonAr: "مراجع تقني بـ 890K متابع — مراجعاته تُحرّك المبيعات مباشرة" },
    { trendIdx: "Ultra-Cushion Bouncy Sole Sneakers", influencerIdx: 1, matchScore: 71, reasonAr: "يُغطي الإلكترونيات والأجهزة الرياضية، تداخل جزئي مع محتوى الأحذية التقنية" },
    // نور الديكور ← مطبخ ياباني
    { trendIdx: "Modern Japanese Kitchen Set", influencerIdx: 2, matchScore: 94, reasonAr: "مصممة داخلية متخصصة في ديكور المطبخ — تطابق مثالي مع ترند المطبخ الياباني" },
  ];

  for (const m of matchMap) {
    const trendId = createdTrends[m.trendIdx];
    const influencerId = createdInfluencers[m.influencerIdx];
    if (!trendId || !influencerId) continue;

    await prisma.influencerMatch.upsert({
      where: { trendId_influencerId: { trendId, influencerId } },
      update: {},
      create: {
        trendId,
        influencerId,
        matchScore: m.matchScore,
        reasonAr: m.reasonAr,
      },
    });
    console.log(`  ✔ Match: Trend[${m.trendIdx.slice(0, 20)}...] ↔ Influencer[${m.influencerIdx}] — score ${m.matchScore}`);
  }

  console.log("\n✅ Seed completed successfully!");
  console.log(`   Trends:       ${TRENDS.length}`);
  console.log(`   Content items: ${TRENDS.length * 2}`);
  console.log(`   Influencers:  ${INFLUENCERS.length}`);
  console.log(`   Matches:      ${matchMap.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
