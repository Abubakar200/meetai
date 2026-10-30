"use client"

import type { inferRouterOutputs } from "@trpc/server"
import type { LegacyColumnDef } from "@tanstack/react-table/legacy"
import { CornerDownRightIcon, VideoIcon } from "lucide-react"

import type { AppRouter } from "@/app/trpc/routers/_app"
import { Badge } from "@/components/ui/badge"
import { GeneratedAvatar } from "@/components/generated-avatar"

type Agent =
  inferRouterOutputs<AppRouter>["agents"]["getMany"]["items"][number]

export const columns: LegacyColumnDef<Agent, unknown>[] = [
  {
    accessorKey: "name",
    header: "Agent Name",
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-2">
          <GeneratedAvatar
            variant="botttsNeutral"
            seed={row.original.name}
            className="size-6"
          />
          <span className="font-semibold capitalize">{row.original.name}</span>
        </div>
        <div className="flex items-center gap-x-2">
          <CornerDownRightIcon className="size-3 text-muted-foreground" />
          <span className="text-sm text-muted-foreground max-w-[200px] truncate capitalize">
            {row.original.instructions}
          </span>
        </div>
      </div>
    )
  },
  {
    id: "meetingCount",
    header: "Meetings",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex items-center gap-x-2 [&>svg]:size-4"
      >
        <VideoIcon className="text-blue-700" />
        {row.original.meetingCount} {row.original.meetingCount === 1 ? "meeting" : "meetings"}
      </Badge>
    )
  }
]