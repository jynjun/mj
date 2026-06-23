// App.jsx — Root component
function App() {
  return React.createElement(GameProvider, null,
    React.createElement(AppContent, null)
  );
}

function AppContent() {
  const { state } = useGame();
  return (
    <div style={{ width:'100%', height:'100%', position:'relative' }}>
      {state.screen === 'home'             && React.createElement(HomeScreen, null)}
      {state.screen === 'playerRoleAssign' && React.createElement(PlayerRoleAssign, null)}
      {state.screen === 'assign'           && React.createElement(AssignScreen, null)}
      {state.screen === 'game'             && React.createElement(GameScreen, null)}
      {state.showSoundModal                && React.createElement(SoundConfigModal, null)}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(App, null)
);
