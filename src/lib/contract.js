// src/lib/contract.js
import { getContract } from 'viem'
import PresaleStagesJSON from '../abi/PresaleStages.json'

// ---- Env-configured addresses ----
export const PRESALE_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
export const USDT_CONTRACT_ADDRESS    = import.meta.env.VITE_USDT_ADDRESS

if (!PRESALE_CONTRACT_ADDRESS) throw new Error('VITE_CONTRACT_ADDRESS is not configured')
if (!USDT_CONTRACT_ADDRESS)    throw new Error('VITE_USDT_ADDRESS is not configured')

// ---- Always extract the ABI ARRAY (works for artifacts or raw ABI files) ----
export const PRESALE_ABI = Array.isArray(PresaleStagesJSON)
  ? PresaleStagesJSON
  : PresaleStagesJSON?.abi

if (!Array.isArray(PRESALE_ABI)) {
  throw new Error('Presale ABI is not an array. Make sure src/abi/PresaleStages.json contains only the ABI array or has an "abi" field.')
}

// Optional: early sanity check so you fail fast if ABI is stale/mismatched
;['status','stagesLength','stages','soldWave','capWave','startTs','endTs','unlockTs',
  'softCapUsdtUnits','raisedUsdtUnits','finalized','successful','refundsEnabled',
  'purchasedWave','claimedWave','paidNative','paidUsdt','claimable'
].forEach((name) => {
  const ok = PRESALE_ABI.some((i) => i?.type === 'function' && i?.name === name)
  if (!ok) console.warn(`[contract.js] ABI missing expected function: ${name}`)
})

// ---- Minimal ERC20 ABI (USDT) ----
export const ERC20_ABI = [
  { type: 'function', name: 'decimals', inputs: [], outputs: [{ type: 'uint8' }], stateMutability: 'view' },
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' }
]

// ---- Contract factories (expects a viem client: { public, wallet } or similar) ----
export const getPresaleContract = (client) =>
  getContract({ address: PRESALE_CONTRACT_ADDRESS, abi: PRESALE_ABI, client })

export const getUSDTContract = (client) =>
  getContract({ address: USDT_CONTRACT_ADDRESS, abi: ERC20_ABI, client })

// ---- Read helpers (all return BigInt/primitive types from viem) ----
export const createContractReads = (client) => {
  const presale = getPresaleContract(client)
  const usdt = getUSDTContract(client)

  return {
    presale,
    usdt,

    // Sale status
    async getStatus() {
      return presale.read.status()
    },

    async getStagesLength() {
      return presale.read.stagesLength()
    },

    async getStage(index) {
      // tuple: [capWave, priceNativeWeiPerWave, priceUsdtUnitsPerWave]
      return presale.read.stages([index])
    },

    async getSaleData() {
      const [status, soldWave, capWave, startTs, endTs, unlockTs] = await Promise.all([
        presale.read.status(),
        presale.read.soldWave(),
        presale.read.capWave(),
        presale.read.startTs(),
        presale.read.endTs(),
        presale.read.unlockTs(),
      ])
      return { status, soldWave, capWave, startTs, endTs, unlockTs }
    },

    async getSoftCapData() {
      const [softCapUsdtUnits, raisedUsdtUnits] = await Promise.all([
        presale.read.softCapUsdtUnits(),
        presale.read.raisedUsdtUnits(),
      ])
      return { softCapUsdtUnits, raisedUsdtUnits }
    },

    async getFinalizeData() {
      const [finalized, successful, refundsEnabled] = await Promise.all([
        presale.read.finalized(),
        presale.read.successful(),
        presale.read.refundsEnabled(),
      ])
      return { finalized, successful, refundsEnabled }
    },

    async getUserData(address) {
      if (!address) return null

      // NOTE: mapping getters REQUIRE the address arg
      const [purchasedWave, claimedWave, paidNative, paidUsdt, claimable] = await Promise.all([
        presale.read.purchasedWave([address]),
        presale.read.claimedWave([address]),
        presale.read.paidNative([address]),
        presale.read.paidUsdt([address]),
        presale.read.claimable([address]),
      ])
      return { purchasedWave, claimedWave, paidNative, paidUsdt, claimable }
    },

    // USDT
    async getUSDTDecimals() {
      return usdt.read.decimals()
    },

    async getUSDTBalance(address) {
      if (!address) return 0n
      return usdt.read.balanceOf([address])
    },

    async getUSDTAllowance(owner, spender) {
      if (!owner || !spender) return 0n
      return usdt.read.allowance([owner, spender])
    },

    // Admin functions
    async getOwner() {
      return presale.read.owner()
    },
  }
}

// ---- Contract writes (expects a wallet client) ----
export const createContractWrites = (walletClient) => {
  const presale = getContract({ address: PRESALE_CONTRACT_ADDRESS, abi: PRESALE_ABI, client: walletClient })
  const usdt = getContract({ address: USDT_CONTRACT_ADDRESS, abi: ERC20_ABI, client: walletClient })

  return {
    presale,
    usdt,

    // Additional reads for admin
    async getOwner() {
      return presale.read.owner()
    },

    async getPaused() {
      return presale.read.paused()
    },

    async getPerWalletMinWave() {
      return presale.read.perWalletMinWave()
    },

    async getPerWalletMaxWave() {
      return presale.read.perWalletMaxWave()
    },

    async getCurrentStageIndex() {
      return presale.read.currentStageIndex()
    },

    // User functions
    async approveUSDT(amount, account) {
      return usdt.write.approve([PRESALE_CONTRACT_ADDRESS, amount], { account })
    },

    async buyNative(referrer, account, value) {
      return presale.write.buyWithNative([referrer], { account, value })
    },

    async buyUSDT(amount, referrer, account) {
      return presale.write.buyWithUsdt([amount, referrer], { account })
    },

    async claim(account) {
      return presale.write.claim([], { account })
    },

    async refund(account) {
      return presale.write.refund([], { account })
    },

    // Admin functions
    async adminReplaceAllStages(caps, priceNative, priceUsdt, account) {
      return presale.write.replaceAllStages([caps, priceNative, priceUsdt], { account })
    },

    async adminSetCapsAndSoft(perMin, perMax, softCap, account) {
      return presale.write.setCapsAndSoft([perMin, perMax, softCap], { account })
    },

    async adminSetTimes(start, end, unlock, account) {
      return presale.write.setTimes([start, end, unlock], { account })
    },

    async adminPause(account) {
      return presale.write.pause([], { account })
    },

    async adminUnpause(account) {
      return presale.write.unpause([], { account })
    },

    async adminFinalize(account) {
      return presale.write.finalize([], { account })
    },

    async adminWithdrawNative(amountWei, account) {
      return presale.write.withdrawNative([amountWei], { account })
    },

    async adminWithdrawToken(tokenAddr, amount, account) {
      return presale.write.withdrawToken([tokenAddr, amount], { account })
    },

    async adminSweepAllWave(account) {
      return presale.write.sweepAllWave([], { account })
    }
  }
}

// ---- Combined contract interface ----
export const createContractIO = (publicClient, walletClient) => {
  const reads = createContractReads(publicClient)
  const writes = walletClient ? createContractWrites(walletClient) : null

  return {
    ...reads,
    ...writes,
    reads,
    writes
  }
}
