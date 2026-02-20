'use client'

export default function TrendingPage() {
    return(
         <div className="relative min-h-screen w-full ">
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat "
        style={{ backgroundImage: 'url(/igb.png)' }}
      />
      
      <div className="relative min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-4/5 min-h-screen overflow-y-auto bg-white bg-opacity-90 rounded-lg shadow-lg p-6 flex items-center flex-col space-y-1">
          <h1 className="font-press-start-2p text-xl md:text-2xl font-extrabold text-center text-gray-800 mb-6">
           🔥Leaderboard🔥
          </h1>

          </div>
        </div>
      </div>
    )
}