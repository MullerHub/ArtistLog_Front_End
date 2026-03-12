"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { contractsService } from "@/lib/services/contracts.service"
import type {
  Contract,
  ContractStatus,
  CreateContractRequest,
  UpdateContractStatusRequest,
} from "@/lib/types"

export type ContractStatusFilter = "ALL" | ContractStatus

export function useContractsWorkspace(initialLimit = 20) {
  const [limit, setLimit] = useState(initialLimit)
  const [offset, setOffset] = useState(0)
  const [statusFilter, setStatusFilter] = useState<ContractStatusFilter>("ALL")

  const key = `/contracts?limit=${limit}&offset=${offset}`

  const { data, error, isLoading, mutate } = useSWR(key, () =>
    contractsService.listContracts({ limit, offset })
  )

  const contracts = data?.items || []
  const filteredContracts = useMemo(() => {
    if (statusFilter === "ALL") return contracts
    return contracts.filter((item) => item.status === statusFilter)
  }, [contracts, statusFilter])

  const total = data?.total || 0
  const canGoPrev = offset > 0
  const canGoNext = offset + limit < total

  const goPrev = () => setOffset((value) => Math.max(0, value - limit))
  const goNext = () => {
    if (canGoNext) {
      setOffset((value) => value + limit)
    }
  }

  const createContract = async (payload: CreateContractRequest): Promise<Contract> => {
    const response = await contractsService.createContract(payload)
    await mutate()
    return response
  }

  const updateContractStatus = async (
    contractId: string,
    payload: UpdateContractStatusRequest
  ): Promise<Contract> => {
    const response = await contractsService.updateContractStatus(contractId, payload)
    await mutate()
    return response
  }

  const deleteContract = async (contractId: string): Promise<void> => {
    await contractsService.deleteContract(contractId)
    await mutate()
  }

  return {
    contracts: filteredContracts,
    total,
    limit,
    offset,
    statusFilter,
    isLoading,
    error,
    canGoPrev,
    canGoNext,
    setLimit,
    setOffset,
    setStatusFilter,
    goPrev,
    goNext,
    createContract,
    updateContractStatus,
    deleteContract,
    refresh: mutate,
  }
}
