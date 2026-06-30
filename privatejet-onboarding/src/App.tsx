import { useState } from 'react';
import MascotViewer from './components/MascotViewer';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [handle, setHandle] = useState('');
  const [tasks, setTasks] = useState([false, false, false]);
  const [commentLink, setCommentLink] = useState('');
  const [walletAddr, setWalletAddr] = useState('');

  const toggleTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks[index] = true;
    setTasks(newTasks);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStep(0);
  };

  const isHandleValid = /^@[A-Za-z0-9_]{1,15}$/.test(handle.trim());
  const isCommentLinkValid = /^https?:\/\/(www\.)?(x\.com|twitter\.com)\/[A-Za-z0-9_]{1,15}\/status\/\d{5,25}(\?.*)?$/i.test(commentLink.trim());
  const isWalletValid = /^0x[a-fA-F0-9]{40}$/.test(walletAddr.trim());

  return (
    <div className="relative min-h-screen bg-asphalt text-white font-sans selection:bg-acid-yellow selection:text-black">

      {/* Global Graffiti Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/mascot-graffiti.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-45 saturate-150"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-asphalt/20 via-asphalt/50 to-asphalt" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference">
        <div className="font-display text-3xl tracking-widest text-acid-yellow">PRIVATEJET</div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-acid-yellow text-acid-yellow px-6 py-2 font-display text-xl tracking-wider hover:bg-acid-yellow hover:text-black transition-colors rotate-2 hover:rotate-0"
        >
          JOIN SYNDICATE
        </button>
      </nav>

      {/* Hero Section - Stacked Layout */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 md:px-24 pt-24 pb-12">

        {/* 1. Mascot Card (Now guaranteed to be ABOVE the text) */}
        <div className="relative z-20 w-full flex  justify-center items-center mb-6">
          <MascotViewer imagePath="/mascot.png" />
        </div>

        {/* 2. Narration Text */}
        <div className="relative z-10 max-w-3xl text-center">
          <h2 className="font-display text-2xl text-neon-orange tracking-widest mb-4 uppercase">Welcome to the Underground</h2>
          <h1 className="font-display text-4xl md:text-6xl leading-tight mb-8 uppercase [text-shadow:_0_0_12px_rgba(0,0,0,0.95),_0_2px_4px_rgba(0,0,0,0.9)]">
            There is only one rule to this game, you go hard or <span className="text-neon-orange">go home</span>.
            Go tell your friends it is time to <span className="text-acid-yellow">$Stake</span>,
            <span style={{ WebkitTextStroke: '1px #D4FF00' }} className="text-transparent"> @pp_privatejet</span> is coming to save us.
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-neon-orange text-black px-10 py-4 font-display text-2xl tracking-widest uppercase hover:bg-white transition-colors transform -rotate-1 shadow-[4px_4px_0px_#D4FF00]"
          >
            Initiate Takeover
          </button>
        </div>
      </main>

      {/* Onboarding Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative bg-concrete border-2 border-neon-orange w-full max-w-2xl overflow-hidden shadow-[8px_8px_0px_#FF4500]">

            <div className="absolute inset-0 z-0">
              <img src="/mascot-graffiti.png" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/70" />
            </div>

            <div className="relative z-10 flex items-center justify-between px-6 pt-6">
              <button onClick={() => (step === 0 ? closeModal() : setStep(step - 1))} className="flex items-center gap-2 text-white/60 hover:text-acid-yellow font-display text-lg tracking-wider transition-colors">
                <span aria-hidden="true">&larr;</span> {step === 0 ? 'CANCEL' : 'BACK'}
              </button>
              <button onClick={closeModal} className="text-white/50 hover:text-neon-orange font-display text-xl" aria-label="Close">
                [ X ]
              </button>
            </div>

            <div className="relative z-10 p-8 md:p-12 pt-4">
              <div className="font-display text-4xl text-acid-yellow tracking-widest mb-2">
                {step === 0 ? "IDENTIFY YOURSELF" : step === 1 ? "PROVE LOYALTY" : "SECURE SPOT"}
              </div>
              
              {step === 0 && (
                <div className="mt-8 animate-fade-in">
                  <label className="block font-display text-xl text-white/50 tracking-wider mb-2">X (TWITTER) HANDLE</label>
                  <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@rebel_tag" className={`w-full bg-transparent border-b-2 text-2xl p-2 outline-none transition-colors font-mono mb-1 ${handle.length > 0 && !isHandleValid ? 'border-neon-orange' : 'border-white/20 focus:border-acid-yellow'}`} />
                  <div className="text-xs text-white/30 font-mono mb-8 h-4">
                    {handle.length > 0 && !isHandleValid && <span className="text-neon-orange">must start with @, 4–15 letters/numbers</span>}
                  </div>
                  <button disabled={!isHandleValid} onClick={() => setStep(1)} className={`w-full py-4 font-display text-xl tracking-widest transition-colors ${isHandleValid ? 'bg-white text-black hover:bg-acid-yellow' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}>
                    PROCEED ➔
                  </button>
                </div>
              )}

              {/* Step 1: Socials */}
{step === 1 && (
  <div className="mt-8 animate-fade-in">
    <div className="space-y-4 mb-6">
      
      {/* Task 0: Follow */}
      <div className="border border-white/20 p-4 flex justify-between items-center bg-black/50 backdrop-blur-sm">
        <div>
          <div className="font-bold">Follow @pp_privatejet</div>
          <div className="text-xs text-white/40 font-mono mt-1">Required for whitelist</div>
        </div>
        <button 
          onClick={() => {
            window.open('https://x.com/pp_privatejet', '_blank');
            toggleTask(0);
          }} 
          className={`px-4 py-2 font-display tracking-wider ${tasks[0] ? 'bg-acid-yellow text-black' : 'bg-white/10 hover:bg-white/20'}`}
        >
          {tasks[0] ? 'DONE' : 'FOLLOW'}
        </button>
      </div>

      {/* Task 1: Like & Retweet */}
      <div className="border border-white/20 p-4 flex justify-between items-center bg-black/50 backdrop-blur-sm">
        <div>
          <div className="font-bold">Like &amp; Retweet</div>
          <div className="text-xs text-white/40 font-mono mt-1">Quote RT with "time to $Stake"</div>
        </div>
        <button 
          onClick={() => {
            // Replace YOUR_TWEET_ID with the actual post ID
            window.open('https://x.com/ppprivatejetnft?s=21&t=g7fEFa6w0-CPegmZpWukfA', '_blank');
            toggleTask(1);
          }} 
          className={`px-4 py-2 font-display tracking-wider ${tasks[1] ? 'bg-acid-yellow text-black' : 'bg-white/10 hover:bg-white/20'}`}
        >
          {tasks[1] ? 'DONE' : 'LIKE + RT'}
        </button>
      </div>

      {/* Task 2: Tag 2 Frens */}
      <div className="border border-white/20 p-4 flex justify-between items-center bg-black/50 backdrop-blur-sm">
        <div>
          <div className="font-bold">Tag 2 Frens</div>
          <div className="text-xs text-white/40 font-mono mt-1">Tag them in the comment section</div>
        </div>
        <button 
          onClick={() => {
            // Usually linking to the same post so they can reply/tag
            window.open('https://x.com/ppprivatejetnft?s=21&t=g7fEFa6w0-CPegmZpWukfA', '_blank');
            toggleTask(2);
          }} 
          className={`px-4 py-2 font-display tracking-wider ${tasks[2] ? 'bg-acid-yellow text-black' : 'bg-white/10 hover:bg-white/20'}`}
        >
          {tasks[2] ? 'DONE' : 'TAG'}
        </button>
      </div>
      
    </div>

    <label className="block font-display text-lg text-white/50 tracking-wider mb-2">YOUR COMMENT LINK</label>
    <input
      type="url"
      value={commentLink}
      onChange={(e) => setCommentLink(e.target.value)}
      placeholder="https://x.com/yourhandle/status/1234567890"
      className={`w-full bg-transparent border-b-2 text-sm md:text-base p-2 outline-none transition-colors font-mono mb-1 ${
        commentLink.length > 0 && !isCommentLinkValid ? 'border-neon-orange' : 'border-white/20 focus:border-acid-yellow'
      }`}
    />
    <div className="text-xs text-white/30 font-mono mb-6 h-4">
      {commentLink.length > 0 && !isCommentLinkValid && <span className="text-neon-orange">must be a standard x.com/.../status/ link</span>}
    </div>

    <button 
      disabled={!tasks.every(Boolean) || !isCommentLinkValid}
      onClick={() => setStep(2)} 
      className={`w-full py-4 font-display text-xl tracking-widest transition-colors ${tasks.every(Boolean) && isCommentLinkValid ? 'bg-white text-black hover:bg-neon-orange hover:text-white' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
    >
      CONNECT WALLET ➔
    </button>
  </div>
)}

              {step === 2 && (
                <div className="mt-8 animate-fade-in">
                  <label className="block font-display text-xl text-white/50 tracking-wider mb-2">ETH WALLET ADDRESS</label>
                  <input type="text" value={walletAddr} onChange={(e) => setWalletAddr(e.target.value)} placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d8976" className={`w-full bg-transparent border-b-2 text-base md:text-lg p-2 outline-none transition-colors font-mono mb-1 ${walletAddr.length > 0 && !isWalletValid ? 'border-neon-orange' : 'border-white/20 focus:border-acid-yellow'}`} />
                  <div className="text-xs text-white/30 font-mono mb-8 h-4">
                    {walletAddr.length > 0 && !isWalletValid ? <span className="text-neon-orange">must be 0x followed by 40 hex characters</span> : <span>standard EVM address — 42 characters, starts with 0x</span>}
                  </div>
                  <button disabled={!isWalletValid} onClick={() => alert('Google Sheets API hook incoming...')} className={`w-full py-4 font-display text-xl tracking-widest transition-all ${isWalletValid ? 'bg-acid-yellow text-black shadow-[4px_4px_0px_#FF4500] hover:translate-y-1 hover:shadow-none' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}>
                    SIGN & SUBMIT TO SHEET
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;