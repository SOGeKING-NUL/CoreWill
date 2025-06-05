import Link from 'next/link'
import { Github, X } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Network Section with Social Buttons */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 sm:mb-0">
              <div className="flex items-center text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Core DAO Testnet2
              </div>
              <div className="text-sm text-gray-400">
                Factory: {`0x8f79150a124bd664CBAB4464dCbE0c80BC1B3D12`}
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Built for the Core DAO ecosystem</span>
              <Link 
                href="https://github.com/SOGeKING-NUL/CoreWill" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-gray-600 transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link 
                href="https://x.com/JanaUtsav" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
