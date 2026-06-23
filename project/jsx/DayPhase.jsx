// DayPhase.jsx — Dawn, Day, Vote, Hunter phases
const { useState: useStDay } = React;

function DawnPhase() {
  const { state, dispatch, playSound, playingEventId } = useGame();
  const [minutes, setMinutes] = useStDay(5);
  var pending = state.pendingDeaths;

  function causeLabel(c) {
    return c==='wolves'?'Dévoré·e par les Loups-Garous'
      : c==='witch'?'Victime de la Sorcière'
      : c==='lovers'?'Mort·e de chagrin (amoureux·se)'
      : c==='hunter'?'Abattu·e par le Chasseur'
      : c==='sister'?'Tué·e par la Sœur survivante (vengeance)'
      : c==='lynch'?'Lynché·e'
      : 'Éliminé·e';
  }

  // Montreur d'Ours — grogne si un voisin direct (cercle) est un Loup
  var ordered = state.players.slice().sort(function(a,b){return a.id-b.id;});
  var bearKeepers = state.players.filter(function(p){ return p.role==='MONTREUR_OURS' && p.alive; });
  var bearReports = bearKeepers.map(function(bk){
    var idx = ordered.findIndex(function(p){return p.id===bk.id;});
    var n = ordered.length;
    var left = ordered[(idx-1+n)%n], right = ordered[(idx+1)%n];
    function wolf(p){ var rd=window.ROLES_DATA[p.role]; return p.alive && rd && (rd.team==='loupgarou'||rd.team==='loupblanc'); }
    var growls = wolf(left) || wolf(right);
    return { id: bk.id, growls: growls, left: left.id, right: right.id };
  });

  var deadAll = state.players.filter(function(p){ return !p.alive; });

  // — Détection d'une condition de victoire (le MJ valide ensuite) —
  var possibleWins = window.checkWinConditions(state.players);
  var win = possibleWins[0] || null;
  var winSoundPlaying = win && playingEventId === win.soundEvent;

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{flexShrink:0,padding:'14px 16px 8px',textAlign:'center'}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:'11px',letterSpacing:'0.4em',color:'var(--text-muted)',textTransform:'uppercase'}}>
          ☀️ Lever du jour · Nuit {state.nightCount}
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'0 16px',display:'flex',flexDirection:'column',gap:'10px'}}>
        <div style={{width:'100%',maxWidth:'440px',margin:'0 auto',display:'flex',flexDirection:'column',gap:'10px'}}>

          {/* ── Condition de victoire détectée ── */}
          {win && (
            <div style={{background:'linear-gradient(180deg, '+win.color+'1f, rgba(212,160,23,0.06))',border:'2px solid '+win.color+'aa',borderRadius:'14px',padding:'15px 16px',display:'flex',flexDirection:'column',gap:'12px',boxShadow:'0 0 30px '+win.color+'33, inset 0 0 0 1px '+win.color+'33'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <span style={{fontSize:'34px',lineHeight:1,flexShrink:0}}>{win.emoji}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:'10px',letterSpacing:'0.22em',color:'var(--gold)',textTransform:'uppercase'}}>Condition de victoire atteinte</div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:'19px',fontWeight:700,color:win.color,marginTop:'2px'}}>{win.title} {possibleWins.length>1?'?':''}</div>
                </div>
                <button onClick={function(){playSound(win.soundEvent);}}
                  title="Jouer le son de victoire"
                  style={{flexShrink:0,width:'42px',height:'40px',background:winSoundPlaying?win.color+'33':win.color+'18',border:'1px solid '+win.color+'88',borderRadius:'9px',cursor:'pointer',fontSize:'16px',color:win.color}}>
                  {winSoundPlaying?'■':'▶'}
                </button>
              </div>
              <div style={{fontSize:'14px',color:'var(--text)',fontFamily:"'Crimson Text',serif",lineHeight:1.45}}>{win.reason}</div>
              <div style={{display:'flex',gap:'8px'}}>
                <button onClick={function(){playSound(win.soundEvent);dispatch({type:'DECLARE_WIN',win:win});}}
                  style={{flex:1,padding:'12px',background:win.color,border:'none',borderRadius:'10px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'12px',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'#0a0410',boxShadow:'0 0 20px '+win.color+'55'}}>
                  ✓ Valider la victoire
                </button>
                <button onClick={function(){dispatch({type:'DISMISS_WIN'});}}
                  style={{flexShrink:0,padding:'12px 14px',background:'transparent',border:'1px solid rgba(180,30,60,0.3)',borderRadius:'10px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'11px',color:'var(--text-muted)',letterSpacing:'0.06em'}}>
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* Morts */}
          {pending.length===0 ? (
            <div style={{textAlign:'center',padding:'24px 0'}}>
              <div style={{fontSize:'46px',marginBottom:'12px'}}>😌</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:'19px',fontWeight:600,color:'var(--text)',marginBottom:'6px'}}>Nuit calme</div>
              <div style={{fontSize:'15px',color:'var(--text-muted)',fontFamily:"'Crimson Text',serif",fontStyle:'italic'}}>Aucune victime — le village s'éveille paisiblement.</div>
            </div>
          ) : (
            <>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:'16px',fontWeight:700,color:'#ef4444',textAlign:'center'}}>
                {pending.length===1?'Une victime cette nuit':pending.length+' victimes cette nuit'}
              </div>
              {pending.map(function(death){
                var player=state.players.find(function(p){return p.id===death.playerId;});
                var role=player?window.ROLES_DATA[player.role]:null;
                return (
                  <div key={death.id} style={{background:'rgba(180,20,20,0.1)',border:'1px solid rgba(220,50,50,0.32)',borderRadius:'12px',padding:'13px 15px',display:'flex',alignItems:'center',gap:'13px'}}>
                    <span style={{fontSize:'30px',lineHeight:1}}>{role?role.emoji:'💀'}</span>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:'15px',fontWeight:600,color:'var(--text)'}}>Joueur {player?player.id:'?'}</div>
                      <div style={{fontSize:'13px',color:role?role.color:'var(--text-muted)',marginTop:'2px',fontFamily:"'Crimson Text',serif"}}>était {role?role.name:'inconnu'}</div>
                      <div style={{fontSize:'12px',color:'var(--text-dim)',marginTop:'2px',fontFamily:"'Crimson Text',serif",fontStyle:'italic'}}>{causeLabel(death.cause)}</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Répercussions (amoureux, transformations) */}
          {state.dawnNotes && state.dawnNotes.length>0 && (
            <div style={{background:'rgba(167,139,250,0.08)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:'12px',padding:'11px 14px',display:'flex',flexDirection:'column',gap:'5px'}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:'11px',letterSpacing:'0.1em',color:'#a78bfa',textTransform:'uppercase'}}>Répercussions</div>
              {state.dawnNotes.map(function(note,i){
                return <div key={i} style={{fontSize:'13px',color:'var(--text)',fontFamily:"'Crimson Text',serif"}}>{note}</div>;
              })}
            </div>
          )}

          {/* Montreur d'Ours */}
          {bearReports.map(function(r){
            return (
              <div key={r.id} style={{background:r.growls?'rgba(161,98,7,0.14)':'rgba(120,113,108,0.08)',border:'1px solid '+(r.growls?'rgba(161,98,7,0.5)':'rgba(120,113,108,0.3)'),borderRadius:'12px',padding:'11px 14px',display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'24px'}}>🐻</span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:'13px',fontWeight:600,color:r.growls?'#d99a3a':'var(--text)'}}>
                    {r.growls?'L\'Ours GROGNE 🔊':'L\'Ours reste silencieux'}
                  </div>
                  <div style={{fontSize:'12px',color:'var(--text-dim)',fontFamily:"'Crimson Text',serif",fontStyle:'italic',marginTop:'1px'}}>
                    Montreur J{r.id} — voisins J{r.left} &amp; J{r.right}
                  </div>
                </div>
                <button onClick={function(){playSound('role_MONTREUR_OURS');}}
                  style={{flexShrink:0,width:'38px',height:'36px',background:'rgba(161,98,7,0.14)',border:'1px solid rgba(161,98,7,0.5)',borderRadius:'8px',cursor:'pointer',fontSize:'14px',color:'#d99a3a'}}>▶</button>
              </div>
            );
          })}

          {/* Chasseur */}
          {state.hunterDying&&(
            <div style={{background:'rgba(251,146,60,0.09)',border:'1px solid rgba(251,146,60,0.3)',borderRadius:'12px',padding:'13px'}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:'13px',color:'#fb923c',marginBottom:'10px',textAlign:'center'}}>🏹 Le Chasseur (J{state.hunterDying}) peut tirer — choisissez sa cible</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(70px,1fr))',gap:'6px'}}>
                {state.players.filter(function(p){return p.alive&&p.id!==state.hunterDying;}).map(function(p){
                  var rdp=window.ROLES_DATA[p.role];
                  return (
                    <button key={p.id} onClick={function(){dispatch({type:'HUNTER_SHOOT',playerId:p.id});playSound('hunter_shot');}}
                      style={{padding:'8px 6px',background:'rgba(251,146,60,0.1)',border:'1px solid rgba(251,146,60,0.3)',borderRadius:'8px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'11px',color:'#fb923c',display:'flex',flexDirection:'column',alignItems:'center',gap:'3px'}}>
                      <span style={{fontSize:'16px'}}>{rdp&&rdp.emoji}</span>
                      <span style={{fontWeight:600}}>J{p.id}</span>
                      {rdp&&<span style={{fontSize:'9px',color:rdp.color,fontFamily:"'Crimson Text',serif",textAlign:'center',lineHeight:1.15}}>{rdp.name}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer : minutes + commencer les débats */}
      <div style={{flexShrink:0,borderTop:'1px solid rgba(180,30,60,0.12)',padding:'12px 16px 16px',background:'rgba(4,2,8,0.6)'}}>
        <div style={{maxWidth:'440px',margin:'0 auto',display:'flex',flexDirection:'column',gap:'10px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px'}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:'12px',color:'var(--text-muted)',letterSpacing:'0.06em'}}>⏱️ Durée du débat</span>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <button onClick={function(){setMinutes(Math.max(1,minutes-1));}}
                style={{width:'30px',height:'30px',borderRadius:'7px',background:'rgba(180,30,60,0.12)',border:'1px solid rgba(180,30,60,0.3)',color:'var(--text)',cursor:'pointer',fontSize:'16px',lineHeight:1}}>−</button>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'18px',fontWeight:700,color:'var(--text)',minWidth:'58px',textAlign:'center'}}>{minutes} min</span>
              <button onClick={function(){setMinutes(Math.min(30,minutes+1));}}
                style={{width:'30px',height:'30px',borderRadius:'7px',background:'rgba(180,30,60,0.12)',border:'1px solid rgba(180,30,60,0.3)',color:'var(--text)',cursor:'pointer',fontSize:'16px',lineHeight:1}}>+</button>
            </div>
          </div>
          <button onClick={function(){dispatch({type:'START_DEBATE',seconds:minutes*60});}} disabled={!!state.hunterDying}
            style={{width:'100%',padding:'14px',background:state.hunterDying?'transparent':'var(--red)',border:'1px solid '+(state.hunterDying?'rgba(70,55,40,0.3)':'transparent'),borderRadius:'10px',cursor:state.hunterDying?'not-allowed':'pointer',fontFamily:"'Cinzel',serif",fontSize:'13px',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:state.hunterDying?'var(--text-dim)':'#fff',transition:'all 0.2s',boxShadow:state.hunterDying?'none':'0 0 24px rgba(196,30,58,0.22)'}}>
            {state.hunterDying?'En attente du Chasseur…':'🗣️ Commencer les débats'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DayPhase() {
  const { state, dispatch, playSound } = useGame();
  var alive = state.players.filter(function(p){return p.alive;}).length;
  var dead = state.players.length - alive;
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'8px 14px',borderBottom:'1px solid rgba(180,30,60,0.1)',flexShrink:0,display:'flex',alignItems:'center',gap:'10px'}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:'11px',letterSpacing:'0.18em',color:'var(--text-muted)',textTransform:'uppercase'}}>Jour {state.nightCount}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:'11px',color:'var(--text-dim)'}}>·</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:'11px',color:'#34d399'}}>{alive} en vie</span>
        {dead>0&&<><span style={{color:'var(--text-dim)'}}>·</span><span style={{fontFamily:"'Cinzel',serif",fontSize:'11px',color:'#ef4444'}}>{dead} mort{dead>1?'s':''}</span></>}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'10px',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:'7px',alignContent:'start'}}>
        {state.players.map(function(player){
          var rd=window.ROLES_DATA[player.role];
          return (
            <div key={player.id} style={{background:player.alive?'rgba(10,4,18,0.85)':'rgba(4,2,8,0.7)',border:'1px solid '+(player.alive?'rgba(180,30,60,0.18)':'rgba(55,35,45,0.18)'),borderRadius:'10px',padding:'10px 7px',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',position:'relative',opacity:player.alive?1:0.38,transition:'opacity 0.3s'}}>
              <span style={{fontSize:'20px',lineHeight:1}}>{rd&&rd.emoji}</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:'10px',fontWeight:600,color:'var(--text)',textAlign:'center',lineHeight:1.25,wordBreak:'break-word'}}>{player.name}</span>
              {rd&&(
                <span style={{fontSize:'9px',color:rd.color,fontFamily:"'Cinzel',serif",textAlign:'center',lineHeight:1.2}}>{player.originRole==='CHIEN_LOUP'?'Chien-Loup'+(player.clCamp?' ('+(player.clCamp==='Loup'?'Loup':'Village')+')':''):rd.name}</span>
              )}
              {player.cursed&&player.alive&&<span style={{position:'absolute',top:'-5px',right:'-5px',fontSize:'11px'}}>🐦‍⬛</span>}
              {player.lovers&&player.alive&&<span style={{position:'absolute',bottom:'3px',right:'4px',fontSize:'9px'}}>💘</span>}
              {!player.alive&&<span style={{position:'absolute',top:'-5px',right:'-5px',fontSize:'11px'}}>💀</span>}
            </div>
          );
        })}
      </div>
      <div style={{padding:'10px 14px',borderTop:'1px solid rgba(180,30,60,0.12)',flexShrink:0}}>
        <button onClick={function(){dispatch({type:'START_VOTE'});playSound('vote_start');}}
          style={{width:'100%',padding:'13px',background:'rgba(196,30,58,0.14)',border:'1px solid rgba(196,30,58,0.42)',borderRadius:'9px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'12px',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text)',transition:'all 0.2s'}}>
          🗳️ Commencer le vote
        </button>
      </div>
    </div>
  );
}

function VotePhase() {
  const { state, dispatch, playSound } = useGame();
  var eligible = state.players.filter(function(p){return p.alive&&!p.idiotRevealed;});
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(180,30,60,0.12)',flexShrink:0,textAlign:'center'}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:'13px',letterSpacing:'0.22em',color:'var(--text-muted)',textTransform:'uppercase'}}>Qui sera lynché ?</div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'10px 12px',display:'flex',flexDirection:'column',gap:'6px'}}>
        {eligible.map(function(player){
          var rd=window.ROLES_DATA[player.role];
          return (
            <div key={player.id} style={{display:'flex',alignItems:'center',gap:'10px',background:'rgba(10,4,18,0.85)',border:'1px solid rgba(180,30,60,0.16)',borderRadius:'10px',padding:'10px 14px'}}>
              <span style={{fontSize:'22px'}}>{rd&&rd.emoji}</span>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:'15px',fontWeight:600,color:'var(--text)'}}>Joueur {player.id}</span>
                  {player.cursed&&<span style={{fontFamily:"'Cinzel',serif",fontSize:'11px',color:'#9ca3af'}}>(maudit +2)</span>}
                </div>
                {rd&&<div style={{fontSize:'13px',color:rd.color,fontFamily:"'Crimson Text',serif",marginTop:'1px'}}>{rd.name}</div>}
              </div>
              <button onClick={function(){dispatch({type:'ELIMINATE_PLAYER',playerId:player.id});playSound('death_day');}}
                style={{padding:'7px 14px',background:'rgba(196,30,58,0.14)',border:'1px solid rgba(196,30,58,0.4)',borderRadius:'8px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'10px',color:'#ef4444',letterSpacing:'0.08em',transition:'all 0.2s'}}>
                Éliminer
              </button>
            </div>
          );
        })}
      </div>
      <div style={{padding:'10px 12px',borderTop:'1px solid rgba(180,30,60,0.12)',flexShrink:0}}>
        <button onClick={function(){dispatch({type:'SKIP_VOTE'});}}
          style={{width:'100%',padding:'11px',background:'transparent',border:'1px solid rgba(180,30,60,0.2)',borderRadius:'9px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'11px',color:'var(--text-muted)',letterSpacing:'0.08em'}}>
          Pas de vote cette nuit
        </button>
      </div>
    </div>
  );
}

function HunterPhase() {
  const { state, dispatch, playSound } = useGame();
  var hunter = state.players.find(function(p){return p.id===state.hunterDying;});
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'safe center',overflowY:'auto',padding:'24px 20px'}}>
      <div style={{fontSize:'52px',marginBottom:'16px'}}>🏹</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:'20px',fontWeight:700,color:'#fb923c',marginBottom:'8px',textAlign:'center'}}>{hunter?hunter.name:''} — Le Chasseur</div>
      <div style={{fontSize:'15px',color:'var(--text-muted)',fontFamily:"'Crimson Text',serif",marginBottom:'32px',textAlign:'center',fontStyle:'italic'}}>Avant de mourir, il désigne un joueur à abattre.</div>
      <div style={{width:'100%',maxWidth:'360px',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:'8px'}}>
        {state.players.filter(function(p){return p.alive&&p.id!==state.hunterDying;}).map(function(p){
          var rd=window.ROLES_DATA[p.role];
          return (
            <button key={p.id} onClick={function(){dispatch({type:'HUNTER_SHOOT',playerId:p.id});playSound('hunter_shot');}}
              style={{padding:'12px 8px',background:'rgba(251,146,60,0.1)',border:'1px solid rgba(251,146,60,0.32)',borderRadius:'10px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
              <span style={{fontSize:'22px'}}>{rd&&rd.emoji}</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:'13px',fontWeight:600,color:'#fb923c'}}>Joueur {p.id}</span>
              {rd&&<span style={{fontSize:'11px',color:rd.color,fontFamily:"'Crimson Text',serif",textAlign:'center',lineHeight:1.2}}>{rd.name}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VictoryScreen() {
  const { state, dispatch, playSound, playingEventId } = useGame();
  var win = state.victory || { title:'Victoire', emoji:'🏆', color:'#d4a017', reason:'', soundEvent:'win_village', players:[] };
  var winners = (win.players || []).map(function(id){
    var p = state.players.find(function(x){ return x.id === id; });
    var rd = p ? window.ROLES_DATA[p.role] : null;
    return { id:id, role: rd };
  });
  var soundPlaying = playingEventId === win.soundEvent;
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'safe center',overflowY:'auto',padding:'32px 22px',position:'relative'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 80% 50% at 50% 30%, '+win.color+'22 0%, transparent 65%)',pointerEvents:'none'}}/>
      <div style={{position:'relative',width:'100%',maxWidth:'400px',display:'flex',flexDirection:'column',alignItems:'center',gap:'14px'}}>
        <div style={{fontSize:'72px',lineHeight:1}}>{win.emoji}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:'11px',letterSpacing:'0.4em',color:'var(--gold)',textTransform:'uppercase'}}>Victoire</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:'30px',fontWeight:700,color:win.color,textAlign:'center',lineHeight:1.1,textShadow:'0 0 24px '+win.color+'55'}}>{win.title}</div>
        <div style={{fontSize:'15px',color:'var(--text-muted)',fontFamily:"'Crimson Text',serif",textAlign:'center',lineHeight:1.5,fontStyle:'italic'}}>{win.reason}</div>

        {winners.length>0 && (
          <div style={{width:'100%',display:'flex',flexWrap:'wrap',gap:'8px',justifyContent:'center',marginTop:'4px'}}>
            {winners.map(function(w){
              return (
                <div key={w.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 13px',background:'rgba(10,4,18,0.85)',border:'1px solid '+win.color+'55',borderRadius:'10px'}}>
                  <span style={{fontSize:'20px'}}>{w.role?w.role.emoji:'🏆'}</span>
                  <div style={{display:'flex',flexDirection:'column'}}>
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:'13px',fontWeight:600,color:'var(--text)'}}>Joueur {w.id}</span>
                    {w.role && <span style={{fontSize:'11px',color:w.role.color,fontFamily:"'Crimson Text',serif"}}>{w.role.name}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={function(){playSound(win.soundEvent);}}
          style={{marginTop:'8px',display:'flex',alignItems:'center',gap:'9px',padding:'10px 18px',background:soundPlaying?win.color+'2a':'transparent',border:'1px solid '+win.color+'88',borderRadius:'10px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'12px',letterSpacing:'0.08em',color:win.color}}>
          <span style={{fontSize:'14px'}}>{soundPlaying?'■':'▶'}</span> Son de victoire
        </button>

        <button onClick={function(){dispatch({type:'RESET_GAME'});}}
          style={{marginTop:'10px',width:'100%',padding:'14px',background:'var(--red)',border:'none',borderRadius:'11px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'13px',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'#fff',boxShadow:'0 0 24px rgba(196,30,58,0.3)'}}>
          🏠 Nouvelle partie
        </button>
        <button onClick={function(){dispatch({type:'DISMISS_WIN'});dispatch({type:'CONFIRM_DAWN'});}}
          style={{width:'100%',padding:'10px',background:'transparent',border:'1px solid rgba(180,30,60,0.25)',borderRadius:'10px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'11px',color:'var(--text-muted)',letterSpacing:'0.06em'}}>
          Reprendre la partie
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { DawnPhase, DayPhase, VotePhase, HunterPhase, VictoryScreen });
