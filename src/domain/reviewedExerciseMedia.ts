import { EXERCISES } from "./exerciseCatalog";

/** Locally bundled, visually checked exercise images. Generated images are illustrative, not trainer-certified. */
export type ReviewedExerciseMedia = {
  exerciseId: string;
  localPath: `/exercises/reviewed/${string}.webp`;
  equipmentVerified: true;
  postureVerified: true;
  reviewedBy: string;
  reviewDate: string;
  altAr: string;
  correct: { localPath: `/exercises/reviewed/${string}.webp`; altAr: string };
  steps: readonly { localPath: `/exercises/reviewed/${string}.webp`; altAr: string }[];
  mistakes: readonly { localPath: `/exercises/reviewed/${string}.webp`; altAr: string }[];
  comparisons?: readonly { angleAr: "من الأمام" | "من الخلف" | "من الجانب"; localPath: `/exercises/reviewed/${string}.webp`; altAr: string }[];
};

export const REVIEWED_EXERCISE_MEDIA: readonly ReviewedExerciseMedia[] = [
  {
    exerciseId: "gym-leg-press",
    localPath: "/exercises/reviewed/gym-leg-press-main.webp",
    equipmentVerified: true,
    postureVerified: true,
    reviewedBy: "Visual review of AI-generated illustration; not trainer-certified",
    reviewDate: "2026-10-13",
    altAr: "رجل يؤدي ضغط الأرجل على الجهاز بوضعية جلوس مدعومة",
    correct: { localPath: "/exercises/reviewed/gym-leg-press-correct.webp", altAr: "الظهر والحوض مسنودان والركبتان تتبعان اتجاه أصابع القدمين مع عدم قفل الركبة." },
    comparisons: [{"angleAr":"من الخلف","localPath":"/exercises/reviewed/gym-leg-press-comparison.webp","altAr":"من الخلف: الصحيح الركبتان بمحاذاة أصابع القدمين؛ الخطأ انهيار الركبتين للداخل."}],
    steps: [
      { localPath: "/exercises/reviewed/gym-leg-press-step-01-setup.webp", altAr: "الجلوس على جهاز ضغط الأرجل مع تثبيت الظهر والقدمين" },
      { localPath: "/exercises/reviewed/gym-leg-press-step-02-drive.webp", altAr: "دفع منصة جهاز ضغط الأرجل بالقدمين مع تتبع الركبتين لاتجاه أصابع القدمين" },
      { localPath: "/exercises/reviewed/gym-leg-press-step-03-return.webp", altAr: "إرجاع منصة ضغط الأرجل ببطء مع بقاء الظهر على المسند" },
    ],
    mistakes: [
      { localPath: "/exercises/reviewed/gym-leg-press-mistake-knee-collapse.webp", altAr: "خطأ: انهيار الركبتين للداخل أثناء ضغط الأرجل" },
      { localPath: "/exercises/reviewed/gym-leg-press-mistake-pelvic-rounding.webp", altAr: "خطأ: تقوس أسفل الظهر وانفصال الحوض عن مسند الجهاز" },
    ],
  },
  {
    exerciseId: "gym-chest-press",
    localPath: "/exercises/reviewed/gym-chest-press-main.webp",
    equipmentVerified: true,
    postureVerified: true,
    reviewedBy: "Visual review of AI-generated illustration; not trainer-certified",
    reviewDate: "2026-10-13",
    altAr: "رجل يؤدي ضغط الصدر على جهاز المقاومة",
    correct: { localPath: "/exercises/reviewed/gym-chest-press-correct.webp", altAr: "الظهر مدعوم والكتفان منخفضان والرسغان مستقيمان والمرفقان دون قفل." },
    comparisons: [{"angleAr":"من الأمام","localPath":"/exercises/reviewed/gym-chest-press-comparison.webp","altAr":"من الأمام: الصحيح الكتفان منخفضان والرسغان مستقيمان؛ الخطأ رفع الكتفين وفتح المرفقين."}],
    steps: [
      { localPath: "/exercises/reviewed/gym-chest-press-step-01-setup.webp", altAr: "رجل جالس على جهاز ضغط الصدر ومرفقاه مثنيان عند مستوى الصدر" },
      { localPath: "/exercises/reviewed/gym-chest-press-step-02-press.webp", altAr: "دفع مقابض جهاز ضغط الصدر للأمام مع رسغين مستقيمين" },
      { localPath: "/exercises/reviewed/gym-chest-press-step-03-return.webp", altAr: "إرجاع مقابض ضغط الصدر ببطء إلى مستوى منتصف الصدر" },
    ],
    mistakes: [
      { localPath: "/exercises/reviewed/gym-chest-press-mistake-shoulders.webp", altAr: "خطأ: رفع الكتفين وفتح المرفقين عاليًا في ضغط الصدر" },
      { localPath: "/exercises/reviewed/gym-chest-press-mistake-lockout.webp", altAr: "خطأ: رفع الكتفين وقفل المرفقين بعنف عند نهاية الدفع" },
    ],
  },
  {
    exerciseId: "gym-lat-pulldown",
    localPath: "/exercises/reviewed/gym-lat-pulldown-main.webp",
    equipmentVerified: true,
    postureVerified: true,
    reviewedBy: "Visual review of AI-generated illustration; not trainer-certified",
    reviewDate: "2026-10-13",
    altAr: "رجل يؤدي السحب العلوي على الجهاز",
    correct: { localPath: "/exercises/reviewed/gym-lat-pulldown-correct.webp", altAr: "البار أمام الجسم، الجذع شبه ثابت، والكتفان منخفضان أثناء السحب." },
    comparisons: [{"angleAr":"من الخلف","localPath":"/exercises/reviewed/gym-lat-pulldown-comparison.webp","altAr":"من الخلف: الصحيح الجذع ثابت والكتفان منخفضان؛ الخطأ التأرجح للخلف وإمالة الجذع."}],
    steps: [
      { localPath: "/exercises/reviewed/gym-lat-pulldown-step-01-setup.webp", altAr: "الجلوس في جهاز السحب العلوي مع تثبيت الفخذين والإمساك بالبار" },
      { localPath: "/exercises/reviewed/gym-lat-pulldown-step-02-pull.webp", altAr: "سحب البار أمام الجسم باتجاه أعلى الصدر" },
      { localPath: "/exercises/reviewed/gym-lat-pulldown-step-03-return.webp", altAr: "إعادة البار إلى الأعلى ببطء مع ثبات الجذع" },
    ],
    mistakes: [
      { localPath: "/exercises/reviewed/gym-lat-pulldown-mistake-behind-neck.webp", altAr: "خطأ: سحب بار الجهاز خلف الرقبة" },
      { localPath: "/exercises/reviewed/gym-lat-pulldown-mistake-swing.webp", altAr: "خطأ: التأرجح للخلف لسحب البار بالزخم" },
    ],
  },
  {
    exerciseId: "gym-seated-row",
    localPath: "/exercises/reviewed/gym-seated-row-main.webp",
    equipmentVerified: true,
    postureVerified: true,
    reviewedBy: "Visual review of AI-generated illustration; not trainer-certified",
    reviewDate: "2026-10-13",
    altAr: "رجل يؤدي التجديف جالسًا على جهاز الكابل",
    correct: { localPath: "/exercises/reviewed/gym-seated-row-correct.webp", altAr: "الظهر محايد والصدر مرفوع والكتفان منخفضان مع سحب المرفقين قرب الجسم." },
    comparisons: [{"angleAr":"من الجانب","localPath":"/exercises/reviewed/gym-seated-row-comparison.webp","altAr":"من الجانب: الصحيح الجذع ثابت والظهر محايد؛ الخطأ الميل للخلف واستخدام الزخم."}],
    steps: [
      { localPath: "/exercises/reviewed/gym-seated-row-step-01-setup.webp", altAr: "الجلوس أمام جهاز التجديف مع تثبيت القدمين ومد الذراعين" },
      { localPath: "/exercises/reviewed/gym-seated-row-step-02-pull.webp", altAr: "سحب مقبض الكابل نحو أسفل الأضلاع مع قرب المرفقين من الجسم" },
      { localPath: "/exercises/reviewed/gym-seated-row-step-03-return.webp", altAr: "مد الذراعين ببطء مع بقاء الظهر محايدًا" },
    ],
    mistakes: [
      { localPath: "/exercises/reviewed/gym-seated-row-mistake-rocking.webp", altAr: "خطأ: التأرجح للخلف واستخدام الزخم في التجديف" },
      { localPath: "/exercises/reviewed/gym-seated-row-mistake-roundback.webp", altAr: "خطأ: تدوير الظهر وتقريب الكتفين عند مد الذراعين" },
    ],
  },
  {
    exerciseId: "gym-leg-curl",
    localPath: "/exercises/reviewed/gym-leg-curl-correct.webp",
    equipmentVerified: true,
    postureVerified: true,
    reviewedBy: "Visual review of AI-generated prone leg-curl illustrations; not trainer-certified",
    reviewDate: "2026-10-13",
    altAr: "من الجانب: أداء ثني الساق مستلقيًا مع بقاء الحوض على المقعد وثني الركبتين",
    correct: { localPath: "/exercises/reviewed/gym-leg-curl-correct.webp", altAr: "وضعية صحيحة: ثني الركبتين على جهاز الساق المستلقي مع ثبات الحوض والفخذين على المسند." },
    comparisons: [{ angleAr: "من الجانب", localPath: "/exercises/reviewed/gym-leg-curl-comparison.webp", altAr: "من الجانب: الصحيح ثبات الحوض على المقعد؛ الخطأ رفع الحوض وتقويس أسفل الظهر." }],
    steps: [],
    mistakes: [],
  },
  {
    exerciseId: "gym-calf-raise",
    localPath: "/exercises/reviewed/gym-calf-raise-main.webp",
    equipmentVerified: true,
    postureVerified: true,
    reviewedBy: "Visual review of AI-generated illustration; not trainer-certified",
    reviewDate: "2026-10-13",
    altAr: "رجل يؤدي رفع السمانة على الجهاز",
    correct: { localPath: "/exercises/reviewed/gym-calf-raise-correct.webp", altAr: "الوزن موزع على مقدمة القدم والكعبان يرتفعان بالتساوي والكاحلان مستقيمان." },
    comparisons: [{"angleAr":"من الخلف","localPath":"/exercises/reviewed/gym-calf-raise-comparison.webp","altAr":"من الخلف: الصحيح رفع الكعبين بالتساوي والكاحلان مستقيمان؛ الخطأ ميل الكاحلين للخارج."}],
    steps: [
      { localPath: "/exercises/reviewed/gym-calf-raise-step-01-setup.webp", altAr: "الوقوف على منصة جهاز السمانة مع وضع مقدمة القدم على الحافة" },
      { localPath: "/exercises/reviewed/gym-calf-raise-step-02-rise.webp", altAr: "رفع الكعبين بالضغط على مقدمة القدم" },
      { localPath: "/exercises/reviewed/gym-calf-raise-step-03-lower.webp", altAr: "خفض الكعبين ببطء إلى مدى مريح أسفل المنصة" },
    ],
    mistakes: [
      { localPath: "/exercises/reviewed/gym-calf-raise-mistake-bouncing.webp", altAr: "خطأ: الارتداد السريع بثني الركبتين ومدى قصير" },
      { localPath: "/exercises/reviewed/gym-calf-raise-mistake-ankles.webp", altAr: "خطأ: ميل الكاحلين للخارج والتحميل على حواف القدمين" },
    ],
  },
  {
    exerciseId: "home-chair-squat",
    localPath: "/exercises/reviewed/home-chair-squat-main.webp",
    equipmentVerified: true,
    postureVerified: true,
    reviewedBy: "Visual review of AI-generated illustration; not trainer-certified",
    reviewDate: "2026-10-13",
    altAr: "رجل يؤدي القرفصاء بمساعدة كرسي",
    correct: { localPath: "/exercises/reviewed/home-chair-squat-correct.webp", altAr: "القدمان ثابتتان والركبتان بمحاذاة القدمين والجلوس يتم بتحكم على كرسي ثابت." },
    comparisons: [{"angleAr":"من الأمام","localPath":"/exercises/reviewed/home-chair-squat-comparison.webp","altAr":"من الأمام: الصحيح الركبتان فوق اتجاه أصابع القدمين؛ الخطأ انهيار الركبتين للداخل."}],
    steps: [
      { localPath: "/exercises/reviewed/home-chair-squat-step-01-setup.webp", altAr: "رجل واقف باستقامة أمام كرسي ثابت وقدماه بعرض الكتفين" },
      { localPath: "/exercises/reviewed/home-chair-squat-step-02-rise.webp", altAr: "النهوض من القرفصاء بمساعدة كرسي مع توجيه الركبتين فوق القدمين" },
      { localPath: "/exercises/reviewed/home-chair-squat-step-03-return.webp", altAr: "الجلوس باتجاه الكرسي ببطء مع إرجاع الوركين للخلف" },
    ],
    mistakes: [
      { localPath: "/exercises/reviewed/home-chair-squat-mistake-knees.webp", altAr: "خطأ: انهيار الركبتين للداخل أثناء القرفصاء" },
      { localPath: "/exercises/reviewed/home-chair-squat-mistake-drop.webp", altAr: "خطأ: السقوط المفاجئ على الكرسي مع انهيار الجذع" },
    ],
  },
  {
    exerciseId: "home-wall-pushup",
    localPath: "/exercises/reviewed/home-wall-pushup-main.webp",
    equipmentVerified: true,
    postureVerified: true,
    reviewedBy: "Visual review of AI-generated illustration; not trainer-certified",
    reviewDate: "2026-10-13",
    altAr: "رجل يؤدي تمرين الضغط على الحائط",
    correct: { localPath: "/exercises/reviewed/home-wall-pushup-correct.webp", altAr: "الرأس والجذع والحوض على خط واحد والكتفان مستقران والمرفقان بزاوية مريحة." },
    comparisons: [{"angleAr":"من الجانب","localPath":"/exercises/reviewed/home-wall-pushup-comparison.webp","altAr":"من الجانب: الصحيح الرأس والجذع والحوض على خط واحد؛ الخطأ هبوط الحوض وتقوس أسفل الظهر."}],
    steps: [
      { localPath: "/exercises/reviewed/home-wall-pushup-step-01-setup.webp", altAr: "رجل يقف مقابل حائط ثابت ويداه عند مستوى الصدر" },
      { localPath: "/exercises/reviewed/home-wall-pushup-step-02-press.webp", altAr: "دفع الجسم بعيدًا عن الحائط مع بقاء الجسم مستقيمًا" },
      { localPath: "/exercises/reviewed/home-wall-pushup-step-03-lower.webp", altAr: "ثني المرفقين للاقتراب من الحائط مع ثبات الجذع" },
    ],
    mistakes: [
      { localPath: "/exercises/reviewed/home-wall-pushup-mistake-hips.webp", altAr: "خطأ: هبوط الحوض وتقوس أسفل الظهر أثناء ضغط الحائط" },
      { localPath: "/exercises/reviewed/home-wall-pushup-mistake-elbows-male.webp", altAr: "خطأ: فتح المرفقين جانبًا ورفع الكتفين" },
    ],
  },
  {
    exerciseId: "home-glute-bridge",
    localPath: "/exercises/reviewed/home-glute-bridge-main.webp",
    equipmentVerified: true,
    postureVerified: true,
    reviewedBy: "Visual review of AI-generated illustration; not trainer-certified",
    reviewDate: "2026-10-13",
    altAr: "رجل يؤدي تمرين الجسر الأرضي",
    correct: { localPath: "/exercises/reviewed/home-glute-bridge-correct.webp", altAr: "الكتفان والقدمان ثابتان والحوض مرتفع دون تقويس مفرط لأسفل الظهر." },
    comparisons: [{"angleAr":"من الجانب","localPath":"/exercises/reviewed/home-glute-bridge-comparison.webp","altAr":"من الجانب: الصحيح رفع الحوض دون تقويس الظهر؛ الخطأ المبالغة في رفع الحوض وتقويس الظهر."}],
    steps: [
      { localPath: "/exercises/reviewed/home-glute-bridge-step-01-setup.webp", altAr: "رجل مستلقٍ على بساط مع ثني الركبتين والقدمين على الأرض" },
      { localPath: "/exercises/reviewed/home-glute-bridge-step-02-lift.webp", altAr: "رفع الحوض حتى يصبح الجذع والفخذان على خط مائل واحد" },
      { localPath: "/exercises/reviewed/home-glute-bridge-step-03-lower.webp", altAr: "خفض الحوض تدريجيًا من وضع الجسر إلى البساط" },
    ],
    mistakes: [
      { localPath: "/exercises/reviewed/home-glute-bridge-mistake-arch.webp", altAr: "خطأ: رفع الحوض أكثر من اللازم وتقويس أسفل الظهر" },
      { localPath: "/exercises/reviewed/home-glute-bridge-mistake-knees.webp", altAr: "خطأ: انهيار الركبتين إلى الداخل أثناء الجسر" },
    ],
  },
  {
    exerciseId: "home-bird-dog",
    localPath: "/exercises/reviewed/home-bird-dog-main.webp",
    equipmentVerified: true,
    postureVerified: true,
    reviewedBy: "Visual review of AI-generated illustration; not trainer-certified",
    reviewDate: "2026-10-13",
    altAr: "رجل يؤدي تمرين bird dog على بساط",
    correct: { localPath: "/exercises/reviewed/home-bird-dog-correct.webp", altAr: "الظهر محايد والحوض مستوٍ والذراع والساق الممدودتان بارتفاع الجذع." },
    comparisons: [{"angleAr":"من الخلف","localPath":"/exercises/reviewed/home-bird-dog-comparison.webp","altAr":"من الخلف: الصحيح الحوض مستوٍ؛ الخطأ تدوير الحوض ورفع أحد جانبيه."}],
    steps: [
      { localPath: "/exercises/reviewed/home-bird-dog-step-01-setup.webp", altAr: "رجل على اليدين والركبتين مع الرسغين تحت الكتفين" },
      { localPath: "/exercises/reviewed/home-bird-dog-step-02-extend.webp", altAr: "مد ذراع وساق متعاكستين مع بقاء الجذع والحوض ثابتين" },
      { localPath: "/exercises/reviewed/home-bird-dog-step-03-return.webp", altAr: "إرجاع اليد والركبة إلى وضع البداية ببطء" },
    ],
    mistakes: [
      { localPath: "/exercises/reviewed/home-bird-dog-mistake-arch.webp", altAr: "خطأ: رفع الساق أعلى من الجذع وتقويس أسفل الظهر" },
      { localPath: "/exercises/reviewed/home-bird-dog-mistake-rotation.webp", altAr: "خطأ: تدوير الحوض جانبًا عند مد الذراع والساق" },
    ],
  },
  {
    exerciseId: "home-calf-raise",
    localPath: "/exercises/reviewed/home-calf-raise-main.webp",
    equipmentVerified: true,
    postureVerified: true,
    reviewedBy: "Visual review of AI-generated illustration; not trainer-certified",
    reviewDate: "2026-10-13",
    altAr: "رجل يؤدي رفع السمانة مستندًا إلى كرسي",
    correct: { localPath: "/exercises/reviewed/home-calf-raise-correct.webp", altAr: "الجذع مستقيم والكاحلان بمحاذاة القدمين والرفع متساوٍ على الجانبين." },
    comparisons: [{"angleAr":"من الخلف","localPath":"/exercises/reviewed/home-calf-raise-comparison.webp","altAr":"من الخلف: الصحيح رفع الكعبين بالتساوي مع ثبات الكاحلين؛ الخطأ ميل الكاحلين للخارج."}],
    steps: [
      { localPath: "/exercises/reviewed/home-calf-raise-step-01-setup.webp", altAr: "رجل واقف بجانب كرسي ثابت وقدماه على الأرض" },
      { localPath: "/exercises/reviewed/home-calf-raise-step-02-rise.webp", altAr: "رفع الكعبين مع الاتزان على مقدمة القدمين" },
      { localPath: "/exercises/reviewed/home-calf-raise-step-03-lower.webp", altAr: "خفض الكعبين حتى الأرض بتحكم" },
    ],
    mistakes: [
      { localPath: "/exercises/reviewed/home-calf-raise-mistake-bouncing.webp", altAr: "خطأ: ارتداد سريع وثني الركبتين لخلق زخم" },
      { localPath: "/exercises/reviewed/home-calf-raise-mistake-lean.webp", altAr: "خطأ: الانحناء والاتكاء بقوة على الكرسي" },
    ],
  },
  {
    exerciseId: "home-march",
    localPath: "/exercises/reviewed/home-march-main.webp",
    equipmentVerified: true,
    postureVerified: true,
    reviewedBy: "Visual review of AI-generated illustration; not trainer-certified",
    reviewDate: "2026-10-13",
    altAr: "رجل يمشي في المكان مع رفع الركبة بالتبادل",
    correct: { localPath: "/exercises/reviewed/home-march-correct.webp", altAr: "الجذع مستقيم والخطوات هادئة والقدم تهبط بلطف مع تحريك الذراع المقابلة." },
    comparisons: [{"angleAr":"من الأمام","localPath":"/exercises/reviewed/home-march-comparison.webp","altAr":"من الأمام: الصحيح جذع مستقيم وخطوة هادئة؛ الخطأ الميل للخلف وضرب الأرض بالقدم."}],
    steps: [
      { localPath: "/exercises/reviewed/home-march-step-01-setup.webp", altAr: "رجل واقف باستقامة وقدماه بعرض الحوض استعدادًا للمشي في المكان" },
      { localPath: "/exercises/reviewed/home-march-step-02-lift.webp", altAr: "رفع ركبة واحدة مع تحريك الذراع المقابلة للأمام" },
      { localPath: "/exercises/reviewed/home-march-step-03-lower.webp", altAr: "إنزال القدم برفق استعدادًا للتبديل إلى الساق الأخرى" },
    ],
    mistakes: [
      { localPath: "/exercises/reviewed/home-march-mistake-lean.webp", altAr: "خطأ: إرجاع الجذع للخلف أثناء رفع الركبة" },
      { localPath: "/exercises/reviewed/home-march-mistake-stomp.webp", altAr: "خطأ: ضرب الأرض بالقدم بقوة عند إنزالها" },
    ],
  },
];

export function getReviewedExerciseMedia(exerciseId: string): ReviewedExerciseMedia | undefined {
  return REVIEWED_EXERCISE_MEDIA.find(
    media => media.exerciseId === exerciseId && EXERCISES.some(exercise => exercise.id === media.exerciseId)
  );
}
