// GameScreen.jsx — Main game wrapper with header + layout modes
const { useState: useStGS } = React;

function GameScreen() {
  const { state, dispatch, playSound, playingEventId } = useGame();
  const [showHistory, setShowHistory] = useStGS(false);

  var { gamePhase, nightCount, timerSeconds, timerRunning, layoutMode } = state;
  var isNight = gamePhase === 'night' || gamePhase === 'dawn';
  var alive = state.players.filter(function(p){return p.alive;}).length;

  function fmt(s) {
    var m = Math.floor(s/60), sec = s%60;
    return m+':'+(sec<10?'0':'')+sec;
  }

  function phaseLabel() {
    if (gamePhase==='night') return '🌙 Nuit '+nightCount;
    if (gamePhase==='dawn')  return '🌅 Aube';
    if (gamePhase==='day')   return '☀️ Jour '+nightCount;
    if (gamePhase==='vote')  return '🗳️ Vote';
    if (gamePhase==='hunter') return '🏹 Chasseur';
    if (gamePhase==='victory') return '🏆 Victoire';
    return '';
  }

  function PhaseContent() {
    if (gamePhase==='night')  return React.createElement(NightPhase, null);
    if (gamePhase==='dawn')   return React.createElement(DawnPhase, null);
    if (gamePhase==='day')    return React.createElement(DayPhase, null);
    if (gamePhase==='vote')   return React.createElement(VotePhase, null);
    if (gamePhase==='hunter') return React.createElement(HunterPhase, null);
    if (gamePhase==='victory') return React.createElement(VictoryScreen, null);
    return null;
  }

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>

      {/* ── Header nuit ── */}
      {gamePhase === 'night' && (
        <div style={{minHeight:'52px',padding:'6px 12px',display:'flex',alignItems:'center',flexWrap:'wrap',rowGap:'6px',borderBottom:'1px solid rgba(180,30,60,0.16)',background:'rgba(4,2,8,0.96)',flexShrink:0,zIndex:10}}>
          <button onClick={function(){dispatch({type:'BACK_FROM_NIGHT'});}}
            style={{background:'transparent',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:'18px',padding:'4px 8px',lineHeight:1,flexShrink:0}}>
            ←
          </button>
          <div style={{flex:1,display:'flex',justifyContent:'center',alignItems:'center',gap:'10px'}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:'14px',fontWeight:700,letterSpacing:'0.22em',color:'var(--text)'}}>🌙 NUIT {nightCount}</span>
            <button onClick={function(){playSound('night_start');}}
              style={{padding:'5px 12px',background:playingEventId==='night_start'?'rgba(196,30,58,0.18)':'transparent',border:'1px solid '+(playingEventId==='night_start'?'rgba(196,30,58,0.55)':'rgba(180,30,60,0.28)'),borderRadius:'7px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'10px',color:playingEventId==='night_start'?'var(--red-light)':'var(--text-muted)',letterSpacing:'0.12em',transition:'all 0.2s',flexShrink:0}}>
              {playingEventId==='night_start'?'■ Late':'Late'}
            </button>
          </div>
          <div style={{display:'flex',gap:'6px',flexShrink:0}}>
            <button onClick={function(){setShowHistory(!showHistory);}}
              style={{background:'transparent',border:'1px solid rgba(180,30,60,0.22)',borderRadius:'6px',cursor:'pointer',fontSize:'12px',padding:'4px 8px',color:'var(--text-muted)',fontFamily:"'Cinzel',serif"}}>
              📜
            </button>
            <button onClick={function(){dispatch({type:'TOGGLE_SOUND_MODAL'});}}
              style={{background:'transparent',border:'none',cursor:'pointer',fontSize:'16px',padding:'4px',color:state.soundEnabled?'var(--text-muted)':'var(--text-dim)'}}>
              {state.soundEnabled?'🔊':'🔇'}
            </button>
          </div>
        </div>
      )}

      {/* ── Header autres phases ── */}
      {gamePhase !== 'night' && (
        <div style={{minHeight:'52px',padding:'6px 14px',display:'flex',alignItems:'center',gap:'10px',rowGap:'8px',flexWrap:'wrap',borderBottom:'1px solid rgba(180,30,60,0.16)',background:'rgba(4,2,8,0.96)',flexShrink:0,zIndex:10}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',flex:'0 0 auto'}}>
            <div style={{width:'7px',height:'7px',borderRadius:'50%',background:isNight?'rgba(160,60,200,0.85)':'rgba(240,190,50,0.85)',boxShadow:'0 0 8px '+(isNight?'rgba(160,60,200,0.6)':'rgba(240,190,50,0.5)'),animation:'pulse 2s infinite'}}/>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:'13px',fontWeight:600,letterSpacing:'0.16em',color:'var(--text)'}}>{phaseLabel()}</span>
          </div>
          <div style={{padding:'3px 8px',background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.28)',borderRadius:'12px',fontFamily:"'Cinzel',serif",fontSize:'10px',color:'#34d399',letterSpacing:'0.1em',flex:'0 0 auto'}}>
            {alive} vivants
          </div>
          <div style={{flex:1}}/>
          {(gamePhase==='day'||gamePhase==='vote') && (
            <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'17px',fontWeight:600,color:timerSeconds>0&&timerSeconds<=10?'#ef4444':timerSeconds===0?'var(--text-dim)':'var(--text)',transition:'color 0.3s',minWidth:'44px',textAlign:'right'}}>
                {timerSeconds>0?fmt(timerSeconds):'—'}
              </span>
              <div style={{display:'flex',gap:'3px'}}>
                {[120,300,600].map(function(s){
                  return (
                    <button key={s} onClick={function(){dispatch({type:'TIMER_SET',seconds:s});}}
                      style={{padding:'3px 6px',background:'transparent',border:'1px solid rgba(180,30,60,0.22)',borderRadius:'4px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'9px',color:'var(--text-muted)',letterSpacing:'0.05em'}}>
                      {s/60}m
                    </button>
                  );
                })}
                <button onClick={function(){
                    if(timerSeconds===0) dispatch({type:'TIMER_SET',seconds:300});
                    dispatch({type:'TIMER_TOGGLE'});
                  }}
                  style={{padding:'3px 8px',background:timerRunning?'rgba(239,68,68,0.14)':'rgba(52,211,153,0.1)',border:'1px solid '+(timerRunning?'rgba(239,68,68,0.4)':'rgba(52,211,153,0.3)'),borderRadius:'4px',cursor:'pointer',fontSize:'12px',color:timerRunning?'#ef4444':'#34d399'}}>
                  {timerRunning?'⏸':'▶'}
                </button>
              </div>
            </div>
          )}
          <button onClick={function(){setShowHistory(!showHistory);}} title="Historique"
            style={{background:'transparent',border:'1px solid rgba(180,30,60,0.22)',borderRadius:'6px',cursor:'pointer',fontSize:'12px',padding:'4px 8px',color:'var(--text-muted)',fontFamily:"'Cinzel',serif",flexShrink:0}}>
            📜
          </button>
          <button onClick={function(){dispatch({type:'TOGGLE_SOUND_MODAL'});}} title="Sons"
            style={{background:'transparent',border:'none',cursor:'pointer',fontSize:'16px',padding:'4px',color:state.soundEnabled?'var(--text-muted)':'var(--text-dim)',flexShrink:0}}>
            {state.soundEnabled?'🔊':'🔇'}
          </button>
          <button onClick={function(){dispatch({type:'SET_LAYOUT',mode:layoutMode==='focused'?'dashboard':'focused'});}}
            title={layoutMode==='focused'?'Vue tableau de bord':'Vue focalisée'}
            style={{background:'transparent',border:'1px solid rgba(180,30,60,0.22)',borderRadius:'6px',cursor:'pointer',padding:'4px 8px',color:'var(--text-muted)',fontFamily:"'Cinzel',serif",fontSize:'11px',flexShrink:0}}>
            {layoutMode==='focused'?'⊞':'◉'}
          </button>
        </div>
      )}

      {/* History panel */}
      {showHistory && (
        <div style={{position:'absolute',top:'52px',right:0,width:'300px',background:'rgba(8,3,14,0.98)',border:'1px solid rgba(180,30,60,0.22)',borderTop:'none',borderRight:'none',borderRadius:'0 0 0 12px',zIndex:20,maxHeight:'calc(100% - 52px)',overflowY:'auto',padding:'12px'}}>
          {(function(){
            var nightsSet = {};
            state.nightActions.forEach(function(a){ nightsSet[a.night]=true; });
            state.deaths.forEach(function(d){ nightsSet[d.night]=true; });
            var nights = Object.keys(nightsSet).map(Number).sort(function(a,b){return a-b;});
            function rn(rid){ var rd=window.ROLES_DATA[rid]; return rd?rd.name:rid; }
            function reveal(rid){ return rid==='VOYANTE'||rid==='FOSSOYEUR'||rid==='VOLEUR'; }
            function targets(a){
              if(a.targetIds.length>0){
                var s=a.targetIds.map(function(id){var p=state.players.find(function(pl){return pl.id===id;});return 'J'+id+(reveal(a.roleId)&&p?' ('+rn(p.role)+')':'');}).join(', ');
                return s+(a.note?' · '+a.note:'');
              }
              return a.note||'—';
            }
            function causeFr(c){ return c==='wolves'?'Loups':c==='witch'?'Sorcière':c==='lovers'?'Chagrin':c==='lynch'?'Lynchage':c==='hunter'?'Chasseur':'?'; }
            return (
              <>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:'10px',letterSpacing:'0.22em',color:'var(--text-dim)',textTransform:'uppercase',marginBottom:'12px'}}>Historique de la partie</div>
                {nights.length===0 ? (
                  <div style={{fontSize:'13px',color:'var(--text-dim)',fontFamily:"'Crimson Text',serif",fontStyle:'italic'}}>Rien à afficher pour l'instant.</div>
                ) : nights.map(function(nt){
                  var acts=state.nightActions.filter(function(a){return a.night===nt && (a.targetIds.length>0||a.note);});
                  var dts=state.deaths.filter(function(d){return d.night===nt;});
                  return (
                    <div key={nt} style={{marginBottom:'14px'}}>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:'11px',fontWeight:700,letterSpacing:'0.14em',color:'var(--gold)',marginBottom:'7px',borderBottom:'1px solid rgba(212,160,23,0.2)',paddingBottom:'4px'}}>🌙 NUIT {nt}</div>
                      {acts.length===0 && dts.length===0 && (
                        <div style={{fontSize:'12px',color:'var(--text-dim)',fontFamily:"'Crimson Text',serif",fontStyle:'italic'}}>Aucune action.</div>
                      )}
                      {acts.map(function(a){
                        var rd=window.ROLES_DATA[a.roleId];
                        return (
                          <div key={a.roleId} style={{display:'flex',alignItems:'flex-start',gap:'7px',marginBottom:'5px',fontFamily:"'Crimson Text',serif",fontSize:'12.5px'}}>
                            <span style={{fontSize:'14px',flexShrink:0,lineHeight:1.3}}>{rd&&rd.emoji}</span>
                            <span style={{color:'var(--text)'}}><span style={{color:rd&&rd.color,fontWeight:600}}>{rd&&rd.name}</span> → {targets(a)}</span>
                          </div>
                        );
                      })}
                      {dts.map(function(d){
                        var p=state.players.find(function(pl){return pl.id===d.playerId;});
                        var rd=p?window.ROLES_DATA[p.role]:null;
                        return (
                          <div key={d.id} style={{display:'flex',alignItems:'center',gap:'7px',marginTop:'4px',padding:'4px 7px',background:'rgba(180,20,20,0.1)',border:'1px solid rgba(180,20,20,0.22)',borderRadius:'6px',fontFamily:"'Crimson Text',serif",fontSize:'12px'}}>
                            <span style={{fontSize:'13px'}}>💀</span>
                            <span style={{color:'var(--text)'}}>J{d.playerId} ({rd?rd.name:'?'}) — {causeFr(d.cause)}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            );
          })()}
        </div>
      )}

      {/* Content area */}
      {layoutMode==='focused' ? (
        <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <PhaseContent/>
        </div>
      ) : (
        /* Dashboard: player sidebar + phase */
        <div style={{flex:1,overflow:'hidden',display:'flex'}}>
          {/* Left sidebar — always-visible player list */}
          <div style={{width:'190px',flexShrink:0,borderRight:'1px solid rgba(180,30,60,0.12)',overflowY:'auto',padding:'8px',display:'flex',flexDirection:'column',gap:'5px',background:'rgba(4,2,8,0.5)'}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:'9px',letterSpacing:'0.28em',color:'var(--text-dim)',textTransform:'uppercase',padding:'4px',marginBottom:'2px'}}>Joueurs</div>
            {state.players.map(function(player){
              var rd=window.ROLES_DATA[player.role];
              var isVic=state.nightVictimId===player.id;
              return (
                <div key={player.id} style={{background:isVic?'rgba(180,20,20,0.22)':player.alive?'rgba(10,4,18,0.85)':'rgba(4,2,8,0.6)',border:'1px solid '+(isVic?'rgba(220,50,50,0.5)':player.alive?'rgba(180,30,60,0.16)':'rgba(50,35,45,0.14)'),borderRadius:'8px',padding:'7px 9px',display:'flex',alignItems:'center',gap:'7px',opacity:player.alive?1:0.38,transition:'all 0.2s'}}>
                  <span style={{fontSize:'15px',lineHeight:1}}>{rd&&rd.emoji}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:'10px',color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{player.name}</div>
                    <div style={{fontSize:'9px',color:rd?rd.color:'var(--text-dim)',marginTop:'1px',fontFamily:"'Cinzel',serif",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{rd&&rd.name}</div>
                  </div>
                  {!player.alive&&<span style={{fontSize:'9px'}}>💀</span>}
                  {player.protected&&player.alive&&<span style={{fontSize:'9px'}}>🛡️</span>}
                  {isVic&&<span style={{fontSize:'10px'}}>🎯</span>}
                  {player.cursed&&player.alive&&<span style={{fontSize:'9px'}}>🐦‍⬛</span>}
                  {player.lovers&&player.alive&&<span style={{fontSize:'9px'}}>💘</span>}
                </div>
              );
            })}
          </div>
          {/* Right — phase content */}
          <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
            <PhaseContent/>
          </div>
        </div>
      )}
    </div>
  );
}
Object.assign(window, { GameScreen });
