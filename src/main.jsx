import React,{useEffect,useMemo,useState}from'react';
import{createRoot}from'react-dom/client';
import{BrowserRouter,useNavigate,useParams,Link,NavLink,Routes,Route,useSearchParams}from'react-router-dom';
import{ArrowRight,Film,Menu,X,Play,Upload,LogOut,ShieldCheck,Trash2,Star,ExternalLink,CheckCircle2,Clock3,UserRound,BriefcaseBusiness,MessageSquare,Copy,Check, Ban, Eye, Users, Image as ImageIcon}from'lucide-react';
import'./styles.css';

const API = import.meta.env.VITE_API_URL || '/api';
const gradients=['g1','g2','g3','g4','g5','g6','g7','g8'];
const categories=['Commercial','Motion Design','Social','Graphics','Documentary','3D / VFX'];

function auth(){try{return JSON.parse(localStorage.getItem('vidoraAuth'))}catch{return null}}
function save(a){a?localStorage.setItem('vidoraAuth',JSON.stringify(a)):localStorage.removeItem('vidoraAuth')}
async function api(url,opt={}){
  const a=auth(); const h={...(opt.headers||{})};
  if(a?.token)h.Authorization='Bearer '+a.token;
  const r=await fetch(API+url,{...opt,headers:h});
  const d=await r.json().catch(()=>({message:'Unexpected server response'}));
  if(!r.ok)throw Error(d.message||'Request failed');
  return d;
}
function assetUrl(url){return url?.startsWith('http')?url:url||''}

function App(){
 const[user,setUser]=useState(auth());
 const logout=()=>{save(null);setUser(null)};
 return <><Nav user={user} logout={logout}/><Routes>
  <Route path="/" element={<Home/>}/><Route path="/work" element={<Work/>}/>
  <Route path="/editor/:slug" element={<PublicEditor/>}/><Route path="/about" element={<About/>}/>
  <Route path="/contact" element={<Contact/>}/><Route path="/auth/:role" element={<Auth setUser={setUser}/>}/>
  <Route path="/editor" element={<Editor user={user}/>}/><Route path="/client" element={<Client user={user}/>}/>
  <Route path="/admin" element={<Admin user={user}/>}/>
  <Route path="*" element={<NotFound/>}/>
 </Routes><Footer/></>
}
function Nav({user,logout}){
 const[open,setOpen]=useState(false);
 const dashboard=user?.role==='editor'?'/editor':user?.role==='admin'?'/admin':'/client';
 return <header><nav className="nav"><Link className="brand" to="/" onClick={()=>setOpen(false)}><span className="logo"><Film/></span>VIDORA<span>.</span></Link>
 <button className="mobile" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
 <div className={'links '+(open?'show':'')}>
  <NavLink to="/work" onClick={()=>setOpen(false)}>Work</NavLink><NavLink to="/about" onClick={()=>setOpen(false)}>About</NavLink><NavLink to="/contact" onClick={()=>setOpen(false)}>Contact</NavLink>
  {!user?<><Link to="/auth/client" onClick={()=>setOpen(false)}>Client Login</Link><Link className="btn sm" to="/auth/editor" onClick={()=>setOpen(false)}>Join as Editor <ArrowRight size={15}/></Link></>
  :<><Link to={dashboard} onClick={()=>setOpen(false)}>Dashboard</Link><button className="btn ghost sm" onClick={()=>{logout();setOpen(false)}}><LogOut size={15}/>Logout</button></>}
 </div></nav></header>
}
function Home(){
 return <main><section className="hero"><div className="grid"/><div className="glow one"/><div className="glow two"/><div className="heroIn">
  <div className="eyebrow">✦ VIDEO EDITING · MOTION · DESIGN</div><h1>We turn raw footage into <span>scroll-stopping stories.</span></h1>
  <p>A curated creative studio connecting brands and creators with sharp editors, motion designers and visual storytellers.</p>
  <div className="actions"><Link className="btn" to="/work">Explore our work <ArrowRight/></Link><Link className="text" to="/contact">Start a project →</Link></div>
  <div className="stats"><b>120+<small>Projects delivered</small></b><b>30+<small>Creative specialists</small></b><b>24–48h<small>Typical first cut</small></b></div>
 </div></section>
 <section className="section"><div className="sectionHead"><div><div className="eyebrow">SELECTED WORK</div><h2>The work speaks louder.</h2></div><p>Anonymous public showcase. Every featured piece is manually curated by the studio.</p></div><WorkGrid featured/><div className="center"><Link className="btn outline" to="/work">View all work <ArrowRight/></Link></div></section>
 <section className="process"><div className="section"><div className="eyebrow">OUR PROCESS</div><h2>From footage to final frame.</h2><div className="processGrid">{[['01','Brief'],['02','Craft'],['03','Review'],['04','Deliver']].map(([n,t])=><div key={n}><i>{n}</i><h3>{t}</h3><p>Clear communication, focused creative work and clean delivery.</p></div>)}</div></div></section>
 </main>
}
function Work(){return <main className="page"><div className="pageHead"><div className="eyebrow">PUBLIC SHOWCASE</div><h1>Work, without the noise.</h1><p>Editor identities stay private. Public work is presented under Vidora Creative.</p></div><WorkGrid/></main>}

function WorkGrid({featured=false}){
  const [w,setW]=useState([]);
  const [cat,setCat]=useState('All');
  const [selected,setSelected]=useState(null);

  useEffect(()=>{
    api('/portfolio/public')
      .then(setW)
      .catch(()=>setW([]));
  },[]);

  const shown=useMemo(
    ()=>w.filter(
      x=>
        (!featured || x.featured) &&
        (cat==='All' || x.category===cat)
    ),
    [w,cat,featured]
  );

  return (
    <div>
      <div className="filters">
        {['All',...categories].map(c=>(
          <button
            key={c}
            className={cat===c?'active':''}
            onClick={()=>setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="workGrid">
        {shown.map((x,i)=>(
          <button
            className="card workCard"
            key={x._id}
            onClick={()=>setSelected(x)}
          >
            <div className="visual workVisual">

              {x.assetType==='video' ? (
                <video
                  src={assetUrl(x.assetUrl)}
                  muted
                  playsInline
                  preload="metadata"
                  onMouseEnter={e=>{
                    e.currentTarget.play().catch(()=>{});
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.pause();
                    e.currentTarget.currentTime=0;
                  }}
                />
              ) : (
                <img
                  src={assetUrl(x.assetUrl)}
                  alt={x.title}
                  loading="lazy"
                />
              )}

              <div className="visualOverlay">
                {x.assetType==='video' && (
                  <span className="play">
                    <Play fill="currentColor" size={20}/>
                  </span>
                )}
              </div>

              <span className="categoryTag">
                {x.category}
              </span>

              {x.featured && (
                <b className="featuredTag">
                  <Star size={12}/>
                  Featured
                </b>
              )}
            </div>

            <div className="workCardInfo">
              <h3>{x.title}</h3>
              <small>VIDORA CREATIVE</small>

              {x.description && (
                <p>{x.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {!shown.length && (
        <div className="empty">
          {w.length
            ? 'No work in this category yet.'
            : 'No public work yet. Approved and featured submissions will appear here.'
          }
        </div>
      )}

      {selected && (
        <WorkModal
          item={selected}
          close={()=>setSelected(null)}
        />
      )}
    </div>
  );
}
function WorkModal({item,close}){
 return <div className="modalBack" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div className="modal">
  <button className="modalClose" onClick={close}><X/></button><div className="modalMedia">
   {item.assetType==='video'?<video src={assetUrl(item.assetUrl)} controls autoPlay playsInline/>:<img src={assetUrl(item.assetUrl)} alt={item.title}/>}
  </div><div className="modalBody"><div className="eyebrow">{item.category} · VIDORA CREATIVE</div><h2>{item.title}</h2><p>{item.description||'A selected piece from the Vidora Creative showcase.'}</p><Link className="btn" to={'/contact?project='+encodeURIComponent(item.title)}>Start a project like this <ArrowRight/></Link></div>
 </div></div>
}
function PublicEditor(){
 const{slug}=useParams();const[d,setD]=useState(null);const[err,setErr]=useState('');
 useEffect(()=>{api('/portfolio/editor/'+slug).then(setD).catch(e=>setErr(e.message))},[slug]);
 return <main className="page">{d?<><div className="profileHero"><div className="avatar">{d.editor.name?.[0]}</div><div><div className="eyebrow">EDITOR PORTFOLIO</div><h1>{d.editor.name}</h1><p>{d.editor.bio||'Creative editor and visual storyteller.'}</p><div className="chips">{[...(d.editor.software||[]),...(d.editor.skills||[])].map(x=><span key={x}>{x}</span>)}</div></div></div>
 <div className="sectionHead"><div><div className="eyebrow">SELECTED WORK</div><h2>Portfolio.</h2></div><Link className="btn" to="/contact">Work with Vidora <ArrowRight/></Link></div>
 <div className="workGrid">{d.works.map((x,i)=><div className="card" key={x._id}><div className="visual workVisual">
  {x.assetType==='video' ? (
    <video
      src={assetUrl(x.assetUrl)}
      muted
      playsInline
      preload="metadata"
    />
  ) : (
    <img
      src={assetUrl(x.assetUrl)}
      alt={x.title}
      loading="lazy"
    />
  )}

  {x.assetType==='video' && (
    <div className="visualOverlay">
      <span className="play">
        <Play fill="currentColor" size={20}/>
      </span>
    </div>
  )}

  <span className="categoryTag">
    {x.category}
  </span>
</div><h3>{x.title}</h3><small>VIDORA CREATIVE</small></div>)}</div>
 {!d.works.length&&<div className="empty">This editor has no approved public work yet.</div>}</>:<div className="empty">{err||'Loading portfolio…'}</div>}</main>
}
function About(){return <main className="page"><div className="pageHead"><div className="eyebrow">ABOUT VIDORA</div><h1>Small studio energy.<br/><span>Big-screen thinking.</span></h1><p>Vidora is a creative video editing agency built around a curated network of editors and motion designers. Clients work with the studio; editors build their own private-to-public portfolios.</p></div><div className="aboutGrid">{[['Curated talent','Editors across Premiere Pro, After Effects, DaVinci, design and motion.'],['Studio quality','Submissions are reviewed before publication and can be featured manually.'],['Built for speed','Clear briefs, focused review cycles and organized delivery.']].map(([a,b])=><div className="aboutCard" key={a}><ShieldCheck/><h3>{a}</h3><p>{b}</p></div>)}</div></main>}
function Contact(){
 const[params]=useSearchParams();const[status,setStatus]=useState('');const user=auth();
 async function submit(e){e.preventDefault();const form=e.currentTarget;const data=Object.fromEntries(new FormData(form));try{await api('/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});setStatus('success');form.reset()}catch(x){setStatus(x.message)}}
 return <main className="page contact"><div><div className="eyebrow">START A PROJECT</div><h1>Tell us what you're <span>building.</span></h1><p>Share the brief and we'll route it through the studio. You can inquire as a guest or while signed in as a client.</p><div className="contactPoints"><div><MessageSquare/>Agency-managed communication</div><div><Clock3/>Clear review and response workflow</div><div><ShieldCheck/>Editor identities stay private in public showcase</div></div></div>
 <form className="form" onSubmit={submit}>{status==='success'?<div className="notice success"><CheckCircle2/> Inquiry received — the studio will contact you.</div>:status&&<div className="notice error">{status}</div>}
 <label>Name<input name="name" required defaultValue={user?.name||''}/></label><label>Email<input type="email" name="email" required defaultValue={user?.email||''}/></label><label>Company<input name="company" placeholder="Optional"/></label>
<label>
  Project
  <select name="projectTitle" defaultValue={params.get('project') || ''}>
    <option value="">Select project type</option>

    {params.get('project') &&
      ![
        'Video editing',
        'Short-form / Reels',
        'Motion design',
        'Brand film',
        'Graphic design',
        'Other'
      ].includes(params.get('project')) && (
        <option value={params.get('project')}>
          {params.get('project')}
        </option>
      )}

    <option>Video editing</option>
    <option>Short-form / Reels</option>
    <option>Motion design</option>
    <option>Brand film</option>
    <option>Graphic design</option>
    <option>Other</option>
  </select>
</label>
 <label>Budget<select name="budget"><option>₹10k–₹20k</option><option>₹20k–₹50k</option><option>₹50k–₹1L</option><option>₹1L+</option></select></label>
 <label>Requirement<textarea name="requirement" required rows="6" placeholder="Tell us about the footage, deliverables, style and deadline."/></label>
 <button className="btn">Send inquiry <ArrowRight/></button></form></main>
}
function Auth({setUser}){
 const{role}=useParams(),nav=useNavigate();const[mode,setMode]=useState('login');const[busy,setBusy]=useState(false);const[f,setF]=useState({name:'',email:'',password:''});
 async function submit(e){e.preventDefault();setBusy(true);try{const d=await api('/auth/'+(mode==='login'?'login':'register'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...f,role})});const session={token:d.token,...d.user};save(session);setUser(session);nav(role==='editor'?'/editor':role==='admin'?'/admin':'/client')}catch(x){alert(x.message)}finally{setBusy(false)}}
 return <main className="authPage"><form className="auth" onSubmit={submit}><div className="eyebrow">{role.toUpperCase()} PORTAL</div><h1>{mode==='login'?'Welcome back.':'Create your account.'}</h1>
 {mode==='register'&&<label>Name<input required value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label>}<label>Email<input required type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></label><label>Password<input required minLength="6" type="password" value={f.password} onChange={e=>setF({...f,password:e.target.value})}/></label>
 <button className="btn full" disabled={busy}>{busy?'Please wait…':mode==='login'?'Login':'Register'} {!busy&&<ArrowRight/>}</button>
 <button type="button" className="switch" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'New here? Create an account':'Already registered? Login'}</button></form></main>
}
function Guard({user,role,children}){if(!user||user.role!==role)return <main className="authPage"><div className="auth"><div className="eyebrow">{role.toUpperCase()} AREA</div><h1>Login required</h1><p>This dashboard is protected.</p><Link className="btn" to={'/auth/'+role}>Go to login <ArrowRight/></Link></div></main>;return children}

function Editor({user}){return <Guard user={user} role="editor"><EditorInner/></Guard>}
function EditorInner(){
 const[me,setMe]=useState(null),[works,setWorks]=useState([]),[saving,setSaving]=useState(false),[copied,setCopied]=useState(false),[loading,setLoading]=useState(true);
 async function load(){try{const[a,b]=await Promise.all([api('/auth/me'),api('/portfolio/mine')]);setMe(a.user);setWorks(b)}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 async function upload(e){e.preventDefault();const fd=new FormData(e.currentTarget);try{await api('/portfolio',{method:'POST',body:fd});await load();e.currentTarget.reset();alert('Work submitted for admin review.')}catch(x){alert(x.message)}}
 async function del(id){if(!confirm('Delete this submission?'))return;try{await api('/portfolio/'+id,{method:'DELETE'});await load()}catch(x){alert(x.message)}}
 async function saveProfile(e){e.preventDefault();setSaving(true);try{const f=e.currentTarget;const data={name:f.name.value,education:f.education.value,experience:f.experience.value,bio:f.bio.value,skills:f.skills.value.split(',').map(x=>x.trim()).filter(Boolean),software:f.software.value.split(',').map(x=>x.trim()).filter(Boolean)};const x=await api('/auth/profile',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const session=auth();save({...session,...x.user});setMe(x.user);alert('Profile saved.')}catch(x){alert(x.message)}finally{setSaving(false)}}
 const completeness=me?Math.round(([me.name,me.bio,me.education,me.experience,(me.skills||[]).length,(me.software||[]).length].filter(Boolean).length/6)*100):0;
 const link=me?.slug?`${window.location.origin}/editor/${me.slug}`:'';
 async function copy(){if(!link)return;await navigator.clipboard.writeText(link);setCopied(true);setTimeout(()=>setCopied(false),1500)}
 return <main className="page dash"><div className="dashTop"><div><div className="eyebrow">EDITOR DASHBOARD</div><h1>{me?.name||'Your'} creative workspace.</h1><p>Your public portfolio: {link?<a href={link} target="_blank" rel="noreferrer">/editor/{me.slug} <ExternalLink size={13}/></a>:'Complete your profile to generate a link.'}</p></div>{link&&<button className="btn outline" onClick={copy}>{copied?<Check size={16}/>:<Copy size={16}/>} {copied?'Copied':'Copy portfolio link'}</button>}</div>
 <div className="dashGrid"><section className="panel"><h2>Upload portfolio work</h2><p>Max 250 MB · MP4/MOV/JPG/PNG. Every upload starts as <b>Pending</b> and needs admin approval.</p><form onSubmit={upload} className="form"><input name="title" required placeholder="Project title"/><select name="category" defaultValue="Social">{categories.map(c=><option key={c}>{c}</option>)}</select><textarea name="description" placeholder="Short description"/><input name="file" required type="file" accept=".mp4,.mov,.jpg,.jpeg,.png,video/mp4,video/quicktime,image/jpeg,image/png"/><button className="btn"><Upload size={16}/> Submit for review</button></form></section>
 <section className="panel"><div className="panelTitle"><h2>Your work</h2><span className="count">{works.length}</span></div>{loading?<div className="empty">Loading…</div>:works.map((x,i)=><div className="row" key={x._id}><div className={'thumb '+gradients[i%8]}>{x.assetType==='video'?<Play size={14}/>:<ImageIcon size={14}/>}</div><div><b>{x.title}</b><small>{x.category}</small></div><em className={x.approvalStatus}>{x.approvalStatus}</em>{x.approvalStatus==='approved'&&x.featured?<span className="featuredTiny"><Star size={11}/> Featured</span>:<span/>}<button className="icon" title="Delete" onClick={()=>del(x._id)}><Trash2 size={15}/></button></div>)}{!loading&&!works.length&&<div className="empty">Upload your first piece above.</div>}</section></div>
 <section className="panel profile"><div className="panelTitle"><div><h2>Profile</h2><p className="sub">This information powers your shareable editor portfolio.</p></div><div className="progress"><span style={{width:completeness+'%'}}/><b>{completeness}%</b></div></div>
 <form onSubmit={saveProfile}><input name="name" defaultValue={me?.name||''} placeholder="Full name"/><input name="education" defaultValue={me?.education||''} placeholder="Education background"/><input name="experience" defaultValue={me?.experience||''} placeholder="Years / experience"/><input name="skills" defaultValue={(me?.skills||[]).join(', ')} placeholder="Skills, comma separated"/><input name="software" defaultValue={(me?.software||[]).join(', ')} placeholder="Software: Premiere Pro, After Effects..."/><textarea name="bio" defaultValue={me?.bio||''} placeholder="Short professional bio"/><button className="btn" disabled={saving}>{saving?'Saving…':'Save profile'}</button></form></section>
 </main>
}

function Client({user}){return <Guard user={user} role="client"><ClientInner/></Guard>}
function ClientInner(){
 const[inq,setInq]=useState([]);
 useEffect(()=>{api('/inquiries/mine').then(setInq).catch(()=>setInq([]))},[]);
 return <main className="page"><div className="dashTop"><div><div className="eyebrow">CLIENT DASHBOARD</div><h1>Find the right creative direction.</h1><p>Browse anonymous studio-curated work and send inquiries through Vidora.</p></div><Link className="btn" to="/contact">Start project <ArrowRight/></Link></div><WorkGrid/><section className="panel clientInq"><div className="panelTitle"><div><h2>My inquiries</h2><p className="sub">Track the requests you've sent to the studio.</p></div></div>{inq.length?inq.map(i=><div className="inquiryCard" key={i._id}><div><b>{i.projectTitle||'Project inquiry'}</b><small>{i.requirement}</small></div><em className={i.status}>{i.status}</em><span>{i.budget}</span></div>):<div className="empty">No inquiries yet. When you're ready, start a project.</div>}</section></main>
}

function Admin({user}){return <Guard user={user} role="admin"><AdminInner/></Guard>}
function AdminInner(){
 const[o,setO]=useState(null),[works,setWorks]=useState([]),[editors,setEditors]=useState([]),[clients,setClients]=useState([]),[inq,setInq]=useState([]),[tab,setTab]=useState('works');
 async function load(){try{const[a,b,c,d,e]=await Promise.all([api('/admin/overview'),api('/admin/works'),api('/admin/editors'),api('/admin/clients'),api('/admin/inquiries')]);setO(a);setWorks(b);setEditors(c);setClients(d);setInq(e)}catch(x){alert(x.message)}}
 useEffect(()=>{load()},[]);
 async function moderate(id,patch){try{await api('/admin/works/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch)});await load()}catch(x){alert(x.message)}}
 async function removeWork(id){if(!confirm('Delete this work permanently?'))return;await api('/admin/works/'+id,{method:'DELETE'});load()}
 async function status(id,status){await api('/admin/users/'+id+'/status',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});load()}
 async function updateInquiry(id,current){const next=current==='new'?'contacted':current==='contacted'?'closed':'new';await api('/admin/inquiries/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:next})});load()}
 const pending=works.filter(x=>x.approvalStatus==='pending').length;
 return <main className="page dash"><div className="adminHead"><div><div className="eyebrow">ADMIN PANEL</div><h1>Studio control center.</h1><p>Review submissions, curate public work and manage studio activity.</p></div><button className="btn outline" onClick={load}>Refresh</button></div>
 <div className="metrics">{[['Editors',o?.editors,UserRound],['Clients',o?.clients,Users],['Works',o?.works,BriefcaseBusiness],['Pending',o?.pending??pending,Clock3],['Inquiries',o?.inquiries,MessageSquare]].map(([label,value,I])=><div key={label}><I size={17}/><b>{value??'—'}</b><small>{label}</small></div>)}</div>
 <div className="adminTabs">{[['works','Portfolio moderation'],['editors','Editors'],['clients','Clients'],['inquiries','Client inquiries']].map(([id,label])=><button className={tab===id?'active':''} onClick={()=>setTab(id)} key={id}>{label}</button>)}</div>
 {tab==='works'&&<section className="panel"><div className="panelTitle"><div><h2>Portfolio moderation</h2><p className="sub">Approve or reject work, then manually feature approved pieces on the public showcase.</p></div></div>{works.length?works.map((x,i)=><div className="adminWork" key={x._id}><div className={'adminPreview '+gradients[i%8]}>{x.assetType==='video'?<video src={assetUrl(x.assetUrl)} muted controls preload="metadata"/>:<img src={assetUrl(x.assetUrl)} alt=""/>}</div><div className="adminWorkInfo"><div className="eyebrow">{x.category} · {x.assetType}</div><h3>{x.title}</h3><p>{x.description||'No description provided.'}</p><small>Editor: {x.editor?.name||'Unknown'} · {x.editor?.email||''}</small><div className="adminActions"><em className={x.approvalStatus}>{x.approvalStatus}</em>{x.approvalStatus!=='approved'&&<button className="mini approve" onClick={()=>moderate(x._id,{approvalStatus:'approved'})}><CheckCircle2 size={13}/> Approve</button>}{x.approvalStatus!=='rejected'&&<button className="mini reject" onClick={()=>moderate(x._id,{approvalStatus:'rejected',featured:false})}><Ban size={13}/> Reject</button>}{x.approvalStatus==='approved'&&<button className={'mini '+(x.featured?'selected':'')} onClick={()=>moderate(x._id,{featured:!x.featured})}><Star size={13}/> {x.featured?'Featured':'Feature publicly'}</button>}<button className="icon" onClick={()=>removeWork(x._id)}><Trash2 size={15}/></button></div></div></div>):<div className="empty">No portfolio submissions yet.</div>}</section>}
 {tab==='editors'&&<UserTable title="Editors" users={editors} onStatus={status}/>}
 {tab==='clients'&&<UserTable title="Clients" users={clients} onStatus={status}/>}
 {tab==='inquiries'&&<section className="panel"><div className="panelTitle"><div><h2>Client inquiries</h2><p className="sub">Agency-level inquiries from registered clients and guests.</p></div></div>{inq.length?inq.map(i=><div className="inquiryAdmin" key={i._id}><div><div className="eyebrow">{i.projectTitle||'PROJECT INQUIRY'}</div><h3>{i.name} <small>{i.email}</small></h3><p>{i.requirement}</p><span>{i.company||'No company'} · {i.budget}</span></div><div className="inquiryAdminSide"><em className={i.status}>{i.status}</em><button className="mini" onClick={()=>updateInquiry(i._id,i.status)}>{i.status==='closed'?'Reopen':'Update status'}</button></div></div>):<div className="empty">No client inquiries yet.</div>}</section>}
 </main>
}
function UserTable({title,users,onStatus}){return <section className="panel"><div className="panelTitle"><div><h2>{title}</h2><p className="sub">{users.length} account{users.length===1?'':'s'}</p></div></div>{users.length?users.map(e=><div className="row userRow" key={e._id}><div className="avatar small">{e.name?.[0]}</div><div><b>{e.name}</b><small>{e.email}</small></div><span className={e.status}>{e.status}</span><button className="mini" onClick={()=>onStatus(e._id,e.status==='blocked'?'active':'blocked')}>{e.status==='blocked'?'Unblock':'Block'}</button></div>):<div className="empty">No {title.toLowerCase()} registered yet.</div>}</section>}
function NotFound(){return <main className="authPage"><div className="auth"><div className="eyebrow">404</div><h1>Page not found.</h1><Link className="btn" to="/">Back home <ArrowRight/></Link></div></main>}
function Footer(){return <footer><div><Link className="brand" to="/"><span className="logo"><Film/></span>VIDORA.</Link><p>Creative editing, motion and design — curated by the studio.</p></div><div><Link to="/work">Work</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></div><span>© 2026 Vidora Creative</span></footer>}
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
