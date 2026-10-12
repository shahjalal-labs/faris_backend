export const privacyPolicy = (key: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>       
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>

        <div id="loader">⏳ Loading…</div>    
        <div id="contentBox" style="display:none;"></div>

        <script>
          fetch('https://api.shaara.center/api/v1/admin/privacy-policy?key=${key}')
            .then(res => res.json())
            .then(data => {
              document.getElementById("loader").style.display = "none";

              let item = null;

              if (Array.isArray(data.result)) {
                item = data.result.find(r => r.key === "${key}") || data.result[0];
              }

              if (!item || !item.content) {
                document.body.innerHTML = "<p>❌ Content not found</p>";
                return;
              }

              const box = document.getElementById("contentBox");
              box.style.display = "block";
              box.innerHTML = item.content;
            })
            .catch(() => {
              document.getElementById("loader").innerText = "❌ Failed to load content";
            });
        </script>

      </body>
    </html>
  `;
};

const getLegalTemplate = (
  titleEn: string,
  titleAr: string,
  subtitleEn: string,
  subtitleAr: string,
  updateDateAr: string,
  updateDateEn: string,
) => {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${titleEn} / ${titleAr}</title>
  <meta name="description" content="${subtitleEn} - ${subtitleAr}" />
  <style>
    :root{
      --bg:#07111f;
      --bg-soft:#0d1b2f;
      --card:rgba(10, 23, 42, 0.82);
      --card-border:rgba(148, 163, 184, 0.16);
      --muted:#9fb0c7;
      --text:#eaf1fb;
      --accent:#4dd4ac;
      --accent-2:#7cdaff;
      --danger:#ff6b6b;
      --success:#66e29f;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    }
    html,body{height:100%}
    body{
      margin:0;
      color:var(--text);
      background:
        radial-gradient(circle at top left, rgba(77, 212, 172, 0.18), transparent 30%),
        radial-gradient(circle at top right, rgba(124, 218, 255, 0.14), transparent 26%),
        linear-gradient(180deg, var(--bg) 0%, var(--bg-soft) 100%);
      -webkit-font-smoothing:antialiased;
      -moz-osx-font-smoothing:grayscale;
      line-height:1.6;
      padding:24px;
    }
    .wrap{max-width:1040px;margin:0 auto}
    header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:20px;flex-wrap:wrap}
    header h1{font-size:28px;line-height:1.2;margin:0;color:var(--text);letter-spacing:-0.03em}
    header p{margin:6px 0 0;color:var(--muted);font-size:14px;max-width:68ch}
    .card{background:var(--card);border:1px solid var(--card-border);border-radius:20px;padding:24px;box-shadow:0 18px 45px rgba(1, 6, 15, 0.28);backdrop-filter:blur(14px);margin-bottom:16px}
    h2{margin:0 0 14px 0;font-size:20px;color:var(--accent);border-bottom:1px solid rgba(77, 212, 172, 0.15);padding-bottom:8px}
    h3{margin:8px 0;color:var(--text);font-size:16px}
    p{margin:8px 0;color:var(--text)}
    ul{margin:10px 0 10px 20px;color:var(--muted)}
    ol{margin:10px 0 10px 20px;color:var(--muted)}
    .legal-list li { margin-bottom: 8px; }
    .muted{color:var(--muted);font-size:13px}
    .pill{display:inline-block;padding:7px 12px;border-radius:999px;background:rgba(77, 212, 172, 0.14);color:var(--accent);font-weight:700;font-size:12px;border:1px solid rgba(77, 212, 172, 0.18)}
    footer{margin-top:24px;font-size:12px;color:var(--muted);text-align:center;padding-bottom:24px;border-top:1px solid var(--card-border);padding-top:16px}
    
    /* Switcher styling */
    .switcher-container {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }
    .switcher {
      display: inline-flex;
      background: var(--bg-soft);
      border: 1px solid var(--card-border);
      border-radius: 999px;
      padding: 4px;
      gap: 4px;
    }
    .switcher label {
      padding: 8px 24px;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 700;
      font-size: 14px;
      color: var(--muted);
      transition: all 0.25s ease;
      user-select: none;
    }
    .switcher label:hover {
      color: var(--text);
    }
    #tab-ar:checked ~ .switcher-container .switcher label[for="tab-ar"] {
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #07111f;
    }
    #tab-en:checked ~ .switcher-container .switcher label[for="tab-en"] {
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #07111f;
    }
    
    /* Content visibility based on radio checks */
    .content-ar, .content-en {
      display: none;
      animation: fadeIn 0.4s ease;
    }
    #tab-ar:checked ~ .content-ar {
      display: block;
    }
    #tab-en:checked ~ .content-en {
      display: block;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    input[type="radio"] { display: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <input type="radio" id="tab-ar" name="lang-select" checked />
    <input type="radio" id="tab-en" name="lang-select" />

    <div class="switcher-container">
      <div class="switcher">
        <label for="tab-ar">العربية</label>
        <label for="tab-en">English</label>
      </div>
    </div>

    <!-- ARABIC CONTENT -->
    <div class="content-ar" dir="rtl">
      <header>
        <div>
          <h1>منصة شَعْرة (Shaara)</h1>
          <p class="muted">${subtitleAr}</p>
        </div>
        <div>
          <span class="pill">آخر تحديث: ${updateDateAr}</span>
        </div>
      </header>

      <section class="card">
        <h2>لوﺑﻘﻟاو ﺔﻣدﻘﻣﻟا</h2>
        <p>مازﺗﻟﻻا ﻰﻠﻋ طرﺷ وأ دﯾﻗ نودﺑو ًﺔﺣارﺻ قﻓاوﺗ كﻧﺈﻓ ،ﺎﮭﯾﻓ ﺎًﺑﺎﺳﺣ كﺋﺎﺷﻧﺈﺑ وأ Shaara ﺔﺻﻧﻣ ﻰﻟإ كﻟوﺧد وأ كﻣادﺧﺗﺳﺎﺑ. ﺎﮭﯾﻠﻋ أرطﺗ تﻼﯾدﻌﺗ وأ تﺎﺛﯾدﺣﺗ يأ ﻰﻠﻋ ﺔﯾﺋﺎﮭﻧ ًﺔﻘﻓاوﻣ ﺔﺻﻧﻣﻟا مادﺧﺗﺳا ﻲﻓ كرارﻣﺗﺳا دﻌُﯾو ،ﺎﻧھ ةروﻛذﻣﻟا دوﻧﺑﻟا ﻊﯾﻣﺟﺑ دﻌُﯾ ﺔﻣدﺧﻠﻟ ﮫﻣادﺧﺗﺳا نأو ،ﺔﯾﻗﺎﻔﺗﻻا هذھ ﻲﻓ لوﺧدﻟاو ﺔﺻﻧﻣﻟا مادﺧﺗﺳﻻ ﺔﻠﻣﺎﻛﻟا ﺔﯾﻧوﻧﺎﻘﻟا ﺔﯾﻠھﻷﺎﺑ ﻊﺗﻣﺗﯾ ﮫﻧﺄﺑ مدﺧﺗﺳﻣﻟا رﻘُﯾ. ﺔﺻﻧﻣﻟا ﺎﮭﯾﻓ مدﺧﺗﺳﯾ ةرﻣ لﻛ ﻲﻓ تﺎﺛﯾدﺣﺗ يﻷ ﮫﺗﻌﺟارﻣو طورﺷﻟا هذﮭﻟ ﮫﺗءارﻗ ﻰﻠﻋ اًدﯾﻛﺄﺗ. نﯾﻣدﺧﺗﺳﻣﻟا ﻊﯾﻣﺟﻟ ﺔﻣزﻠﻣ دﻌُﺗو ،ﺔﯾدوﻌﺳﻟا ﺔﯾﺑرﻌﻟا ﺔﻛﻠﻣﻣﻟا ﺔﻣظﻧﻷ ﺔﻘﯾﺛوﻟا هذھ ﻊﺿﺧﺗ.</p>
      </section>

      <section class="card">
        <h2>تﺎﻔﯾرﻌﺗﻟا</h2>
        <ul class="legal-list">
          <li><strong>منصة شَعْرة (Shaara):</strong> منصة وسيطة تقنية تربط بين العملاء ومقدمي خدمات العناية والتجميل.</li>
          <li><strong>المستخدم:</strong> أي شخص طبيعي أو اعتباري يقوم بزيارة المنصة أو استخدامها أو إنشاء حساب فيها، سواء كان مسجلاً أو غير مسجل.</li>
          <li><strong>مقدم الخدمة:</strong> أي صالون، حلاق، مركز عناية، منشأة أو فرد يقدم خدماته داخل المنصة، ويقر بأنه حاصل على التراخيص السارية والوثائق النظامية اللازمة من الجهات المختصة في المملكة لممارسة النشاط (إن كانت مطلوبة).</li>
          <li><strong>المحتوى:</strong> يشمل جميع المعلومات والبيانات والصور والأسعار والروابط والرسائل والتقييمات وأي مواد يتم رفعها أو نشرها أو مشاركتها عبر المنصة.</li>
          <li><strong>الإعلان:</strong> أي محتوى تسويقي أو عرض أو خدمة تُنشر داخل المنصة سواء كان مجانياً أو مدفوعاً، ويشمل النصوص والصور والوسائط والروابط.</li>
        </ul>
      </section>

      <section class="card">
        <h2>بﺎﺳﺣﻟا ﺔﯾﻟوؤﺳﻣو ﺔﯾﻧوﻧﺎﻘﻟا ﺔﯾﻠھﻷا</h2>
        <p>يقر المستخدم بأنه يمثل نفسه أو الجهة المخول نظاماً بتمثيلها. وإذا كان مقدم خدمة، فإنه يقر بأن حساب منشأته قد يُسخدم من قبله أو من موظفين تابعين له بنفس بيانات الدخول. والمنصة غير ملزمة بالتحقق من هوية الشخص الذي استخدم الحساب فعلياً.</p>
        <p>يتحمل صاحب الحساب كامل المسؤولية القانونية والمالية والإدارية عن جميع الإجراءات التي تتم عبر حسابه، سواء قام بها هو أو موظفوه أو أي شخص حصل على بيانات الدخول منه.</p>
      </section>

      <section class="card">
        <h2>أولاً: الأحكام العامة والمشتركة</h2>
        <ol class="legal-list">
          <li>الالتزام الكامل بجميع الأنظمة واللوائح المعمول بها في المملكة العربية السعودية.</li>
          <li>يُمنع نشر أي محتوى مسيء، مخالف، عنصري، تحريضي، مخل بالآداب، أو ينتهك حقوق الآخرين.</li>
          <li>المستخدم مسؤول عن صحة ودقة جميع المعلومات التي يقوم بإدخالها أو نشرها عبر المنصة.</li>
          <li>يُمنع نسخ أو إعادة نشر محتوى أي مستخدم آخر أو محتوى المنصة دون إذن كتابي مسبق.</li>
          <li>يحظر أي استخدام آلي للمنصة مثل (Bots / Scripts / Crawlers) دون إذن رسمي من إدارة المنصة.</li>
          <li>المنصة وسيط تقني فقط، ولا تتحمل مسؤولية النزاعات أو نتائج الخدمات بين الأطراف.</li>
          <li>للمنصة الحق في:
            <ul>
              <li>حذف أي محتوى مخالف دون إشعار مسبق.</li>
              <li>تقييد، تعليق، إيقاف، أو شطب أي حساب يخالف الشروط أو يسيء استخدام المنصة.</li>
            </ul>
          </li>
        </ol>
      </section>

      <section class="card">
        <h2>ثانياً: الأحكام الخاصة بالعملاء</h2>
        <ol class="legal-list">
          <li>العميل مسؤول عن التحقق من جودة الخدمة، ومصداقية المعلومات (السعر، الموقع، نوع الخدمة، المواعيد) قبل إتمام الحجز.</li>
          <li>لا تتحمل المنصة أي مسؤولية عن إلغاء الموعد، أو تأخر مقدم الخدمة، أو عدم حضوره، أو اختلاف مستوى الخدمة عن المتوقع، أو أي أضرار أو نتائج ناتجة عن الخدمة المقدمة.</li>
          <li>التقييمات تعبر عن آراء أصحابها فقط، ولا تمثل المنصة، ولا تلتزم المنصة بتعديلها أو حذفها إلا وفق ما تراه مناسباً.</li>
          <li>يُمنع الإساءة، التحرش، التهديد، أو استخدام ألفاظ غير لائقة أثناء التواصل داخل أو خارج المنصة.</li>
          <li>أي تواصل أو اتفاق أو دفع يتم خارج المنصة يكون مسؤولية الطرفين فقط.</li>
          <li>في حال الخدمات المنزلية أو الميدانية:
            <ul>
              <li>العميل مسؤول عن صحة عنوانه الجغرافي، وعن السماح بالدخول لمقدم الخدمة وآثاره القانونية.</li>
              <li>لا تتحمل المنصة مسؤولية أي فقدان أو أضرار أو سوء فهم يشمل الموقع، الأشخاص، الأطفال، الممتلكات، أو الحيوانات داخل موقع الخدمة.</li>
              <li>يقر العميل بأن جميع الزيارات المنزلية تتم بمحض إرادته وعلى مسؤوليته الشخصية دون أي مسؤولية أو ضمانات من المنصة.</li>
            </ul>
          </li>
        </ol>
      </section>

      <section class="card">
        <h2>ثالثاً: الأحكام الخاصة بمقدمي الخدمة</h2>
        <ol class="legal-list">
          <li>يُمنع تقديم أو الإعلان عن أي خدمة مخالفة للأنظمة أو التعليمات أو الآداب العامة في المملكة.</li>
          <li>يُمنع تقديم خدمات تتطلب ترخيصاً طبياً/صحياً مثل: الحقن التجميلية (بوتوكس/فيلر/خيوط)، أو الليزر، أو التقشير الكيميائي، أو الإجراءات الطبية أو الجلدية، ما لم يكن مقدم الخدمة مرخصاً نظامياً ويقدم الوثائق عند الطلب.</li>
          <li>يُمنع استخدام عمالة غير نظامية أو أشخاص غير مؤهلين أو غير مخولين بتقديم الخدمة.</li>
          <li>تتحمل المنشأة أو صاحب الحساب المسؤولية الكاملة عن أي انتهاك للخصوصية أو إساءة استخدام بيانات العملاء.</li>
          <li>يحظر إضافة رسوم غير معلنة بعد تأكيد الحجز، أو إلغاء/تأخير المواعيد بشكل متكرر دون مبرر، أو إساءة التعامل اللفظي أو السلوكي مع العملاء بما في ذلك التحرش أو التهديد أو التمييز.</li>
          <li>تحتفظ المنصة بالحق في إيقاف الحساب أو شطبه نهائياً دون تعويض عند ارتكاب المخالفات أو انخفاض مستوى الخدمات أو كثرة البلاغات.</li>
        </ol>
      </section>

      <section class="card">
        <h2>بند التوثيق</h2>
        <p>حصول مقدم الخدمة على حالة "موثق" داخل المنصة لا يعني ضمان المنصة أو مصادقتها على جودة الخدمة أو كفاءة مقدم الخدمة أو نتائجه أو التزامه المستقبلي، وإنما يعني فقط أن مقدم الخدمة قد استوفى متطلبات التحقق التي تحددها المنصة وقت التوثيق. وتحتفظ المنصة بحق سحب أو تعليق حالة التوثيق في أي وقت وفقاً لتقديرها.</p>
      </section>

      <section class="card">
        <h2>بند التقييمات والمراجعات</h2>
        <p>يجب أن تكون جميع التقييمات والمراجعات مبنية على تجربة حقيقية وواقعية. ويُمنع التلاعب بالتقييمات أو نشر تقييمات مضللة أو غير صحيحة أو الحصول على تقييمات مقابل مبالغ مالية أو منافع مباشرة أو غير مباشرة. وتحتفظ المنصة بحق تعديل أو إخفاء أو حذف أي تقييم ترى أنه مخالف أو مضلل أو يهدف للتأثير غير المشروع على المستخدمين.</p>
      </section>

      <section class="card">
        <h2>بند الصور والمحتوى المرفوع والملكية الفكرية</h2>
        <p>يقر مقدم الخدمة بأنه يمتلك أو حصل على جميع الحقوق والتصاريح اللازمة لاستخدام الصور والمحتويات والمواد التي يقوم برفعها داخل المنصة. ويتحمل وحده المسؤولية القانونية الكاملة عن أي انتهاك لحقوق الملكية الفكرية أو حقوق النشر أو العلامات التجارية أو حقوق الغير. وتخلي المنصة مسؤوليتها عن أي مطالبات أو نزاعات تنشأ بسبب المحتوى المرفوع من قبل المستخدمين.</p>
      </section>

      <section class="card">
        <h2>بند الإشعارات والتنبيهات</h2>
        <p>يوافق المستخدم على استقبال الإشعارات والتنبيهات المتعلقة بالحساب والمواعيد والحجوزات والتنبيهات التشغيلية والتحديثات المهمة الخاصة بالمنصة. كما يحق للمنصة إرسال الإشعارات اللازمة لتشغيل الخدمة وتحسين تجربة المستخدم. ويمكن للمستخدم التحكم ببعض إعدادات الإشعارات من خلال جهازه أو التطبيق عند توفر ذلك.</p>
      </section>

      <section class="card">
        <h2>بند الأسعار والمعلومات المعروضة</h2>
        <p>يلتزم مقدم الخدمة بأن تكون جميع الأسعار والخدمات والعروض والمعلومات المعروضة داخل المنصة صحيحة وواضحة ومحدثة باستمرار. ويتحمل مقدم الخدمة المسؤولية الكاملة عن أي اختلاف أو تضليل أو أخطاء تتعلق بالأسعار أو تفاصيل الخدمات أو العروض المقدمة للعملاء.</p>
      </section>

      <section class="card">
        <h2>بند الخدمات المالية المستقبلية</h2>
        <p>تحتفظ المنصة بحق إضافة خدمات الدفع الإلكتروني أو المحافظ الرقمية أو خدمات التحصيل أو أي خدمات مالية أخرى مستقبلاً. وفي حال إضافة أي من هذه الخدمات، يحق للمنصة تحديث الشروط والأحكام والسياسات ذات العلاقة بما يتوافق مع الأنظمة واللوائح المعمول بها في المملكة العربية السعودية. ويُعد استمرار المستخدم في استخدام المنصة موافقة على تلك التحديثات.</p>
      </section>

      <section class="card">
        <h2>رابعاً: أحكام الإعلان</h2>
        <ol class="legal-list">
          <li>يُمنع نشر أي إعلان يحتوي على:
            <ul>
              <li>محتوى مخالف لأنظمة المملكة أو الآداب العامة.</li>
              <li>صور مزيفة أو صور تم الحصول عليها من الإنترنت.</li>
              <li>إعلانات مضللة أو وعود بنتائج غير واقعية.</li>
              <li>بيانات شخصية أو وثائق حكومية أو صور لأشخاص دون إذنهم.</li>
              <li>روابط أو محتوى يهدف لجمع بيانات المستخدمين أو تحويلهم خارج المنصة.</li>
              <li>محتوى استغلالي أو احتيالي أو يضر بالمنصة أو مستخدميها.</li>
            </ul>
          </li>
          <li>للمنصة الحق في:
            <ul>
              <li>حذف أي إعلان مخالف فوراً دون إشعار مسبق.</li>
              <li>إيقاف أو شطب الحساب المرتبط به.</li>
              <li>إحالة المخالفات الجسيمة للجهات المختصة دون التزام باسترداد أي مبالغ مدفوعة أو بالتعويض.</li>
            </ul>
          </li>
        </ol>
        <p class="muted">يقر المستخدم بأن المنصة لا تضمن صحة الإعلانات، وأنها تخلي مسؤوليتها بالكامل عن أي أضرار أو خسائر أو تضليل ناتج عن الاعتماد على الإعلانات.</p>
      </section>

      <section class="card">
        <h2>خامساً: الأمن والخصوصية</h2>
        <ol class="legal-list">
          <li>تلتزم المنصة بتوفير بيئة آمنة قدر الإمكان.</li>
          <li>يُمنع التحرش، التنمر، التهديد، أو الإساءة بين المستخدمين.</li>
          <li>توصي المنصة بعدم مشاركة أي بيانات حساسة خارج التطبيق، خصوصاً للنساء والفتيات حفاظاً على الخصوصية والأمان.</li>
          <li>لا تتحمل المنصة مسؤولية أي حوالات أو تعاملات مالية تتم خارجها، ويتحمل المستخدم وحده التحقق منها.</li>
          <li>يحق للمنصة:
            <ul>
              <li>إيقاف أي حساب عند الاشتباه بأنه يشكل خطراً على الأمان.</li>
              <li>إحالة أي نشاط مشبوه للجهات المختصة دون إشعار مسبق.</li>
            </ul>
          </li>
        </ol>
      </section>

      <section class="card">
        <h2>سادساً: سياسة جمع البيانات والاحتفاظ بها</h2>
        <ol class="legal-list">
          <li>قد تجمع المنصة بيانات ضرورية للتشغيل تشمل: الاسم، رقم الجوال/البريد الإلكتروني، الموقع التقريبي، بيانات الجهاز، وبيانات الاستخدام لغرض تشغيل الخدمة وتحسين التجربة.</li>
          <li>يجوز للمنصة مشاركة بعض البيانات الضرورية فقط مع: مقدمي الخدمة عند الحجز، ومزودي الخدمات التقنية (استضافة/رسائل/مدفوعات) بما يخدم تشغيل الخدمة فقط.</li>
          <li>الإنترنت ليس آمناً 100% ولا تضمن المنصة حماية مطلقة من الاختراقات الخارجة عن إرادتها.</li>
          <li>عند طلب حذف الحساب: تُحذف البيانات ما لم يوجد التزام نظامي أو أمر رسمي من الجهات المختصة يقتضي الاحتفاظ بها لمدة محددة.</li>
        </ol>
      </section>

      <section class="card">
        <h2>sابعاً: حدود المسؤولية</h2>
        <ol class="legal-list">
          <li>لا تقدم المنصة أي ضمان حول دقة أو صحة أو اكتمال المحتوى المنشور أو الإعلانات.</li>
          <li>لا تتحمل المنصة أي مسؤولية عن: فقدان البيانات، الخسائر المالية، الأعطال التقنية، الانقطاعات، الفيروسات، الهجمات السيبرانية، أو أي ظرف طارئ خارج عن إرادتها.</li>
          <li>المستخدم يعفي المنصة نهائياً وغير قابل للرجوع من أي مطالبات أو تعويضات تنشأ عن استخدامه للمنصة، أو الخدمات المعروضة داخلها، أو التعاملات خارجها.</li>
        </ol>
      </section>

      <section class="card">
        <h2>ثامناً: التعويض</h2>
        <p>يتعهد المستخدم بتعويض المنصة عن أي دعاوى أو أضرار أو خسائر أو تكاليف (بما في ذلك أتعاب المحاماة) تنشأ بسبب محتوى نشره، أو إساءة استخدامه، أو إهماله، أو استخدام بيانات الدخول له من قبل طرف غير مصرح له.</p>
      </section>

      <section class="card">
        <h2>تاسعاً: سريان البنود</h2>
        <p>لا يتأثر سريان بقية البنود إذا أصبح أي بند غير قابل للتطبيق بموجب حكم قضائي أو لائحة سعودية، ويتم استبدال البند ببند نظامي يحقق نفس الغرض بأقرب صورة ممكنة.</p>
      </section>

      <section class="card">
        <h2>عاشراً: الإبلاغ</h2>
        <p>يمكن للمسخدم تقديم البلاغات عبر زر مباشر داخل التطبيق أو من خلال القنوات الرسمية المعتمدة. وتحتفظ الإدارة بحق تقدير خطورة البلاغ واتخاذ الإجراء المناسب دون إلزامها بإجراء محدد.</p>
      </section>

      <section class="card">
        <h2>حادي عشر: التعديلات</h2>
        <p>يحق للمنصة تعديل الشروط في أي وقت دون إشعار. واستمرار المستخدم في الاستخدام يعني موافقته النهائية على التعديلات. والمستخِدم مسؤول عن مراجعة الشروط بشكل دوري.</p>
      </section>

      <footer>
        حقوق الطبع والنشر محفوظة لمنصة شَعْرة (Shaara).
      </footer>
    </div>

    <!-- ENGLISH CONTENT -->
    <div class="content-en" dir="ltr">
      <header>
        <div>
          <h1>Shaara Platform</h1>
          <p class="muted">${subtitleEn}</p>
        </div>
        <div>
          <span class="pill">Last Updated: ${updateDateEn}</span>
        </div>
      </header>

      <section class="card">
        <h2>Introduction and Acceptance</h2>
        <p>By accessing or using the Shaara Platform, browsing it, or creating an account, you unconditionally agree to comply with all terms outlined below. Continued use constitutes final acceptance of any updates or modifications.</p>
        <p>The user confirms full legal capacity to use the platform and enter into this agreement. This document is governed by the laws of the Kingdom of Saudi Arabia and is binding on all users.</p>
      </section>

      <section class="card">
        <h2>Definitions</h2>
        <ul class="legal-list">
          <li><strong>Platform:</strong> Shaara, a technical intermediary platform connecting clients with grooming, beauty, and personal care service providers.</li>
          <li><strong>User:</strong> Any individual or legal entity visiting, registering, browsing, or using the platform, registered or unregistered.</li>
          <li><strong>Service Provider:</strong> Any salon, barber, beauty center, independent professional, or establishment acknowledged to hold valid licenses or required Saudi legal documents if mandated by authorities for service practice.</li>
          <li><strong>Content:</strong> Includes all uploaded or shared items such as data, descriptions, images, prices, links, messages, reviews, and advertisements.</li>
          <li><strong>Advertisement:</strong> Any free or paid promotional content including text, images, media, or links displayed on the platform.</li>
        </ul>
      </section>

      <section class="card">
        <h2>Legal Eligibility and Account Responsibility</h2>
        <p>Users confirm they represent themselves or the entity they are legally authorized to represent. The account owner bears full legal, financial, and administrative responsibility for all actions performed through their credentials.</p>
        <p>The platform is not obligated to verify the actual identity of the person operating the account using shared login details. If a Service Provider is a business entity, their account might be operated by authorized employees using the same login credentials.</p>
      </section>

      <section class="card">
        <h2>General Rules for All Users</h2>
        <ol class="legal-list">
          <li>Users must fully comply with Saudi applicable laws and regulations.</li>
          <li>It is strictly prohibited to publish content that is offensive, racist, abusive, unlawful, unethical, or violates public morals or others’ rights.</li>
          <li>Users are solely responsible for ensuring accuracy and legal rights to publish their content, without copying or republishing others’ platform content without prior written permission.</li>
          <li>Automated access or data scraping using (Bots / Scripts / Crawlers) is fully prohibited unless explicitly authorized by platform management.</li>
          <li>The platform acts only as a technical intermediary and is not liable for service disputes or service outcomes between users and providers.</li>
          <li>Platform management reserves the right to delete violating or suspicious content, restrict, suspend, or permanently deactivate any account without notice or compensation if misuse or violations occur.</li>
        </ol>
      </section>

      <section class="card">
        <h2>Client-Specific Terms</h2>
        <ol class="legal-list">
          <li>Clients are solely responsible for verifying service information before booking, including pricing, service type, provider credibility, location, and appointment details.</li>
          <li>The platform bears no responsibility for provider delays, appointment cancellation, failures to show, unsatisfactory results, or any damages or consequences resulting from the provided service.</li>
          <li>Reviews express their authors’ opinions only, with platform management having discretionary rights to modify or remove content if deemed appropriate.</li>
          <li>Communications, agreements, or payments outside the platform are the responsibility of involved parties only.</li>
          <li>For home or mobile services: clients are solely responsible for address accuracy and permitting provider entry, along with associated legal and security consequences.</li>
          <li>The platform has no liability concerning service site safety, individuals, property, children, or animals at the visit location.</li>
          <li>Users confirm home or mobile visits are performed under their own free will and personal responsibility without platform liability or guarantees.</li>
        </ol>
      </section>

      <section class="card">
        <h2>Service Provider-Specific Terms</h2>
        <ol class="legal-list">
          <li>Providers must not advertise or provide services that violate Saudi regulations or public morals.</li>
          <li>Health/medical-related beauty services such as: Botox, fillers, threads, laser procedures, chemical peels, or clinical dermatological treatments are strictly prohibited unless properly licensed by Saudi health authorities and required documents are submitted when officially requested.</li>
          <li>It is strictly forbidden to employ unqualified or non-licensed or unauthorized personnel or illegal workers to perform services within the platform operations or visits.</li>
          <li>Collecting, storing, or capturing client data, images, recordings, or undisclosed charges post-booking confirmation is prohibited. Establishments and account owners bear full liability for any privacy or data misuse violations.</li>
          <li>Providers must not cancel or delay appointments repeatedly without valid justification, or engage in improper client conduct including harassment, threats, abuse, discrimination, or adding unforeseen fees post-confirmation.</li>
          <li>Platform management holds the right to restrict, suspend, or permanently deactivate provider accounts without explanation or compensation if violations, repeated complaints, or significant rating decline occur.</li>
        </ol>
      </section>

      <section class="card">
        <h2>Verification Status</h2>
        <p>Obtaining a “Verified” status on the platform does not constitute a guarantee, endorsement, warranty, or certification by the Platform regarding the quality, performance, legality, reliability, future conduct, or outcomes of the Service Provider. Verification only indicates that the Service Provider has completed the verification requirements established by the Platform at the time of verification. The Platform reserves the right to suspend, remove, or revoke the verification status at any time at its sole discretion.</p>
      </section>

      <section class="card">
        <h2>Ratings and Reviews</h2>
        <p>All ratings and reviews must be based on genuine and actual service experiences. Users are strictly prohibited from manipulating ratings, publishing misleading or false reviews, purchasing reviews, exchanging incentives for reviews, or engaging in any activity intended to artificially influence ratings. The Platform reserves the right to remove, modify, hide, or investigate any review that it considers inaccurate, misleading, fraudulent, abusive, or in violation of these Terms.</p>
      </section>

      <section class="card">
        <h2>Images and Intellectual Property</h2>
        <p>The Service Provider represents and warrants that it owns or has obtained all necessary rights, permissions, licenses, and authorizations to upload, publish, display, and use any images, content, trademarks, logos, or materials submitted through the Platform. The Service Provider shall bear full legal responsibility for any infringement of intellectual property rights, copyrights, trademarks, privacy rights, or any third-party rights. The Platform disclaims any liability arising from user-generated content and reserves the right to remove any content that may violate applicable laws or third-party rights.</p>
      </section>

      <section class="card">
        <h2>Notifications and Communications</h2>
        <p>By using the Platform, the User agrees to receive notifications, alerts, reminders, operational messages, booking-related communications, account updates, service announcements, and other communications necessary for the operation of the Platform. The Platform may send such communications through in-app notifications, SMS messages, email, push notifications, or any other available communication channels. Users may manage certain notification preferences where such options are provided.</p>
      </section>

      <section class="card">
        <h2>Pricing and Service Information</h2>
        <p>Service Providers are solely responsible for ensuring that all prices, service descriptions, promotions, availability information, and related details displayed on the Platform are accurate, complete, current, and not misleading. The Service Provider shall bear full responsibility for any discrepancies, inaccuracies, omissions, misrepresentations, or misleading information relating to services, pricing, promotions, or offers presented to Users.</p>
      </section>

      <section class="card">
        <h2>Future Financial Services</h2>
        <p>The Platform reserves the right to introduce electronic payment services, digital wallets, payment processing services, commissions, fees, subscription plans, financial products, or other related services in the future. In such cases, the Platform may update these Terms and Conditions, Privacy Policy, or any related policies as required by applicable laws and regulations. Continued use of the Platform following such updates shall constitute acceptance of the revised terms and policies.</p>
      </section>

      <section class="card">
        <h2>Advertisement Compliance Rules</h2>
        <ol class="legal-list">
          <li>Publishing advertisements that violate Saudi law or public morals is strictly prohibited including: suspicious/fake/internet-taken/before-after-manipulated advertisements, misleading offers, unreal results-promising advertisements, unauthorized external data redirection or data collection links, government documents or personal images without consent, or fraudulent/scam/misuse content.</li>
          <li>Management holds the right to: delete advertisements instantly, suspend or permanently deactivate accounts, report serious violations to competent Saudi authorities, reject refunds of advertisement payments, or compensation obligations if any misuse or violations occur.</li>
        </ol>
        <p class="muted">Users explicitly confirm that the platform is not responsible for any losses or damages or misleading information caused by advertisements or reliance on advertisement content.</p>
      </section>

      <section class="card">
        <h2>Data Collection, Usage, and Retention</h2>
        <ol class="legal-list">
          <li>The platform may collect essential data such as: name, phone/email, approximate location, device and usage data for booking operations and platform functionality and experience improvement only.</li>
          <li>The platform may share booking-essential data only with: providers post-booking, hosting, SMS, and payment service partners to operate platform services only, with no external non-mandated usage.</li>
          <li>Internet operations are not fully secure and absolute protection against external breaches beyond platform control is not guaranteed.</li>
          <li>User-requested account deletion results in full data deletion unless a mandated binding Saudi request orders retention for a defined period.</li>
          <li>The platform does not share private data except when mandated by Saudi law or competent authority official request.</li>
        </ol>
      </section>

      <section class="card">
        <h2>Liability Limitations</h2>
        <ol class="legal-list">
          <li>The platform does not guarantee accuracy or completeness or validity of user-submitted or advertisement content.</li>
          <li>The platform is not liable for: technical errors, data loss, interruptions, viruses, or cyber attacks beyond its control.</li>
          <li>The platform is not liable for: external platform communications, agreements, provider conduct, appointment no-show/delay/cancellation, unsatisfactory results, or home/mobile service visits.</li>
          <li>Users hereby waive platform liability fully and finally, non-reversible, from all claims or compensation obligations including direct/indirect/incidental/consequential losses or damages resulting from platform use or services or advertisements posted on or accessed through it.</li>
        </ol>
      </section>

      <section class="card">
        <h2>User Compensation Clause</h2>
        <p>Users agree to compensate the platform for any: legal claims, financial loss, damages, or expenses caused by user or employee or third-party misuse or negligence or violating Saudi regulations using their credentials or posted content using their account.</p>
      </section>

      <section class="card">
        <h2>Severability, Reporting, and Modifications</h2>
        <ol class="legal-list">
          <li>Invalid clause rulings do not affect other binding clauses, with replacement with the nearest compliant clause fulfilling the purpose under Saudi regulations.</li>
          <li>Users may report through Report/Contact Us features, with management reserving discretionary rights in severity evaluation and actions.</li>
          <li>The platform may edit terms at any point without notice, with users responsible for ongoing reviews and acceptance via use continuation.</li>
        </ol>
      </section>

      <footer>
        Copyright © Shaara Platform. Use of the service is subject to these terms.
      </footer>
    </div>
  </div>
</body>
</html>`;
};

export const privacyPolicyForPublish = () => {
  return getLegalTemplate(
    "Shaara - Privacy Policy",
    "منصة شَعْرة - سياسة الخصوصية",
    "Privacy Policy for the Shaara Platform booking and grooming services",
    "سياسة الخصوصية لمنصة شَعْرة لخدمات العناية والتجميل والحجوزات",
    "2025",
    "2025",
  );
};

export const termsandconditions = () => {
  return getLegalTemplate(
    "Shaara - Terms and Conditions",
    "منصة شَعْرة - الشروط والأحكام",
    "Terms and Conditions for the Shaara Platform booking and grooming services",
    "الشروط والأحكام لمنصة شَعْرة لخدمات العناية والتجميل والحجوزات",
    "2025",
    "2025",
  );
};

export const marketingPage = () => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Shaara Marketing Page</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      line-height: 1.8;
      max-width: 1000px;
      margin: 0 auto;
      color: #333;
      background: #fff;
    }

    .language-switcher {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
    }

    .language-switcher button {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      background: #f1f1f1;
      font-weight: 600;
    }

    .language-switcher button.active {
      background: #000;
      color: #fff;
    }

    h1,
    h2 {
      color: #222;
    }

    ul {
      padding-left: 20px;
    }

    li {
      margin-bottom: 10px;
    }

    .arabic {
      direction: rtl;
      text-align: right;
    }

    .hidden {
      display: none;
    }

    .email {
      font-weight: bold;
    }
  </style>
</head>
<body>

  <div class="language-switcher">
    <button id="englishBtn" class="active">English</button>
    <button id="arabicBtn">العربية</button>
  </div>

  <!-- English Content -->
  <div id="englishContent">
    <h1>Shaara</h1>

    <p>
      Shaara is a modern platform that connects clients with beauty salons,
      barber shops, spas, wellness centers, clinics, and personal care service
      providers through a simple and convenient booking experience.
    </p>

    <p>
      Clients can discover service providers, explore available services,
      view business information, book appointments, and manage their bookings
      in one place.
    </p>

    <p>
      For service providers, Shaara offers tools to manage appointments,
      organize bookings, showcase services, and connect with more customers.
    </p>

    <h2>Platform Features</h2>

    <ul>
      <li>Search service providers easily.</li>
      <li>Explore services and provider information.</li>
      <li>Book and manage appointments conveniently.</li>
      <li>Track booking status and updates.</li>
      <li>Discover nearby service providers.</li>
      <li>A unified platform connecting clients and providers.</li>
    </ul>

    <h2>Our Mission</h2>

    <p>
      Our mission is to simplify the booking experience for clients while helping
      service providers grow their businesses through modern technology.
    </p>

    <h2>Support</h2>

    <p class="email">company.shaara@gmail.com</p>
  </div>

  <!-- Arabic Content -->
  <div id="arabicContent" class="arabic hidden">
    <h1>منصة شعرة</h1>

    <p>
      شعرة هي منصة رقمية حديثة تربط العملاء بمقدمي خدمات التجميل والعناية الشخصية
      من خلال تجربة حجز سهلة ومريحة.
    </p>

    <p>
      تساعد المنصة العملاء على اكتشاف الصالونات ومراكز التجميل والسبا ومراكز
      المساج والعيادات ومقدمي خدمات العناية الشخصية، والاطلاع على الخدمات
      المتاحة ومقارنة الخيارات وحجز المواعيد وإدارتها بسهولة من مكان واحد.
    </p>

    <p>
      كما توفر منصة شعرة لمقدمي الخدمات أدوات تساعدهم على إدارة الحجوزات
      وتنظيم المواعيد وعرض خدماتهم والوصول إلى عدد أكبر من العملاء.
    </p>

    <h2>مميزات منصة شعرة</h2>

    <ul>
      <li>البحث عن مقدمي الخدمات بسهولة.</li>
      <li>استعراض الخدمات المتاحة ومعلومات مقدم الخدمة.</li>
      <li>حجز المواعيد وإدارتها بكل سهولة.</li>
      <li>متابعة حالة الحجوزات والتحديثات المتعلقة بها.</li>
      <li>اكتشاف مقدمي الخدمات القريبين من موقعك.</li>
      <li>منصة موحدة تجمع العملاء ومقدمي الخدمات في مكان واحد.</li>
    </ul>

    <h2>رسالتنا</h2>

    <p>
      نسعى في منصة شعرة إلى تبسيط تجربة الحجز في قطاع الجمال والعناية الشخصية،
      وتمكين مقدمي الخدمات من تنمية أعمالهم والوصول إلى المزيد من العملاء من
      خلال حلول تقنية حديثة وفعالة.
    </p>

    <h2>للتواصل</h2>

    <p class="email">company.shaara@gmail.com</p>
  </div>

  <script>
    const englishBtn = document.getElementById("englishBtn");
    const arabicBtn = document.getElementById("arabicBtn");

    const englishContent = document.getElementById("englishContent");
    const arabicContent = document.getElementById("arabicContent");

    englishBtn.addEventListener("click", () => {
      englishContent.classList.remove("hidden");
      arabicContent.classList.add("hidden");

      englishBtn.classList.add("active");
      arabicBtn.classList.remove("active");
    });

    arabicBtn.addEventListener("click", () => {
      arabicContent.classList.remove("hidden");
      englishContent.classList.add("hidden");

      arabicBtn.classList.add("active");
      englishBtn.classList.remove("active");
    });
  </script>

</body>
</html>
  `;
};

export const supportPage = () => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Shaara Support Center</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      line-height: 1.8;
      max-width: 1000px;
      margin: 0 auto;
      color: #333;
      background: #fff;
    }

    .language-switcher {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
    }

    .language-switcher button {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      background: #f1f1f1;
      font-weight: 600;
    }

    .language-switcher button.active {
      background: #000;
      color: #fff;
    }

    .hidden {
      display: none;
    }

    .arabic {
      direction: rtl;
      text-align: right;
    }

    h1,
    h2 {
      color: #222;
    }

    ul {
      padding-left: 20px;
    }

    li {
      margin-bottom: 10px;
    }

    .contact {
      font-weight: 600;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>

  <div class="language-switcher">
    <button id="englishBtn" class="active">English</button>
    <button id="arabicBtn">العربية</button>
  </div>

  <!-- English Content -->
  <div id="englishContent">
    <h1>Shaara Support Center</h1>

    <p>
      Welcome to Shaara Support.
    </p>

    <p>
      We are committed to providing assistance and support to our clients and
      service providers to ensure the best possible experience on the platform.
    </p>

    <p>
      If you need help with bookings, account access, provider verification,
      technical issues, reports, suggestions, or general inquiries, please
      contact us through one of the following channels:
    </p>

    <h2>Email Support</h2>
    <p class="contact">company.shaara@gmail.com</p>

    <h2>WhatsApp Support</h2>
    <p class="contact">+966 55 068 0132</p>

    <h2>Support Availability</h2>
    <p>
      Our support team is available to assist you at any time and will do its
      best to respond as quickly as possible.
    </p>

    <h2>Common Support Topics</h2>

    <ul>
      <li>Booking and appointment issues</li>
      <li>Account access and login assistance</li>
      <li>Service provider verification inquiries</li>
      <li>Technical problems and bug reports</li>
      <li>Complaints and reports</li>
      <li>Suggestions and feedback</li>
      <li>General platform inquiries</li>
    </ul>

    <p>
      Thank you for using Shaara.
    </p>
  </div>

  <!-- Arabic Content -->
  <div id="arabicContent" class="arabic hidden">
    <h1>مركز دعم منصة شعرة</h1>

    <p>
      مرحبًا بك في مركز دعم منصة شعرة.
    </p>

    <p>
      نلتزم بتقديم المساعدة والدعم لعملائنا ومقدمي الخدمات لضمان أفضل تجربة
      ممكنة على المنصة.
    </p>

    <p>
      إذا كنت بحاجة إلى المساعدة فيما يتعلق بالحجوزات، أو الوصول إلى الحساب،
      أو توثيق مقدمي الخدمات، أو المشكلات التقنية، أو البلاغات والشكاوى،
      أو الاقتراحات والملاحظات، أو أي استفسارات عامة، يمكنك التواصل معنا عبر
      إحدى القنوات التالية:
    </p>

    <h2>البريد الإلكتروني</h2>
    <p class="contact">company.shaara@gmail.com</p>

    <h2>الدعم عبر الواتساب</h2>
    <p class="contact">+966 55 068 0132</p>

    <h2>ساعات الدعم</h2>
    <p>
      فريق الدعم متاح على مدار الساعة، وسيبذل قصارى جهده للرد على جميع
      الاستفسارات في أسرع وقت ممكن.
    </p>

    <h2>المواضيع الشائعة للدعم</h2>

    <ul>
      <li>مشكلات الحجوزات والمواعيد</li>
      <li>المساعدة في تسجيل الدخول والوصول إلى الحساب</li>
      <li>استفسارات توثيق مقدمي الخدمات</li>
      <li>المشكلات التقنية والأخطاء البرمجية</li>
      <li>الشكاوى والبلاغات</li>
      <li>الاقتراحات والملاحظات</li>
      <li>الاستفسارات العامة المتعلقة بالمنصة</li>
    </ul>

    <p>
      شكرًا لاستخدامك منصة شعرة.
    </p>
  </div>

  <script>
    const englishBtn = document.getElementById("englishBtn");
    const arabicBtn = document.getElementById("arabicBtn");

    const englishContent = document.getElementById("englishContent");
    const arabicContent = document.getElementById("arabicContent");

    englishBtn.addEventListener("click", () => {
      englishContent.classList.remove("hidden");
      arabicContent.classList.add("hidden");

      englishBtn.classList.add("active");
      arabicBtn.classList.remove("active");
    });

    arabicBtn.addEventListener("click", () => {
      arabicContent.classList.remove("hidden");
      englishContent.classList.add("hidden");

      arabicBtn.classList.add("active");
      englishBtn.classList.remove("active");
    });
  </script>

</body>
</html>
  `;
};

export const deleteData = () => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Delete Data</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
 
    * {
 
      box-sizing: border-box;
 
    }
 
    body {
 
      font-family: Arial, sans-serif;
 
      background-color: #f6f6f6;
 
      padding: 0;
 
      margin: 0;
 
    }
 
    .container {
 
      max-width: 400px;
 
      margin: 80px auto;
 
      background-color: #ffffff;
 
      padding: 30px;
 
      border-radius: 10px;
 
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
 
    }
 
    h2 {
 
      color: #d32f2f;
 
      text-align: center;
 
      margin-bottom: 20px;
 
    }
 
    label {
 
      display: block;
 
      margin-bottom: 6px;
 
      font-weight: 600;
 
    }
 
    input[type="email"],
 
    input[type="password"] {
 
      width: 100%;
 
      padding: 10px;
 
      margin-bottom: 20px;
 
      border: 1px solid #ccc;
 
      border-radius: 6px;
 
      font-size: 14px;
 
    }
 
    button {
 
      width: 100%;
 
      padding: 12px;
 
      background-color: #d32f2f;
 
      color: #ffffff;
 
      border: none;
 
      border-radius: 6px;
 
      font-size: 16px;
 
      cursor: pointer;
 
      transition: background-color 0.3s ease;
 
    }
 
    button:hover {
 
      background-color: #b71c1c;
 
    }
 
    .note {
 
      font-size: 13px;
 
      color: #555;
 
      text-align: center;
 
      margin-top: 15px;
 
    }
</style>
</head>
<body>
 
<div class="container">
<h2>Delete Your Data</h2>
 
  <form onsubmit="handleDelete(event)">
<label for="email">Email</label>
<input type="email" id="email" name="email" required>
 
    <label for="password">Password</label>
<input type="password" id="password" name="password" required>
 
    <button type="submit">Confirm</button>
</form>
 
  <div class="note">
 
    This action is irreversible. Please confirm carefully.
</div>
</div>
 
<script>
 
  function handleDelete(e) {
 
    e.preventDefault();
 
    const email = document.getElementById("email").value.trim();
 
    const password = document.getElementById("password").value.trim();
 
    if (!email || !password) {
 
      alert("Please fill in both fields.");
 
      return;
 
    }
 
    const confirmed = confirm(Are you sure you want to delete the account?);
 
    if (confirmed) {
 
      // TODO: Send deletion request to server here
 
      alert("Your account has been marked for deletion.");
 
    }
 
  }
</script>
 
</body>
</html>
 
 `;
};

export const deleteAccount = () => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Delete Account</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
 
    * {
 
      box-sizing: border-box;
 
    }
 
    body {
 
      font-family: Arial, sans-serif;
 
      background-color: #f6f6f6;
 
      padding: 0;
 
      margin: 0;
 
    }
 
    .container {
 
      max-width: 400px;
 
      margin: 80px auto;
 
      background-color: #ffffff;
 
      padding: 30px;
 
      border-radius: 10px;
 
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
 
    }
 
    h2 {
 
      color: #d32f2f;
 
      text-align: center;
 
      margin-bottom: 20px;
 
    }
 
    label {
 
      display: block;
 
      margin-bottom: 6px;
 
      font-weight: 600;
 
    }
 
    input[type="email"],
 
    input[type="password"] {
 
      width: 100%;
 
      padding: 10px;
 
      margin-bottom: 20px;
 
      border: 1px solid #ccc;
 
      border-radius: 6px;
 
      font-size: 14px;
 
    }
 
    button {
 
      width: 100%;
 
      padding: 12px;
 
      background-color: #d32f2f;
 
      color: #ffffff;
 
      border: none;
 
      border-radius: 6px;
 
      font-size: 16px;
 
      cursor: pointer;
 
      transition: background-color 0.3s ease;
 
    }
 
    button:hover {
 
      background-color: #b71c1c;
 
    }
 
    .note {
 
      font-size: 13px;
 
      color: #555;
 
      text-align: center;
 
      margin-top: 15px;
 
    }
</style>
</head>
<body>
 
<div class="container">
<h2>Delete Your Account</h2>
 
  <form onsubmit="handleDelete(event)">
<label for="email">Email</label>
<input type="email" id="email" name="email" required>
 
    <label for="password">Password</label>
<input type="password" id="password" name="password" required>
 
    <button type="submit">Confirm</button>
</form>
 
  <div class="note">
 
    This action is irreversible. Please confirm carefully.
</div>
</div>
 
<script>
 
  function handleDelete(e) {
 
    e.preventDefault();
 
    const email = document.getElementById("email").value.trim();
 
    const password = document.getElementById("password").value.trim();
 
    if (!email || !password) {
 
      alert("Please fill in both fields.");
 
      return;
 
    }
 
    const confirmed = confirm(Are you sure you want to delete the account?);
 
    if (confirmed) {
 
      // TODO: Send deletion request to server here
 
      alert("Your account has been marked for deletion.");
 
    }
 
  }
</script>
 
</body>
</html>
 
 `;
};

export const appleAppSiteAssociation = () => {
  return {
    applinks: {
      details: [
        {
          appIDs: ["UKUYSFA2ZH.app.faris.shaara"],
          components: [
            {
              "/": "/services",
              "?": { id: "?*" },
            },
          ],
        },
      ],
    },
  };
};

export const assetLinks = () => {
  return [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "app.faris.shaara",
        sha256_cert_fingerprints: [
          "1D:C9:93:E1:C3:5F:10:21:C3:0B:89:F5:E5:EB:7F:F1:31:4D:58:D7:68:01:20:28:DC:19:8A:29:F4:AB:83:1C",
          "82:3E:6C:58:80:65:AF:55:30:5D:CA:4B:8C:75:AE:8A:C1:5B:4F:A2:B8:C6:0B:67:5C:50:F9:4B:A1:FD:D2:E4",
        ],
      },
    },
  ];
};

export const showWhileRedirectDeepLink = (id: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#07111f" />
  <meta name="description" content="Open the Shaara app or continue in your browser." />
  <title>Open in Shaara</title>
  <style>
    :root {
      --bg: #06111d;
      --bg-2: #0b1c2f;
      --card: rgba(10, 20, 35, 0.78);
      --border: rgba(255, 255, 255, 0.12);
      --text: #eef5ff;
      --muted: #a8b9d4;
      --accent: #56e3b4;
      --accent-2: #68b7ff;
      --shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
    }

    * { box-sizing: border-box; }

    html, body { height: 100%; }

    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at top left, rgba(86, 227, 180, 0.18), transparent 30%),
        radial-gradient(circle at top right, rgba(104, 183, 255, 0.18), transparent 28%),
        linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%);
      display: grid;
      place-items: center;
      padding: 24px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .shell {
      width: min(100%, 640px);
    }

    .card {
      position: relative;
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 28px;
      background: linear-gradient(180deg, rgba(16, 29, 48, 0.92), rgba(8, 16, 28, 0.92));
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
      padding: 28px;
    }

    .card::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(86, 227, 180, 0.08), transparent 36%, rgba(104, 183, 255, 0.08));
      pointer-events: none;
    }

    .hero {
      position: relative;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 18px;
      align-items: center;
      margin-bottom: 22px;
    }

    .logo-wrap {
      width: 82px;
      height: 82px;
      border-radius: 24px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: grid;
      place-items: center;
      overflow: hidden;
    }

    .logo-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 18px;
      display: block;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      border-radius: 999px;
      background: rgba(86, 227, 180, 0.12);
      color: var(--accent);
      border: 1px solid rgba(86, 227, 180, 0.2);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      width: fit-content;
      margin-bottom: 10px;
    }

    h1 {
      margin: 0;
      font-size: clamp(28px, 4vw, 42px);
      line-height: 1.05;
      letter-spacing: -0.04em;
    }

    h1 .brand {
      color: var(--accent);
    }

    .subtitle {
      margin: 10px 0 0;
      font-size: 15px;
      line-height: 1.7;
      color: var(--muted);
      max-width: 56ch;
    }

    .status-row {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 22px 0;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--text);
      font-size: 13px;
    }

    .chip svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      color: var(--accent);
    }

    .chip strong {
      color: var(--accent);
      font-weight: 700;
    }

    .button-grid {
      position: relative;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-top: 22px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-height: 56px;
      padding: 14px 18px;
      border-radius: 16px;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .btn svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .btn:hover {
      transform: translateY(-2px);
    }

    .btn-primary {
      color: #07111f;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      box-shadow: 0 16px 30px rgba(86, 227, 180, 0.22);
    }

    .btn-secondary {
      color: var(--text);
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(255, 255, 255, 0.04);
    }

    .note {
      position: relative;
      margin-top: 18px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
    }

    .footer {
      margin-top: 16px;
      text-align: center;
      color: rgba(168, 185, 212, 0.82);
      font-size: 12px;
    }

    @media (max-width: 640px) {
      .card { padding: 22px; border-radius: 24px; }
      .hero { grid-template-columns: 1fr; justify-items: start; }
      .logo-wrap { width: 72px; height: 72px; border-radius: 20px; }
      .button-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="card">
      <div class="hero">
        <div class="logo-wrap" aria-hidden="true">
          <img src="https://res.cloudinary.com/dbpao5h91/image/upload/v1780558557/uploads/courses/profileImage/xlqdnqx9ubhzedw9p1v7.png" alt="Shaara app logo" />
        </div>

        <div>
          <div class="eyebrow">Deep link preview</div>
          <h1>Open this content in <span class="brand">Shaara</span></h1>
          <p class="subtitle">You shared an item from the app. Choose your device below to continue in the right store while we keep the shared context ready.</p>
        </div>
      </div>

      <div class="status-row">
        <div class="chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          Install or open the app to continue
        </div>
      </div>

      <div class="button-grid">
        <a class="btn btn-primary" href="https://apps.apple.com/us/app/shaara/id6759182992" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.365 1.43c0 1.14-.462 2.242-1.215 3.05-.833.89-2.191 1.573-3.297 1.484-.14-1.09.415-2.246 1.176-3.04C13.83 1.995 15.28 1.32 16.365 1.43zM20.66 17.12c-.573 1.32-.847 1.912-1.583 3.083-1.028 1.632-2.478 3.667-4.276 3.684-1.598.016-2.01-1.043-4.18-1.033-2.17.01-2.622 1.05-4.222 1.034-1.798-.017-3.17-1.85-4.198-3.482C-.152 17.1-.618 12.9 1.024 10.62c1.163-1.618 3.003-2.567 4.735-2.567 1.762 0 2.87 1.02 4.33 1.02 1.415 0 2.27-1.023 4.33-1.023 1.542 0 3.174.84 4.337 2.29-3.815 2.09-3.196 7.54 1.904 6.78z"></path>
          </svg>
          Open on iPhone
        </a>
        <a class="btn btn-secondary" href="https://play.google.com/store/apps/details?id=app.faris.shaara" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.5 9.5v6.9c0 .38.31.6.7.6h.8v3c0 .77.63 1 1 1s1-.23 1-1v-3h1v3c0 .77.63 1 1 1s1-.23 1-1v-3h1v3c0 .77.63 1 1 1s1-.23 1-1v-3h.8c.39 0 .7-.22.7-.6V9.5H6.5zm-1.6 0c-.6 0-1 .43-1 1v5c0 .57.4 1 1 1s1-.43 1-1v-5c0-.57-.4-1-1-1zm12.2 0c-.6 0-1 .43-1 1v5c0 .57.4 1 1 1s1-.43 1-1v-5c0-.57-.4-1-1-1zM8.3 4.7l-.9-1.6a.32.32 0 0 1 .12-.44.32.32 0 0 1 .44.12l.93 1.62c.65-.25 1.37-.4 2.11-.4s1.46.15 2.11.4l.93-1.62a.32.32 0 0 1 .44-.12.32.32 0 0 1 .12.44l-.9 1.6c1.4.78 2.36 2.16 2.44 3.8H5.86c.08-1.64 1.04-3.02 2.44-3.8zM9.3 7c.33 0 .6-.27.6-.6s-.27-.6-.6-.6-.6.27-.6.6.27.6.6.6zm5.4 0c.33 0 .6-.27.6-.6s-.27-.6-.6-.6-.6.27-.6.6.27.6.6.6z"></path>
          </svg>
          Open on Android
        </a>
      </div>
    </section>
    <div class="footer">Shaara deep link gateway</div>
  </main>
</body>
</html>
 `;
};
export const showWhileRedirectDeepLinkTwo = (id: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#07111f" />
  <meta name="description" content="Open the Shaara app or continue in your browser." />
  <title>Opening Shaara...</title>

  <style>
    :root {
      --bg: #06111d;
      --bg-2: #0b1c2f;
      --card: rgba(10,20,35,.78);
      --border: rgba(255,255,255,.12);
      --text: #eef5ff;
      --muted: #a8b9d4;
      --accent: #56e3b4;
      --accent-2: #68b7ff;
      --shadow: 0 24px 80px rgba(0,0,0,.35);
    }

    * {
      box-sizing: border-box;
    }

    html,body{
      height:100%;
    }

    body{
      margin:0;
      font-family:Inter,system-ui,sans-serif;
      color:var(--text);
      background:
        radial-gradient(circle at top left, rgba(86,227,180,.18), transparent 30%),
        radial-gradient(circle at top right, rgba(104,183,255,.18), transparent 28%),
        linear-gradient(180deg,var(--bg),var(--bg-2));
      display:grid;
      place-items:center;
      padding:24px;
    }

    .shell{
      width:min(100%,640px);
    }

    .card{
      position:relative;
      overflow:hidden;
      border-radius:28px;
      padding:30px;
      background:linear-gradient(180deg,rgba(16,29,48,.92),rgba(8,16,28,.92));
      border:1px solid var(--border);
      box-shadow:var(--shadow);
    }

    .hero{
      display:grid;
      grid-template-columns:auto 1fr;
      gap:18px;
      align-items:center;
      margin-bottom:22px;
    }

    .logo-wrap{
      width:82px;
      height:82px;
      border-radius:24px;
      overflow:hidden;
      background:rgba(255,255,255,.08);
    }

    .logo-wrap img{
      width:100%;
      height:100%;
      object-fit:cover;
    }

    .eyebrow{
      display:inline-block;
      padding:7px 12px;
      border-radius:999px;
      background:rgba(86,227,180,.12);
      color:var(--accent);
      font-size:12px;
      font-weight:700;
      margin-bottom:10px;
    }

    h1{
      margin:0;
      font-size:38px;
    }

    .brand{
      color:var(--accent);
    }

    .subtitle{
      color:var(--muted);
      line-height:1.7;
      margin-top:12px;
    }

    .loading{
      margin-top:20px;
      display:flex;
      align-items:center;
      gap:12px;
      color:var(--accent);
      font-weight:600;
    }

    .spinner{
      width:22px;
      height:22px;
      border:3px solid rgba(255,255,255,.2);
      border-top-color:var(--accent);
      border-radius:50%;
      animation:spin 1s linear infinite;
    }

    @keyframes spin{
      to{
        transform:rotate(360deg);
      }
    }

    .buttons{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:12px;
      margin-top:28px;
    }

    a{
      display:flex;
      justify-content:center;
      align-items:center;
      text-decoration:none;
      min-height:56px;
      border-radius:16px;
      font-weight:700;
    }

    .primary{
      color:#07111f;
      background:linear-gradient(135deg,var(--accent),var(--accent-2));
    }

    .secondary{
      color:white;
      border:1px solid rgba(255,255,255,.15);
      background:rgba(255,255,255,.05);
    }

    .footer{
      margin-top:18px;
      text-align:center;
      color:var(--muted);
      font-size:13px;
    }

    @media(max-width:640px){
      .hero{
        grid-template-columns:1fr;
      }

      .buttons{
        grid-template-columns:1fr;
      }
    }
  </style>

  <script>
    const PLAY_STORE = "https://play.google.com/store/apps/details?id=app.faris.shaara";
    const APP_STORE = "https://apps.apple.com/us/app/shaara/id6759182992";

    function isAndroid() {
      return /Android/i.test(navigator.userAgent);
    }

    function isIOS() {
      return (
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      );
    }

    window.addEventListener("load", () => {
      if (isAndroid()) {
        window.location.replace(PLAY_STORE);
        return;
      }

      if (isIOS()) {
        window.location.replace(APP_STORE);
        return;
      }

      // Desktop users remain on the page.
      document.getElementById("loading").style.display = "none";
    });
  </script>
</head>

<body>

<div class="shell">

  <div class="card">

    <div class="hero">

      <div class="logo-wrap">
        <img
          src="https://res.cloudinary.com/dbpao5h91/image/upload/v1780558557/uploads/courses/profileImage/xlqdnqx9ubhzedw9p1v7.png"
          alt="Shaara"
        />
      </div>

      <div>

        <div class="eyebrow">
          Deep Link
        </div>

        <h1>
          Open in <span class="brand">Shaara</span>
        </h1>

        <p class="subtitle">
          We're detecting your device and redirecting you to the correct app store...
        </p>

      </div>

    </div>

    <div id="loading" class="loading">
      <div class="spinner"></div>
      Redirecting...
    </div>

    <div class="buttons">

      <a
        class="primary"
        href="https://apps.apple.com/us/app/shaara/id6759182992"
      >
        Open on iPhone
      </a>

      <a
        class="secondary"
        href="https://play.google.com/store/apps/details?id=app.faris.shaara"
      >
        Open on Android
      </a>

    </div>

  </div>

  <div class="footer">
    Shaara Deep Link Gateway
  </div>

</div>

</body>
</html>
`;
};