// AssignScreen.jsx — Secret role reveal per player
const { useState: useStAss, useRef: useRefAss } = React;

function PlayerNamesScreen() {
  const { state, dispatch } = useGame();
  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'14px 18px 12px',borderBottom:'1px solid rgba(180,30,60,0.15)',display:'flex',alignItems:'center',gap:'12px',flexShrink:0}}>
        <button onClick={function(){dispatch({type:'SET_SCREEN',screen:'roleConfig'});}} style={{background:'transparent',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:'20px',padding:'4px'}}>←</button>
        <div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'15px',fontWeight:600,color:'var(--text)'}}>Noms des joueurs</div>
          <div style={{fontSize:'13px',color:'var(--text-muted)',fontFamily:"'Crimson Text',serif",marginTop:'2px'}}>Optionnel — modifiez ou gardez les noms par défaut</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'12px 14px',display:'flex',flexDirection:'column',gap:'7px'}}>
        {state.players.map(function(p,i){
          return (
            <div key={p.id} style={{display:'flex',alignItems:'center',gap:'10px',background:'rgba(10,4,16,0.75)',border:'1px solid rgba(180,30,60,0.14)',borderRadius:'8px',padding:'10px 14px'}}>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:'12px',color:'var(--text-dim)',minWidth:'22px',textAlign:'center'}}>{i+1}</span>
              <input value={p.name} onChange={function(e){dispatch({type:'SET_PLAYER_NAME',id:p.id,name:e.target.value});}}
                style={{flex:1,background:'transparent',border:'none',outline:'none',fontFamily:"'Crimson Text',serif",fontSize:'16px',color:'var(--text)',padding:'0'}}
                placeholder={'Joueur '+(i+1)} />
            </div>
          );
        })}
      </div>
      <div style={{padding:'12px 14px 20px',borderTop:'1px solid rgba(180,30,60,0.15)',flexShrink:0}}>
        <button onClick={function(){dispatch({type:'SHUFFLE_ROLES'});dispatch({type:'SET_SCREEN',screen:'assign'});}}
          style={{width:'100%',padding:'14px',background:'var(--red)',border:'none',borderRadius:'10px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'13px',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'#fff'}}>
          Distribuer les rôles →
        </button>
      </div>
    </div>
  );
}

function AssignScreen() {
  const { state, dispatch } = useGame();
  const [holding, setHolding] = useStAss(false);
  const holdRef = useRefAss(null);
  var player = state.players[state.assignIndex];
  var isLast = state.assignIndex >= state.players.length - 1;
  var allDone = state.assignIndex >= state.players.length;

  if (allDone) {
    return (
      <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 40%, rgba(80,10,20,0.25) 0%, transparent 65%)',pointerEvents:'none'}}/>
        <div style={{fontSize:'60px',marginBottom:'20px',lineHeight:1}}>🌙</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:'22px',fontWeight:700,color:'var(--text)',textAlign:'center',marginBottom:'10px'}}>Tous les rôles sont distribués</div>
        <div style={{fontSize:'15px',color:'var(--text-muted)',fontFamily:"'Crimson Text',serif",textAlign:'center',marginBottom:'44px',fontStyle:'italic'}}>La nuit va tomber sur le village…</div>
        <button onClick={function(){dispatch({type:'START_GAME'});}}
          style={{padding:'15px 44px',background:'var(--red)',border:'none',borderRadius:'12px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'14px',fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',color:'#fff',boxShadow:'0 0 50px rgba(196,30,58,0.4)'}}>
          Commencer la partie
        </button>
      </div>
    );
  }

  var role = player ? window.ROLES_DATA[player.role] : null;
  function startHold(){holdRef.current=setTimeout(function(){setHolding(true);},60);}
  function endHold(){clearTimeout(holdRef.current);setHolding(false);}

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px 20px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 50%, rgba(60,8,18,0.22) 0%, transparent 70%)',pointerEvents:'none'}}/>
      {/* Progress bar */}
      <div style={{position:'absolute',top:'16px',left:'20px',right:'20px',display:'flex',alignItems:'center',gap:'10px'}}>
        <button onClick={function(){dispatch({type:'SET_SCREEN',screen:'playerNames'});}} style={{background:'transparent',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:'18px',padding:'4px'}}>←</button>
        <div style={{flex:1,height:'3px',background:'rgba(180,30,60,0.15)',borderRadius:'2px',overflow:'hidden'}}>
          <div style={{height:'100%',width:(((state.assignIndex+1)/state.players.length)*100)+'%',background:'var(--red)',borderRadius:'2px',transition:'width 0.3s'}}/>
        </div>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:'12px',color:'var(--text-muted)'}}>{state.assignIndex+1}/{state.players.length}</span>
      </div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:'11px',letterSpacing:'0.4em',color:'var(--text-muted)',textTransform:'uppercase',marginBottom:'28px',marginTop:'36px'}}>Distribution secrète</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:'26px',fontWeight:700,color:'var(--text)',marginBottom:'28px',textAlign:'center'}}>{player && player.name}</div>
      {/* Tap-and-hold card */}
      <div
        onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
        onTouchStart={startHold} onTouchEnd={endHold} onTouchCancel={endHold}
        style={{width:'260px',height:'190px',borderRadius:'16px',cursor:'pointer',userSelect:'none',WebkitUserSelect:'none',position:'relative',overflow:'hidden',
          background:holding&&role?role.bgColor:'rgba(10,4,18,0.95)',
          border:'1px solid '+(holding&&role?role.color+'55':'rgba(180,30,60,0.25)'),
          transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'10px',
          boxShadow:holding&&role?'0 0 50px '+role.color+'28':'none'}}>
        {!holding ? (
          <>
            <div style={{fontSize:'36px'}}>🤫</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:'12px',letterSpacing:'0.12em',color:'var(--text-muted)',textTransform:'uppercase',textAlign:'center',lineHeight:1.5}}>Maintenez<br/>pour voir votre rôle</div>
          </>
        ) : role ? (
          <>
            <div style={{fontSize:'48px',lineHeight:1}}>{role.emoji}</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:'19px',fontWeight:700,color:role.color,textAlign:'center'}}>{role.name}</div>
            <div style={{fontSize:'12px',color:'var(--text-muted)',textAlign:'center',fontFamily:"'Crimson Text',serif",padding:'0 14px',lineHeight:1.4}}>{role.description}</div>
            <div style={{position:'absolute',top:'9px',right:'10px',fontSize:'9px',fontFamily:"'Cinzel',serif",letterSpacing:'0.14em',textTransform:'uppercase',color:window.TEAM_INFO[role.team]?window.TEAM_INFO[role.team].color:'white',background:'rgba(0,0,0,0.45)',padding:'3px 7px',borderRadius:'4px'}}>
              {window.TEAM_INFO[role.team]?window.TEAM_INFO[role.team].label:''}
            </div>
          </>
        ) : null}
      </div>
      <div style={{marginTop:'10px',fontSize:'13px',color:'var(--text-dim)',fontFamily:"'Crimson Text',serif",fontStyle:'italic'}}>Relâchez puis passez l'appareil</div>
      <button onClick={function(){setHolding(false);dispatch({type:'SET_ASSIGN_INDEX',index:state.assignIndex+1});}}
        style={{marginTop:'28px',padding:'12px 30px',background:'transparent',border:'1px solid rgba(180,30,60,0.32)',borderRadius:'10px',cursor:'pointer',fontFamily:"'Cinzel',serif",fontSize:'12px',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-muted)',transition:'all 0.2s'}}>
        {isLast?'Terminé ✓':'Joueur suivant →'}
      </button>
    </div>
  );
}
Object.assign(window, { PlayerNamesScreen, AssignScreen });
