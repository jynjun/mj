// RoleConfig.jsx — Per-player role assignment (pre-filled randomly, manually adjustable)
const { useState: useStPRA } = React;

function PlayerRoleAssign() {
  const { state, dispatch } = useGame();
  const [pickerFor, setPickerFor] = useStPRA(null);

  var allDone = state.players.every(function(p) { return p.role !== null; });
  var assignedCount = state.players.filter(function(p) { return p.role !== null; }).length;
  var totalCount = state.players.length;

  // Enfant Sauvage rule check
  var hasEnfant = state.players.some(function(p) { return p.role === 'ENFANT_SAUVAGE'; });
  var hasGuardian = state.players.some(function(p) { return p.role === 'MONTREUR_OURS' || p.role === 'RENARD'; });
  var enfantWarning = hasEnfant && !hasGuardian;

  function reshuffle() {
    var pool = window.getRandomRolePool ? window.getRandomRolePool(state.players.length) : [];
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    pool.forEach(function(roleId, idx) {
      dispatch({ type:'ASSIGN_PLAYER_ROLE', playerId: idx+1, roleId: roleId });
    });
  }

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>

      {/* Header */}
      <div style={{padding:'14px 18px 12px',borderBottom:'1px solid rgba(180,30,60,0.15)',display:'flex',alignItems:'center',gap:'12px',flexShrink:0}}>
        <button onClick={function(){dispatch({type:'SET_SCREEN',screen:'home'});}} style={{background:'transparent',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:'20px',padding:'4px',lineHeight:1}}>←</button>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'15px',fontWeight:600,color:'var(--text)'}}>Assignation des rôles</div>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'3px'}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:'13px',fontWeight:700,color:allDone?'#34d399':'var(--gold)'}}>{assignedCount}/{totalCount}</span>
            <span style={{fontSize:'13px',color:'var(--text-muted)',fontFamily:"'Crimson Text',serif"}}>rôles assignés</span>
          </div>
        </div>
        <button onClick={reshuffle} title="Nouveau tirage aléatoire"
          style={{padding:'6px 12px',background:'rgba(212,160,23,0.1)',border:'1px solid rgba(212,160,23,0.3)',borderRadius:'8px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'11px',color:'var(--gold)',letterSpacing:'0.06em',flexShrink:0,display:'flex',alignItems:'center',gap:'5px'}}>
          🎲 Nouveau tirage
        </button>
      </div>

      {/* Enfant Sauvage warning */}
      {enfantWarning && (
        <div style={{padding:'8px 16px',background:'rgba(251,146,60,0.1)',borderBottom:'1px solid rgba(251,146,60,0.28)',display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
          <span style={{fontSize:'14px'}}>⚠️</span>
          <span style={{fontFamily:"'Crimson Text',serif",fontSize:'13px',color:'#fb923c',lineHeight:1.35}}>L'Enfant Sauvage requiert un <strong>Montreur d'Ours</strong> ou un <strong>Renard</strong>.</span>
        </div>
      )}

      {/* Player list */}
      <div style={{flex:1,overflowY:'auto',padding:'10px 14px',display:'flex',flexDirection:'column',gap:'6px'}}>
        {state.players.map(function(player) {
          var role = player.role ? window.ROLES_DATA[player.role] : null;
          return (
            <button key={player.id} onClick={function(){setPickerFor(player.id);}}
              style={{display:'flex',alignItems:'center',gap:'12px',padding:'11px 14px',background:role?role.bgColor:'rgba(10,4,18,0.8)',border:'1px solid '+(role?role.color+'38':'rgba(180,30,60,0.18)'),borderRadius:'10px',cursor:'pointer',textAlign:'left',transition:'all 0.18s',width:'100%'}}>
              {/* Player number — large and clear */}
              <div style={{fontFamily:"'Cinzel',serif",fontSize:'16px',fontWeight:700,color:'var(--text)',minWidth:'36px',flexShrink:0,lineHeight:1}}>{player.id}</div>
              {role ? (
                <>
                  <span style={{fontSize:'22px',lineHeight:1,flexShrink:0}}>{role.emoji}</span>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:'13px',fontWeight:600,color:role.color,flex:1}}>{role.name}</span>
                </>
              ) : (
                <>
                  <span style={{fontSize:'20px',lineHeight:1,flexShrink:0,opacity:0.3}}>·</span>
                  <span style={{fontFamily:"'Crimson Text',serif",fontSize:'15px',color:'var(--text-dim)',flex:1,fontStyle:'italic'}}>Choisir un rôle…</span>
                </>
              )}
              <span style={{color:'var(--text-dim)',fontSize:'13px',flexShrink:0}}>▾</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{padding:'10px 14px 20px',borderTop:'1px solid rgba(180,30,60,0.15)',flexShrink:0,display:'flex',flexDirection:'column',gap:'8px'}}>
        {enfantWarning && (
          <div style={{fontSize:'12px',color:'rgba(251,146,60,0.7)',fontFamily:"'Crimson Text',serif",fontStyle:'italic',textAlign:'center'}}>
            Corrigez l'avertissement avant de continuer
          </div>
        )}
        <button onClick={function(){dispatch({type:'START_GAME'});}}
          disabled={enfantWarning}
          style={{width:'100%',padding:'14px',background:enfantWarning?'rgba(60,20,28,0.5)':'var(--red)',border:'1px solid '+(enfantWarning?'rgba(180,30,60,0.18)':'transparent'),borderRadius:'10px',cursor:enfantWarning?'not-allowed':'pointer',fontFamily:"'Cinzel',serif",fontSize:'13px',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:enfantWarning?'var(--text-dim)':'#fff',transition:'all 0.2s',boxShadow:enfantWarning?'none':'0 0 30px rgba(196,30,58,0.25)'}}>
          Commencer la partie →
        </button>
      </div>

      {/* Role picker */}
      {pickerFor !== null && (
        <RolePicker
          playerId={pickerFor}
          players={state.players}
          onSelect={function(roleId){
            dispatch({type:'ASSIGN_PLAYER_ROLE',playerId:pickerFor,roleId:roleId});
            setPickerFor(null);
          }}
          onClose={function(){setPickerFor(null);}}
        />
      )}
    </div>
  );
}

function RolePicker({ playerId, players, onSelect, onClose }) {
  var currentPlayer = players.find(function(p){return p.id===playerId;});
  var cats = ['Village','Loup-Garou','Solitaire'];
  var bycat = {};
  cats.forEach(function(c){bycat[c]=[];});
  Object.values(window.ROLES_DATA).forEach(function(r){
    if(bycat[r.category]) bycat[r.category].push(r);
  });
  // Count per role EXCLUDING current player's current role
  var counts = {};
  players.forEach(function(p){
    if(p.role && p.id !== playerId) counts[p.role] = (counts[p.role]||0) + 1;
  });

  return (
    <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'flex-end',zIndex:200,backdropFilter:'blur(4px)'}}
      onClick={onClose}>
      <div style={{width:'100%',maxHeight:'82vh',background:'rgba(8,3,14,0.99)',borderTop:'1px solid rgba(180,30,60,0.35)',borderRadius:'16px 16px 0 0',display:'flex',flexDirection:'column',overflow:'hidden'}}
        onClick={function(e){e.stopPropagation();}}>

        {/* Sheet header */}
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(180,30,60,0.15)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:'14px',fontWeight:700,color:'var(--text)'}}>Joueur {playerId}</div>
            {currentPlayer && currentPlayer.role && window.ROLES_DATA[currentPlayer.role] && (
              <div style={{fontSize:'12px',color:'var(--text-muted)',fontFamily:"'Crimson Text',serif",marginTop:'2px'}}>
                Rôle actuel : {window.ROLES_DATA[currentPlayer.role].emoji} {window.ROLES_DATA[currentPlayer.role].name}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{background:'transparent',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:'22px',padding:'2px',lineHeight:1}}>×</button>
        </div>

        {/* Roles list by category */}
        <div style={{flex:1,overflowY:'auto',padding:'6px 14px 14px'}}>
          {cats.map(function(cat){
            var roles = bycat[cat];
            if(!roles||!roles.length) return null;
            return (
              <div key={cat} style={{marginTop:'14px'}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:'10px',letterSpacing:'0.3em',color:'var(--text-dim)',textTransform:'uppercase',marginBottom:'6px',paddingLeft:'2px'}}>{cat}</div>
                <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                  {roles.map(function(role){
                    var active = currentPlayer && currentPlayer.role === role.id;
                    var usedCount = counts[role.id] || 0;
                    return (
                      <button key={role.id} onClick={function(){onSelect(role.id);}}
                        style={{display:'flex',alignItems:'center',gap:'12px',padding:'9px 12px',background:active?role.bgColor:'rgba(10,4,18,0.7)',border:'1px solid '+(active?role.color+'60':'rgba(180,30,60,0.12)'),borderRadius:'9px',cursor:'pointer',textAlign:'left',transition:'all 0.15s',width:'100%'}}>
                        <span style={{fontSize:'22px',lineHeight:1,flexShrink:0}}>{role.emoji}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
                            <span style={{fontFamily:"'Cinzel',serif",fontSize:'13px',fontWeight:600,color:active?role.color:'var(--text)'}}>{role.name}</span>
                            {usedCount > 0 && (
                              <span style={{fontFamily:"'Cinzel',serif",fontSize:'10px',color:role.color,background:role.color+'22',border:'1px solid '+(role.color+'55'),padding:'1px 7px',borderRadius:'10px',flexShrink:0,fontWeight:700}}>
                                ×{usedCount} déjà assigné{usedCount > 1 ? 's' : ''}
                              </span>
                            )}
                            {active && <span style={{fontSize:'11px',color:role.color,marginLeft:'auto'}}>✓ actuel</span>}
                          </div>
                          <div style={{fontSize:'12px',color:'var(--text-muted)',marginTop:'2px',fontFamily:"'Crimson Text',serif",lineHeight:1.3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{role.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PlayerRoleAssign, RoleConfigScreen: PlayerRoleAssign });
