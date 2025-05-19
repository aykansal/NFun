const MainContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-3 xs:px-4 md:px-6 lg:px-8 py-4 xs:py-6 md:py-8 w-full h-full flex-grow overflow-auto text-white">
      {children}
    </div>
  );
};

export default MainContainer;
