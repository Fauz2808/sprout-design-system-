import imgBackgroundImage from "figma:asset/303207b27e0ba1fe0015c257dddec23385efe713.png";
import imgImage214 from "figma:asset/2ef4fe20e396f455f50c73bbaf286800bdb3f700.png";

function Circle() {
  return (
    <div className="absolute left-[202px] opacity-20 rounded-[99999px] size-[1037px] top-0" data-name="Circle">
      <div aria-hidden="true" className="absolute border-[#1e3e2b] border-[0.5px] border-solid inset-[-0.5px] pointer-events-none rounded-[99999.5px]" />
    </div>
  );
}

function Circle1() {
  return (
    <div className="absolute left-[calc(12.5%+151.25px)] opacity-20 rounded-[99999px] size-[777.75px] top-[129.63px]" data-name="Circle">
      <div aria-hidden="true" className="absolute border-[#1e3e2b] border-[0.5px] border-solid inset-[-0.5px] pointer-events-none rounded-[99999.5px]" />
    </div>
  );
}

function Pattern() {
  return (
    <div className="absolute contents left-[202px] top-0" data-name="Pattern">
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
          <img alt="" className="absolute h-[158.09%] left-[-131.88%] max-w-none top-[-28.78%] w-[380.2%]" src={imgImage214} />
        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0" data-name="Logo">
      <Logo1 />
      <p className="font-['Playfair_Display:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[#1e3e2b] text-[24px] whitespace-nowrap">Sprout</p>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-[48px] items-center leading-[1.55] not-italic relative shrink-0 text-[#7d715e] text-[16px] whitespace-nowrap" data-name="Link">
      <p className="relative shrink-0">How it works</p>
      <p className="relative shrink-0">Features</p>
      <p className="relative shrink-0">About</p>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex h-[28px] items-center justify-center pb-[4px] relative shrink-0" data-name="Content">
      <p className="font-['Playfair_Display:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Download App</p>
    </div>
  );
}

function NavigationBar() {
  return (
    <div className="backdrop-blur-[10px] content-stretch flex items-center justify-between px-[120px] py-[24px] relative shrink-0 w-[1440px]" data-name="Navigation Bar">
      <Logo />
      <Link />
      <div className="bg-[#186338] content-stretch flex gap-[8px] h-[52px] items-center justify-center px-[16px] py-[8px] relative rounded-[99999px] shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] shrink-0" data-name="Button">
        <Content />
      </div>
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
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.55] not-italic relative shrink-0 text-[#186338] text-[12px] whitespace-nowrap">Now Available on iOS</p>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex items-center justify-center px-[10px] relative shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#d0dacf] border-l-2 border-solid inset-0 pointer-events-none" />
      <p className="font-['Playfair_Display:Medium_Italic',sans-serif] font-medium italic leading-[1.5] relative shrink-0 text-[#7d715e] text-[16px] whitespace-nowrap">
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
      <p className="font-['Playfair_Display:Medium',sans-serif] font-medium leading-[0] min-w-full relative shrink-0 text-[#1e3e2b] text-[0px] w-[min-content]">
        <span className="leading-[1.43] text-[42px]">{`Where parents bond, `}</span>
        <span className="font-['Playfair_Display:Medium_Italic',sans-serif] italic leading-[1.43] text-[#186338] text-[42px]">childhoods flourish.</span>
      </p>
      <Container />
    </div>
  );
}

function HeroText() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-[421px]" data-name="Hero Text">
      <Badge />
      <HeaderAndSubHead />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.7] not-italic relative shrink-0 text-[#7d715e] text-[16px] w-[360px]">Find events, join clubs, and build the friendships your family deserves — all in the neighborhood your kids call home.</p>
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex h-[28px] items-center justify-center pb-[4px] relative shrink-0" data-name="Content">
      <p className="font-['Playfair_Display:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Download App</p>
    </div>
  );
}

function Stats() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-[136px]" data-name="Stats 1">
      <p className="font-['Playfair_Display:Regular',sans-serif] leading-[1.3] relative shrink-0 text-[#1e3e2b] text-[42px]">2.0k+</p>
      <p className="font-['Inter:Regular',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#7d715e] text-[14px] tracking-[0.28px]">Families connected</p>
    </div>
  );
}

function Stats1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-[136px]" data-name="Stats 2">
      <p className="font-['Playfair_Display:Regular',sans-serif] leading-[1.3] relative shrink-0 text-[#1e3e2b] text-[42px]">10k+</p>
      <p className="font-['Inter:Regular',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#7d715e] text-[14px] tracking-[0.28px]">Events created</p>
    </div>
  );
}

function Stats2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-[136px]" data-name="Stats 3">
      <p className="font-['Playfair_Display:Regular',sans-serif] leading-[1.3] relative shrink-0 text-[#1e3e2b] text-[42px]">50+</p>
      <p className="font-['Inter:Regular',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#7d715e] text-[14px] tracking-[0.28px]">Cities across the US</p>
    </div>
  );
}

function StatsContainer() {
  return (
    <div className="content-stretch flex font-normal gap-[32px] items-start relative shrink-0 text-center whitespace-nowrap" data-name="Stats Container">
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
      <div className="bg-[#186338] content-stretch flex gap-[8px] h-[52px] items-center justify-center px-[16px] py-[8px] relative rounded-[99999px] shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] shrink-0" data-name="Button">
        <Content1 />
      </div>
      <StatsContainer />
    </div>
  );
}

function HeroContainer() {
  return (
    <div className="content-stretch flex items-center px-[120px] py-[64px] relative shrink-0 w-[1440px]" data-name="Hero Container">
      <HeroContent />
    </div>
  );
}

export default function WebsiteDesktop() {
  return (
    <div className="bg-[#f4f1ea] content-stretch flex flex-col gap-[4px] items-start relative size-full" data-name="Website - Desktop">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[1151px] left-1/2 top-[calc(50%-0.5px)] w-[1440px]" data-name="Background Image">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute max-w-none object-cover size-full" src={imgBackgroundImage} />
          <div className="absolute bg-gradient-to-t from-[rgba(255,255,255,0.9)] inset-0 to-[193.4%] to-[rgba(255,255,255,0)]" />
        </div>
      </div>
      <Pattern />
      <NavigationBar />
      <HeroContainer />
    </div>
  );
}