// SoundConfigModal.jsx — Library + per-profile assignment
const { useState: useStSM2, useRef: useRefSM } = React;

function SoundConfigModal() {
  const { state, dispatch, playSound } = useGame();
  const [tab, setTab] = useStSM2('library'); // 'library' | 'assign'
  const [editingSound, setEditingSound] = useStSM2(null); // soundId being renamed
  const [editSoundName, setEditSoundName] = useStSM2('');
  const [editingProfile, setEditingProfile] = useStSM2(false);
  const [editProfileName, setEditProfileName] = useStSM2('');
  const [newProfileName, setNewProfileName] = useStSM2('');
  const [showNewProfile, setShowNewProfile] = useStSM2(false);
  const fileInputRef = useRefSM(null);

  var events = window.SOUND_EVENTS_FULL || [];
  var library = state.soundLibrary || {};
  var profiles = state.soundProfiles || [];
  var currentProfileId = state.soundProfile;
  var currentProfile = profiles.find(function(p) { return p.id === currentProfileId; });

  // Group events by category
  var cats = [];
  var bycat = {};
  events.forEach(function(e) {
    if (!bycat[e.category]) { bycat[e.category] = []; cats.push(e.category); }
    bycat[e.category].push(e);
  });

  var libraryList = Object.keys(library).map(function(id) { return Object.assign({ id: id }, library[id]); });

  function handleImport(e) {
    var files = Array.from(e.target.files || []);
    files.forEach(function(file) {
      var reader = new FileReader();
      reader.onload = function(ev) {
        var id = 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        var name = file.name.replace(/\.[^.]+$/, '');
        dispatch({ type: 'ADD_SOUND', id: id, name: name, dataURL: ev.target.result });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  function playSoundDirect(soundId) {
    var sound = library[soundId];
    if (!sound || !sound.dataURL) return;
    try { new Audio(sound.dataURL).play().catch(function(){}); } catch(e) {}
  }

  function getSoundName(soundId) {
    return library[soundId] ? library[soundId].name : '—';
  }

  function getAssignment(eventId) {
    return currentProfile ? (currentProfile.assignments[eventId] || '') : '';
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.78)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'16px',backdropFilter:'blur(6px)'}}
      onClick={function(e){if(e.target===e.currentTarget)dispatch({type:'CLOSE_SOUND_MODAL'});}}>
      <div style={{background:'rgba(8,3,14,0.99)',border:'1px solid rgba(180,30,60,0.3)',borderRadius:'16px',width:'100%',maxWidth:'460px',maxHeight:'92vh',display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Header */}
        <div style={{padding:'13px 16px',borderBottom:'1px solid rgba(180,30,60,0.15)',display:'flex',alignItems:'center',gap:'10px',flexShrink:0}}>
          <div style={{flex:1,fontFamily:"'Cinzel',serif",fontSize:'15px',fontWeight:600,color:'var(--text)'}}>Réglages des sons</div>
          <button onClick={function(){dispatch({type:'TOGGLE_SOUND'});}}
            title={state.soundEnabled ? 'Désactiver les sons' : 'Activer les sons'}
            style={{width:'38px',height:'22px',borderRadius:'11px',background:state.soundEnabled?'var(--red)':'rgba(70,45,55,0.6)',border:'none',cursor:'pointer',position:'relative',flexShrink:0,transition:'background 0.2s'}}>
            <div style={{position:'absolute',top:'3px',left:state.soundEnabled?'18px':'3px',width:'16px',height:'16px',borderRadius:'50%',background:'white',transition:'left 0.2s'}}/>
          </button>
          <button onClick={function(){dispatch({type:'CLOSE_SOUND_MODAL'});}} style={{background:'transparent',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:'20px',padding:'2px',lineHeight:1}}>×</button>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',borderBottom:'1px solid rgba(180,30,60,0.12)',flexShrink:0}}>
          {[{id:'library',label:'Bibliothèque'},{id:'assign',label:'Assignations'}].map(function(t) {
            var active = tab === t.id;
            return (
              <button key={t.id} onClick={function(){setTab(t.id);}}
                style={{flex:1,padding:'10px',background:active?'rgba(196,30,58,0.1)':'transparent',border:'none',borderBottom:'2px solid '+(active?'var(--red)':'transparent'),cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'11px',letterSpacing:'0.12em',color:active?'var(--text)':'var(--text-muted)',textTransform:'uppercase',transition:'all 0.15s'}}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── BIBLIOTHÈQUE ── */}
        {tab === 'library' && (
          <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column'}}>
            <div style={{padding:'12px 14px',borderBottom:'1px solid rgba(180,30,60,0.08)',flexShrink:0}}>
              <input type="file" ref={fileInputRef} accept="audio/*" multiple onChange={handleImport} style={{display:'none'}}/>
              <button onClick={function(){fileInputRef.current && fileInputRef.current.click();}}
                style={{width:'100%',padding:'10px',background:'rgba(212,160,23,0.09)',border:'1px dashed rgba(212,160,23,0.4)',borderRadius:'9px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'12px',color:'var(--gold)',letterSpacing:'0.1em',textTransform:'uppercase',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                <span style={{fontSize:'16px'}}>＋</span> Importer des sons
              </button>
              <div style={{fontSize:'12px',color:'var(--text-dim)',fontFamily:"'Crimson Text',serif",textAlign:'center',marginTop:'6px',fontStyle:'italic'}}>MP3, WAV, OGG, AAC — plusieurs fichiers acceptés</div>
            </div>

            {libraryList.length === 0 ? (
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px',gap:'12px'}}>
                <div style={{fontSize:'36px',opacity:0.3}}>🔈</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:'13px',color:'var(--text-dim)',textAlign:'center',lineHeight:1.6}}>Aucun son dans la bibliothèque.<br/>Importez vos fichiers audio.</div>
              </div>
            ) : (
              <div style={{padding:'8px 12px',display:'flex',flexDirection:'column',gap:'4px'}}>
                {libraryList.map(function(sound) {
                  var isEditing = editingSound === sound.id;
                  return (
                    <div key={sound.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'9px 12px',background:'rgba(10,4,18,0.7)',border:'1px solid rgba(180,30,60,0.12)',borderRadius:'8px'}}>
                      <span style={{fontSize:'16px',flexShrink:0}}>🔊</span>
                      {isEditing ? (
                        <input autoFocus value={editSoundName}
                          onChange={function(e){setEditSoundName(e.target.value);}}
                          onBlur={function(){if(editSoundName.trim()){dispatch({type:'RENAME_SOUND',id:sound.id,name:editSoundName.trim()});}setEditingSound(null);}}
                          onKeyDown={function(e){if(e.key==='Enter'){if(editSoundName.trim())dispatch({type:'RENAME_SOUND',id:sound.id,name:editSoundName.trim()});setEditingSound(null);}if(e.key==='Escape')setEditingSound(null);}}
                          style={{flex:1,background:'rgba(180,30,60,0.08)',border:'1px solid rgba(196,30,58,0.4)',borderRadius:'5px',outline:'none',padding:'3px 7px',fontFamily:"'Crimson Text',serif",fontSize:'14px',color:'var(--text)'}}/>
                      ) : (
                        <span style={{flex:1,fontFamily:"'Crimson Text',serif",fontSize:'14px',color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sound.name}</span>
                      )}
                      <button onClick={function(){playSoundDirect(sound.id);}} title="Tester"
                        style={{padding:'3px 7px',background:'transparent',border:'1px solid rgba(180,30,60,0.22)',borderRadius:'5px',cursor:'pointer',fontSize:'10px',color:'var(--text-muted)',flexShrink:0}}>▶</button>
                      <button onClick={function(){setEditingSound(sound.id);setEditSoundName(sound.name);}} title="Renommer"
                        style={{padding:'3px 7px',background:'transparent',border:'1px solid rgba(180,30,60,0.18)',borderRadius:'5px',cursor:'pointer',fontSize:'10px',color:'var(--text-dim)',flexShrink:0}}>✏️</button>
                      <button onClick={function(){dispatch({type:'DELETE_SOUND',id:sound.id});}} title="Supprimer"
                        style={{padding:'3px 7px',background:'transparent',border:'1px solid rgba(180,30,60,0.18)',borderRadius:'5px',cursor:'pointer',fontSize:'10px',color:'rgba(239,68,68,0.5)',flexShrink:0}}>🗑️</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ASSIGNATIONS ── */}
        {tab === 'assign' && (
          <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column'}}>
            {/* Profile management bar */}
            <div style={{padding:'10px 14px',borderBottom:'1px solid rgba(180,30,60,0.1)',flexShrink:0,display:'flex',flexDirection:'column',gap:'8px',background:'rgba(6,2,12,0.6)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'7px'}}>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:'10px',letterSpacing:'0.16em',color:'var(--text-dim)',textTransform:'uppercase',flexShrink:0}}>Profil</span>
                {editingProfile ? (
                  <input autoFocus value={editProfileName}
                    onChange={function(e){setEditProfileName(e.target.value);}}
                    onBlur={function(){if(editProfileName.trim()&&currentProfileId)dispatch({type:'RENAME_PROFILE',id:currentProfileId,name:editProfileName.trim()});setEditingProfile(false);}}
                    onKeyDown={function(e){if(e.key==='Enter'){if(editProfileName.trim()&&currentProfileId)dispatch({type:'RENAME_PROFILE',id:currentProfileId,name:editProfileName.trim()});setEditingProfile(false);}if(e.key==='Escape')setEditingProfile(false);}}
                    style={{flex:1,background:'rgba(180,30,60,0.08)',border:'1px solid rgba(196,30,58,0.4)',borderRadius:'5px',outline:'none',padding:'4px 8px',fontFamily:"'Cinzel',serif",fontSize:'12px',color:'var(--text)'}}/>
                ) : (
                  <select value={currentProfileId}
                    onChange={function(e){dispatch({type:'SELECT_PROFILE',id:e.target.value});}}
                    style={{flex:1,background:'rgba(12,5,20,0.95)',border:'1px solid rgba(180,30,60,0.28)',borderRadius:'7px',color:'var(--text)',fontFamily:"'Cinzel',serif",fontSize:'11px',padding:'5px 8px',cursor:'pointer',outline:'none'}}>
                    {profiles.length === 0 && <option value="">— Aucun profil —</option>}
                    {profiles.map(function(p){return <option key={p.id} value={p.id}>{p.name}</option>;})}
                  </select>
                )}
                {currentProfileId && !editingProfile && (
                  <button onClick={function(){setEditingProfile(true);setEditProfileName(currentProfile?currentProfile.name:'');}} title="Renommer"
                    style={{padding:'5px 8px',background:'transparent',border:'1px solid rgba(180,30,60,0.2)',borderRadius:'6px',cursor:'pointer',fontSize:'12px',color:'var(--text-dim)',flexShrink:0}}>✏️</button>
                )}
                <button onClick={function(){setShowNewProfile(true);setNewProfileName('');}} title="Nouveau profil"
                  style={{padding:'5px 9px',background:'rgba(212,160,23,0.09)',border:'1px solid rgba(212,160,23,0.3)',borderRadius:'6px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'12px',color:'var(--gold)',flexShrink:0}}>+</button>
                {currentProfileId && (
                  <button onClick={function(){if(window.confirm('Supprimer ce profil ?'))dispatch({type:'DELETE_PROFILE',id:currentProfileId});}} title="Supprimer"
                    style={{padding:'5px 8px',background:'transparent',border:'1px solid rgba(180,30,60,0.2)',borderRadius:'6px',cursor:'pointer',fontSize:'12px',color:'rgba(239,68,68,0.5)',flexShrink:0}}>🗑️</button>
                )}
              </div>
              {showNewProfile && (
                <div style={{display:'flex',gap:'7px'}}>
                  <input autoFocus value={newProfileName} placeholder="Nom du profil…"
                    onChange={function(e){setNewProfileName(e.target.value);}}
                    onKeyDown={function(e){if(e.key==='Enter'&&newProfileName.trim()){dispatch({type:'CREATE_PROFILE',name:newProfileName.trim()});setShowNewProfile(false);}if(e.key==='Escape')setShowNewProfile(false);}}
                    style={{flex:1,background:'rgba(180,30,60,0.08)',border:'1px solid rgba(196,30,58,0.4)',borderRadius:'7px',outline:'none',padding:'5px 10px',fontFamily:"'Cinzel',serif",fontSize:'12px',color:'var(--text)'}}/>
                  <button onClick={function(){if(newProfileName.trim()){dispatch({type:'CREATE_PROFILE',name:newProfileName.trim()});setShowNewProfile(false);}}}
                    style={{padding:'5px 12px',background:'var(--red)',border:'none',borderRadius:'7px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'11px',color:'#fff',flexShrink:0}}>Créer</button>
                  <button onClick={function(){setShowNewProfile(false);}}
                    style={{padding:'5px 9px',background:'transparent',border:'1px solid rgba(180,30,60,0.22)',borderRadius:'7px',cursor:'pointer',fontSize:'14px',color:'var(--text-muted)',flexShrink:0}}>×</button>
                </div>
              )}
            </div>

            {/* No profile selected */}
            {!currentProfile && (
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px',gap:'12px'}}>
                <div style={{fontSize:'32px',opacity:0.3}}>🎛️</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:'13px',color:'var(--text-dim)',textAlign:'center',lineHeight:1.6}}>Créez un profil pour<br/>assigner des sons aux événements.</div>
              </div>
            )}

            {/* No sounds in library */}
            {currentProfile && libraryList.length === 0 && (
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 20px',gap:'10px'}}>
                <div style={{fontSize:'28px',opacity:0.3}}>🔈</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:'12px',color:'var(--text-dim)',textAlign:'center',lineHeight:1.6}}>Importez d'abord des sons<br/>dans la Bibliothèque.</div>
              </div>
            )}

            {/* Events list */}
            {currentProfile && libraryList.length > 0 && (
              <div style={{padding:'4px 0'}}>
                {cats.map(function(cat) {
                  return (
                    <div key={cat}>
                      <div style={{padding:'8px 16px 4px',fontFamily:"'Cinzel',serif",fontSize:'9px',letterSpacing:'0.3em',color:'var(--text-dim)',textTransform:'uppercase',background:'rgba(4,1,8,0.5)'}}>{cat}</div>
                      {bycat[cat].map(function(evt) {
                        var currentAssign = getAssignment(evt.id);
                        var assignedSound = currentAssign ? library[currentAssign] : null;
                        return (
                          <div key={evt.id} style={{display:'flex',alignItems:'center',gap:'9px',padding:'8px 14px',borderBottom:'1px solid rgba(180,30,60,0.05)'}}>
                            <span style={{fontSize:'15px',width:'18px',textAlign:'center',flexShrink:0,lineHeight:1}}>{evt.icon}</span>
                            <span style={{flex:1,fontFamily:"'Crimson Text',serif",fontSize:'14px',color:'var(--text)',minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{evt.label}</span>
                            <select value={currentAssign}
                              onChange={function(e){ dispatch({type:'SET_PROFILE_SOUND',eventId:evt.id,soundId:e.target.value||null}); }}
                              style={{background:'rgba(12,5,20,0.95)',border:'1px solid rgba(180,30,60,0.25)',borderRadius:'6px',color:currentAssign?'var(--text)':'var(--text-dim)',fontFamily:"'Cinzel',serif",fontSize:'10px',padding:'4px 6px',cursor:'pointer',outline:'none',maxWidth:'120px',flexShrink:0}}>
                              <option value="">— Aucun —</option>
                              {libraryList.map(function(s){return <option key={s.id} value={s.id}>{s.name}</option>;})}
                            </select>
                            <button onClick={function(){if(currentAssign)playSoundDirect(currentAssign);}}
                              disabled={!currentAssign}
                              style={{padding:'3px 7px',background:'transparent',border:'1px solid rgba(180,30,60,0.2)',borderRadius:'5px',cursor:currentAssign?'pointer':'not-allowed',fontSize:'10px',color:currentAssign?'var(--text-muted)':'var(--text-dim)',opacity:currentAssign?1:0.4,flexShrink:0}}>▶</button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{padding:'10px 14px',borderTop:'1px solid rgba(180,30,60,0.12)',flexShrink:0}}>
          <button onClick={function(){dispatch({type:'CLOSE_SOUND_MODAL'});}}
            style={{width:'100%',padding:'11px',background:'rgba(196,30,58,0.12)',border:'1px solid rgba(196,30,58,0.32)',borderRadius:'9px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'12px',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text)'}}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { SoundConfigModal });
