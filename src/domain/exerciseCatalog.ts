export type ExercisePlace = "gym" | "home";
export type ExerciseRestriction = "knee" | "shoulder";
export interface ExerciseDefinition {
  id: string;
  nameAr: string;
  place: ExercisePlace;
  equipmentAr: string;
  primaryMusclesAr: string[];
  stepsAr: string[];
  mistakesAr: string[];
  restrictions: ExerciseRestriction[];
  /** A lower-demand option for the same movement, not a medical substitute. */
  easierAlternativeId: string | null;
}
/** Offline, static, versioned catalog. No user records or external requests. */
export const EXERCISE_CATALOG_VERSION = 1;
export const EXERCISES: readonly ExerciseDefinition[] = [
  { id:"gym-leg-press",nameAr:"ضغط الأرجل على الجهاز",place:"gym",equipmentAr:"جهاز ضغط الأرجل",primaryMusclesAr:["الفخذ الأمامي","الأرداف"],stepsAr:["اضبط المقعد بحيث لا ينثني الركبتان بشدة.","ضع القدمين بعرض الكتفين على اللوح.","ادفع بهدوء دون قفل الركبتين، ثم ارجع ببطء."],mistakesAr:["رفع الحوض عن المقعد.","قفل الركبتين بقوة.","استخدام وزن يمنع التحكم بالحركة."],restrictions:["knee"],easierAlternativeId:null },
  { id:"gym-chest-press",nameAr:"ضغط الصدر على الجهاز",place:"gym",equipmentAr:"جهاز ضغط الصدر",primaryMusclesAr:["الصدر","العضد الخلفي"],stepsAr:["اضبط المقعد لتكون المقابض قرب منتصف الصدر.","ثبّت الظهر على المسند.","ادفع المقابض ببطء ثم عد بتحكم."],mistakesAr:["رفع الكتفين نحو الأذنين.","فتح المرفقين بصورة مبالغ فيها.","تحريك الظهر عن المسند."],restrictions:["shoulder"],easierAlternativeId:null },
  { id:"gym-lat-pulldown",nameAr:"السحب العلوي",place:"gym",equipmentAr:"جهاز السحب العلوي",primaryMusclesAr:["الظهر","العضد الأمامي"],stepsAr:["اضبط وسادة تثبيت الفخذين.","اسحب المقبض نحو أعلى الصدر مع خفض الكتفين.","أعد الذراعين ببطء دون تأرجح."],mistakesAr:["سحب المقبض خلف الرقبة.","التأرجح بالجذع.","استخدام وزن زائد."],restrictions:["shoulder"],easierAlternativeId:null },
  { id:"gym-seated-row",nameAr:"التجديف جالسًا",place:"gym",equipmentAr:"جهاز التجديف الجالس",primaryMusclesAr:["منتصف الظهر","العضد الأمامي"],stepsAr:["اجلس بظهر محايد وقدميك ثابتتين.","اسحب المقبض نحو الجذع مع تقريب لوحي الكتف.","مد الذراعين ببطء دون تقويس الظهر."],mistakesAr:["التأرجح للأمام والخلف.","رفع الكتفين.","شد الوزن بحركة مفاجئة."],restrictions:["shoulder"],easierAlternativeId:null },
  { id:"gym-leg-curl",nameAr:"ثني الساق على الجهاز",place:"gym",equipmentAr:"جهاز ثني الساق",primaryMusclesAr:["الفخذ الخلفي"],stepsAr:["اضبط محور الجهاز بمحاذاة مفصل الركبة.","اثن الساقين ضمن مدى مريح.","عد ببطء مع ثبات الحوض."],mistakesAr:["رفع الحوض عن المقعد أثناء الثني.","تقويس أسفل الظهر ورفع الصدر للمساعدة.","إرجاع الوزن بسرعة دون تحكم."],restrictions:["knee"],easierAlternativeId:null },
  { id:"gym-calf-raise",nameAr:"رفع الكعبين على الجهاز",place:"gym",equipmentAr:"جهاز السمانة",primaryMusclesAr:["بطة الساق"],stepsAr:["ضع مقدمة القدمين على المنصة بثبات.","ارفع الكعبين ببطء.","اخفضهما بتحكم دون ارتداد."],mistakesAr:["الارتداد السريع.","ثني الركبتين عشوائيًا.","فقدان التوازن."],restrictions:[],easierAlternativeId:"home-calf-raise" },
  { id:"home-chair-squat",nameAr:"الجلوس والوقوف من كرسي",place:"home",equipmentAr:"كرسي ثابت",primaryMusclesAr:["الفخذ الأمامي","الأرداف"],stepsAr:["ضع كرسيًا ثابتًا خلفك.","اثن الوركين والركبتين ببطء حتى تلامس المقعد.","قف بدفع القدمين دون اندفاع."],mistakesAr:["هبوط سريع على المقعد.","انهيار الركبتين للداخل.","كرسي غير ثابت."],restrictions:["knee"],easierAlternativeId:null },
  { id:"home-wall-pushup",nameAr:"الضغط على الحائط",place:"home",equipmentAr:"حائط ثابت",primaryMusclesAr:["الصدر","العضد الخلفي"],stepsAr:["ضع الكفين على الحائط بمستوى الصدر.","اثن المرفقين مع بقاء الجسم مستقيمًا.","ادفع الحائط حتى تستقيم الذراعان براحة."],mistakesAr:["هبوط أسفل الظهر.","رفع الكتفين.","الاقتراب الشديد من الحائط."],restrictions:["shoulder"],easierAlternativeId:null },
  { id:"home-glute-bridge",nameAr:"رفع الحوض",place:"home",equipmentAr:"بساط اختياري",primaryMusclesAr:["الأرداف","الفخذ الخلفي"],stepsAr:["استلقِ مع ثني الركبتين والقدمين على الأرض.","ارفع الحوض بشد الأرداف دون تقويس مبالغ فيه.","انزل ببطء."],mistakesAr:["المبالغة في تقويس أسفل الظهر.","الدفع بالرقبة.","السرعة."],restrictions:[],easierAlternativeId:null },
  { id:"home-bird-dog",nameAr:"مد الذراع والساق المتعاكستين",place:"home",equipmentAr:"بساط اختياري",primaryMusclesAr:["عضلات الجذع","الظهر"],stepsAr:["ابدأ على اليدين والركبتين بوضع مريح.","مد ذراعًا وساقًا متعاكستين دون تدوير الحوض.","عد وبدّل الجهة ببطء."],mistakesAr:["رفع الساق أعلى من الجذع.","تدوير الحوض.","حبس النفس."],restrictions:["shoulder","knee"],easierAlternativeId:null },
  { id:"home-calf-raise",nameAr:"رفع الكعبين واقفًا",place:"home",equipmentAr:"حائط أو كرسي ثابت للتوازن",primaryMusclesAr:["بطة الساق"],stepsAr:["قف باستقامة قرب دعامة ثابتة.","ارفع الكعبين ببطء.","انزل بتحكم."],mistakesAr:["التمايل.","الارتداد.","الاعتماد على كرسي متحرك."],restrictions:[],easierAlternativeId:null },
  { id:"home-march",nameAr:"المشي في المكان",place:"home",equipmentAr:"بدون معدات",primaryMusclesAr:["الساقان"],stepsAr:["قف في مساحة خالية من العوائق.","ارفع القدمين بالتناوب بارتفاع مريح.","حافظ على وتيرة تسمح بالكلام."],mistakesAr:["الاندفاع بسرعة تسبب فقدان التوازن.","رفع الركبة رغم الألم.","حبس النفس."],restrictions:[],easierAlternativeId:null }
] as const;

/** Caution tags are not a diagnosis. Avoid painful movements and seek qualified advice for injuries. */
export const EXERCISE_SAFETY_NOTE_AR = "إذا سبّب التمرين ألمًا، أوقفه. عند وجود إصابة أو ألم مستمر في الركبة أو الكتف، استشر مختصًا قبل أداء التمرين. البدائل الأسهل ليست بالضرورة مناسبة للإصابة.";

export const getExercise = (id: string): ExerciseDefinition | undefined => EXERCISES.find(exercise => exercise.id === id);
export const listExercises = (place?: ExercisePlace): ExerciseDefinition[] =>
  EXERCISES.filter(exercise => place === undefined || exercise.place === place);

/** For plan generation in Task 3: conservatively omit exercises flagged for a joint. */
export function listExercisesForPreferences(
  place: ExercisePlace,
  caution: { knee: boolean; shoulder: boolean },
): ExerciseDefinition[] {
  return listExercises(place).filter(exercise =>
    !(caution.knee && exercise.restrictions.includes("knee")) &&
    !(caution.shoulder && exercise.restrictions.includes("shoulder"))
  );
}
