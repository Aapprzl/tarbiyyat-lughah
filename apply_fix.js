const fs = require('fs');
const path = 'd:/PROYEK_WEBSITE/tarbiyyat-lughah/src/components/admin/BlockEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add direction style to question input
const questSearch = 'isArabic(q.question) && "arabic-content text-right transition-all"\r\n                                      )}';
const questSearchLF = 'isArabic(q.question) && "arabic-content text-right transition-all"\n                                      )}';

const questReplace = 'isArabic(q.question) && "arabic-content text-right transition-all"\n                                      )}\n                                      style={{ direction: isArabic(q.question) ? "rtl" : "ltr" }}';

if (content.includes(questSearch)) {
    content = content.replace(questSearch, questReplace);
    console.log('Updated question input (CRLF)');
} else if (content.includes(questSearchLF)) {
    content = content.replace(questSearchLF, questReplace);
    console.log('Updated question input (LF)');
} else {
    console.log('Could not find question input anchor');
}

// 2. Update option inputs (class and direction)
const optSearch = '"w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm pr-10",\r\n                                              q.correct === opt && opt !== "" ? "border-amber-500 ring-2 ring-amber-500/20" : ""';
const optSearchLF = '"w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm pr-10",\n                                              q.correct === opt && opt !== "" ? "border-amber-500 ring-2 ring-amber-500/20" : ""';

const optReplace = '"w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm pr-10 transition-all",\n                                              isArabic(opt) && "arabic-content",\n                                              q.correct === opt && opt !== "" ? "border-amber-500 ring-2 ring-amber-500/20" : ""\n                                            )}\n                                            style={{ direction: isArabic(opt) ? "rtl" : "ltr" }}';

// Note: The option replace is trickier because of the closing parenthesis of the `cn` function.
// Let's refine the option replacement to be more robust.

const optPattern = /className=\{cn\(\s+"w-full bg-slate-100 dark:bg-white\/5 border border-slate-200 dark:border-white\/10 rounded-xl px-3 py-2 text-sm pr-10",\s+q\.correct === opt && opt !== "" \? "border-amber-500 ring-2 ring-amber-500\/20" : ""\s+\)\}/g;

const optReplaceFull = 'className={cn(\n                                              "w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm pr-10 transition-all",\n                                              isArabic(opt) && "arabic-content",\n                                              q.correct === opt && opt !== "" ? "border-amber-500 ring-2 ring-amber-500/20" : ""\n                                            )}\n                                            style={{ direction: isArabic(opt) ? "rtl" : "ltr" }}';

if (optPattern.test(content)) {
    content = content.replace(optPattern, optReplaceFull);
    console.log('Updated option inputs');
} else {
    console.log('Could not find option input pattern');
}

fs.writeFileSync(path, content, 'utf8');
console.log('File saved');
