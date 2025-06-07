"use client"

import { useState } from "react"
import { X, Copy, Check, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NetworkInfoOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function NetworkInfoOverlay({ isOpen, onClose }: NetworkInfoOverlayProps) {
  const [copiedChainId, setCopiedChainId] = useState(false)
  const [copiedRpcUrl, setCopiedRpcUrl] = useState(false)

  const chainId = "1114"
  const rpcUrl = "rpc.test2.btcs.network"

  const copyToClipboard = async (text: string, type: "chainId" | "rpcUrl") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "chainId") {
        setCopiedChainId(true)
        setTimeout(() => setCopiedChainId(false), 2000)
      } else {
        setCopiedRpcUrl(true)
        setTimeout(() => setCopiedRpcUrl(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-[#ffa600]/20 max-w-md w-full mx-4 p-6 animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#ffa600] to-[#ff8c00] rounded-full flex items-center justify-center">
              <Info className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Important Network Information</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed">
            This project is deployed on Core DAO Testnet 2 and requires users to use the appropriate network. Please use
            an EVM-compatible wallet like Metamask or Trust Wallet, or directly add the chain to your wallet:
          </p>

          {/* Chain ID */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Chain ID</label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <code className="flex-1 font-mono text-gray-800">{chainId}</code>
              <Button
                onClick={() => copyToClipboard(chainId, "chainId")}
                className="p-2 text-[#ffa600] hover:bg-[#ffa600]/10 rounded-md transition-colors"
              >
                {copiedChainId ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* RPC URL */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">RPC URL</label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <code className="flex-1 font-mono text-gray-800 text-sm break-all">{rpcUrl}</code>
              <Button
                onClick={() => copyToClipboard(rpcUrl, "rpcUrl")}
                className="p-2 text-[#ffa600] hover:bg-[#ffa600]/10 rounded-md transition-colors"
              >
                {copiedRpcUrl ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="p-4 bg-[#ffa600]/5 border border-[#ffa600]/20 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-[#ffa600]">Note:</span> Make sure to switch to the Core DAO Testnet 2
              network in your wallet before interacting with the platform.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#ffa600] to-[#ff8c00] text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
