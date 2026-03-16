import BuilderPage from "./pages/BuilderPage";

function App() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-950 selection:bg-blue-600/20 selection:text-neutral-900">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(59,130,246,0.05)_0%,_transparent_50%)] pointer-events-none" />
      <div className="relative z-10 font-medium">
        <BuilderPage />
      </div>
    </div>
  );
}

export default App;
