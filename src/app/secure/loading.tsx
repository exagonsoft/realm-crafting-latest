import LoadingAnimation from "@/components/shared/LoadingAnimator";

export default function Loading() {
  return (
    <div className="w-full h-screen fixed top-0 left-0 flex z-[900] justify-center items-center">
      <div className="w-full h-screen fixed left-0 top-0 backdrop-blur-[10px] z-[890]"></div>
      <div className="relative py-4 px-8 flex flex-col gap-4 justify-center items-center z-[895] bg-[#ffffff26] backdrop-blur-[10px] rounded-[10px] border border-[#ffffff2e] shadow-md min-w-[40%]">
        <LoadingAnimation />
      </div>
    </div>
  );
}
