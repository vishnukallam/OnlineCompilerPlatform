return (
<header
className="md-top-app-bar"
style={{
    minHeight:isMobile ? '56px':'64px',
    display:'flex',
    alignItems:'center',
    justifyContent:'space-between',
    flexWrap:'wrap',
    padding:isMobile ? '8px':'0 16px',
    zIndex:10,
    borderBottom:'1px solid var(--md-sys-color-outline-variant)',
    flexShrink:0,
    gap:'10px'
}}
>

{/* LEFT SIDE */}
<div
style={{
    display:'flex',
    alignItems:'center',
    gap:isMobile ? '8px':'24px',
    flex:1,
    minWidth:0,
    flexWrap:'wrap'
}}
>

<div
style={{
    display:'flex',
    alignItems:'center',
    gap:isMobile ? '6px':'16px'
}}
>
<h1
style={{
    margin:0,
    fontSize:isMobile ? '17px':'var(--md-sys-typescale-title-large-font-size)',
    fontWeight:600,
    color:'var(--md-sys-color-primary)',
    whiteSpace:'nowrap'
}}
>
{isMobile
? 'Online Compiler'
: 'Online Compiler Platform'}
</h1>

{!isMobile && (
<button
className="md-icon-button"
onClick={()=>setIsAboutOpen(true)}
>
<span className="material-symbols-rounded">
info
</span>
</button>
)}
</div>

<div
style={{
    position:'relative',
    display:'flex',
    alignItems:'center',
    flexShrink:1
}}
>

<select
value={language}
onChange={(e)=>{

const lang=e.target.value as Language;

setLanguage(lang);

sessionStorage.setItem(
'last_language',
lang
);

const savedCode=
sessionStorage.getItem(
`code_${lang}`
);

setCode(
savedCode || templates[lang]
);

xterm.current?.clear();

setOutputTab(
'terminal'
);

}}
style={{
    padding:isMobile
    ? '0 28px 0 10px'
    : '0 32px 0 16px',

    height:isMobile
    ? '36px'
    : '40px',

    borderRadius:'8px',

    border:'1px solid var(--md-sys-color-outline)',

    background:'transparent',

    color:'var(--md-sys-color-on-surface)',

    appearance:'none',

    minWidth:isMobile
    ? '110px'
    : '140px',

    maxWidth:isMobile
    ? '130px'
    : '180px',

    flex:'1'
}}
>

<option value="python3.11">Python 3.11</option>
<option value="python3.10">Python 3.10</option>
<option value="java17">Java 17</option>
<option value="java16">Java 16</option>

</select>

<span
className="material-symbols-rounded"
style={{
position:'absolute',
right:'6px',
pointerEvents:'none',
fontSize:'18px'
}}
>
arrow_drop_down
</span>

</div>
</div>

{/* RIGHT SIDE */}

<div
style={{
display:'flex',
alignItems:'center',
gap:'8px',
flexShrink:0
}}
>

<button
className="md-icon-button"
onClick={toggleTheme}
>
<span className="material-symbols-rounded">
{theme==='dark'
? 'light_mode'
: 'dark_mode'}
</span>
</button>

<button
onClick={runCode}
className="md-button md-button--filled"
disabled={isInitializing || isRunning}
style={{
opacity:
(isInitializing || isRunning)
? 0.38
: 1,

cursor:
(isInitializing || isRunning)
? 'not-allowed'
: 'pointer',

minWidth:isMobile
? '75px'
: '120px',

height:isMobile
? '36px'
: '40px',

padding:isMobile
? '0 12px'
: '0 24px',

whiteSpace:'nowrap'
}}
>

{isRunning ? (
<>
<span className="md-circular-progress"></span>

{!isMobile &&
'Executing...'}

</>
) : (
<>
<span
className="material-symbols-rounded"
style={{
fontSize:'18px'
}}
>
play_arrow
</span>

{isMobile
? 'Run'
: 'Execute'}

</>
)}

</button>

</div>

</header>
);
