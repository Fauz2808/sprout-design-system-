import { motion } from "motion/react";
import imgBackgroundImage from "figma:asset/303207b27e0ba1fe0015c257dddec23385efe713.png";
import imgImage214 from "figma:asset/2ef4fe20e396f455f50c73bbaf286800bdb3f700.png";

function Circle() {
  return (
    <div className="absolute left-[202px] opacity-20 rounded-[99999px] size-[1037px] top-0 pointer-events-none" data-name="Circle">
      <div aria-hidden="true" className="absolute border-[#1e3e2b] border-[0.5px] border-solid inset-[-0.5px] pointer-events-none rounded-[99999.5px]" />
    </div>
  );
}

function Circle1() {
  return (
    <div className="absolute left-[calc(12.5%+151.25px)] opacity-20 rounded-[99999px] size-[777.75px] top-[129.63px] pointer-events-none" data-name="Circle">
      <div aria-hidden="true" className="absolute border-[#1e3e2b] border-[0.5px] border-solid inset-[-0.5px] pointer-events-none rounded-[99999.5px]" />
    </div>
  );
}

function Pattern() {
  return (
    <div className="absolute left-0 top-0 w-full h-full pointer-events-none" data-name="Pattern">
      <Circle />
      <Circle1 />
    </div>
  );
}

function Logo1() {
  return (
    <div className="bg-gradient-to-b content-stretch flex from-[#f2edea] items-center justify-center p-[7.875px] relative rounded-[10.5px] shadow-[-1.313px_-1.313px_0px_0px_rgba(14,14,16,0.02),1.313px_1.313px_0px_0px_rgba(14,14,16,0.02)] shrink-0 size-[42px] to-[#e7d8d2]" data-name="Logo">
      <div className="h-[29.021px] relative shrink-0 w-[26.119px]" data-name="image 214">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="Sprout Logo" className="absolute h-[158.09%] left-[-131.88%] max-w-none top-[-28.78%] w-[380.2%]" src={imgImage214} />
        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <motion.div 
      className="content-stretch flex gap-[12px] items-start relative shrink-0 cursor-pointer" 
      data-name="Logo"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <Logo1 />
      <p className="font-['Playfair_Display',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[#1e3e2b] text-[24px] whitespace-nowrap">Sprout</p>
    </motion.div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex font-['Inter',sans-serif] font-medium gap-[48px] items-center leading-[1.55] not-italic relative shrink-0 text-[#7d715e] text-[16px] whitespace-nowrap" data-name="Link">
      <motion.p whileHover={{ scale: 1.05, y: -2 }} transition={{ type: "spring", stiffness: 300 }} className="relative shrink-0 cursor-pointer hover:text-[#1e3e2b] transition-colors">How it works</motion.p>
      <motion.p whileHover={{ scale: 1.05, y: -2 }} transition={{ type: "spring", stiffness: 300 }} className="relative shrink-0 cursor-pointer hover:text-[#1e3e2b] transition-colors">Features</motion.p>
      <motion.p whileHover={{ scale: 1.05, y: -2 }} transition={{ type: "spring", stiffness: 300 }} className="relative shrink-0 cursor-pointer hover:text-[#1e3e2b] transition-colors">About</motion.p>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex h-[28px] items-center justify-center pb-[4px] relative shrink-0" data-name="Content">
      <p className="font-['Playfair_Display',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Download App</p>
    </div>
  );
}

function NavigationBar() {
  return (
    <div className="backdrop-blur-[10px] content-stretch flex items-center justify-between px-[120px] py-[24px] relative shrink-0 w-[1440px] max-w-full" data-name="Navigation Bar">
      <Logo />
      <Link />
      <motion.button 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }} 
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="bg-[#186338] hover:bg-[#134d2b] transition-colors content-stretch flex gap-[8px] h-[52px] items-center justify-center px-[16px] py-[8px] relative rounded-[99999px] shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] shrink-0 cursor-pointer" 
        data-name="Button"
      >
        <Content />
      </motion.button>
    </div>
  );
}

function Badge() {
  return (
    <div className="bg-[#e2e9e3] content-stretch flex gap-[8px] items-center px-[12px] py-[4px] relative rounded-[99999px] shrink-0" data-name="Badge">
      <div className="relative shrink-0 size-[6px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
          <circle cx="3" cy="3" fill="var(--fill-0, #186338)" id="Ellipse 1" r="3" />
        </svg>
      </div>
      <p className="font-['Inter',sans-serif] font-normal leading-[1.55] not-italic relative shrink-0 text-[#186338] text-[12px] whitespace-nowrap">Now Available on iOS</p>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex items-center justify-center px-[10px] relative shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#d0dacf] border-l-2 border-solid inset-0 pointer-events-none" />
      <p className="font-['Playfair_Display',sans-serif] font-medium italic leading-[1.5] relative shrink-0 text-[#7d715e] text-[16px] whitespace-nowrap">
        {`"You got lucky when you found these people.`}
        <br aria-hidden="true" />
        {`Sprout is where that luck happens."`}
      </p>
    </div>
  );
}

function HeaderAndSubHead() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Header and Sub Head">
      <p className="font-['Playfair_Display',sans-serif] font-medium leading-[0] min-w-full relative shrink-0 text-[#1e3e2b] text-[0px] w-[min-content]">
        <span className="leading-[1.43] text-[42px]">{`Where parents bond, `}</span>
        <span className="font-['Playfair_Display',sans-serif] italic leading-[1.43] text-[#186338] text-[42px]">childhoods flourish.</span>
      </p>
      <Container />
    </div>
  );
}

function HeroText() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-[421px] max-w-full" data-name="Hero Text">
      <Badge />
      <HeaderAndSubHead />
      <p className="font-['Inter',sans-serif] font-normal leading-[1.7] not-italic relative shrink-0 text-[#7d715e] text-[16px] w-[360px] max-w-full">
        Find events, join clubs, and build the friendships your family deserves — all in the neighborhood your kids call home.
      </p>
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex h-[28px] items-center justify-center pb-[4px] relative shrink-0" data-name="Content">
      <p className="font-['Playfair_Display',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Download App</p>
    </div>
  );
}

function Stats() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-[136px]" data-name="Stats 1">
      <p className="font-['Playfair_Display',sans-serif] leading-[1.3] relative shrink-0 text-[#1e3e2b] text-[42px]">2.0k+</p>
      <p className="font-['Inter',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#7d715e] text-[14px] tracking-[0.28px]">Families connected</p>
    </div>
  );
}

function Stats1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-[136px]" data-name="Stats 2">
      <p className="font-['Playfair_Display',sans-serif] leading-[1.3] relative shrink-0 text-[#1e3e2b] text-[42px]">10k+</p>
      <p className="font-['Inter',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#7d715e] text-[14px] tracking-[0.28px]">Events created</p>
    </div>
  );
}

function Stats2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-[136px]" data-name="Stats 3">
      <p className="font-['Playfair_Display',sans-serif] leading-[1.3] relative shrink-0 text-[#1e3e2b] text-[42px]">50+</p>
      <p className="font-['Inter',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#7d715e] text-[14px] tracking-[0.28px]">Cities across the US</p>
    </div>
  );
}

function StatsContainer() {
  return (
    <div className="content-stretch flex font-normal gap-[32px] items-start relative shrink-0 text-center whitespace-nowrap flex-wrap" data-name="Stats Container">
      <Stats />
      <Stats1 />
      <Stats2 />
    </div>
  );
}

function HeroContent() {
  return (
    <div className="content-stretch flex flex-col gap-[42px] items-start relative shrink-0" data-name="Hero Content">
      <HeroText />
      <motion.button 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }} 
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="bg-[#186338] hover:bg-[#134d2b] transition-colors cursor-pointer content-stretch flex gap-[8px] h-[52px] items-center justify-center px-[16px] py-[8px] relative rounded-[99999px] shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] shrink-0" 
        data-name="Button"
      >
        <Content1 />
      </motion.button>
      <StatsContainer />
    </div>
  );
}

function HeroContainer() {
  return (
    <div className="content-stretch flex items-center px-[120px] py-[64px] relative shrink-0 w-[1440px] max-w-full" data-name="Hero Container">
      <HeroContent />
    </div>
  );
}

function WindParticles() {
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 15 + 15,
    delay: -Math.random() * 20,
    yDrift: (Math.random() - 0.5) * 100,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-white rounded-full blur-[1px]"
          style={{
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            right: "-20px",
          }}
          animate={{
            x: ["0vw", "-120vw"],
            y: [0, p.yDrift, p.yDrift * 1.5],
          }}
          transition={{
            x: { duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay },
            y: { duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay },
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  return (
    <div className="bg-[#f4f1ea] overflow-hidden min-h-screen content-stretch flex flex-col items-center relative size-full w-full" data-name="Website - Desktop">
      {/* Background with absolute positioning to cover properly */}
      <div className="absolute top-0 left-0 w-full h-[1151px] pointer-events-none" data-name="Background Image">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none flex justify-center overflow-hidden">
          <div className="relative w-[1440px] max-w-[1440px] h-full flex-shrink-0">
             <motion.img 
               alt="" 
               className="absolute max-w-none object-cover size-full origin-center" 
               src={imgBackgroundImage} 
               animate={{ scale: [1, 1.05, 1], x: [0, -20, 0], y: [0, -10, 0] }}
               transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
             />
             <div className="absolute bg-gradient-to-t from-[rgba(255,255,255,0.9)] inset-0 to-[193.4%] to-[rgba(255,255,255,0)]" />
          </div>
        </div>
      </div>
      
      <WindParticles />
      
      <div className="relative w-[1440px] max-w-full z-10 flex flex-col items-start min-h-screen">
        <Pattern />
        <NavigationBar />
        <HeroContainer />
      </div>
    </div>
  );
}