"use client"

import { useEffect, useMemo, useState } from "react"
import { Wallet, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { BrowserProvider } from "ethers"
import { useEngagement } from "@/components/engagement-provider"

type WalletInfo = {
  address: string
  chainIdHex: string
  label: string
}

const FUJI_PARAMS = {
  chainId: "0xa869", // 43113
  chainName: "Avalanche Fuji Testnet",
  nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io/"],
}

function truncate(addr?: string) {
  if (!addr) return ""
  return addr.slice(0, 6) + "…" + addr.slice(-4)
}

export default function WalletConnect() {
  const { toast } = useToast()
  const { mark, unmark } = useEngagement()
  const [connecting, setConnecting] = useState(false)
  const [wallet, setWallet] = useState<WalletInfo | null>(null)

  const providerObject = useMemo(() => {
    if (typeof window === "undefined") return null
    const w = window as any
    let candidate = w.ethereum
    if (candidate?.providers?.length) {
      candidate =
        candidate.providers.find((p: any) => p.isMetaMask) ??
        candidate.providers.find((p: any) => p.isAvalanche) ??
        candidate.providers[0]
    }
    if (!candidate && w.avalanche) candidate = w.avalanche
    return candidate ?? null
  }, [])

  useEffect(() => {
    if (!providerObject) return
    const onChainChanged = (chainId: string) => {
      setWallet((prev) => (prev ? { ...prev, chainIdHex: chainId } : prev))
    }
    const onAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWallet(null)
        unmark("connect_wallet")
      } else {
        setWallet((prev) => (prev ? { ...prev, address: accounts[0] } : prev))
      }
    }
    providerObject.on?.("chainChanged", onChainChanged)
    providerObject.on?.("accountsChanged", onAccountsChanged)
    return () => {
      providerObject.removeListener?.("chainChanged", onChainChanged)
      providerObject.removeListener?.("accountsChanged", onAccountsChanged)
    }
  }, [providerObject, unmark])

  const connect = async () => {
    try {
      if (!providerObject) {
        toast({
          title: "Wallet not found",
          description: "Install MetaMask or Core Wallet to connect.",
          variant: "destructive",
        })
        return
      }
      setConnecting(true)
      const browserProvider = new BrowserProvider(providerObject)
      await providerObject.request({ method: "eth_requestAccounts" })

      try {
        await providerObject.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: FUJI_PARAMS.chainId }],
        })
      } catch (err: any) {
        if (err?.code === 4902) {
          await providerObject.request({
            method: "wallet_addEthereumChain",
            params: [FUJI_PARAMS],
          })
        } else {
          throw err
        }
      }

      const signer = await browserProvider.getSigner()
      const address = await signer.getAddress()
      const network = await browserProvider.getNetwork()

      setWallet({
        address,
        chainIdHex: "0x" + Number(network.chainId).toString(16),
        label: network.name || "Avalanche",
      })

      mark("connect_wallet")
      toast({
        title: "Connected",
        description: `Wallet connected on ${FUJI_PARAMS.chainName}`,
      })
    } catch (e: any) {
      toast({
        title: "Connection failed",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      })
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    setWallet(null)
    unmark("connect_wallet")
    toast({ title: "Disconnected", description: "Wallet state cleared." })
  }

  if (wallet) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 backdrop-blur">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#E84142]/20 px-2 py-1 text-[#E84142]">
          <Wallet className="h-3.5 w-3.5" />
          Fuji
        </span>
        <span className="hidden sm:inline">{truncate(wallet.address)}</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-white/80 hover:text-white"
          onClick={disconnect}
          aria-label="Disconnect"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={connect}
      disabled={connecting}
      className="rounded-full bg-[#E84142] px-4 text-white hover:brightness-110 focus-visible:ring-[#E84142]/60"
      aria-label="Connect Wallet"
    >
      <Wallet className="mr-2 h-4 w-4" />
      {connecting ? "Connecting…" : "Connect Wallet"}
    </Button>
  )
}
